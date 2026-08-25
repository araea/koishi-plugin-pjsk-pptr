import { Context } from 'koishi'
import {} from 'koishi-plugin-puppeteer'
import path from 'node:path'
import { ASSETS } from './characters'

export interface Sticker {
  text: string
  /** 角色立绘相对 `assets/img` 的路径。 */
  img: string
  color: string
  x: number
  y: number
  rotate: number
  fontSize: number
  spaceSize: number
  curve: boolean
}

const WIDTH = 296
const HEIGHT = 256

const fileUrl = (...parts: string[]) => 'file://' + path.join(ASSETS, ...parts).replace(/\\/g, '/')

/** 画布尺寸固定，字体走 file:// 加载，所以页面必须先落在 assets 目录下。 */
const PAGE = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <style>
    @font-face { font-family: "YurukaStd"; src: local("YurukaStd"), url("./fonts/YurukaStd.woff2") format("woff2"); }
    @font-face { font-family: "SSFangTangTi"; src: local("SSFangTangTi"), url("./fonts/ShangShouFangTangTi.woff2") format("woff2"); }
    body { margin: 0; background: transparent; font-family: "YurukaStd", "SSFangTangTi"; }
    canvas { display: block; }
  </style>
</head>
<body><canvas id="canvas" width="${WIDTH}" height="${HEIGHT}"></canvas></body>
</html>`

/** 序列化进 page.evaluate 的绘制函数。 */
const CLIENT = String.raw`
async (sticker) => {
  await Promise.all(['YurukaStd', 'SSFangTangTi'].map((family) =>
    document.fonts.load('30px "' + family + '"').catch(() => {})))
  await document.fonts.ready

  const canvas = document.getElementById('canvas')
  const context = canvas.getContext('2d')
  const image = new Image()
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = () => reject(new Error('立绘加载失败：' + sticker.img))
    image.src = sticker.img
  })

  // 立绘等比缩放并居中
  const ratio = Math.min(canvas.width / image.width, canvas.height / image.height)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, image.width, image.height,
    (canvas.width - image.width * ratio) / 2,
    (canvas.height - image.height * ratio) / 2,
    image.width * ratio, image.height * ratio)

  context.font = sticker.fontSize + 'px YurukaStd, SSFangTangTi'
  context.lineWidth = 9
  context.textAlign = 'center'
  context.strokeStyle = 'white'
  context.fillStyle = sticker.color

  context.save()
  context.translate(sticker.x, sticker.y)
  context.rotate(sticker.rotate / 10)

  const lines = sticker.text.split('\n')
  if (sticker.curve) {
    // 沿弧线逐字排布，每个字转过相同的角度
    const angle = Math.PI * sticker.text.length / 7
    for (const line of lines) {
      for (const char of [...line]) {
        context.rotate(angle / line.length / 2.5)
        context.save()
        context.translate(0, -sticker.fontSize * 3.5)
        context.strokeText(char, 0, 0)
        context.fillText(char, 0, 0)
        context.restore()
      }
    }
  } else {
    lines.forEach((line, index) => {
      const y = index * sticker.spaceSize
      context.strokeText(line, 0, y)
      context.fillText(line, 0, y)
    })
  }
  context.restore()
}`

export function createRenderer(ctx: Context) {
  const blankUrl = fileUrl('blank.html')

  return async function draw(sticker: Sticker) {
    const page = await ctx.puppeteer.page()
    try {
      await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 })
      await page.goto(blankUrl)
      await page.setContent(PAGE)
      await page.evaluate(`(${CLIENT})(${JSON.stringify({
        ...sticker,
        img: fileUrl('img', sticker.img),
      }).replace(/</g, '\\u003c')})`)
      return await (await page.$('#canvas')).screenshot({ type: 'png', omitBackground: true })
    } finally {
      await page.close()
    }
  }
}
