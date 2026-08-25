import { Schema } from 'koishi'

export interface Config {
  isTextSizeAdaptationEnabled: boolean
  shouldSendDrawingGuideText: boolean
  shouldSendSuccessMessageAfterDrawingEmoji: boolean
  shouldMentionUserInMessage: boolean
  retractDelay: number
  isEnableQQOfficialRobotMarkdownTemplate: boolean
  customTemplateId?: string
  key?: string
  numberOfMessageButtonsPerRow?: number
  shouldPrefixAtForMarkdownMessage?: boolean
  shouldWaitForUserInputBeforeSendingCommands?: boolean
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    isTextSizeAdaptationEnabled: Schema.boolean().default(true).description('根据文本长度自动调整字号与位置。'),
    shouldSendDrawingGuideText: Schema.boolean().default(true)
      .description('发送引导用户绘制表情包的提示文本（QQ 官方机器人模板下强制开启）。'),
    shouldSendSuccessMessageAfterDrawingEmoji: Schema.boolean().default(true)
      .description('绘制完成后发送提示（QQ 官方机器人模板下强制开启）。'),
    shouldMentionUserInMessage: Schema.boolean().default(false).description('非 QQ 官方机器人时，在消息中 @ 用户。'),
    retractDelay: Schema.natural().default(0).description('自动撤回延迟（秒），0 表示不撤回。'),
    isEnableQQOfficialRobotMarkdownTemplate: Schema.boolean().default(false)
      .description('启用 QQ 官方机器人的 Markdown 模板（带消息按钮）。'),
  }),
  Schema.union([
    Schema.object({
      isEnableQQOfficialRobotMarkdownTemplate: Schema.const(true).required(),
      customTemplateId: Schema.string().default('').description('自定义模板 ID。'),
      key: Schema.string().default('')
        .description('模板中存放文本的插值 key。若插值写作 `{{.info}}`，这里填 `info`。'),
      numberOfMessageButtonsPerRow: Schema.natural().min(3).max(5).default(3).description('每行消息按钮的数量。'),
      shouldPrefixAtForMarkdownMessage: Schema.boolean().default(false).description('在 Markdown 文本前加一行 @用户。'),
      shouldWaitForUserInputBeforeSendingCommands: Schema.boolean().default(false)
        .description('点击「随机绘制」按钮后等待用户输入。'),
    }),
    Schema.object({}),
  ]),
]) as Schema<Config>
