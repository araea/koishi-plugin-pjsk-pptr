import { Session } from 'koishi'
import { Config } from './config'

/** 按钮文案 -> 点击后填入输入框的指令。空串表示只填提示、由用户续写。 */
const BUTTON_COMMANDS: Record<string, string> = {
  表情包列表: 'pjsk.列表',
  全部: 'pjsk.列表.全部',
  角色分类: 'pjsk.列表.角色分类',
  指定角色: 'pjsk.列表.展开指定角色',
  随机绘制: 'pjsk.绘制',
  自选绘制: 'pjsk.列表.角色分类',
  修改文本: 'pjsk.调整.文本',
  调整字体: 'pjsk.调整.字体',
  调整行间距: 'pjsk.调整.行间距',
  文本曲线: 'pjsk.调整.文本曲线',
  调整位置: 'pjsk.调整.位置',
  修改角色: 'pjsk.调整.角色',
  随机角色: 'pjsk.调整.角色 -r',
  字体变大: 'pjsk.调整.字体.大',
  字体变小: 'pjsk.调整.字体.小',
  行间距变大: 'pjsk.调整.行间距.大',
  行间距变小: 'pjsk.调整.行间距.小',
  开启曲线: 'pjsk.调整.文本曲线.开启',
  关闭曲线: 'pjsk.调整.文本曲线.关闭',
  文本上移: 'pjsk.调整.位置.上',
  文本下移: 'pjsk.调整.位置.下',
  文本左移: 'pjsk.调整.位置.左',
  文本右移: 'pjsk.调整.位置.右',
}

/** 这些按钮点了之后需要用户继续输入，不能直接发送。 */
const NEEDS_INPUT = new Set(['指定角色', '输入', '修改角色', '修改文本', '输入角色序号或名称'])

function button(label: string, config: Config) {
  const waits = NEEDS_INPUT.has(label)
    || (config.shouldWaitForUserInputBeforeSendingCommands && label === '随机绘制')
  return {
    render_data: { label, visited_label: label, style: 1 },
    action: { type: 2, permission: { type: 2 }, data: BUTTON_COMMANDS[label] ?? '', enter: !waits },
  }
}

/** 把空格分隔的按钮文案排成键盘，每行不超过配置的按钮数，最多 5 行。 */
export function keyboard(labels: string, config: Config) {
  const perRow = Math.min(config.numberOfMessageButtonsPerRow || 3, 5)
  const buttons = labels.split(' ').filter(Boolean).map((label) => button(label, config))
  const rows = []
  for (let i = 0; i < buttons.length; i += perRow) rows.push({ buttons: buttons.slice(i, i + perRow) })
  return rows.slice(0, 5)
}

/** QQ 官方机器人一条消息内的多次回复需要递增的 msg_seq。 */
export function createSeqCounter() {
  const seen = new Map<string, number>()
  return (messageId: string) => {
    if (seen.size > 512) seen.clear()
    const next = (seen.get(messageId) ?? 1)
    seen.set(messageId, next + 100)
    return next
  }
}

export async function sendMarkdown(session: Session, text: string, labels: string, config: Config, seq: number) {
  const content = config.shouldPrefixAtForMarkdownMessage
    ? `<@${session.userId}>\r${text.replace(/\n/g, '\r')}`
    : text.replace(/\n/g, '\r')

  const result = await session['qq'].sendMessage(session.channelId, {
    msg_type: 2,
    msg_id: session.messageId,
    msg_seq: seq,
    content: '111',
    markdown: {
      custom_template_id: config.customTemplateId,
      params: [{ key: config.key, values: [content] }],
    },
    keyboard: { content: { rows: keyboard(labels, config) } },
  })
  return result.id
}
