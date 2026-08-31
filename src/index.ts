import { Context, h, Random, Session } from 'koishi'
import {} from 'koishi-plugin-puppeteer'
import { Character, CHARACTERS, listImage, NAMES, OVERVIEWS, resolveName } from './characters'
import { Config } from './config'
import { createRenderer, Sticker } from './draw'

export { Config }
export const name = 'pjsk-pptr'
export const inject = ['puppeteer', 'database']

export const usage = `## 使用

\`pjsk.绘制 <文本>\` 绘制表情包，\`/\` 换行。\`-n <ID>\` 指定表情，缺省随机。

## 指令

| 指令 | 说明 |
| --- | --- |
| \`pjsk.绘制 <文本>\` | 绘制表情包 |
| \`pjsk.列表.全部\` | 全部表情 |
| \`pjsk.列表.角色分类\` | 按角色分类 |
| \`pjsk.列表.展开指定角色 <角色>\` | 展开角色表情 |
| \`pjsk.调整\` | 微调上一张图 |

常用参数：\`-x\` / \`-y\` 位置，\`-r\` 旋转，\`-s\` 字号，\`-l\` 行间距，\`-c\` 文本曲线。`

declare module 'koishi' {
  interface Tables {
    pjsk: PJSK
  }
}

/** 每人保存最近一次绘制的参数，供 `pjsk.调整.*` 增量修改。 */
export interface PJSK {
  id: number
  userId: string
  username: string
  text: string
  fontSize: number
  curve: boolean
  characterId: number
  x: number
  y: number
  spaceSize: number
  rotate: number
}

const LIMITS = {
  positionX: { min: 0, max: 296, label: '文本的水平位置' },
  positionY: { min: 0, max: 256, label: '文本的垂直位置' },
  rotate: { min: -10, max: 10, label: '文本的旋转角度' },
  fontSize: { min: 10, max: 100, label: '文本的字体大小' },
  spaceSize: { min: 18, max: 100, label: '文本上下行间距' },
} as const

/** `pjsk.调整.*` 的增量操作表：一个字段加上一个增量。 */
const ADJUSTMENTS: Record<string, { field: keyof PJSK; delta: number; description: string }> = {
  '字体.大': { field: 'fontSize', delta: 5, description: '字体变大' },
  '字体.小': { field: 'fontSize', delta: -5, description: '字体变小' },
  '行间距.大': { field: 'spaceSize', delta: 5, description: '行间距变大' },
  '行间距.小': { field: 'spaceSize', delta: -5, description: '行间距变小' },
  '位置.上': { field: 'y', delta: -20, description: '文本上移' },
  '位置.下': { field: 'y', delta: 20, description: '文本下移' },
  '位置.左': { field: 'x', delta: -20, description: '文本左移' },
  '位置.右': { field: 'x', delta: 20, description: '文本右移' },
}

const ADJUSTMENT_GROUPS = ['字体', '行间距', '位置'] as const

const hasChinese = (text: string) => /[一-龥]/.test(text)
const countLetters = (text: string) => (text.match(/[a-zA-Z]/g) ?? []).length

