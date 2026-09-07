# koishi-plugin-pjsk-pptr

Project SEKAI 表情包绘制插件。

## 安装

~~~sh
yarn add koishi-plugin-pjsk-pptr
~~~

在 Koishi 配置中启用 koishi-plugin-pjsk-pptr，并提供 puppeteer 和 database 服务。

## 指令

| 指令 | 说明 |
| --- | --- |
| pjsk.绘制 &lt;文本&gt; | 绘制表情包，/ 表示换行 |
| pjsk.列表.全部 | 查看全部表情 |
| pjsk.列表.角色分类 | 按角色分类 |
| pjsk.列表.展开指定角色 &lt;角色&gt; | 查看指定角色表情 |
| pjsk.调整 | 微调上一张图片 |

可用参数：-n &lt;ID&gt; 指定表情；-x、-y 调整位置；-r 旋转；-s 字号；
-l 行间距；-c 文本曲线。

## 许可证

可按 [Apache-2.0](LICENSE-APACHE) 或 [MIT](LICENSE-MIT) 使用。
