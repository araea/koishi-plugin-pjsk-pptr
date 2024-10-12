# koishi-plugin-pjsk-pptr

[![npm](https://img.shields.io/npm/v/koishi-plugin-pjsk-pptr?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-pjsk-pptr)

## 介绍

Koishi 的 Project SEKAI 表情包绘制插件。

## 使用

1. 启动 `puppeteer` 服务。
2. 设置指令别名。

## 特性

- `pjsk.列表.角色分类` 指令可触发表情包绘制引导。
- `pjsk.绘制 [文本]` 指令可直接绘制表情包。

## 关键指令

- `pjsk.绘制 [文本]` - 将自定义文本渲染到随机或指定的表情包中，使用 / 可以换行。
  - `-n` - 指定表情包 ID。
  - `-y` - 指定文本垂直位置。
  - `-x` - 指定文本水平位置。
  - `-r` - 指定文本旋转角度。
  - `-s` - 指定文本字体大小（自适应时不生效）。
  - `-c` - 是否启用文本曲线。
  - `--space` - 指定文本行间距。

## 致谢

- [上学大人](https://www.npmjs.com/~shangxue)
- [Koishi](https://koishi.chat/)
- [F.a.i.t.h](https://user.qzone.qq.com/185110524)
- [Project SEKAI](https://pjsekai.sega.jp/)
- [yunkuangao](https://github.com/yunkuangao) - 文件移动指导
- [st.ayaka.one](https://st.ayaka.one/) - 表情包资源
- [sekai-stickers](https://github.com/TheOriginalAyaka/sekai-stickers) - 表情包资源

## QQ 群

- 956758505

## License

MIT License © 2024
