import {Context, Logger, Schema, h, noop} from 'koishi'
import {} from '@koishijs/plugin-help'
import {} from 'koishi-plugin-puppeteer';
import path from 'path';
import * as fs from "fs";

export const name = 'pjsk-pptr'
export const inject = {
  required: ['puppeteer', 'database']
}
export const usage = `
## 🎮 使用

- 启动 puppeteer 服务。
- 建议为指令添加指令别名。
- 使用 \`pjsk.列表.角色分类\` 指令可触发表情包绘制引导。
- 使用 \`pjsk.绘制 [文本]\` 指令可直接绘制表情包。

## ⚙️ 配置

无特殊配置

## 📝 命令

- \`pjsk.列表\` - 显示可用的表情包列表。
- \`pjsk.绘制 [inputText:text]\` - 将自定义文本渲染到随机或指定的表情包中，使用 / 可以换行。
  - \`-n\` - 指定表情包 ID。
  - \`-y\` - 指定文本垂直位置。
  - \`-x\` - 指定文本水平位置。
  - \`-r\` - 指定文本旋转角度。
  - \`-s\` - 指定文本字体大小（自适应时不生效）。
  - \`-c\` - 是否启用文本曲线。
  - \`--space\` - 指定文本行间距。
- \`pjsk.调整\` - 调整绘制成功的表情相关指令。

## 🐱 QQ 群

- 956758505
`

const logger = new Logger('PJSK')

// pz* pzx*
export interface Config {
  isTextSizeAdaptationEnabled: boolean
  shouldSendDrawingGuideText: boolean
  shouldSendSuccessMessageAfterDrawingEmoji: boolean
  retractDelay: number
  shouldMentionUserInMessage: boolean
  isEnableQQOfficialRobotMarkdownTemplate: boolean
  customTemplateId: string
  key: string
  // key2: string
  // key3: string
  numberOfMessageButtonsPerRow: number
  shouldPrefixAtForMarkdownMessage: boolean
  shouldWaitForUserInputBeforeSendingCommands: boolean
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    isTextSizeAdaptationEnabled: Schema.boolean().default(true).description('是否启用文本大小自适应。'),
    shouldSendDrawingGuideText: Schema.boolean().default(true).description('（QQ 官方机器人自动开启）是否发送提示文本信息，当开启后，将会发送引导用户绘制表情包的提示文本信息。'),
    shouldSendSuccessMessageAfterDrawingEmoji: Schema.boolean().default(true).description(`（QQ 官方机器人自动开启）是否发送绘制表情包成功的提示信息，即 \`🎉 表情包绘制完成！\`。`),
    shouldMentionUserInMessage: Schema.boolean().default(false).description(`（非 QQ 官方机器人）是否在消息中 @ 用户。`),
    retractDelay: Schema.number().min(0).default(0).description(`自动撤回等待的时间，单位是秒。值为 0 时不启用自动撤回功能。`),
    isEnableQQOfficialRobotMarkdownTemplate: Schema.boolean().default(false).description(`是否启用 QQ 官方机器人的 Markdown 模板，带消息按钮。`),
  }),
  Schema.union([
    Schema.object({
      isEnableQQOfficialRobotMarkdownTemplate: Schema.const(true).required(),
      customTemplateId: Schema.string().default('').description(`自定义模板 ID。`),
      key: Schema.string().default('').description(`文本内容中特定插值的 key，用于存放文本。如果你的插值为 {{.info}}，那么请在这里填 info。`),
      // key2: Schema.string().default('').description(`发送图片信息的特定插值的 key，用于存放图片的宽高。与下面的 key3 联动，Markdown 源码中形如：{{.key2}}{{.key3}}。`),
      // key3: Schema.string().default('').description(`发送图片URL的特定插值的 key，用于存放图片的URL。`),
      numberOfMessageButtonsPerRow: Schema.number().min(3).max(5).default(3).description(`每行消息按钮的数量。`),
      shouldPrefixAtForMarkdownMessage: Schema.boolean().default(false).description(`是否在 Markdown 消息的文本前加上一行 @用户。`),
      shouldWaitForUserInputBeforeSendingCommands: Schema.boolean().default(false).description(`是否在点击“随机绘制”按钮后等待用户输入。`),
    }),
    Schema.object({}),
  ]),
]) as any

declare module 'koishi' {
  interface Tables {
    pjsk: PJSK
  }
}

export interface PJSK {
  id: number
  userId: string
  username: string
  // 字体大小 文字曲线 角色ID 文本 x y 行间距 旋转角度
  fontSize: number
  curve: boolean
  characterId: number
  text: string
  x: number
  y: number
  spaceSize: number
  rotate: number
}

// jk*
interface Range {
  min: number;
  max: number;
  message: string;
}

interface Button {
  render_data: {
    label: string;
    visited_label: string;
    style: number;
  };
  action: {
    type: number;
    permission: { type: number };
    data: string;
    enter: boolean;
  };
}

