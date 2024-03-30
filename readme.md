# koishi-plugin-pjsk-pptr

[![npm](https://img.shields.io/npm/v/koishi-plugin-pjsk-pptr?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-pjsk-pptr)

## 🎈 介绍

通过 puppeteer 渲染 HTML 和 Canvas，实现了一个可以自定义文本并渲染初音未来 Project SEKAI 表情包的功能。

## 📦 安装

```
npm i koishi-plugin-pjsk-stickers-maker-pptr
```

或前往 Koishi 插件市场添加该插件。

## 🎮 使用

- 启动 puppeteer 服务
- 建议为指令添加指令别名

## ⚙️ 配置

无特殊配置

## 📝 命令

- `pjsk.教学引导` - 循环教学引导绘制
- `pjsk.列表` - 显示可用的表情包列表
- `pjsk.绘制 [inputText:text]` - 将自定义文本渲染到随机或指定的表情包中，使用 / 可以换行。
  - `-n` - 指定表情包 ID
  - `-y` - 指定文本垂直位置
  - `-x` - 指定文本水平位置
  - `-r` - 指定文本旋转角度
  - `-s` - 指定文本字体大小（自适应时不生效）
  - `-c` - 是否启用文本曲线
  - `--space` - 指定文本行间距

## 🙏 致谢

- [上学大人](https://www.npmjs.com/~shangxue) - 一个严肃的 🤓
- [Koishi](https://koishi.chat/) - 一个灵活强大的机器人框架 🤖
- [F.a.i.t.h](https://user.qzone.qq.com/185110524) - 本尊特别喜欢的 QQ 群友 🥰
- [Project SEKAI](https://pjsekai.sega.jp/) - 一个充满魅力的音乐游戏 🎶
- [yunkuangao](https://github.com/yunkuangao) - pjsk 文件移动指导，修复 bugs 🐱
- [st.ayaka.one](https://st.ayaka.one/) - 提供 Project SEKAI 表情包的网站 🎀
- [sekai-stickers](https://github.com/TheOriginalAyaka/sekai-stickers) - 提供 Project SEKAI 表情包的仓库 📦

## 📄 License

MIT License © 2024
