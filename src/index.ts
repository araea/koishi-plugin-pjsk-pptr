import {Context, Logger, Schema, h} from 'koishi'

import {} from 'koishi-plugin-puppeteer';
import path from 'path';
import * as fs from "fs";

export const name = 'pjsk-pptr'
export const inject = ['puppeteer']
export const usage = `## 🎮 使用

- 启动 puppeteer 服务
- 建议为指令添加指令别名

## ⚙️ 配置

无特殊配置

## 📝 命令

- \`pjsk.列表\` - 显示可用的表情包列表
- \`pjsk.绘制 [inputText:text]\` - 将自定义文本渲染到随机或指定的表情包中，使用 / 可以换行。
  - \`-n\` - 指定表情包 ID
  - \`-y\` - 指定文本垂直位置
  - \`-x\` - 指定文本水平位置
  - \`-r\` - 指定文本旋转角度
  - \`-s\` - 指定文本字体大小
  - \`-c\` - 是否启用文本曲线
  - \`--space\` - 指定文本行间距`

const logger = new Logger('PJSK')

// pz* pzx*
export interface Config {
  isTextSizeAdaptationEnabled: boolean
  retractDelay: number
}

export const Config: Schema<Config> = Schema.object({
  isTextSizeAdaptationEnabled: Schema.boolean().default(true).description('是否启用文本大小自适应'),
  retractDelay: Schema.number().min(0).default(0).description(`自动撤回等待的时间，单位是秒。值为 0 时不启用自动撤回功能。`),
})

// jk*
interface Range {
  min: number;
  max: number;
  message: string;
}

