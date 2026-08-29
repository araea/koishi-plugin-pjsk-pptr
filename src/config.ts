import { Schema } from 'koishi'

export interface Config {
  isTextSizeAdaptationEnabled: boolean
  shouldSendDrawingGuideText: boolean
  shouldSendSuccessMessageAfterDrawingEmoji: boolean
  shouldMentionUserInMessage: boolean
  retractDelay: number
}

export const Config: Schema<Config> = Schema.object({
  isTextSizeAdaptationEnabled: Schema.boolean().default(true).description('根据文本长度自动调整字号与位置。'),
  shouldSendDrawingGuideText: Schema.boolean().default(true).description('发送引导用户绘制表情包的提示文本。'),
  shouldSendSuccessMessageAfterDrawingEmoji: Schema.boolean().default(true).description('绘制完成后发送提示。'),
  shouldMentionUserInMessage: Schema.boolean().default(false).description('在消息中 @ 用户。'),
  retractDelay: Schema.natural().default(0).description('自动撤回延迟（秒），0 表示不撤回。'),
})
