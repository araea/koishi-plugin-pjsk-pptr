koishi-plugin-pjsk-pptr
========================

[<img alt="github" src="https://img.shields.io/badge/github-araea/pjsk_pptr-8da0cb?style=for-the-badge&labelColor=555555&logo=github" height="20">](https://github.com/araea/koishi-plugin-pjsk-pptr)
[<img alt="npm" src="https://img.shields.io/npm/v/koishi-plugin-pjsk-pptr.svg?style=for-the-badge&color=fc8d62&logo=npm" height="20">](https://www.npmjs.com/package/koishi-plugin-pjsk-pptr)

Koishi 的 Project SEKAI 表情包绘制插件。通过自定义文本绘制各种有趣的表情包。

## 使用

1. 启动 `puppeteer` 服务。
2. 配置指令别名。
3. 通过指令与插件交互。

## 指令

| 指令 | 说明 |
| --- | --- |
| `pjsk.绘制 <文本>` | 将文本绘制到随机或指定的表情包上，`/` 换行 |
| `pjsk.列表.全部` | 全部表情总览 |
| `pjsk.列表.角色分类` | 按角色分类，随后输入序号或角色名进入绘制引导 |
| `pjsk.列表.展开指定角色 <角色>` | 展开某个角色的表情 |
| `pjsk.调整` | 查看调整指令 |

## 绘制参数

| 参数 | 说明 |
| --- | --- |
| `-n <ID>` | 表情包 ID（0 ~ 358），缺省随机 |
| `-x <数值>` | 文本水平位置（0 ~ 296） |
| `-y <数值>` | 文本垂直位置（0 ~ 256） |
| `-r <数值>` | 文本旋转角度（-10 ~ 10） |
| `-s <数值>` | 字体大小（10 ~ 100），自适应开启时不生效 |
| `-l <数值>` / `--space` | 行间距（18 ~ 100） |
| `-c` | 开启文本曲线 |

## 调整

画完之后可以在上一张的基础上微调，不必重新输入全部参数：

| 指令 | 说明 |
| --- | --- |
| `pjsk.调整.文本 <文本>` | 换文本 |
| `pjsk.调整.字体.大` / `.小` | 字号 ±5 |
| `pjsk.调整.行间距.大` / `.小` | 行间距 ±5 |
| `pjsk.调整.位置.上` / `.下` / `.左` / `.右` | 位置 ±20 |
| `pjsk.调整.文本曲线.开启` / `.关闭` | 文本曲线 |
| `pjsk.调整.角色 <ID>` / `-r` | 换角色，`-r` 随机 |

## 致谢

- [上学大人](https://www.npmjs.com/~shangxue)
- [Koishi](https://koishi.chat/)
- [F.a.i.t.h](https://user.qzone.qq.com/185110524)
- [Project SEKAI](https://pjsekai.sega.jp/)
- [yunkuangao](https://github.com/yunkuangao)
- [st.ayaka.one](https://st.ayaka.one/)
- [sekai-stickers](https://github.com/TheOriginalAyaka/sekai-stickers)
- [@nick-cjyx9](https://github.com/nick-cjyx9) — 本地文件读取与内网 SSRF

## QQ 群

- 956758505

<br>

#### License

<sup>
Licensed under either of <a href="LICENSE-APACHE">Apache License, Version
2.0</a> or <a href="LICENSE-MIT">MIT license</a> at your option.
</sup>

<br>

<sub>
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this crate by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.
</sub>