export function apply(ctx: Context, config: Config) {
  ctx.model.extend('pjsk', {
    id: 'unsigned',
    userId: 'string',
    username: 'string',
    text: 'string',
    fontSize: 'unsigned',
    curve: 'boolean',
    characterId: 'unsigned',
    x: 'unsigned',
    y: 'unsigned',
    spaceSize: 'unsigned',
    rotate: 'integer',
  }, { primary: 'id', autoInc: true })

  const draw = createRenderer(ctx)

  async function send(session: Session, message: h.Fragment) {
    if (config.shouldMentionUserInMessage && typeof message === 'string') {
      message = [h.at(session.userId), ' ~\n', message]
    }
    const [messageId] = await session.send(message)
    if (config.retractDelay && messageId) {
      ctx.setTimeout(() => {
        session.bot.deleteMessage(session.channelId, messageId).catch(() => {})
      }, config.retractDelay * 1000)
    }
  }

  // --- 自适应排版 ---

  function longestLine(text: string) {
    // 全角算一个单位、半角算半个，才能反映实际占宽
    return text.split('\n').reduce((longest, line) => {
      const width = [...line.trim()].reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 1 : 0.5), 0)
      return width > longest.width ? { line, width } : longest
    }, { line: '', width: 0 }).line
  }

  function adapt(sticker: Sticker): Sticker {
    const line = longestLine(sticker.text)
    const length = line.length || 1
    let fontSize: number
    if (hasChinese(line)) {
      if (countLetters(line) && length > 3) fontSize = 278 / length + countLetters(line)
      else if (length > 4) fontSize = 278 / length
      else if (length > 3) fontSize = 278 / length - 12
      else fontSize = sticker.fontSize + 10 * (3 - length) + 12
    } else {
      if (length > 6) fontSize = 278 / length + 10.5
      else if (length > 4) fontSize = 278 / length + 3
      else fontSize = 278 / (length + (length > 2 ? 1 : 4 - length))
    }

    // 曲线模式下文字沿弧线铺开，需要把锚点往左上挪
    let { x, y } = sticker
    if (sticker.curve) {
      if (length <= 5) { x -= 20; y += 200 } else if (length >= 8) {
        x -= hasChinese(line) ? 30 : 60
        y += hasChinese(line) ? 100 : 150
      } else {
        x -= 60
        y += hasChinese(line) ? 130 : 150
      }
    }

    return { ...sticker, x, y, fontSize, spaceSize: sticker.spaceSize + fontSize / 2 + 10 }
  }

  async function remember(session: Session, characterId: number, sticker: Sticker) {
    const data = {
      username: session.username,
      text: sticker.text,
      fontSize: Math.round(sticker.fontSize),
      curve: sticker.curve,
      characterId,
      x: Math.round(sticker.x),
      y: Math.round(sticker.y),
      spaceSize: Math.round(sticker.spaceSize),
      rotate: sticker.rotate,
    }
    const [record] = await ctx.database.get('pjsk', { userId: session.userId })
    if (record) await ctx.database.set('pjsk', { userId: session.userId }, data)
    else await ctx.database.create('pjsk', { userId: session.userId, ...data })
  }

  /** 画一张并回消息；`adaptive` 为 false 表示参数已是最终值，不再自适应。 */
  async function render(session: Session, characterId: number, sticker: Sticker, adaptive: boolean) {
    const final = adaptive && config.isTextSizeAdaptationEnabled ? adapt(sticker) : sticker
    await remember(session, characterId, final)
    await send(session, h.image(await draw(final), 'image/png'))
    if (config.shouldSendSuccessMessageAfterDrawingEmoji) {
      await send(session, '✅ 表情包绘制完成。\n\n输入「pjsk.调整」可继续调整，或「pjsk.列表.角色分类」开始新的绘制。')
    }
  }

  const stickerOf = (character: Character, overrides: Partial<Sticker>): Sticker => ({
    text: character.defaultText.text,
    img: character.img,
    color: character.color,
    x: character.defaultText.x,
    y: character.defaultText.y + 12,
    rotate: character.defaultText.r,
    fontSize: character.defaultText.s,
    spaceSize: 18,
    curve: false,
    ...overrides,
  })

  /** 取出上次绘制的记录，没有则回一句提示。 */
  async function lastRecord(session: Session) {
    const [record] = await ctx.database.get('pjsk', { userId: session.userId })
    if (!record) {
      await send(session, '⚠️ 你还没有绘制过表情包。')
      return null
    }
    return record
  }

  const fromRecord = (record: PJSK): Sticker => stickerOf(CHARACTERS[record.characterId], {
    text: record.text,
    x: record.x,
    y: record.y,
    rotate: record.rotate,
    fontSize: record.fontSize,
    spaceSize: record.spaceSize,
    curve: record.curve,
  })

  // --- 指令 ---

  const cmd = ctx.command('pjsk', 'Project SEKAI 表情包生成')
    .action(async ({ session }) => {
      await session.execute('help pjsk')
    })

  cmd.subcommand('.列表', '表情列表')
    .action(async ({ session }) => {
      return send(session, '📋 查看表情包列表：\n> pjsk.列表.全部\n> pjsk.列表.角色分类\n> pjsk.列表.展开指定角色 [角色序号或角色名]')
    })

  cmd.subcommand('.列表.全部', '全部表情列表')
    .action(async ({ session }) => {
      await send(session, h.image(listImage(OVERVIEWS[0]), 'image/jpeg'))
      await promptForSticker(session)
    })

  cmd.subcommand('.列表.角色分类', '按角色分类的表情列表')
    .action(async ({ session }) => {
      await send(session, h.image(listImage(OVERVIEWS[1]), 'image/jpeg'))
      if (config.shouldSendDrawingGuideText) {
        await send(session, '请输入角色序号（如 10）或角色名（如 Emu）。')
      }
      const input = await session.prompt()
      if (!input) return config.shouldSendDrawingGuideText ? send(session, '⚠️ 输入无效或超时。') : undefined
      const character = resolveName(input)
      if (!character) {
        return config.shouldSendDrawingGuideText ? send(session, '⚠️ 无效的角色序号或角色名。') : undefined
      }
      await session.execute(`pjsk.列表.展开指定角色 ${character}`)
    })

  cmd.subcommand('.列表.展开指定角色 <character:string>', '展开指定角色的表情列表')
    .usage(`可用角色：${NAMES.join(' / ')}`)
    .action(async ({ session }, input) => {
      const character = resolveName(input)
      const image = character && listImage(character)
      if (!image) return send(session, '⚠️ 无效的角色序号或角色名。')
      await send(session, h.image(image, 'image/jpeg'))
      await promptForSticker(session)
    })

  cmd.subcommand('.调整', '调整上一张表情包')
    .action(async ({ session }) => {
      if (!await lastRecord(session)) return
      return send(session, [
        '📋 请使用以下指令调整表情包：',
        '> pjsk.调整.文本 [文本内容]',
        '> pjsk.调整.字体.大 / .小',
        '> pjsk.调整.行间距.大 / .小',
        '> pjsk.调整.文本曲线.开启 / .关闭',
        '> pjsk.调整.位置.上 / .下 / .左 / .右',
        '> pjsk.调整.角色 [角色ID]',
      ].join('\n'))
    })

  cmd.subcommand('.调整.文本 <content:text>', '修改文本内容')
    .action(async ({ session }, content) => {
      if (!content) return send(session, '⚠️ 请输入有效的文本内容。')
      const record = await lastRecord(session)
      if (!record) return
      // 换了文本就重新自适应排版，否则字号还是按旧文本算的
      await render(session, record.characterId, { ...fromRecord(record), text: normalize(content) }, true)
    })

  // 三个分组入口 + 八个「变大变小 / 上下左右」，共用同一段实现
  for (const group of ADJUSTMENT_GROUPS) {
    cmd.subcommand(`.调整.${group}`, `调整${group}`)
      .action(({ session }) => {
        const items = Object.entries(ADJUSTMENTS).filter(([suffix]) => suffix.startsWith(`${group}.`))
        return send(session, `请使用以下指令：\n${items.map(([suffix, item]) => `> pjsk.调整.${suffix} - ${item.description}`).join('\n')}`)
      })
  }

  for (const [suffix, { field, delta, description }] of Object.entries(ADJUSTMENTS)) {
    cmd.subcommand(`.调整.${suffix}`, description)
      .action(async ({ session }) => {
        const record = await lastRecord(session)
        if (!record) return
        const value = (record[field] as number) + delta
        await render(session, record.characterId, { ...fromRecord(record), [field]: value }, false)
      })
  }

  for (const [suffix, curve] of [['开启', true], ['关闭', false]] as const) {
    cmd.subcommand(`.调整.文本曲线.${suffix}`, `${suffix}文本曲线`)
      .action(async ({ session }) => {
        const record = await lastRecord(session)
        if (!record) return
        // 曲线开关会大幅改变排版，交回自适应重算
        await render(session, record.characterId, { ...fromRecord(record), curve }, true)
      })
  }

  cmd.subcommand('.调整.角色 [characterId:natural]', '更换表情包角色')
    .option('random', '-r 随机选择角色')
    .action(async ({ session, options }, characterId) => {
      const record = await lastRecord(session)
      if (!record) return
      const id = options.random ? Random.int(CHARACTERS.length) : characterId
      if (id === undefined || id < 0 || id >= CHARACTERS.length) {
        return send(session, `⚠️ 请输入 0 到 ${CHARACTERS.length - 1} 之间的表情 ID。`)
      }
      const character = CHARACTERS[id]
      await render(session, id, {
        ...fromRecord(record),
        img: character.img,
        color: character.color,
      }, false)
    })

  cmd.subcommand('.绘制 [text:text]', '绘制表情包')
    .usage('文本里用 `/` 换行。')
    .example('pjsk.绘制 -n 6 你好呀')
    .option('number', '-n <id:natural> 表情包 ID')
    .option('positionX', '-x <x:number> 文本水平位置')
    .option('positionY', '-y <y:number> 文本垂直位置')
    .option('rotate', '-r <rotate:number> 文本旋转角度')
    .option('fontSize', '-s <size:number> 字体大小')
    .option('spaceSize', '-l, --space <space:number> 行间距')
    .option('curve', '-c 启用文本曲线')
    .action(async ({ session, options }, text) => {
      for (const [key, { min, max, label }] of Object.entries(LIMITS)) {
        const value = options[key]
        if (value !== undefined && (value < min || value > max)) {
          return send(session, `⚠️ ${label}必须在 ${min} 到 ${max} 之间。`)
        }
      }

      const id = options.number ?? Random.int(CHARACTERS.length)
      if (id < 0 || id >= CHARACTERS.length) {
        return send(session, `⚠️ 请输入 0 到 ${CHARACTERS.length - 1} 之间的表情 ID。`)
      }

      const character = CHARACTERS[id]
      const sticker = stickerOf(character, {
        ...(text ? { text: normalize(text) } : {}),
        ...(options.positionX !== undefined ? { x: options.positionX } : {}),
        ...(options.positionY !== undefined ? { y: options.positionY } : {}),
        ...(options.rotate !== undefined ? { rotate: options.rotate } : {}),
        ...(options.fontSize !== undefined ? { fontSize: options.fontSize } : {}),
        ...(options.spaceSize !== undefined ? { spaceSize: options.spaceSize } : {}),
        curve: options.curve ?? false,
      })
      await render(session, id, sticker, true)
    })

  /** 列表发出后等用户回一句「序号 文本」。 */
  async function promptForSticker(session: Session) {
    if (config.shouldSendDrawingGuideText) {
      await send(session, '请按「表情包序号 文本内容」的格式绘制。例：6 你好呀')
    }
    const input = await session.prompt()
    if (!input) return
    const [id, ...rest] = input.trim().split(/\s+/)
    if (!/^\d+$/.test(id) || Number(id) >= CHARACTERS.length) return
    await session.execute(`pjsk.绘制 -n ${id} ${rest.join(' ')}`)
  }
}

/** `/` 与真实换行都当作换行；画布脚本按 \n 切行。 */
const normalize = (text: string) => text.replace(/\/+/g, '\n').replace(/\r\n?/g, '\n')
