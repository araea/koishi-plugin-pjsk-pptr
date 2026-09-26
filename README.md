# Project SEKAI 表情包

Koishi 插件，根据角色和文本绘制 Project SEKAI 风格表情包。

## 安装

```sh
yarn add koishi-plugin-pjsk-pptr
```

在 Koishi 中启用，并安装 `puppeteer` 与 `database` 服务。

## 指令

| 指令 | 说明 |
| --- | --- |
| `pjsk.绘制 <文本>` | 绘制表情包；`/` 表示换行 |
| `pjsk.列表 [角色]` | 查看角色或该角色的全部表情 |
| `pjsk.调整` | 微调上一张图片 |
| `pjsk.调整.文本 <内容>` | 修改文本 |
| `pjsk.调整.字号 <大/小>` | 调整字号 |
| `pjsk.调整.行距 <大/小>` | 调整行距 |
| `pjsk.调整.位置 <上/下/左/右>` | 调整位置 |
| `pjsk.调整.曲线 <开/关>` | 切换曲线文本 |
| `pjsk.调整.角色 [ID]` | 更换角色 |

绘制选项：`-n <ID>` 指定表情，`-x` / `-y` 调整位置，`-r` 旋转，`-s` 设置字号，`-l` 设置行距，`-c` 设置曲线文本。

## 许可证

可按 [Apache-2.0](LICENSE-APACHE) 或 [MIT](LICENSE-MIT) 使用。
