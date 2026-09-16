import { Context, h, Random, Session } from 'koishi'
import {} from 'koishi-plugin-puppeteer'
import { Character, CHARACTERS, listImage, NAMES, OVERVIEWS, resolveName } from './characters'
import { Config } from './config'
import { createRenderer, Sticker } from './draw'

export { Config }
export const name = 'pjsk-pptr'
export const inject = ['puppeteer', 'database']

export const usage = `## 使用

\`pjsk.绘制 <文本>\` 绘制表情包，\`/\` 表示换行。

## 指令

| 指令 | 说明 |
| --- | --- |
| \`pjsk.绘制 <文本>\` | 绘制表情包 |
| \`pjsk.列表 [角色]\` | 按角色分类；带上角色则展开它的全部表情 |
| \`pjsk.列表 -a\` | 一次列出全部表情包 |
| \`pjsk.调整\` | 查看可用的调整指令 |
| \`pjsk.调整.文本 <内容>\` | 修改文本内容 |
| \`pjsk.调整.字号 <大/小>\` | 字号增减 |
| \`pjsk.调整.行距 <大/小>\` | 行间距增减 |
| \`pjsk.调整.位置 <上/下/左/右>\` | 移动文本 |
| \`pjsk.调整.曲线 <开/关>\` | 开关文本曲线 |
| \`pjsk.调整.角色 [ID]\` | 更换角色 |

可用参数：\`-n <ID>\` 指定表情，缺省随机；\`-x\`、\`-y\` 调整位置，\`-r\` 旋转，\`-s\` 字号，\`-l\` 行间距，\`-c\` 文本曲线。`

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

/**
 * `pjsk.调整.*` 的增量操作表。
 *
 * 每一项是「一条三级指令 + 一个方向参数」，而不是再往下长一级子指令：
 * 指令树到三级为止，第四级的东西一律降成参数。
 */
interface Adjustment {
  field: keyof PJSK
  /** 方向词 -> 增量。参数只认这张表里的键。 */
  steps: Record<string, number>
  hint: string
}

const ADJUSTMENTS: Record<string, Adjustment> = {
  字号: { field: 'fontSize', steps: { 大: 5, 小: -5 }, hint: '大 / 小' },
  行距: { field: 'spaceSize', steps: { 大: 5, 小: -5 }, hint: '大 / 小' },
  位置: { field: 'x', steps: {}, hint: '上 / 下 / 左 / 右' },
}