export function apply(ctx: Context, config: Config) {
  // cl*
  const filePath = path.join(__dirname, 'emptyHtml.html').replace(/\\/g, '/');
  const characterNames = [
    'characterListAll',
    'characterListWithIndex',
    'characterListNoIndex',
    'Airi',
    'Akito',
    'An',
    'Emu',
    'Ena',
    'Haruka',
    'Honami',
    'Ichika',
    'KAITO',
    'Kanade',
    'Kohane',
    'Len',
    'Luka',
    'Mafuyu',
    'Meiko',
    'Miku',
    'Minori',
    'Mizuki',
    'Nene',
    'Rin',
    'Rui',
    'Saki',
    'Shiho',
    'Shizuku',
    'Touya',
    'Tsukasa',
  ];
  const pjskListDir: { [key: string]: string } = {};
  // wj*
  const dependencyPjskDir = path.join(__dirname, 'assets')
  for (const name of characterNames) {
    pjskListDir[`pjskListFor${name}Dir`] = path.join(__dirname, 'assets', 'list', `${name}.jpeg`);
  }
  const characters = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'characters.json'), 'utf8'))

  // pjsk* h* bz*
  ctx.command('pjsk', '查看pjsk表情包生成帮助')
    .action(async ({session}) => {
      await session.execute(`pjsk -h`)
    })
  // lb*
  ctx.command('pjsk.列表', 'pjsk表情列表')
    .action(async ({session}) => {
      // 读取 pjskListDir 图片，并得到 buffer
      const buffer = fs.readFileSync(pjskListDir['pjskListForcharacterListAllDir']);
      return await sendMessage(session, h.image(buffer, 'image/jpeg'))
    })

  // hz*
  ctx.command('pjsk.绘制 [inputText:text]', '绘制表情包')
    .option('number', '-n [number:number] 表情包ID', {fallback: undefined})
    .option('positionY', '-y [positionY:number] 文本的垂直位置')
    .option('positionX', '-x [positionX:number] 文本的水平位置')
    .option('rotate', '-r [rotate:number] 文本的旋转角度')
    .option('fontSize', '-s [fontSize:number] 文本字体的大小')
    .option('spaceSize', '-l [spaceSize:number] 文本上下行间距')
    .option('curve', '-c 是否启用文本曲线', {fallback: false})
    .action(async ({session, options}, inputText) => {

      // 表情包 ID 必须在 characters 的元素个数之内，即小于 characters.length，默认为随机
      // 文本的垂直位置 y 范围 0~256，默认为 character 中指定的值
      // 文本的水平位置 x 范围 0~296，默认为 character 中指定的值
      // 文本的旋转角度 rotate 范围 -10 ~ 10 默认为 character 中指定的值
      // 文本的字体大小 fontSize 范围 10 ~ 100 默认为 character 中指定的值
      // 是否启用文本曲线功能 curve 默认为 false
      // 文本上下行间距 spaceSize 范围 18 ~ 100，默认值为 18

      let character: { defaultText?: any; id?: string; name?: string; character?: string; img?: any; color?: any; };
      if (options.number !== undefined) {
        const isValidCharacter = options.number >= 0 && options.number < characters.length;
        if (!isValidCharacter) {
          return await sendMessage(session, `抱歉，您输入的表情 ID 无效，请输入范围在 0 到 358 之间的有效表情 ID。`)
        }
        character = characters[options.number]
      } else {
        character = getRandomCharacter(characters);
      }

      let {text, x, y, r: rotate, s: fontSize} = character.defaultText;
      if (inputText) {
        text = inputText.replace(/\/+/g, '\\n').replace(/\n/g, '\\n');
      }
      const {color, img} = character;
      const imgPath = 'file://' + dependencyPjskDir.replaceAll('\\', '/') + `/img/${img}`;

      const curve = options.curve || false;
      let spaceSize = options.spaceSize || 18;
      let specifiedX = options.positionX !== undefined ? options.positionX : x;
      let specifiedY = options.positionY !== undefined ? options.positionY : y + 12;
      const specifiedRotate = options.rotate !== undefined ? options.rotate : rotate;
      let specifiedFontSize = options.fontSize !== undefined ? options.fontSize : fontSize;


      if (config.isTextSizeAdaptationEnabled) {
        const longestLine = findLongestLine(text);
        const offsets = calculateOffsets(longestLine, options);
        specifiedX += offsets.x;
        specifiedY += offsets.y;
        specifiedFontSize = calculateFontSize(specifiedFontSize, longestLine);
        spaceSize += specifiedFontSize / 2 + 10;
      }

      async function checkOptions(options: any, key: string, range: Range): Promise<boolean> {
        if (options[key] !== undefined && (options[key] < range.min || options[key] > range.max)) {
          await sendMessage(session, range.message);
          return true;
        }
        return false;
      }

      const ranges: { [key: string]: Range } = {
        positionY: {min: 0, max: 256, message: '抱歉，文本的垂直位置必须在 0 到 256 之间。'},
        positionX: {min: 0, max: 296, message: '抱歉，文本的水平位置必须在 0 到 296 之间。'},
        rotate: {min: -10, max: 10, message: '抱歉，文本的旋转角度必须在 -10 到 10 之间。'},
        fontSize: {min: 10, max: 100, message: '抱歉，文本的字体大小必须在 10 到 100 之间。'},
        spaceSize: {min: 18, max: 100, message: '抱歉，文本的上下行间距必须在 18 到 100 之间。'}
      };

      for (const key in ranges) {
        if (await checkOptions(options, key, ranges[key])) {
          return;
        }
      }

      const angle = (Math.PI * text.length) / 7; // 曲线弯曲的角度
      const buffer = await draw(text, imgPath, specifiedX, specifiedY, specifiedRotate, specifiedFontSize, color, curve, spaceSize, angle)
      return await sendMessage(session, h.image(buffer, 'image/png'))
    })


  // hs*
  function calculateOffsets(longestLine: string, options: any): { x: number; y: number } {
    const offsets = {x: 0, y: 0};

    if (options.curve) {
      if (longestLine.length <= 5) {
        offsets.x = -60;
        offsets.y = containsChinese(longestLine) ? 260 : 380;
      } else {
        offsets.x = -60;
        offsets.y = containsChinese(longestLine) ? 200 : 180;
      }
    }

    return offsets;
  }

  function calculateFontSize(specifiedFontSize: number, longestLine: string): number {
    if (containsChinese(longestLine)) {
      if (containsEnglishLetter(longestLine) && longestLine.length > 3) {
        const englishLetterCount = countEnglishLetters(longestLine);
        return 278 / (longestLine.length - englishLetterCount / 2) - 2;
      } else if (longestLine.length > 3) {
        if (longestLine.length > 4) {
          return 278 / longestLine.length;
        }
        return 278 / longestLine.length - 12;
      } else {
        return specifiedFontSize + 10 * (3 - longestLine.length);
      }
    } else {
      return longestLine.length > 4
        ? 278 / longestLine.length + 3
        : 278 / (longestLine.length + (longestLine.length > 2 ? 1 : 4 - longestLine.length));
    }
  }

  async function drawList2() {
    const browser = ctx.puppeteer.browser
    const context = await browser.createBrowserContext()
    const page = await context.newPage()

    const htmlContent = generateHTML(characters);

    await page.goto('file://' + filePath);

    function generateHTML(characters: any[]) {
      let html = `
      <html>
          <head>
              <style>
              @font-face {
    font-family: YurukaStd;
    src: local("YurukaStd"),url('./assets/fonts/YurukaStd.woff2') format("woff2")
}

@font-face {
    font-family: SSFangTangTi;
    src: local("SSFangTangTi"),url('./assets/fonts/ShangShouFangTangTi.woff2') format("woff2")
}

                  .character {
                      position: relative;
                      display: inline-block;
                      margin: 5px;
                      background-color: transparent;
                  }

                  .character img {
                      max-width: 100px;
                      opacity: 1;
                  }

                  .character .number {
                      position: absolute;
                      top: 0;
                      left: 0;
                      color: red;
                      font-weight: bold;
                      font-size: 30px;
                      font-family: 'YurukaStd', 'SSFangTangTi';
                  }
              </style>
          </head>
          <body>
          `;

      characters.forEach((character, index) => {
        const imgPath = 'file://' + dependencyPjskDir.replaceAll('\\', '/') + `/img/${character.img}`;
        html += `
              <div class="character">
                  <div class="number">${index}</div>
                  <img src="${imgPath}" alt="${character.name}">
              </div>
              `;
      });

      html += `
          </body>
          </html>
          `;

      return html;
    }

    await page.setContent(htmlContent);
    const screenshot = await page.screenshot({type: 'jpeg', fullPage: true, omitBackground: true});
    await page.close();
    await context.close()
    return screenshot
  }

  async function drawList(picsDir) {
    function generateHTMLFromPictures(picsDir: string): string {
      const files = fs.readdirSync(picsDir);

      const pngFiles = files.filter((file) => path.extname(file).toLowerCase() === '.png');

      // 排序
      const sortedPngFiles = pngFiles.sort((a, b) => {
        const numA = parseInt(path.basename(a, '.png'), 10);
        const numB = parseInt(path.basename(b, '.png'), 10);
        return numA - numB;
      });

      let html = `
    <html>
      <head>
        <style>
          body {
            background-color: #282C35;
          }
          .gallery {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }
   .gallery img {
            width: 9.09%;
            padding: 5px;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div class="gallery">
  `;

      // 每行展示 5 张图片
      const imagesPerRow = 11;
      for (let i = 0; i < sortedPngFiles.length; i += imagesPerRow) {
        const rowImages = sortedPngFiles.slice(i, i + imagesPerRow);
        rowImages.forEach((file) => {
          const imagePath = path.join(picsDir, file);
          html += `<img src="${imagePath}" alt="${file}">`;
        });
      }

      html += `
        </div>
      </body>
    </html>
  `;

      return html;
    }

    const html = generateHTMLFromPictures(picsDir);
    const browser = ctx.puppeteer.browser
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({width: 3454, height: 256, deviceScaleFactor: 1})
    await page.goto('file://' + filePath);
    await page.setContent(html);
    const screenshot = await page.screenshot({type: 'jpeg', fullPage: true, omitBackground: true});
    await page.close();
    await context.close()
    return screenshot
  }

  function findLongestLine(text: string): string {
    const lines = text.replace(/\\n/g, '\n').split('\n');
    let maxLength = 0;
    let longestLine = '';

    for (const line of lines) {
      let length = 0;
      for (const char of line.trim()) {
        length += char.charCodeAt(0) > 255 ? 1 : 0.5;
      }

      if (length > maxLength) {
        maxLength = length;
        longestLine = line;
      }
    }

    return longestLine;
  }

  async function draw(text, imgPath, specifiedX, specifiedY, specifiedRotate, specifiedFontSize, color, curve, spaceSize, angle) {
    const browser = ctx.puppeteer.browser
    const context = await browser.createBrowserContext()
    const page = await context.newPage()

    const htmlContent = `
<html lang="zh">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
        @font-face {
            font-family: 'YurukaStd';
            src: local('YurukaStd'), url('./assets/fonts/YurukaStd.woff2') format('woff2');
        }

        @font-face {
            font-family: 'SSFangTangTi';
            src: local('SSFangTangTi'), url('./assets/fonts/ShangShouFangTangTi.woff2') format('woff2');
        }

    .canvas {
      height: 256px;
      width: 296px;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: transparent;
      font-family: 'YurukaStd', 'SSFangTangTi';
    }

  </style>
</head>

<body>
<h1 style="font-family: 'YurukaStd'; font-weight: normal; font-style: normal;">YurukaStd</h1>
<h1 style="font-family: 'SSFangTangTi'; font-weight: normal; font-style: normal;">SSFangTangTi</h1>
  <div class="canvas">
    <canvas id="myCanvas" width="296" height="256">
  </div>


  <script>
 window.onload = () => {
      const canvas = document.getElementById("myCanvas");
      const context = canvas.getContext('2d');
      const text = '${text}';
      const x = ${specifiedX};
      const y = ${specifiedY};
      const rotate = ${specifiedRotate};
      const fontSize = '${specifiedFontSize}';
      const color = '${color}'
      const curve = ${curve};
      const position = { x, y }
      const spaceSize = ${spaceSize};
      let angle = ${angle};
      const img = new Image();
      img.src = '${imgPath}';

      img.onload = () => {
        draw(context)
      }

      function draw(context) {
        context.canvas.width = 296;
        context.canvas.height = 256;

          var hRatio = context.canvas.width / img.width;
          var vRatio = context.canvas.height / img.height;
          var ratio = Math.min(hRatio, vRatio);
          var centerShift_x = (context.canvas.width - img.width * ratio) / 2;
          var centerShift_y = (context.canvas.height - img.height * ratio) / 2;
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
          context.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShift_x,
            centerShift_y,
            img.width * ratio,
            img.height * ratio
          );
          context.font = \`\${fontSize}px YurukaStd, SSFangTangTi\`;
          context.lineWidth = 9;
          context.save();

          context.translate(position.x, position.y);
          context.rotate(rotate / 10);
          context.textAlign = "center";
          context.strokeStyle = "white";
          context.fillStyle = color;
          var lines = text.split("\\n");
          if (curve) {
            for (let line of lines) {
              for (let i = 0; i < line.length; i++) {
                context.rotate(angle / line.length / 2.5);
                context.save();
                context.translate(0, -1 * fontSize * 3.5);
                context.strokeText(line[i], 0, 0);
                context.fillText(line[i], 0, 0);
                context.restore();
              }
            }
          } else {
            for (var i = 0, k = 0; i < lines.length; i++) {
              context.strokeText(lines[i], 0, k);
              context.fillText(lines[i], 0, k);
              k += spaceSize;
            }
            context.restore();
          }
      }
    }
  </script>
</body>

</html>`

    await page.setViewport({width: 296, height: 256, deviceScaleFactor: 1})
    await page.goto('file://' + filePath);

    await page.setContent(h.unescape(htmlContent), {waitUntil: 'load'});

    const canvas = await page.$('canvas#myCanvas');
    const buffer = await canvas.screenshot({type: 'png', omitBackground: true});

    await page.close();
    await context.close()

    return buffer;
  }

  function getRandomCharacter(characters: any[]): any {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  }

  function countEnglishLetters(text: string): number {
    const englishLettersRegex = /[a-zA-Z]/g;
    const englishLetters = text.match(englishLettersRegex);

    if (englishLetters) {
      return englishLetters.length;
    } else {
      return 0;
    }
  }

  function containsEnglishLetter(text: string): boolean {
    const regex = /[a-zA-Z]/;
    return regex.test(text);
  }

  function containsChinese(text: string): boolean {
    const chineseRegex = /[\u4e00-\u9fa5]/;

    return chineseRegex.test(text);
  }

  function checkFileExists(filePath: string): boolean {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  let sentMessages = [];

  async function sendMessage(session: any, message: any): Promise<void> {
    const {bot, channelId} = session;
    let messageId;
    [messageId] = await session.send(message);


    if (config.retractDelay === 0) return;
    sentMessages.push(messageId);

    if (sentMessages.length > 1) {
      const oldestMessageId = sentMessages.shift();
      setTimeout(async () => {
        await bot.deleteMessage(channelId, oldestMessageId);
      }, config.retractDelay * 1000);
    }
  }
}


