koishi-plugin-pjsk-pptr
========================

[<img alt="github" src="https://img.shields.io/badge/github-araea/pjsk_pptr-8da0cb?style=for-the-badge&labelColor=555555&logo=github" height="20">](https://github.com/araea/koishi-plugin-pjsk-pptr)
[<img alt="npm" src="https://img.shields.io/npm/v/koishi-plugin-pjsk-pptr.svg?style=for-the-badge&color=fc8d62&logo=npm" height="20">](https://www.npmjs.com/package/koishi-plugin-pjsk-pptr)

Koishi 的 Project SEKAI 表情包绘制插件。通过自定义文本绘制各种有趣的表情包。

## 使用

1. 启动 `puppeteer` 服务。
2. 配置指令别名。
3. 通过指令与插件交互。

## 基本用法

- **pjsk.列表.角色分类**
  进入表情包绘制引导。

- **pjsk.绘制 [文本]**
  将文本绘制于随机或指定表情包。文本内用 `/` 换行。

## 指令参数

- `-n`
  指定表情包 ID。

- `-y`
  文本垂直位置。

- `-x`
  文本水平位置。

- `-r`
  文本旋转角度。

- `-s`
  文本字体大小。自适应模式下无效。

- `-c`
  开启文本曲线效果。

- `--space`
  行间距设置。

## 致谢

* [上学大人](https://www.npmjs.com/~shangxue)
* [Koishi](https://koishi.chat/)
* [F.a.i.t.h](https://user.qzone.qq.com/185110524)
* [Project SEKAI](https://pjsekai.sega.jp/)
* [yunkuangao](https://github.com/yunkuangao) - 文件移动指导
* [st.ayaka.one](https://st.ayaka.one/) - 表情包资源
* [sekai-stickers](https://github.com/TheOriginalAyaka/sekai-stickers) - 表情包资源
* 感谢 [@nick-cjyx9](https://github.com/nick-cjyx9) 的安全洞见
  修复了本地文件读取与内网 SSRF 隐患
  建议采用安全参数传递与输入过滤

## QQ 群

* 956758505

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