/** 位置要同时动 x 与 y，单独一张表。 */
const MOVES: Record<string, { field: keyof PJSK; delta: number }> = {
  上: { field: 'y', delta: -20 },
  下: { field: 'y', delta: 20 },
  左: { field: 'x', delta: -20 },
  右: { field: 'x', delta: 20 },
}

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
  const logger = ctx.logger(name)
  // 自动撤回：同一频道只保留最新一条，上一条延时撤回。
  const lastMessage = new Map<string, { id: string; timestamp: number }>()

  async function send(session: Session, message: h.Fragment) {
    if (config.shouldMentionUserInMessage && typeof message === 'string') {
      message = [h.at(session.userId), ' ~\n', message]
    }
    const [messageId] = await session.send(message)
    if (!config.retractDelay || !messageId) return
    const previous = lastMessage.get(session.channelId)
    if (previous) {
      const passed = Date.now() - previous.timestamp
      // 超过两分钟的消息撤不回来，留 2 秒余量。
      if (passed < 118000) {
        ctx.setTimeout(() => {
          session.bot.deleteMessage(session.channelId, previous.id).catch((error) => {
            logger.debug('撤回消息失败：%s', error.message)
          })
        }, Math.max(0, config.retractDelay * 1000 - passed))
      }
    }
    lastMessage.set(session.channelId, { id: messageId, timestamp: Date.now() })
  }

  /** 列表图是随包发布的素材，文件不在时不发空图，回一句说明。 */
  async function sendListImage(session: Session, name: string) {
    const image = listImage(name)
    if (!image) {
      return send(session, '❌ 表情包列表没有加载出来\n素材没有随插件装上，重装插件后再试。')
    }
    return send(session, h.image(image, 'image/jpeg'))
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
    let buffer: Uint8Array | null = null
    try {
      buffer = await draw(final)
    } catch (error) {
      // 图是增强不是前提：渲染不可用时把这张表情包的参数交代清楚
      logger.warn('图片渲染失败：%s', error.message)
    }
    if (!buffer) {
      return await send(session, [
        '❌ 图片没有渲染出来',
        // 文本里的换行摊成一行，回显的写法与 `pjsk.绘制` 的输入一致
        `文本：${final.text.replace(/\n/g, ' / ')}`,
        `角色：${CHARACTERS[characterId]?.name ?? characterId}`,
        '详细原因见后台日志，稍后重发即可。',
      ].join('\n'))
    }
    await send(session, h.image(buffer, 'image/png'))
    if (config.shouldSendSuccessMessageAfterDrawingEmoji) {
      await send(session, '✅ 表情包绘制完成\n发送「pjsk.调整」接着微调，或发送「pjsk.列表」换一张。')
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
      await send(session, [
        '💡 还没有可以调整的表情包',
        '画过一张之后，它就会成为可微调的那张。',
        '发送「pjsk.绘制 你好呀」先画一张。',
      ].join('\n'))
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

  cmd.subcommand('.列表 [character:string]', '查看表情包列表')
    .usage(`不带参数按角色分类；带上角色展开它的全部表情。可用角色：${NAMES.join(' / ')}`)
    .option('all', '-a 一次列出全部表情包')
    .example('pjsk.列表 Emu')
    .action(async ({ session, options }, input) => {
      if (options.all) {
        await sendListImage(session, OVERVIEWS[0])
        return promptForSticker(session)
      }

      // 带了角色就直接展开，省掉一次追问
      if (input) {
        const character = resolveName(input)
        if (!character) return send(session, '⚠️ 认不出这个角色\n发送「pjsk.列表」看可用的角色。')
        await sendListImage(session, character)
        return promptForSticker(session)
      }

      await sendListImage(session, OVERVIEWS[1])
      if (!config.shouldSendDrawingGuideText) return
      await send(session, '💡 发送角色序号（如 10）或角色名（如 Emu）展开，或发送「取消」。')
      const reply = await session.prompt()
      if (!reply) return send(session, '⏳ 没有等到角色，这次先作罢。')
      if (reply.trim() === '取消') return send(session, '✅ 已取消。')
      const character = resolveName(reply)
      if (!character) return send(session, '⚠️ 认不出这个角色\n发送「pjsk.列表」看可用的角色。')
      await session.execute(`pjsk.列表 ${character}`)
    })

  cmd.subcommand('.调整', '微调上一张表情包')
    .action(async ({ session }) => {
      if (!await lastRecord(session)) return
      return send(session, [
        '📋 可用的调整指令',
        '• pjsk.调整.文本 <文本内容>',
        '• pjsk.调整.字号 <大 / 小>｜.行距 <大 / 小>',
        '• pjsk.调整.位置 <上 / 下 / 左 / 右>',
        '• pjsk.调整.曲线 <开 / 关>｜.角色 [表情包 ID]',
      ].join('\n'))
    })

  cmd.subcommand('.调整.文本 <content:text>', '修改文本内容')
    .action(async ({ session }, content) => {
      if (!content) return send(session, '⚠️ 文本是空的\n例：「pjsk.调整.文本 你好呀」。')
      const record = await lastRecord(session)
      if (!record) return
      // 换了文本就重新自适应排版，否则字号还是按旧文本算的
      await render(session, record.characterId, { ...fromRecord(record), text: normalize(content) }, true)
    })

  // 字号与行距：同一条指令，方向作参数
  for (const name of ['字号', '行距'] as const) {
    const { field, steps, hint } = ADJUSTMENTS[name]
    cmd.subcommand(`.调整.${name} <direction:string>`, `增减${name}`)
      .usage(`参数为 ${hint}。`)
      .example(`pjsk.调整.${name} 大`)
      .action(async ({ session }, direction) => {
        const delta = steps[direction?.trim()]
        if (delta === undefined) {
          return send(session, `⚠️ 认不出这个方向\n可用 ${hint}，例：「pjsk.调整.${name} 大」。`)
        }
        const record = await lastRecord(session)
        if (!record) return
        const value = (record[field] as number) + delta
        await render(session, record.characterId, { ...fromRecord(record), [field]: value }, false)
      })
  }

  cmd.subcommand('.调整.位置 <direction:string>', '上下左右移动文本')
    .usage('参数为 上 / 下 / 左 / 右。')
    .example('pjsk.调整.位置 上')
    .action(async ({ session }, direction) => {
      const move = MOVES[direction?.trim()]
      if (!move) {
        return send(session, '⚠️ 认不出这个方向\n可用 上 / 下 / 左 / 右，例：「pjsk.调整.位置 上」。')
      }
      const record = await lastRecord(session)
      if (!record) return
      const value = (record[move.field] as number) + move.delta
      await render(session, record.characterId, { ...fromRecord(record), [move.field]: value }, false)
    })

  cmd.subcommand('.调整.曲线 <state:string>', '开关文本曲线')
    .usage('参数为 开 / 关。')
    .example('pjsk.调整.曲线 开')
    .action(async ({ session }, state) => {
      const text = state?.trim()
      const curve = text === '开' || text === '开启'
      if (!curve && text !== '关' && text !== '关闭') {
        return send(session, '⚠️ 曲线开关只认「开」「关」\n例：「pjsk.调整.曲线 开」。')
      }
      const record = await lastRecord(session)
      if (!record) return
      // 曲线开关会大幅改变排版，交回自适应重算
      await render(session, record.characterId, { ...fromRecord(record), curve }, true)
    })

  cmd.subcommand('.调整.角色 [characterId:natural]', '更换表情包角色')
    .option('random', '-r 随机选择角色')
    .action(async ({ session, options }, characterId) => {
      const record = await lastRecord(session)
      if (!record) return
      const id = options.random ? Random.int(CHARACTERS.length) : characterId
      if (id === undefined || id < 0 || id >= CHARACTERS.length) {
        return send(session, `⚠️ 表情包 ID 超出范围\n可用范围是 0 到 ${CHARACTERS.length - 1}。`)
      }
      const character = CHARACTERS[id]
      await render(session, id, {
        ...fromRecord(record),
        img: character.img,
        color: character.color,
      }, false)
    })

  cmd.subcommand('.绘制 [text:text]', '绘制表情包')
    .usage('文本中的 `/` 表示换行。')
    .example('pjsk.绘制 -n 6 你好呀')
    .option('number', '-n <id:natural> 指定的表情包 ID')
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
          return send(session, `⚠️ ${label}超出范围\n可用范围是 ${min} 到 ${max}。`)
        }
      }

      const id = options.number ?? Random.int(CHARACTERS.length)
      if (id < 0 || id >= CHARACTERS.length) {
        return send(session, `⚠️ 表情包 ID 超出范围\n可用范围是 0 到 ${CHARACTERS.length - 1}。`)
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
    if (!config.shouldSendDrawingGuideText) return
    await send(session, '💡 按「表情包序号 文本内容」发送即可，或发送「取消」。例：6 你好呀')
    const input = await session.prompt()
    if (!input) return send(session, '⏳ 没有等到内容，这次先作罢。')
    const text = input.trim()
    if (text === '取消') return send(session, '✅ 已取消。')
    const [id, ...rest] = text.split(/\s+/)
    if (!/^\d+$/.test(id) || Number(id) >= CHARACTERS.length) {
      return send(session, `⚠️ 表情包序号超出范围\n可用范围是 0 到 ${CHARACTERS.length - 1}。`)
    }
    await session.execute(`pjsk.绘制 -n ${id} ${rest.join(' ')}`)
  }
}

/** `/` 与真实换行都当作换行；画布脚本按 \n 切行。 */
const normalize = (text: string) => text.replace(/\/+/g, '\n').replace(/\r\n?/g, '\n')