export function apply(ctx: Context, config: Config) {
  // tzb*
  ctx.model.extend('pjsk', {
    id: 'unsigned',
    userId: 'string',
    username: 'string',
    fontSize: 'unsigned',
    curve: 'boolean',
    characterId: 'unsigned',
    text: 'string',
    x: 'unsigned',
    y: 'unsigned',
    spaceSize: 'unsigned',
    rotate: 'integer',
  }, {primary: 'id', autoInc: true})
  // cl*
  const isQQOfficialRobotMarkdownTemplateEnabled = config.isEnableQQOfficialRobotMarkdownTemplate && config.key !== '' && config.customTemplateId !== ''
  const filePath = path.join(__dirname, 'emptyHtml.html').replace(/\\/g, '/');
  const characterNames = [
    'characterListAll',
    'characterListWithIndex',
    'characterListNoIndex',
    'Airi',
    'Akito',
    'An',
    'Emu',
    'Ena',
    'Haruka',
    'Honami',
    'Ichika',
    'KAITO',
    'Kanade',
    'Kohane',
    'Len',
    'Luka',
    'Mafuyu',
    'Meiko',
    'Miku',
    'Minori',
    'Mizuki',
    'Nene',
    'Rin',
    'Rui',
    'Saki',
    'Shiho',
    'Shizuku',
    'Touya',
    'Tsukasa',
  ];
  const pjskListDir: { [key: string]: string } = {};
  // wj*
  const dependencyPjskDir = path.join(__dirname, 'assets')
  for (const name of characterNames) {
    pjskListDir[`pjskListFor${name}Dir`] = path.join(__dirname, 'assets', 'list', `${name}.jpeg`);
  }
  const characters = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'characters.json'), 'utf8'))

  // pjsk* h* bz*
  ctx.command('pjsk', '初音未来表情包生成帮助')
    .action(async ({session}) => {
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `🌸 初音未来表情包生成器 🌸
😆 欢迎使用~ 祝您玩得开心！`, `表情包列表 随机绘制 自选绘制`)
      }
      await session.execute(`pjsk -h`)
    })
  // lb*
  ctx.command('pjsk.列表', '表情列表指令引导')
    .action(async ({session}) => {
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `当前可查看的表情包列表如下：
1. 全部
2. 角色分类
3. 指定角色 [角色序号或角色名]`, `全部 角色分类 指定角色`)
      }
      // 提示当前可用的表情包列表
      return await sendMessage(session, `请使用以下指令查看表情包列表：
> pjsk.列表.全部 - 查看全部表情包列表
> pjsk.列表.角色分类 - 查看角色分类表情包列表
> pjsk.列表.展开指定角色 [角色序号或角色名] - 查看指定角色表情包列表`, ``)
    })

  // lb* qb*
  ctx.command('pjsk.列表.全部', '全部表情列表')
    .action(async ({session}) => {
      const buffer = fs.readFileSync(pjskListDir['pjskListForcharacterListAllDir']);
      await sendMessage(session, h.image(buffer, 'image/jpeg'), ``, 863, 2245)
      await processUserInput(session)
    })
  // lb* js* fl*
  ctx.command('pjsk.列表.角色分类', '角色分类表情列表')
    .action(async ({session}) => {
      const buffer = fs.readFileSync(pjskListDir['pjskListForcharacterListWithIndexDir']);
      await sendMessage(session, h.image(buffer, 'image/jpeg'), ``, 1570, 1637)
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq' || config.shouldSendDrawingGuideText) {
        await sendMessage(session, `查看指定角色的表情，请输入：
> 角色序号，例如：10
> 角色名，例如：Emu`, `输入角色序号或名称`)
      }
      const userInput = await session.prompt()
      if (!userInput) return isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq' || config.shouldSendDrawingGuideText ? await sendMessage(session, `输入无效或超时！`, ``) : noop()
      const character = getCharacterName(userInput);
      if (character === `无效的角色序号或角色名！` || character === `找不到角色图像！`) {
        return isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq' || config.shouldSendDrawingGuideText ? await sendMessage(session, `无效的角色序号或角色名！`, `表情包列表 角色分类`) : noop()
      } else {
        await session.execute(`pjsk.列表.展开指定角色 ${character}`)
      }
    })
  // lb* js* fl*
  ctx.command('pjsk.列表.展开指定角色 <character:string>', '展开指定角色表情列表')
    .action(async ({session}, character) => {
      if (!character) {
        return await sendMessage(session, `请输入有效的角色序号或角色名！`, `表情包列表 角色分类`)
      }
      const imageBuffer = getCharacterImageBuffer(character);
      if (imageBuffer === `无效的角色序号或角色名！` || imageBuffer === `找不到角色图像！`) {
        return await sendMessage(session, imageBuffer, `表情包列表 指定角色`)
      }
      await sendMessage(session, h.image(imageBuffer, 'image/jpeg'), ``, 1570, 1096)
      await processUserInput(session)
    })

  // tz*
  ctx.command('pjsk.调整', '调整指令引导')
    .action(async ({session}, character) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `您当前可以调整的项目有：
1. 修改文本内容
2. 调整字体大小
3. 调整行间距
4. 开启/关闭文本曲线
5. 调整文本位置
6. 修改表情包角色`, `修改文本 调整字体 调整行间距 文本曲线 调整位置 修改角色 随机角色`)
      }
      return await sendMessage(session, `请使用以下指令调整表情包：
> pjsk.调整.文本 [文本内容] - 修改文本
> pjsk.调整.字体.大 - 字体变大
> pjsk.调整.字体.小 - 字体变小
> pjsk.调整.行间距.大 - 行间距变大
> pjsk.调整.行间距.小 - 行间距变小
> pjsk.调整.文本曲线.开启 - 开启文本曲线
> pjsk.调整.文本曲线.关闭 - 关闭文本曲线
> pjsk.调整.位置.上 - 文本上移
> pjsk.调整.位置.下 - 文本下移
> pjsk.调整.位置.左 - 文本左移
> pjsk.调整.位置.右 - 文本右移
> pjsk.调整.角色 [角色ID] - 修改表情包角色
`, ``)
    })
  // tz* wb*
  ctx.command('pjsk.调整.文本 <textContent:text>', '修改文本内容')
    .action(async ({session}, textContent) => {
      if (!textContent) {
        return await sendMessage(session, `请输入有效的文本内容！`, `随机绘制 自选绘制`)
      }
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      await ctx.database.set('pjsk', {userId: session.userId}, {text: textContent})
      const {
        fontSize, curve, characterId, x, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 -n ${characterId}${curve ? ` -c` : ''} ${textContent}`)
    })

  // tz* zt*
  ctx.command('pjsk.调整.字体', '调整字体大小指令引导')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `您可以对字体进行的操作有：
1. 字体变大
2. 字体变小`, `字体变大 字体变小`)
      }
      return await sendMessage(session, `请使用以下指令调整字体大小：
> pjsk.调整.字体.大 - 字体变大
> pjsk.调整.字体.小 - 字体变小`, ``)
    })

  // tz* zt*
  ctx.command('pjsk.调整.字体.大', '')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {fontSize} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {fontSize: fontSize + 5})
      const {
        text, curve, characterId, x, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize + 5} -x ${x} -y ${y} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* zt*
  ctx.command('pjsk.调整.字体.小', '')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {fontSize} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {fontSize: fontSize - 5})
      const {
        text, curve, characterId, x, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize - 5} -x ${x} -y ${y} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* hjj*
  ctx.command('pjsk.调整.行间距', '调整行间距指令引导')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `您可以对行间距进行的操作有：
1. 行间距变大
2. 行间距变小`, `行间距变大 行间距变小`)
      }
      return await sendMessage(session, `请使用以下指令调整行间距：
> pjsk.调整.行间距.大 - 行间距变大
> pjsk.调整.行间距.小 - 行间距变小`, ``)
    })

  // tz* hjj*
  ctx.command('pjsk.调整.行间距.大', '')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {spaceSize} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {spaceSize: spaceSize + 5})
      const {
        text, curve, characterId, x, y, fontSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x} -y ${y} -l ${spaceSize + 5}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* hjj*
  ctx.command('pjsk.调整.行间距.小', '')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {spaceSize} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {spaceSize: spaceSize - 5})
      const {
        text, curve, characterId, x, y, fontSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x} -y ${y} -l ${spaceSize - 5}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* wbqx* qx*
  ctx.command('pjsk.调整.文本曲线', '调整文本曲线指令引导')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `您可以对文本曲线进行的操作有：
1. 开启文本曲线
2. 关闭文本曲线`, `开启文本曲线 关闭文本曲线`)
      }
      return await sendMessage(session, `请使用以下指令调整文本曲线：
> pjsk.调整.文本曲线.开启 - 开启文本曲线
> pjsk.调整.文本曲线.关闭 - 关闭文本曲线`, ``)
    })

  // tz* wbqx* qx*
  ctx.command('pjsk.调整.文本曲线.开启', '开启文本曲线')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      await ctx.database.set('pjsk', {userId: session.userId}, {curve: true})
      const {
        text, fontSize, characterId, x, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 -n ${characterId} -c ${text}`)
    })

  // tz* wbqx* qx*
  ctx.command('pjsk.调整.文本曲线.关闭', '关闭文本曲线')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      await ctx.database.set('pjsk', {userId: session.userId}, {curve: false})
      const {
        text, fontSize, characterId, x, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 -n ${characterId} ${text}`)
    })

  // tz* wz*
  ctx.command('pjsk.调整.位置', '调整文本位置指令引导')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
        return await sendMessage(session, `您可以对文本进行的操作有：
1. 文本上移
2. 文本下移
3. 文本左移
4. 文本右移`, `文本上移 文本下移 文本左移 文本右移`)
      }
      return await sendMessage(session, `请使用以下指令调整文本位置：
> pjsk.调整.位置.上 - 文本上移
> pjsk.调整.位置.下 - 文本下移
> pjsk.调整.位置.左 - 文本左移
> pjsk.调整.位置.右 - 文本右移`, ``)
    })

  // tz* wz*
  ctx.command('pjsk.调整.位置.上', '文本上移')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {y} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {y: y - 20})
      const {
        text, fontSize, curve, characterId, x, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x} -y ${y - 20} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* wz*
  ctx.command('pjsk.调整.位置.下', '文本下移')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {y} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {y: y + 20})
      const {
        text, fontSize, curve, characterId, x, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x} -y ${y + 20} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* wz*
  ctx.command('pjsk.调整.位置.左', '文本左移')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {x} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {x: x - 20})
      const {
        text, fontSize, curve, characterId, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x - 20} -y ${y} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* wz*
  ctx.command('pjsk.调整.位置.右', '文本右移')
    .action(async ({session}, change) => {
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      const {x} = userRecord[0]
      await ctx.database.set('pjsk', {userId: session.userId}, {x: x + 20})
      const {
        text, fontSize, curve, characterId, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x + 20} -y ${y} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // tz* jx*
  ctx.command('pjsk.调整.角色 <characterId:number>', '修改表情包角色')
    .option('random', '-r 随机选择角色', {fallback: false})
    .action(async ({session, options}, characterId) => {
      if (options.random) {
        characterId = Math.floor(Math.random() * characters.length)
      }
      if (!characterId) {
        return await sendMessage(session, `请输入有效的表情 ID！`, `随机绘制 自选绘制`)
      }
      if (characterId < 0 || characterId >= characters.length) {
        return await sendMessage(session, `抱歉，您输入的表情 ID 无效，请输入范围在 0 到 358 之间的有效表情 ID。`, `修改角色 随机角色`)
      }
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        return await sendMessage(session, `抱歉，您尚未绘制过表情包。`, `随机绘制 自选绘制`)
      }
      await ctx.database.set('pjsk', {userId: session.userId}, {characterId})
      const {
        text, fontSize, curve, x, y, spaceSize, rotate
      } = userRecord[0]
      await session.execute(`pjsk.绘制 --daf -n ${characterId} -s ${fontSize} -x ${x} -y ${y} -l ${spaceSize}${curve ? ` -c` : ''} ${text}`)
    })

  // hz*
  ctx.command('pjsk.绘制 [inputText:text]', '绘制表情包')
    .option('number', '-n [number:number] 表情包ID', {fallback: undefined})
    .option('positionY', '-y [positionY:number] 文本的垂直位置', {fallback: undefined})
    .option('positionX', '-x [positionX:number] 文本的水平位置', {fallback: undefined})
    .option('rotate', '-r [rotate:number] 文本的旋转角度', {fallback: undefined})
    .option('fontSize', '-s [fontSize:number] 文本字体的大小', {fallback: undefined})
    .option('spaceSize', '-l [spaceSize:number] 文本上下行间距', {fallback: 18})
    .option('curve', '-c 是否启用文本曲线', {fallback: false})
    .option('disableAdaptiveFunctionality', '--daf 关闭自适应功能', {hidden: true, fallback: false})
    .action(async ({session, options}, inputText) => {

      // 表情包 ID 必须在 characters 的元素个数之内，即小于 characters.length，默认为随机
      // 文本的垂直位置 y 范围 0~256，默认为 character 中指定的值
      // 文本的水平位置 x 范围 0~296，默认为 character 中指定的值
      // 文本的旋转角度 rotate 范围 -10 ~ 10 默认为 character 中指定的值
      // 文本的字体大小 fontSize 范围 10 ~ 100 默认为 character 中指定的值
      // 是否启用文本曲线功能 curve 默认为 false
      // 文本上下行间距 spaceSize 范围 18 ~ 100，默认值为 18

      let character: { defaultText?: any; id?: string; name?: string; character?: string; img?: any; color?: any; };
      let characterId: number;
      if (options.number !== undefined) {
        const isValidCharacter = options.number >= 0 && options.number < characters.length;
        if (!isValidCharacter) {
          return await sendMessage(session, `抱歉，您输入的表情 ID 无效，请输入范围在 0 到 358 之间的有效表情 ID。`, `随机绘制 自选绘制`)
        }
        character = characters[options.number]
        characterId = options.number
      } else {
        const randomIndex = Math.floor(Math.random() * characters.length);
        character = characters[randomIndex];
        characterId = randomIndex
      }

      let {text, x, y, r: rotate, s: fontSize} = character.defaultText;
      if (inputText) {
        text = inputText.replace(/\/+/g, '\\n').replace(/\n/g, '\\n');
      }
      const {color, img} = character;
      const imgPath = 'file://' + dependencyPjskDir.replaceAll('\\', '/') + `/img/${img}`;

      const curve = options.curve || false;
      let spaceSize = options.spaceSize || 18;
      let specifiedX = options.positionX !== undefined ? options.positionX : x;
      let specifiedY = options.positionY !== undefined ? options.positionY : y + 12;
      const specifiedRotate = options.rotate !== undefined ? options.rotate : rotate;
      let specifiedFontSize = options.fontSize !== undefined ? options.fontSize : fontSize;


      if (config.isTextSizeAdaptationEnabled && !options.disableAdaptiveFunctionality) {
        const longestLine = findLongestLine(text);
        const offsets = calculateOffsets(longestLine, options);
        specifiedX += offsets.x;
        specifiedY += offsets.y;
        specifiedFontSize = calculateFontSize(specifiedFontSize, longestLine);
        spaceSize += specifiedFontSize / 2 + 10;
      }

      const ranges: { [key: string]: Range } = {
        positionY: {min: 0, max: 256, message: '抱歉，文本的垂直位置必须在 0 到 256 之间。'},
        positionX: {min: 0, max: 296, message: '抱歉，文本的水平位置必须在 0 到 296 之间。'},
        rotate: {min: -10, max: 10, message: '抱歉，文本的旋转角度必须在 -10 到 10 之间。'},
        fontSize: {min: 10, max: 100, message: '抱歉，文本的字体大小必须在 10 到 100 之间。'},
        spaceSize: {min: 18, max: 100, message: '抱歉，文本的上下行间距必须在 18 到 100 之间。'}
      };

      if (!options.curve) {
        for (const key in ranges) {
          if (await checkOptions(session, options, key, ranges[key])) {
            return;
          }
        }
      }

      const angle = (Math.PI * text.length) / 7; // 曲线弯曲的角度
      const userRecord = await ctx.database.get('pjsk', {userId: session.userId})
      if (userRecord.length === 0) {
        await ctx.database.create('pjsk', {
          userId: session.userId,
          username: session.username,
          text,
          fontSize: specifiedFontSize,
          curve,
          characterId,
          x: specifiedX,
          y: specifiedY,
          spaceSize,
          rotate: specifiedRotate
        })
      } else {
        await ctx.database.set('pjsk', {userId: session.userId}, {
          userId: session.userId, username: session.username,
          text,
          fontSize: specifiedFontSize,
          curve,
          characterId,
          x: specifiedX,
          y: specifiedY,
          spaceSize,
          rotate: specifiedRotate
        })
      }
      const buffer = await draw(text, imgPath, specifiedX, specifiedY, specifiedRotate, specifiedFontSize, color, curve, spaceSize, angle)
      await sendMessage(session, h.image(buffer, 'image/png'), ``, 296, 256)
      if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq' || config.shouldSendSuccessMessageAfterDrawingEmoji) {
        return await sendMessage(session, `🎉 表情包绘制完成！${!(isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') ? `\n\n🔍 输入"pjsk.调整"获取调整指令\n或直接输入"pjsk.列表.角色分类"开始新的绘制\n\n✨ 期待您的下一个创作！` : ''}`, `修改文本 字体变大 字体变小 修改角色 行间距变大 行间距变小 随机角色 开启曲线 关闭曲线 随机绘制 文本上移 文本下移 自选绘制 文本左移 文本右移`)
      }
    })


  // hs*
  function parseMarkdownCommands(markdownCommands: string): string[] {
    return markdownCommands.split(' ').filter(command => command.trim() !== '');
  }

  function createButtons(markdownCommands: string): Button[] {
    const commands = parseMarkdownCommands(markdownCommands);

    return commands.map(command => {
      let dataValue = command;
      switch (command) {
        case '全部':
          dataValue = 'pjsk.列表.全部';
          break;
        case '角色分类':
          dataValue = 'pjsk.列表.角色分类';
          break;
        case '指定角色':
          dataValue = 'pjsk.列表.展开指定角色';
          break;
        case '输入':
          dataValue = '';
          break;
        case '表情包列表':
          dataValue = 'pjsk.列表';
          break;
        case '随机绘制':
          dataValue = 'pjsk.绘制';
          break;
        case '自选绘制':
          dataValue = 'pjsk.列表.角色分类';
          break;
        case '修改文本':
          dataValue = 'pjsk.调整.文本';
          break;
        case '调整字体':
          dataValue = 'pjsk.调整.字体';
          break;
        case '调整行间距':
          dataValue = 'pjsk.调整.行间距';
          break;
        case '文本曲线':
          dataValue = 'pjsk.调整.文本曲线';
          break;
        case '调整位置':
          dataValue = 'pjsk.调整.位置';
          break;
        case '修改角色':
          dataValue = 'pjsk.调整.角色';
          break;
        case '字体变大':
          dataValue = 'pjsk.调整.字体.大';
          break;
        case '字体变小':
          dataValue = 'pjsk.调整.字体.小';
          break;
        case '行间距变大':
          dataValue = 'pjsk.调整.行间距.大';
          break;
        case '行间距变小':
          dataValue = 'pjsk.调整.行间距.小';
          break;
        case '开启曲线':
          dataValue = 'pjsk.调整.文本曲线.开启';
          break;
        case '关闭曲线':
          dataValue = 'pjsk.调整.文本曲线.关闭';
          break;
        case '文本上移':
          dataValue = 'pjsk.调整.位置.上';
          break;
        case '文本下移':
          dataValue = 'pjsk.调整.位置.下';
          break;
        case '文本左移':
          dataValue = 'pjsk.调整.位置.左';
          break;
        case '文本右移':
          dataValue = 'pjsk.调整.位置.右';
          break;
        case '随机角色':
          dataValue = 'pjsk.调整.角色 -r';
          break;
        case '输入角色序号或名称':
          dataValue = '';
          break;
        default:
          dataValue = ``;
          break;
      }

      let array = ['指定角色', '输入', '修改角色', '修改文本', '输入角色序号或名称']
      if (config.shouldWaitForUserInputBeforeSendingCommands) {
        array.push('随机绘制')
      }

      return {
        render_data: {
          label: command,
          visited_label: command,
          style: 1,
        },
        action: {
          type: 2,
          permission: {type: 2},
          data: `${dataValue}`,
          enter: !array.includes(command),
        },
      };
    });
  }

  async function checkOptions(session, options: any, key: string, range: Range): Promise<boolean> {
    if (options[key] !== undefined && (options[key] < range.min || options[key] > range.max)) {
      await sendMessage(session, range.message, `随机绘制 自选绘制`);
      return true;
    }
    return false;
  }

  async function processUserInput(session: any) {
    if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq' || config.shouldSendDrawingGuideText) {
      await sendMessage(session, `请选择您中意的表情 ID，
并按以下格式进行绘制：
> 表情包序号 文本内容
例如：6 你好呀`, `输入`)
    }
    const userInput = await session.prompt();
    if (!userInput) return;

    const [number, ...words] = userInput.split(' ');
    const text = words.join(' ');

    const isValidCharacter = /^\d+$/.test(number) && parseInt(number, 10) >= 0 && parseInt(number, 10) < characters.length;

    if (!isValidCharacter) {
      return;
    } else {
      await session.execute(`pjsk.绘制 -n ${parseInt(number, 10)} ${text}`);
    }
  }

  function getCharacterName(character: string): string {
    const lowercaseCharacter = character.toLowerCase();

    if (/^\d+$/.test(lowercaseCharacter)) {
      const index = parseInt(lowercaseCharacter, 10);
      if (index >= 0 && index < characterNames.length - 3) {
        return characterNames[index + 3];
      }
    } else {
      const matchedCharacter = characterNames.find(
        (name) => name.toLowerCase() === lowercaseCharacter
      );
      if (matchedCharacter) {
        return matchedCharacter;
      }
    }

    return `无效的角色序号或角色名！`;
  }

  function getCharacterImagePath(characterName: string): string {
    const imagePath = pjskListDir[`pjskListFor${characterName}Dir`];
    if (!imagePath) {
      return `找不到角色图像！`;
    }
    return imagePath;
  }

  function getCharacterImageBuffer(character: string) {
    const characterName = getCharacterName(character);
    if (characterName === `无效的角色序号或角色名！`) {
      return `无效的角色序号或角色名！`;
    }
    const imagePath = getCharacterImagePath(characterName);
    if (imagePath === `找不到角色图像！`) {
      return `找不到角色图像！`;
    }
    return fs.readFileSync(imagePath);
  }

  function calculateOffsets(longestLine: string, options: any): { x: number; y: number } {
    const offsets = {x: 0, y: 0};

    if (options.curve) {
      if (longestLine.length <= 5) {
        offsets.x = -20;
        offsets.y = 200;
      } else {
        if (longestLine.length >= 8) {
          offsets.x = containsChinese(longestLine) ? -30 : -60;
          offsets.y = containsChinese(longestLine) ? 100 : 150;
        } else {
          offsets.x = -60;
          offsets.y = containsChinese(longestLine) ? 130 : 150;
        }

      }
    }

    return offsets;
  }

  function calculateFontSize(specifiedFontSize: number, longestLine: string): number {
    if (containsChinese(longestLine)) {
      if (containsEnglishLetter(longestLine) && longestLine.length > 3) {
        const englishLetterCount = countEnglishLetters(longestLine);
        return 278 / (longestLine.length) + englishLetterCount;
      } else if (longestLine.length > 3) {
        if (longestLine.length > 4) {
          return 278 / longestLine.length;
        }
        return 278 / longestLine.length - 12;
      } else {
        return specifiedFontSize + 10 * (3 - longestLine.length) + 12;
      }
    } else {
      return longestLine.length > 6
        ? 278 / longestLine.length + 10.5
        : longestLine.length > 4
          ? 278 / longestLine.length + 3
          : 278 / (longestLine.length + (longestLine.length > 2 ? 1 : 4 - longestLine.length));
    }
  }

  async function drawList2() {
    const browser = ctx.puppeteer.browser
    const context = await browser.createBrowserContext()
    const page = await context.newPage()

    const htmlContent = generateHTML(characters);

    await page.goto('file://' + filePath);

    function generateHTML(characters: any[]) {
      let html = `
      <html>
          <head>
              <style>
              @font-face {
    font-family: YurukaStd;
    src: local("YurukaStd"),url('./assets/fonts/YurukaStd.woff2') format("woff2")
}

@font-face {
    font-family: SSFangTangTi;
    src: local("SSFangTangTi"),url('./assets/fonts/ShangShouFangTangTi.woff2') format("woff2")
}

                  .character {
                      position: relative;
                      display: inline-block;
                      margin: 5px;
                      background-color: transparent;
                  }

                  .character img {
                      max-width: 100px;
                      opacity: 1;
                  }

                  .character .number {
                      position: absolute;
                      top: 0;
                      left: 0;
                      color: red;
                      font-weight: bold;
                      font-size: 30px;
                      font-family: 'YurukaStd', 'SSFangTangTi';
                  }
              </style>
          </head>
          <body>
          `;

      characters.forEach((character, index) => {
        const imgPath = 'file://' + dependencyPjskDir.replaceAll('\\', '/') + `/img/${character.img}`;
        html += `
              <div class="character">
                  <div class="number">${index}</div>
                  <img src="${imgPath}" alt="${character.name}">
              </div>
              `;
      });

      html += `
          </body>
          </html>
          `;

      return html;
    }

    await page.setContent(htmlContent);
    const screenshot = await page.screenshot({type: 'jpeg', fullPage: true, omitBackground: true});
    await page.close();
    await context.close()
    return screenshot
  }

  async function drawList(picsDir) {
    function generateHTMLFromPictures(picsDir: string): string {
      const files = fs.readdirSync(picsDir);

      const pngFiles = files.filter((file) => path.extname(file).toLowerCase() === '.png');

      // 排序
      const sortedPngFiles = pngFiles.sort((a, b) => {
        const numA = parseInt(path.basename(a, '.png'), 10);
        const numB = parseInt(path.basename(b, '.png'), 10);
        return numA - numB;
      });

      let html = `
    <html>
      <head>
        <style>
          body {
            background-color: #282C35;
          }
          .gallery {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }
   .gallery img {
            width: 9.09%;
            padding: 5px;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div class="gallery">
  `;

      // 每行展示 5 张图片
      const imagesPerRow = 11;
      for (let i = 0; i < sortedPngFiles.length; i += imagesPerRow) {
        const rowImages = sortedPngFiles.slice(i, i + imagesPerRow);
        rowImages.forEach((file) => {
          const imagePath = path.join(picsDir, file);
          html += `<img src="${imagePath}" alt="${file}">`;
        });
      }

      html += `
        </div>
      </body>
    </html>
  `;

      return html;
    }

    const html = generateHTMLFromPictures(picsDir);
    const browser = ctx.puppeteer.browser
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({width: 3454, height: 256, deviceScaleFactor: 1})
    await page.goto('file://' + filePath);
    await page.setContent(html);
    const screenshot = await page.screenshot({type: 'jpeg', fullPage: true, omitBackground: true});
    await page.close();
    await context.close()
    return screenshot
  }

  function findLongestLine(text: string): string {
    const lines = text.replace(/\\n/g, '\n').split('\n');
    let maxLength = 0;
    let longestLine = '';

    for (const line of lines) {
      let length = 0;
      for (const char of line.trim()) {
        length += char.charCodeAt(0) > 255 ? 1 : 0.5;
      }

      if (length > maxLength) {
        maxLength = length;
        longestLine = line;
      }
    }

    return longestLine;
  }

  async function draw(text, imgPath, specifiedX, specifiedY, specifiedRotate, specifiedFontSize, color, curve, spaceSize, angle) {
    const browser = ctx.puppeteer.browser
    const context = await browser.createBrowserContext()
    const page = await context.newPage()

    const htmlContent = `
<html lang="zh">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
        @font-face {
            font-family: 'YurukaStd';
            src: local('YurukaStd'), url('./assets/fonts/YurukaStd.woff2') format('woff2');
        }

        @font-face {
            font-family: 'SSFangTangTi';
            src: local('SSFangTangTi'), url('./assets/fonts/ShangShouFangTangTi.woff2') format('woff2');
        }

    .canvas {
      height: 256px;
      width: 296px;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: transparent;
      font-family: 'YurukaStd', 'SSFangTangTi';
    }

  </style>
</head>

<body>
<h1 style="font-family: 'YurukaStd'; font-weight: normal; font-style: normal;">YurukaStd</h1>
<h1 style="font-family: 'SSFangTangTi'; font-weight: normal; font-style: normal;">SSFangTangTi</h1>
  <div class="canvas">
    <canvas id="myCanvas" width="296" height="256">
  </div>


  <script>
 window.onload = () => {
      const canvas = document.getElementById("myCanvas");
      const context = canvas.getContext('2d');
      const text = '${text}';
      const x = ${specifiedX};
      const y = ${specifiedY};
      const rotate = ${specifiedRotate};
      const fontSize = '${specifiedFontSize}';
      const color = '${color}'
      const curve = ${curve};
      const position = { x, y }
      const spaceSize = ${spaceSize};
      let angle = ${angle};
      const img = new Image();
      img.src = '${imgPath}';

      img.onload = () => {
        draw(context)
      }

      function draw(context) {
        context.canvas.width = 296;
        context.canvas.height = 256;

          var hRatio = context.canvas.width / img.width;
          var vRatio = context.canvas.height / img.height;
          var ratio = Math.min(hRatio, vRatio);
          var centerShift_x = (context.canvas.width - img.width * ratio) / 2;
          var centerShift_y = (context.canvas.height - img.height * ratio) / 2;
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
          context.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShift_x,
            centerShift_y,
            img.width * ratio,
            img.height * ratio
          );
          context.font = \`\${fontSize}px YurukaStd, SSFangTangTi\`;
          context.lineWidth = 9;
          context.save();

          context.translate(position.x, position.y);
          context.rotate(rotate / 10);
          context.textAlign = "center";
          context.strokeStyle = "white";
          context.fillStyle = color;
          var lines = text.split("\\n");
          if (curve) {
            for (let line of lines) {
              for (let i = 0; i < line.length; i++) {
                context.rotate(angle / line.length / 2.5);
                context.save();
                context.translate(0, -1 * fontSize * 3.5);
                context.strokeText(line[i], 0, 0);
                context.fillText(line[i], 0, 0);
                context.restore();
              }
            }
          } else {
            for (var i = 0, k = 0; i < lines.length; i++) {
              context.strokeText(lines[i], 0, k);
              context.fillText(lines[i], 0, k);
              k += spaceSize;
            }
            context.restore();
          }
      }
    }
  </script>
</body>

</html>`

    await page.setViewport({width: 296, height: 256, deviceScaleFactor: 1})
    await page.goto('file://' + filePath);

    await page.setContent(h.unescape(htmlContent), {waitUntil: 'load'});

    const canvas = await page.$('canvas#myCanvas');
    const buffer = await canvas.screenshot({type: 'png', omitBackground: true});

    await page.close();
    await context.close()

    return buffer;
  }

  function countEnglishLetters(text: string): number {
    const englishLettersRegex = /[a-zA-Z]/g;
    const englishLetters = text.match(englishLettersRegex);

    if (englishLetters) {
      return englishLetters.length;
    } else {
      return 0;
    }
  }

  function containsEnglishLetter(text: string): boolean {
    const regex = /[a-zA-Z]/;
    return regex.test(text);
  }

  function containsChinese(text: string): boolean {
    const chineseRegex = /[\u4e00-\u9fa5]/;

    return chineseRegex.test(text);
  }

  function checkFileExists(filePath: string): boolean {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  let sentMessages = [];
  const msgSeqMap: { [msgId: string]: number } = {};

  async function sendMessage(session: any, message: any, markdownCommands: string, width?: number, height?: number): Promise<void> {
    markdownCommands = markdownCommands || '';
    width = width || 296;
    height = height || 256;
    const {bot, channelId} = session;
    let messageId;
    if (isQQOfficialRobotMarkdownTemplateEnabled && session.platform === 'qq') {
      const msgSeq = msgSeqMap[session.messageId] || 1;
      msgSeqMap[session.messageId] = msgSeq + 100;
      const buttons = createButtons(markdownCommands);

      const rows = [];
      let row = {buttons: []};
      buttons.forEach((button, index) => {
        row.buttons.push(button);
        if (row.buttons.length === 5 || index === buttons.length - 1 || row.buttons.length === config.numberOfMessageButtonsPerRow) {
          rows.push(row);
          row = {buttons: []};
        }
      });

      if (message.attrs?.src) {
        [messageId] = await session.send(message);
        // const hImg = message.attrs.src
        // const capture = /^data:([\w/-]+);base64,(.*)$/.exec(hImg)
        // const result = await session.qq.sendFileGuild(session.channelId, {
        //   file_type: 1,
        //   file_data: capture[2],
        //   srv_send_msg: false,
        // })
        // const url = `http://multimedia.nt.qq.com/download?appid=1407&fileid=${result.file_uuid}&rkey=CAMSKMa3OFokB%5fTlXbdWx0sNAtdt7YQNj36jIjbfuwwsli1U3XZknVopAnQ`
        // // const fileInfo = result.file_info;
        // const result2 = await session.qq.sendMessage(session.channelId, {
        //   msg_type: 2,
        //   msg_id: session.messageId,
        //   msg_seq: msgSeq,
        //   content: '111',
        //   markdown: {
        //     custom_template_id: config.customTemplateId,
        //     params: [
        //       {
        //         key: config.key2,
        //         values: [`![img #${width}px #${height}px]`],
        //       },
        //       {
        //         key: config.key3,
        //         values: [`(${url})`],
        //       }
        //     ],
        //   },
        //   keyboard: {
        //     content: {
        //       rows: rows.slice(0, 5),
        //     },
        //   },
        // });
        // messageId = result2.id;
      } else {
        if (config.shouldPrefixAtForMarkdownMessage) {
          message = `<@${session.userId}>
${message}`;
        }

        message = message.replace(/\n/g, '\r');

        const result = await session.qq.sendMessage(session.channelId, {
          msg_type: 2,
          msg_id: session.messageId,
          msg_seq: msgSeq,
          content: '111',
          markdown: {
            custom_template_id: config.customTemplateId,
            params: [
              {
                key: config.key,
                values: [`${message}`],
              },
            ],
          },
          keyboard: {
            content: {
              rows: rows.slice(0, 5),
            },
          },
        });
        messageId = result.id;
      }


    } else {
      if (config.shouldMentionUserInMessage && !String(message).includes('img')) {
        message = h.at(session.userId) + ' ~ \n' + message;
      }
      [messageId] = await session.send(message);
    }

    if (config.retractDelay === 0) return;
    sentMessages.push(messageId);

    if (sentMessages.length > 1) {
      const oldestMessageId = sentMessages.shift();
      setTimeout(async () => {
        await bot.deleteMessage(channelId, oldestMessageId);
      }, config.retractDelay * 1000);
    }
  }
}


