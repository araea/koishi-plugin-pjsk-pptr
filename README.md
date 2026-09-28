# Project SEKAI 表情包

Koishi 插件：用 Project SEKAI 角色立绘生成可微调的自定义表情包

[![GitHub](https://img.shields.io/badge/GitHub-仓库-181717)](https://github.com/araea/koishi-plugin-pjsk-pptr) [![npm](https://img.shields.io/badge/npm-包-CB3837)](https://www.npmjs.com/package/koishi-plugin-pjsk-pptr)

## 安装

```sh
yarn add koishi-plugin-pjsk-pptr
```

需要 `puppeteer` 与 `database` 服务。puppeteer 服务依赖 Chromium，需在本机安装可被 puppeteer 调用的 Chromium。

## 快速使用

| 指令 | 说明 |
| --- | --- |
| `pjsk.绘制 <文本>` | 绘制表情包，文本中 `/` 表示换行 |
| `pjsk.列表 [角色]` | 按角色浏览表情，`pjsk.列表 -a` 一次列出全部 |
| `pjsk.调整` | 查看可用的微调指令 |
| `pjsk.调整.文本 <内容>` | 修改文本 |
| `pjsk.调整.字号 <大/小>` | 增减字号 |
| `pjsk.调整.行距 <大/小>` | 增减行距 |
| `pjsk.调整.位置 <上/下/左/右>` | 移动文本 |
| `pjsk.调整.曲线 <开/关>` | 开关文本曲线 |
| `pjsk.调整.角色 [ID]` | 更换角色，`-r` 随机 |

`pjsk.绘制` 选项：`-n <ID>` 指定表情（缺省随机），`-x` / `-y` 调整位置，`-r` 旋转，`-s` 字号，`-l` 行距，`-c` 曲线文本。

每人最近一次绘制的参数会保存，供 `pjsk.调整.*` 增量修改。

## 配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `isTextSizeAdaptationEnabled` | boolean | `true` | 根据文本长度自动调整字号与位置 |
| `shouldSendDrawingGuideText` | boolean | `true` | 发送引导用户绘制表情包的提示文本 |
| `shouldSendSuccessMessageAfterDrawingEmoji` | boolean | `true` | 绘制完成后发送提示 |
| `shouldMentionUserInMessage` | boolean | `false` | 在消息中 @ 用户 |
| `retractDelay` | number | `0` | 自动撤回延迟（秒），0 表示不撤回 |

## 限制 / 风险

图片由无头浏览器渲染。Chromium 不可用或渲染失败时，不返回图片，仅回显表情包的文字参数。
