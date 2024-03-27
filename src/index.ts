import { Context, Logger, Schema, h, is, isComparable } from 'koishi'

import { } from 'koishi-plugin-puppeteer';
import path from 'path';

export const name = 'pjsk-pptr'
export const inject = ['puppeteer']
export const usage = `## 🎮 使用

- 启动 puppeteer 服务
- 建议为指令添加指令别名

## ⚙️ 配置

无特殊配置

## 📝 命令

- \`pjsk.教学引导\` - 循环教学引导绘制
- \`pjsk.列表\` - 显示可用的表情包列表
- \`pjsk.绘制 [inputText:text]\` - 将自定义文本渲染到随机或指定的表情包中，使用 / 可以换行。
  - \`-n\` - 指定表情包 ID
  - \`-y\` -指定文本垂直位置
  - \`-x\` - 指定文本水平位置
  - \`-r\` - 指定文本旋转角度
  - \`-s\` - 指定文本字体大小
  - \`-c\` - 是否启用文本曲线
  - \`-l\` - 指定文本行间距`
const logger = new Logger('PJSK')

export interface Config { }

export const Config: Schema<Config> = Schema.object({})



export function apply(ctx: Context) {
  const dependencyPjskDir = path.join(__dirname, 'pjsk-pptr')
  // const koishiCacheDir = path.join(ctx.baseDir, 'cache')
  // const screenshotPath = path.join(koishiCacheDir, 'pjsk_stickers_list.png');
  const htmlPath = 'file://' + dependencyPjskDir.replaceAll('\\', '/') + '/emptyHtml.html'
  // function ensureDirExists(dirPath: string) {
  //   if (!fs.existsSync(dirPath)) {
  //     fs.mkdirSync(dirPath, { recursive: true });
  //   }
  // }
  // ensureDirExists(koishiCacheDir);
  // pjsk*
  ctx.command('pjsk', '查看pjsk表情包生成帮助')
    .action(async ({ session }) => {
      await session.execute(`pjsk -h`)
    })
  // ctx.command('pjsk.教学引导', '循环教学引导绘制')
  //   .action(async ({ session }) => {
  //     const drawingInstruction = 'pjsk.绘制'
  //     // await session.execute('pjsk.列表');
  //     await session.send('请选择：\n【随机】或【取消】\n或【直接发送要生成的表情ID】');

  //     const userInput = await session.prompt();
  //     if (!userInput) return '输入超时。';

  //     let character: string;
  //     if (userInput === '随机') {
  //       let randomIndex = Math.floor(Math.random() * characters.length);
  //       // 随机多次
  //       while (true) {

  //         await session.execute(`pjsk.绘制 -n ${randomIndex}`);
  //         await session.send('你可以发送【随机】或任意字符来进行下一次随机。\n\n当你感到满意，你可以发送【满意】来结束调整。');
  //         const userInput = await session.prompt();
  //         if (!userInput) return '输入超时。';
  //         if (userInput === '满意') {
  //           break;
  //         }
  //         else {
  //           randomIndex = Math.floor(Math.random() * characters.length);
  //         }

  //       }


  //       character = `-n ${randomIndex}`;
  //     } else if (userInput === '取消') {
  //       return '已取消绘制表情。';
  //     } else {
  //       const number = parseInt(userInput, 10);
  //       if (isNaN(number)) {
  //         await session.send('抱歉，您输入的不是有效的数字，请输入一个有效的数字。');
  //         return;
  //       }

  //       const isValidCharacter = number >= 0 && number < characters.length;
  //       if (!isValidCharacter) {
  //         await session.send('抱歉，您输入的表情 ID 无效，请输入范围在 0 到 358 之间的有效表情 ID。');
  //         return;
  //       }

  //       character = `-n ${number}`;
  //     }

  //     await session.send('接下来请发送你想写在表情上的文字。你可以使用 \'\\n\' 或 \'/\' 或 [回车] 换行，也可以连续换行多次');
  //     const textInput = await session.prompt();
  //     if (!textInput) return '输入超时。';

  //     await session.execute(`${drawingInstruction} ${character} ${textInput}`);

  //     // 定义参数类型
  //     type DrawingParameters = {
  //       x?: number;
  //       y?: number;
  //       r?: number;
  //       s?: number;
  //       c?: number;
  //       l?: number;
  //     };

  //     // 通用的输入处理函数
  //     async function handleInput(
  //       session: any,
  //       promptMessage: string,
  //       validationRange: { min: number; max: number },
  //       paramName: keyof DrawingParameters,
  //       drawingInstruction: string,
  //       drawingParameters: DrawingParameters,
  //       textInput: string
  //     ) {
  //       let isOver: boolean = false;
  //       while (!isOver) {
  //         await session.send(`${promptMessage}\n\n当你感到满意，你可以发送【满意】来结束调整。`);
  //         const input = await session.prompt();
  //         if (!input) return '输入超时。';
  //         if (input === '满意') {
  //           isOver = true;
  //           if (drawingParameters[paramName] !== undefined) {
  //             drawingParameters[paramName] = drawingParameters[paramName];
  //           }
  //         } else {
  //           const number = parseInt(input, 10);
  //           if (isNaN(number)) {
  //             await session.send('抱歉，您输入的不是有效的数字，请输入一个有效的数字。');
  //           } else if (number < validationRange.min || number > validationRange.max) {
  //             await session.send(`抱歉，文本的${paramName}必须在 ${validationRange.min} 到 ${validationRange.max} 之间。`);
  //           } else {
  //             drawingParameters[paramName] = number;
  //             let drawingOptions = Object.entries(drawingParameters)
  //               .filter(([_, value]) => value !== undefined)
  //               .map(([key, value]) => `-${key} ${value}`)
  //               .join(' ');
  //             await session.execute(`${drawingInstruction} ${character} ${drawingOptions} ${textInput}`);
  //           }
  //         }
  //       }
  //     }

  //     // 主循环
  //     let drawingParameters: DrawingParameters = {};
  //     let isRunning = true;

  //     // 操作映射
  //     const operations: { [key: string]: Function } = {
  //       '左右': () => handleInput(session, '请输入 0 ~ 296 之间的数字确定文本水平位置。', { min: 0, max: 296 }, 'x', drawingInstruction, drawingParameters, textInput),
  //       '上下': () => handleInput(session, '请输入 0 ~ 256 之间的数字确定文本垂直位置。', { min: 0, max: 256 }, 'y', drawingInstruction, drawingParameters, textInput),
  //       '旋转': () => handleInput(session, '请输入 -10 ~ 10 之间的数字确定文本旋转角度。', { min: -10, max: 10 }, 'r', drawingInstruction, drawingParameters, textInput),
  //       '大小': () => handleInput(session, '请输入 10 ~ 100 之间的数字确定文本字体大小。', { min: 10, max: 100 }, 's', drawingInstruction, drawingParameters, textInput),
  //       '曲线': () => handleInput(session, '如果你想启用文本曲线，请输入【1】，否则输入【0】。', { min: 0, max: 1 }, 'c', drawingInstruction, drawingParameters, textInput),
  //       '行间距': () => handleInput(session, '请输入 18 ~ 100 之间的数字确定文本行间距。', { min: 18, max: 100 }, 'l', drawingInstruction, drawingParameters, textInput),
  //     };

  //     while (isRunning) {
  //       await session.send(`你可以对文本进行如下操作：\n【左右】\n【上下】\n【旋转】\n【大小】\n【曲线】\n【行间距】\n\n【结束】\n\n请选择：`);
  //       const userInput = await session.prompt();
  //       if (!userInput) return '输入超时。';
  //       if (userInput === '结束') {
  //         isRunning = false;
  //         return '已结束绘制。';
  //       }
  //       const operation = operations[userInput];
  //       if (operation) {
  //         await operation();
  //       } else {
  //         await session.send('未知的操作，请重新选择。');
  //       }
  //     }


  //   });

  // lb*
  ctx.command('pjsk.列表', 'pjsk表情列表')
    .action(async ({ session }) => {
      // if (fs.existsSync(screenshotPath)) {
      //   return h.image(screenshotPath);
      // }
      // 生成 HTML
      function generateHTML(characters: any[]) {
        let html = `
          <html>
          <head>
              <style>
                  @font-face {
                      font-family: 'YurukaStd';
                      src: local('YurukaStd'), url(./fonts/YurukaStd.woff2) format('woff2');
                  }

                  @font-face {
                      font-family: 'SSFangTangTi';
                      src: local('SSFangTangTi'), url(./fonts/ShangShouFangTangTi.woff2) format('woff2');
                  }

                  .character {
                      position: relative;
                      display: inline-block;
                      margin: 5px;
                      background-color: transparent;
                  }

                  .character img {
                      max-width: 100px;
                  }

                  .character .number {
                      position: absolute;
                      top: 0;
                      left: 0;
                      color: red;
                      font-weight: bold;
                      font-size: 16px;
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

      const page = await ctx.puppeteer.page();

      // 生成 HTML
      const htmlContent = generateHTML(characters);

      await page.goto(htmlPath)
      // 设置 HTML 内容并生成截图
      await page.setContent(htmlContent);
      const screenshot = await page.screenshot({ type: 'png', fullPage: true, omitBackground: true });

      // 保存截图到本地
      // const outputPath = path.join(koishiCacheDir, 'pjsk_stickers_list.png');
      // await fs.promises.writeFile(outputPath, screenshot);

      // 关闭浏览器
      await page.close();

      return h.image(screenshot, 'image/jpeg')

    })
  // hz*
  ctx.command('pjsk.绘制 [inputText:text]', '绘制表情包')
    .option('number', '-n [number:number] 表情包ID')
    .option('positionY', '-y [positionY:number] 文本的垂直位置')
    .option('positionX', '-x [positionX:number] 文本的水平位置')
    .option('rotate', '-r [rotate:number] 文本的旋转角度')
    .option('fontSize', '-s [fontSize:number] 文本字体的大小')
    .option('curve', '-c [curve:boolean] 是否启用文本曲线')
    .option('spaceSize', '-l [spaceSize:number] 文本上下行间距')
    .action(async ({ session, options }, inputText) => {

      // 表情包 ID 必须在 characters 的元素个数之内，即小于 characters.length，默认为随机
      // 文本的垂直位置 y 范围 0~256，默认为 character 中指定的值
      // 文本的水平位置 x 范围 0~296，默认为 character 中指定的值
      // 文本的旋转角度 rotate 范围 -10 ~ 10 默认为 character 中指定的值
      // 文本的字体大小 fontSize 范围 10 ~ 100 默认为 character 中指定的值
      // 是否启用文本曲线功能 curve 默认为 false
      // 文本上下行间距 spaceSize 范围 18 ~ 100，默认值为 18

      function getRandomCharacter(characters: any[]): any {
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
      }
      let character: { defaultText?: any; id?: string; name?: string; character?: string; img?: any; color?: any; };
      if (options.number) {
        // 检查表情包ID是否在有效范围内
        const isValidCharacter = options.number >= 0 && options.number < characters.length;
        if (!isValidCharacter) {
          await session.send('抱歉，您输入的表情 ID 无效，请输入范围在 0 到 358 之间的有效表情 ID。');
          return;
        }
        character = characters[options.number]
      } else {
        character = getRandomCharacter(characters);
      }


      let { text, x, y, r: rotate, s: fontSize } = character.defaultText;
      if (inputText) {
        text = inputText.replace(/\/+/g, '\\n').replace(/\n/g, '\\n');
      }
      const { color, img } = character;
      const imgPath = 'file://' + dependencyPjskDir.replaceAll('\\', '/') + `/img/${img}`;

      // 处理默认值逻辑
      const curve = options.curve || false;
      const spaceSize = options.spaceSize || 18;
      const specifiedX = options.positionX !== undefined ? options.positionX : x;
      const specifiedY = options.positionY !== undefined ? options.positionY : y;
      const specifiedRotate = options.rotate !== undefined ? options.rotate : rotate;
      const specifiedFontSize = options.fontSize !== undefined ? options.fontSize : fontSize;
      // 检查垂直位置是否在有效范围内
      if (options.positionY !== undefined && (options.positionY < 0 || options.positionY > 256)) {
        await session.send('抱歉，文本的垂直位置必须在 0 到 256 之间。');
        return;
      }

      // 检查水平位置是否在有效范围内
      if (options.positionX !== undefined && (options.positionX < 0 || options.positionX > 296)) {
        await session.send('抱歉，文本的水平位置必须在 0 到 296 之间。');
        return;
      }

      // 检查旋转角度是否在有效范围内
      if (options.rotate !== undefined && (options.rotate < -10 || options.rotate > 10)) {
        await session.send('抱歉，文本的旋转角度必须在 -10 到 10 之间。');
        return;
      }

      // 检查字体大小是否在有效范围内
      if (options.fontSize !== undefined && (options.fontSize < 10 || options.fontSize > 100)) {
        await session.send('抱歉，文本的字体大小必须在 10 到 100 之间。');
        return;
      }

      // 检查文本上下行间距是否在有效范围内
      if (options.spaceSize !== undefined && (options.spaceSize < 18 || options.spaceSize > 100)) {
        await session.send('抱歉，文本的上下行间距必须在 18 到 100 之间。');
        return;
      }

      const angle = (Math.PI * text.length) / 7; // 曲线弯曲的角度
      // 启动 page
      const page = await ctx.puppeteer.page();
      // font-family: 'YurukaStd', 'SSFangTangTi', sans-serif;

      const htmlContent = `
<!DOCTYPE html>
<html lang="zh">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .canvas {
      height: 256px;
      width: 296px;
      border: 1px solid #ddd;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: transparent;
      /* background-color: rgb(87, 73, 91); */
      font-family: 'YurukaStd', 'SSFangTangTi';
    }

    @font-face {
      font-family: 'YurukaStd';
      src: local('YurukaStd'), url(./fonts/YurukaStd.woff2) format('woff2');
    }

    @font-face {
      font-family: 'SSFangTangTi';
      src: local('SSFangTangTi'), url(./fonts/ShangShouFangTangTi.woff2) format('woff2');
    }
  </style>
</head>

<body>
  <div class="canvas">
    <canvas id="myCanvas" width="296" height="256"></canvas>
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
      const spaceSize = ${spaceSize}; // 增加行间距以避免文本重叠
      let angle = ${angle};
      const img = new Image();
      img.src = '${imgPath}';

      img.onload = () => {
        draw(context)
      }


      function draw(context) {
        context.canvas.width = 296;
        context.canvas.height = 256;

        if (document.fonts.check("12px YurukaStd")) {
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
    }
  </script>
</body>

</html>`
      await page.setViewport({ width: 300, height: 260, deviceScaleFactor: 1 })
      await page.goto(htmlPath)
      // 设置页面内容
      await page.setContent(h.unescape(htmlContent), { waitUntil: 'load' });

      // 截取 Canvas 并返回 Buffer
      const canvas = await page.$('canvas#myCanvas');
      const buffer = await canvas.screenshot({ type: 'png', omitBackground: true });

      // 关闭 page
      await page.close();

      return h.image(buffer, 'image/png')
    })


}



const characters = [
  {
    "id": "3",
    "name": "Airi 01",
    "character": "airi",
    "img": "airi/Airi_01.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "keep up",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "4",
    "name": "Airi 02",
    "character": "airi",
    "img": "airi/Airi_02.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "nice to meet ya",
      "x": 148,
      "y": 58,
      "r": 0,
      "s": 28
    }
  },
  {
    "id": "5",
    "name": "Airi 03",
    "character": "airi",
    "img": "airi/Airi_03.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "keep at it!",
      "x": 140,
      "y": 79,
      "r": 2,
      "s": 47
    }
  },
  {
    "id": "6",
    "name": "Airi 04",
    "character": "airi",
    "img": "airi/Airi_04.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "8",
    "name": "Airi 06",
    "character": "airi",
    "img": "airi/Airi_06.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "9",
    "name": "Airi 07",
    "character": "airi",
    "img": "airi/Airi_07.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "10",
    "name": "Airi 08",
    "character": "airi",
    "img": "airi/Airi_08.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "11",
    "name": "Airi 09",
    "character": "airi",
    "img": "airi/Airi_09.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "13",
    "name": "Airi 11",
    "character": "airi",
    "img": "airi/Airi_11.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "14",
    "name": "Airi 12",
    "character": "airi",
    "img": "airi/Airi_12.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "15",
    "name": "Airi 13",
    "character": "airi",
    "img": "airi/Airi_13.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "16",
    "name": "Airi 14",
    "character": "airi",
    "img": "airi/Airi_14.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "18",
    "name": "Airi 16",
    "character": "airi",
    "img": "airi/Airi_16.png",
    "color": "#FB8AAC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "19",
    "name": "Akito 01",
    "character": "akito",
    "img": "akito/Akito_01.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "20",
    "name": "Akito 02",
    "character": "akito",
    "img": "akito/Akito_02.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "21",
    "name": "Akito 03",
    "character": "akito",
    "img": "akito/Akito_03.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "22",
    "name": "Akito 04",
    "character": "akito",
    "img": "akito/Akito_04.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "24",
    "name": "Akito 06",
    "character": "akito",
    "img": "akito/Akito_06.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "25",
    "name": "Akito 07",
    "character": "akito",
    "img": "akito/Akito_07.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "26",
    "name": "Akito 08",
    "character": "akito",
    "img": "akito/Akito_08.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "27",
    "name": "Akito 09",
    "character": "akito",
    "img": "akito/Akito_09.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "29",
    "name": "Akito 11",
    "character": "akito",
    "img": "akito/Akito_11.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "30",
    "name": "Akito 12",
    "character": "akito",
    "img": "akito/Akito_12.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "31",
    "name": "Akito 13",
    "character": "akito",
    "img": "akito/Akito_13.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "32",
    "name": "Akito 14",
    "character": "akito",
    "img": "akito/Akito_14.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "33",
    "name": "Akito 16",
    "character": "akito",
    "img": "akito/Akito_16.png",
    "color": "#FF7722",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "34",
    "name": "An 01",
    "character": "an",
    "img": "an/An_01.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "35",
    "name": "An 02",
    "character": "an",
    "img": "an/An_02.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "36",
    "name": "An 03",
    "character": "an",
    "img": "an/An_03.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "37",
    "name": "An 04",
    "character": "an",
    "img": "an/An_04.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "39",
    "name": "An 06",
    "character": "an",
    "img": "an/An_06.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "40",
    "name": "An 07",
    "character": "an",
    "img": "an/An_07.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "41",
    "name": "An 08",
    "character": "an",
    "img": "an/An_08.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "42",
    "name": "An 09",
    "character": "an",
    "img": "an/An_09.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "44",
    "name": "An 11",
    "character": "an",
    "img": "an/An_11.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "45",
    "name": "An 12",
    "character": "an",
    "img": "an/An_12.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "46",
    "name": "An 13",
    "character": "an",
    "img": "an/An_13.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "47",
    "name": "An 14",
    "character": "an",
    "img": "an/An_14.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "49",
    "name": "An 16",
    "character": "an",
    "img": "an/An_16.png",
    "color": "#00BADC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "50",
    "name": "Emu 01",
    "character": "emu",
    "img": "emu/Emu_01.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "51",
    "name": "Emu 02",
    "character": "emu",
    "img": "emu/Emu_02.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "52",
    "name": "Emu 03",
    "character": "emu",
    "img": "emu/Emu_03.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "53",
    "name": "Emu 04",
    "character": "emu",
    "img": "emu/Emu_04.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "55",
    "name": "Emu 06",
    "character": "emu",
    "img": "emu/Emu_06.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "56",
    "name": "Emu 07",
    "character": "emu",
    "img": "emu/Emu_07.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "57",
    "name": "Emu 08",
    "character": "emu",
    "img": "emu/Emu_08.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "58",
    "name": "Emu 09",
    "character": "emu",
    "img": "emu/Emu_09.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "60",
    "name": "Emu 11",
    "character": "emu",
    "img": "emu/Emu_11.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "61",
    "name": "Emu 12",
    "character": "emu",
    "img": "emu/Emu_12.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "62",
    "name": "Emu 13",
    "character": "emu",
    "img": "emu/Emu_13.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "Wonderhoy!",
      "x": 148,
      "y": 70,
      "r": -2,
      "s": 38
    }
  },
  {
    "id": "63",
    "name": "Emu 14",
    "character": "emu",
    "img": "emu/Emu_14.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "65",
    "name": "Emu 16",
    "character": "emu",
    "img": "emu/Emu_16.png",
    "color": "#FF66BB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "66",
    "name": "Ena 01",
    "character": "ena",
    "img": "ena/Ena_01.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "67",
    "name": "Ena 02",
    "character": "ena",
    "img": "ena/Ena_02.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "68",
    "name": "Ena 03",
    "character": "ena",
    "img": "ena/Ena_03.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "69",
    "name": "Ena 04",
    "character": "ena",
    "img": "ena/Ena_04.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "71",
    "name": "Ena 06",
    "character": "ena",
    "img": "ena/Ena_06.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "72",
    "name": "Ena 07",
    "character": "ena",
    "img": "ena/Ena_07.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "73",
    "name": "Ena 08",
    "character": "ena",
    "img": "ena/Ena_08.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "74",
    "name": "Ena 09",
    "character": "ena",
    "img": "ena/Ena_09.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "76",
    "name": "Ena 11",
    "character": "ena",
    "img": "ena/Ena_11.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "77",
    "name": "Ena 12",
    "character": "ena",
    "img": "ena/Ena_12.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "78",
    "name": "Ena 13",
    "character": "ena",
    "img": "ena/Ena_13.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "79",
    "name": "Ena 14",
    "character": "ena",
    "img": "ena/Ena_14.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "81",
    "name": "Ena 16",
    "character": "ena",
    "img": "ena/Ena_16.png",
    "color": "#B18F6C",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "81",
    "name": "Haruka 01",
    "character": "Haruka",
    "img": "Haruka/Haruka_01.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "82",
    "name": "Haruka 02",
    "character": "Haruka",
    "img": "Haruka/Haruka_02.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "83",
    "name": "Haruka 03",
    "character": "Haruka",
    "img": "Haruka/Haruka_03.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "84",
    "name": "Haruka 04",
    "character": "Haruka",
    "img": "Haruka/Haruka_04.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "85",
    "name": "Haruka 06",
    "character": "Haruka",
    "img": "Haruka/Haruka_06.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "86",
    "name": "Haruka 07",
    "character": "Haruka",
    "img": "Haruka/Haruka_07.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "87",
    "name": "Haruka 08",
    "character": "Haruka",
    "img": "Haruka/Haruka_08.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "88",
    "name": "Haruka 09",
    "character": "Haruka",
    "img": "Haruka/Haruka_09.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "89",
    "name": "Haruka 11",
    "character": "Haruka",
    "img": "Haruka/Haruka_11.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "90",
    "name": "Haruka 12",
    "character": "Haruka",
    "img": "Haruka/Haruka_12.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "91",
    "name": "Haruka 13",
    "character": "Haruka",
    "img": "Haruka/Haruka_13.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "92",
    "name": "Haruka 14",
    "character": "Haruka",
    "img": "Haruka/Haruka_14.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "93",
    "name": "Haruka 16",
    "character": "Haruka",
    "img": "Haruka/Haruka_16.png",
    "color": "#6495F0",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "94",
    "name": "Honami 01",
    "character": "Honami",
    "img": "Honami/Honami_01.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "95",
    "name": "Honami 02",
    "character": "Honami",
    "img": "Honami/Honami_02.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "96",
    "name": "Honami 03",
    "character": "Honami",
    "img": "Honami/Honami_03.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "97",
    "name": "Honami 04",
    "character": "Honami",
    "img": "Honami/Honami_04.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "98",
    "name": "Honami 06",
    "character": "Honami",
    "img": "Honami/Honami_06.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "99",
    "name": "Honami 07",
    "character": "Honami",
    "img": "Honami/Honami_07.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "100",
    "name": "Honami 08",
    "character": "Honami",
    "img": "Honami/Honami_08.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "101",
    "name": "Honami 09",
    "character": "Honami",
    "img": "Honami/Honami_09.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "102",
    "name": "Honami 11",
    "character": "Honami",
    "img": "Honami/Honami_11.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "103",
    "name": "Honami 12",
    "character": "Honami",
    "img": "Honami/Honami_12.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "104",
    "name": "Honami 13",
    "character": "Honami",
    "img": "Honami/Honami_13.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "105",
    "name": "Honami 14",
    "character": "Honami",
    "img": "Honami/Honami_14.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "106",
    "name": "Honami 16",
    "character": "Honami",
    "img": "Honami/Honami_16.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "107",
    "name": "Honami 17",
    "character": "Honami",
    "img": "Honami/Honami_17.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "108",
    "name": "Honami 18",
    "character": "Honami",
    "img": "Honami/Honami_18.png",
    "color": "#F86666",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "109",
    "name": "Ichika 01",
    "character": "Ichika",
    "img": "Ichika/Ichika_01.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "110",
    "name": "Ichika 02",
    "character": "Ichika",
    "img": "Ichika/Ichika_02.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "111",
    "name": "Ichika 03",
    "character": "Ichika",
    "img": "Ichika/Ichika_03.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "112",
    "name": "Ichika 04",
    "character": "Ichika",
    "img": "Ichika/Ichika_04.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "113",
    "name": "Ichika 06",
    "character": "Ichika",
    "img": "Ichika/Ichika_06.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "114",
    "name": "Ichika 07",
    "character": "Ichika",
    "img": "Ichika/Ichika_07.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "115",
    "name": "Ichika 08",
    "character": "Ichika",
    "img": "Ichika/Ichika_08.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "116",
    "name": "Ichika 09",
    "character": "Ichika",
    "img": "Ichika/Ichika_09.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "117",
    "name": "Ichika 11",
    "character": "Ichika",
    "img": "Ichika/Ichika_11.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "118",
    "name": "Ichika 12",
    "character": "Ichika",
    "img": "Ichika/Ichika_12.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "119",
    "name": "Ichika 13",
    "character": "Ichika",
    "img": "Ichika/Ichika_13.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "120",
    "name": "Ichika 14",
    "character": "Ichika",
    "img": "Ichika/Ichika_14.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "121",
    "name": "Ichika 16",
    "character": "Ichika",
    "img": "Ichika/Ichika_16.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "122",
    "name": "Ichika 17",
    "character": "Ichika",
    "img": "Ichika/Ichika_17.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "123",
    "name": "Ichika 18",
    "character": "Ichika",
    "img": "Ichika/Ichika_18.png",
    "color": "#33AAEE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "124",
    "name": "KAITO 01",
    "character": "KAITO",
    "img": "KAITO/KAITO_01.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "125",
    "name": "KAITO 02",
    "character": "KAITO",
    "img": "KAITO/KAITO_02.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "126",
    "name": "KAITO 03",
    "character": "KAITO",
    "img": "KAITO/KAITO_03.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "127",
    "name": "KAITO 04",
    "character": "KAITO",
    "img": "KAITO/KAITO_04.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "128",
    "name": "KAITO 06",
    "character": "KAITO",
    "img": "KAITO/KAITO_06.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "129",
    "name": "KAITO 07",
    "character": "KAITO",
    "img": "KAITO/KAITO_07.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "130",
    "name": "KAITO 08",
    "character": "KAITO",
    "img": "KAITO/KAITO_08.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "131",
    "name": "KAITO 09",
    "character": "KAITO",
    "img": "KAITO/KAITO_09.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "132",
    "name": "KAITO 11",
    "character": "KAITO",
    "img": "KAITO/KAITO_11.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "133",
    "name": "KAITO 12",
    "character": "KAITO",
    "img": "KAITO/KAITO_12.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "134",
    "name": "KAITO 13",
    "character": "KAITO",
    "img": "KAITO/KAITO_13.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "135",
    "name": "KAITO 14",
    "character": "KAITO",
    "img": "KAITO/KAITO_14.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "136",
    "name": "KAITO 16",
    "character": "KAITO",
    "img": "KAITO/KAITO_16.png",
    "color": "#3366CC",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "137",
    "name": "Kanade 01",
    "character": "Kanade",
    "img": "Kanade/Kanade_01.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "138",
    "name": "Kanade 02",
    "character": "Kanade",
    "img": "Kanade/Kanade_02.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "139",
    "name": "Kanade 03",
    "character": "Kanade",
    "img": "Kanade/Kanade_03.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "140",
    "name": "Kanade 04",
    "character": "Kanade",
    "img": "Kanade/Kanade_04.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "141",
    "name": "Kanade 06",
    "character": "Kanade",
    "img": "Kanade/Kanade_06.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "142",
    "name": "Kanade 07",
    "character": "Kanade",
    "img": "Kanade/Kanade_07.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "143",
    "name": "Kanade 08",
    "character": "Kanade",
    "img": "Kanade/Kanade_08.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "144",
    "name": "Kanade 09",
    "character": "Kanade",
    "img": "Kanade/Kanade_09.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "145",
    "name": "Kanade 11",
    "character": "Kanade",
    "img": "Kanade/Kanade_11.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "146",
    "name": "Kanade 12",
    "character": "Kanade",
    "img": "Kanade/Kanade_12.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "147",
    "name": "Kanade 13",
    "character": "Kanade",
    "img": "Kanade/Kanade_13.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "148",
    "name": "Kanade 14",
    "character": "Kanade",
    "img": "Kanade/Kanade_14.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "149",
    "name": "Kanade 16",
    "character": "Kanade",
    "img": "Kanade/Kanade_16.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "150",
    "name": "Kanade 17",
    "character": "Kanade",
    "img": "Kanade/Kanade_17.png",
    "color": "#BB6688",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "151",
    "name": "Kohane 01",
    "character": "Kohane",
    "img": "Kohane/Kohane_01.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "152",
    "name": "Kohane 02",
    "character": "Kohane",
    "img": "Kohane/Kohane_02.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "153",
    "name": "Kohane 03",
    "character": "Kohane",
    "img": "Kohane/Kohane_03.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "154",
    "name": "Kohane 04",
    "character": "Kohane",
    "img": "Kohane/Kohane_04.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "155",
    "name": "Kohane 06",
    "character": "Kohane",
    "img": "Kohane/Kohane_06.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "156",
    "name": "Kohane 07",
    "character": "Kohane",
    "img": "Kohane/Kohane_07.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "157",
    "name": "Kohane 08",
    "character": "Kohane",
    "img": "Kohane/Kohane_08.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "158",
    "name": "Kohane 09",
    "character": "Kohane",
    "img": "Kohane/Kohane_09.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "159",
    "name": "Kohane 11",
    "character": "Kohane",
    "img": "Kohane/Kohane_11.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "160",
    "name": "Kohane 12",
    "character": "Kohane",
    "img": "Kohane/Kohane_12.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "161",
    "name": "Kohane 13",
    "character": "Kohane",
    "img": "Kohane/Kohane_13.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "162",
    "name": "Kohane 14",
    "character": "Kohane",
    "img": "Kohane/Kohane_14.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "163",
    "name": "Kohane 16",
    "character": "Kohane",
    "img": "Kohane/Kohane_16.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "164",
    "name": "Kohane 17",
    "character": "Kohane",
    "img": "Kohane/Kohane_17.png",
    "color": "#FF6699",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "165",
    "name": "Len 01",
    "character": "Len",
    "img": "Len/Len_01.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "166",
    "name": "Len 02",
    "character": "Len",
    "img": "Len/Len_02.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "167",
    "name": "Len 03",
    "character": "Len",
    "img": "Len/Len_03.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "168",
    "name": "Len 04",
    "character": "Len",
    "img": "Len/Len_04.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "169",
    "name": "Len 06",
    "character": "Len",
    "img": "Len/Len_06.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "170",
    "name": "Len 07",
    "character": "Len",
    "img": "Len/Len_07.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "171",
    "name": "Len 08",
    "character": "Len",
    "img": "Len/Len_08.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "172",
    "name": "Len 09",
    "character": "Len",
    "img": "Len/Len_09.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "173",
    "name": "Len 11",
    "character": "Len",
    "img": "Len/Len_11.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "174",
    "name": "Len 12",
    "character": "Len",
    "img": "Len/Len_12.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "175",
    "name": "Len 13",
    "character": "Len",
    "img": "Len/Len_13.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "176",
    "name": "Len 14",
    "character": "Len",
    "img": "Len/Len_14.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "177",
    "name": "Len 16",
    "character": "Len",
    "img": "Len/Len_16.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "178",
    "name": "Len 17",
    "character": "Len",
    "img": "Len/Len_17.png",
    "color": "#D3BD00",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "179",
    "name": "Luka 01",
    "character": "Luka",
    "img": "Luka/Luka_01.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "180",
    "name": "Luka 02",
    "character": "Luka",
    "img": "Luka/Luka_02.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "181",
    "name": "Luka 03",
    "character": "Luka",
    "img": "Luka/Luka_03.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "182",
    "name": "Luka 04",
    "character": "Luka",
    "img": "Luka/Luka_04.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "183",
    "name": "Luka 06",
    "character": "Luka",
    "img": "Luka/Luka_06.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "184",
    "name": "Luka 07",
    "character": "Luka",
    "img": "Luka/Luka_07.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "185",
    "name": "Luka 08",
    "character": "Luka",
    "img": "Luka/Luka_08.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "186",
    "name": "Luka 09",
    "character": "Luka",
    "img": "Luka/Luka_09.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "187",
    "name": "Luka 11",
    "character": "Luka",
    "img": "Luka/Luka_11.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "188",
    "name": "Luka 12",
    "character": "Luka",
    "img": "Luka/Luka_12.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "189",
    "name": "Luka 13",
    "character": "Luka",
    "img": "Luka/Luka_13.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "190",
    "name": "Luka 14",
    "character": "Luka",
    "img": "Luka/Luka_14.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "191",
    "name": "Luka 16",
    "character": "Luka",
    "img": "Luka/Luka_16.png",
    "color": "#F88CA7",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "192",
    "name": "Mafuyu 01",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_01.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "193",
    "name": "Mafuyu 02",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_02.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "194",
    "name": "Mafuyu 03",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_03.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "195",
    "name": "Mafuyu 04",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_04.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "196",
    "name": "Mafuyu 06",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_06.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "197",
    "name": "Mafuyu 07",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_07.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "198",
    "name": "Mafuyu 08",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_08.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "199",
    "name": "Mafuyu 09",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_09.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "200",
    "name": "Mafuyu 11",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_11.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "201",
    "name": "Mafuyu 12",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_12.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "202",
    "name": "Mafuyu 13",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_13.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "203",
    "name": "Mafuyu 14",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_14.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "204",
    "name": "Mafuyu 16",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_16.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "205",
    "name": "Mafuyu 17",
    "character": "Mafuyu",
    "img": "Mafuyu/Mafuyu_17.png",
    "color": "#7171AF",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "206",
    "name": "Meiko 01",
    "character": "Meiko",
    "img": "Meiko/Meiko_01.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "207",
    "name": "Meiko 02",
    "character": "Meiko",
    "img": "Meiko/Meiko_02.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "208",
    "name": "Meiko 03",
    "character": "Meiko",
    "img": "Meiko/Meiko_03.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "209",
    "name": "Meiko 04",
    "character": "Meiko",
    "img": "Meiko/Meiko_04.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "210",
    "name": "Meiko 06",
    "character": "Meiko",
    "img": "Meiko/Meiko_06.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "211",
    "name": "Meiko 07",
    "character": "Meiko",
    "img": "Meiko/Meiko_07.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "212",
    "name": "Meiko 08",
    "character": "Meiko",
    "img": "Meiko/Meiko_08.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "213",
    "name": "Meiko 09",
    "character": "Meiko",
    "img": "Meiko/Meiko_09.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "214",
    "name": "Meiko 11",
    "character": "Meiko",
    "img": "Meiko/Meiko_11.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "215",
    "name": "Meiko 12",
    "character": "Meiko",
    "img": "Meiko/Meiko_12.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "216",
    "name": "Meiko 13",
    "character": "Meiko",
    "img": "Meiko/Meiko_13.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "217",
    "name": "Meiko 14",
    "character": "Meiko",
    "img": "Meiko/Meiko_14.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "218",
    "name": "Meiko 16",
    "character": "Meiko",
    "img": "Meiko/Meiko_16.png",
    "color": "#E4485F",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "219",
    "name": "Miku 01",
    "character": "Miku",
    "img": "Miku/Miku_01.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "220",
    "name": "Miku 02",
    "character": "Miku",
    "img": "Miku/Miku_02.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "221",
    "name": "Miku 03",
    "character": "Miku",
    "img": "Miku/Miku_03.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "222",
    "name": "Miku 04",
    "character": "Miku",
    "img": "Miku/Miku_04.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "223",
    "name": "Miku 06",
    "character": "Miku",
    "img": "Miku/Miku_06.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "224",
    "name": "Miku 07",
    "character": "Miku",
    "img": "Miku/Miku_07.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "225",
    "name": "Miku 08",
    "character": "Miku",
    "img": "Miku/Miku_08.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "226",
    "name": "Miku 09",
    "character": "Miku",
    "img": "Miku/Miku_09.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "227",
    "name": "Miku 11",
    "character": "Miku",
    "img": "Miku/Miku_11.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "228",
    "name": "Miku 12",
    "character": "Miku",
    "img": "Miku/Miku_12.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "229",
    "name": "Miku 13",
    "character": "Miku",
    "img": "Miku/Miku_13.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "230",
    "name": "Miku 14",
    "character": "Miku",
    "img": "Miku/Miku_14.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "231",
    "name": "Miku 16",
    "character": "Miku",
    "img": "Miku/Miku_16.png",
    "color": "#33CCBB",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "232",
    "name": "Minori 01",
    "character": "Minori",
    "img": "Minori/Minori_01.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "233",
    "name": "Minori 02",
    "character": "Minori",
    "img": "Minori/Minori_02.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "234",
    "name": "Minori 03",
    "character": "Minori",
    "img": "Minori/Minori_03.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "235",
    "name": "Minori 04",
    "character": "Minori",
    "img": "Minori/Minori_04.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "236",
    "name": "Minori 06",
    "character": "Minori",
    "img": "Minori/Minori_06.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "237",
    "name": "Minori 07",
    "character": "Minori",
    "img": "Minori/Minori_07.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "238",
    "name": "Minori 08",
    "character": "Minori",
    "img": "Minori/Minori_08.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "239",
    "name": "Minori 09",
    "character": "Minori",
    "img": "Minori/Minori_09.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "240",
    "name": "Minori 11",
    "character": "Minori",
    "img": "Minori/Minori_11.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "241",
    "name": "Minori 12",
    "character": "Minori",
    "img": "Minori/Minori_12.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "242",
    "name": "Minori 13",
    "character": "Minori",
    "img": "Minori/Minori_13.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "243",
    "name": "Minori 14",
    "character": "Minori",
    "img": "Minori/Minori_14.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "244",
    "name": "Minori 16",
    "character": "Minori",
    "img": "Minori/Minori_16.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "245",
    "name": "Minori 17",
    "character": "Minori",
    "img": "Minori/Minori_17.png",
    "color": "#F39E7D",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "246",
    "name": "Mizuki 01",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_01.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "247",
    "name": "Mizuki 02",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_02.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "248",
    "name": "Mizuki 03",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_03.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "249",
    "name": "Mizuki 04",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_04.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "250",
    "name": "Mizuki 06",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_06.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "251",
    "name": "Mizuki 07",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_07.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "252",
    "name": "Mizuki 08",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_08.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "253",
    "name": "Mizuki 09",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_09.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "254",
    "name": "Mizuki 11",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_11.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "255",
    "name": "Mizuki 12",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_12.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "256",
    "name": "Mizuki 13",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_13.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "257",
    "name": "Mizuki 14",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_14.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "258",
    "name": "Mizuki 16",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_16.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "259",
    "name": "Mizuki 17",
    "character": "Mizuki",
    "img": "Mizuki/Mizuki_17.png",
    "color": "#CA8DB6",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "260",
    "name": "Nene 01",
    "character": "Nene",
    "img": "Nene/Nene_01.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "261",
    "name": "Nene 02",
    "character": "Nene",
    "img": "Nene/Nene_02.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "262",
    "name": "Nene 03",
    "character": "Nene",
    "img": "Nene/Nene_03.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "263",
    "name": "Nene 04",
    "character": "Nene",
    "img": "Nene/Nene_04.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "264",
    "name": "Nene 06",
    "character": "Nene",
    "img": "Nene/Nene_06.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "265",
    "name": "Nene 07",
    "character": "Nene",
    "img": "Nene/Nene_07.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "266",
    "name": "Nene 08",
    "character": "Nene",
    "img": "Nene/Nene_08.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "267",
    "name": "Nene 09",
    "character": "Nene",
    "img": "Nene/Nene_09.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "268",
    "name": "Nene 11",
    "character": "Nene",
    "img": "Nene/Nene_11.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "269",
    "name": "Nene 12",
    "character": "Nene",
    "img": "Nene/Nene_12.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "270",
    "name": "Nene 13",
    "character": "Nene",
    "img": "Nene/Nene_13.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "271",
    "name": "Nene 14",
    "character": "Nene",
    "img": "Nene/Nene_14.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "272",
    "name": "Nene 16",
    "character": "Nene",
    "img": "Nene/Nene_16.png",
    "color": "#19CD94",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "273",
    "name": "Rin 01",
    "character": "Rin",
    "img": "Rin/Rin_01.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "274",
    "name": "Rin 02",
    "character": "Rin",
    "img": "Rin/Rin_02.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "275",
    "name": "Rin 03",
    "character": "Rin",
    "img": "Rin/Rin_03.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "276",
    "name": "Rin 04",
    "character": "Rin",
    "img": "Rin/Rin_04.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "277",
    "name": "Rin 06",
    "character": "Rin",
    "img": "Rin/Rin_06.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "278",
    "name": "Rin 07",
    "character": "Rin",
    "img": "Rin/Rin_07.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "279",
    "name": "Rin 08",
    "character": "Rin",
    "img": "Rin/Rin_08.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "280",
    "name": "Rin 09",
    "character": "Rin",
    "img": "Rin/Rin_09.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "281",
    "name": "Rin 11",
    "character": "Rin",
    "img": "Rin/Rin_11.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "282",
    "name": "Rin 12",
    "character": "Rin",
    "img": "Rin/Rin_12.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "283",
    "name": "Rin 13",
    "character": "Rin",
    "img": "Rin/Rin_13.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "284",
    "name": "Rin 14",
    "character": "Rin",
    "img": "Rin/Rin_14.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "285",
    "name": "Rin 16",
    "character": "Rin",
    "img": "Rin/Rin_16.png",
    "color": "#E8A505",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "286",
    "name": "Rui 01",
    "character": "Rui",
    "img": "Rui/Rui_01.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "287",
    "name": "Rui 02",
    "character": "Rui",
    "img": "Rui/Rui_02.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "288",
    "name": "Rui 03",
    "character": "Rui",
    "img": "Rui/Rui_03.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "289",
    "name": "Rui 04",
    "character": "Rui",
    "img": "Rui/Rui_04.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "290",
    "name": "Rui 06",
    "character": "Rui",
    "img": "Rui/Rui_06.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "291",
    "name": "Rui 07",
    "character": "Rui",
    "img": "Rui/Rui_07.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "292",
    "name": "Rui 08",
    "character": "Rui",
    "img": "Rui/Rui_08.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "293",
    "name": "Rui 09",
    "character": "Rui",
    "img": "Rui/Rui_09.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "294",
    "name": "Rui 11",
    "character": "Rui",
    "img": "Rui/Rui_11.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "295",
    "name": "Rui 12",
    "character": "Rui",
    "img": "Rui/Rui_12.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "296",
    "name": "Rui 13",
    "character": "Rui",
    "img": "Rui/Rui_13.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "297",
    "name": "Rui 14",
    "character": "Rui",
    "img": "Rui/Rui_14.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "298",
    "name": "Rui 16",
    "character": "Rui",
    "img": "Rui/Rui_16.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "299",
    "name": "Rui 17",
    "character": "Rui",
    "img": "Rui/Rui_17.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "300",
    "name": "Rui 18",
    "character": "Rui",
    "img": "Rui/Rui_18.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "301",
    "name": "Rui 19",
    "character": "Rui",
    "img": "Rui/Rui_19.png",
    "color": "#BB88EE",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "302",
    "name": "Saki 01",
    "character": "Saki",
    "img": "Saki/Saki_01.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "303",
    "name": "Saki 02",
    "character": "Saki",
    "img": "Saki/Saki_02.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "304",
    "name": "Saki 03",
    "character": "Saki",
    "img": "Saki/Saki_03.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "305",
    "name": "Saki 04",
    "character": "Saki",
    "img": "Saki/Saki_04.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "306",
    "name": "Saki 06",
    "character": "Saki",
    "img": "Saki/Saki_06.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "307",
    "name": "Saki 07",
    "character": "Saki",
    "img": "Saki/Saki_07.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "308",
    "name": "Saki 08",
    "character": "Saki",
    "img": "Saki/Saki_08.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "309",
    "name": "Saki 09",
    "character": "Saki",
    "img": "Saki/Saki_09.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "310",
    "name": "Saki 11",
    "character": "Saki",
    "img": "Saki/Saki_11.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "311",
    "name": "Saki 12",
    "character": "Saki",
    "img": "Saki/Saki_12.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "312",
    "name": "Saki 13",
    "character": "Saki",
    "img": "Saki/Saki_13.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "313",
    "name": "Saki 14",
    "character": "Saki",
    "img": "Saki/Saki_14.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "314",
    "name": "Saki 16",
    "character": "Saki",
    "img": "Saki/Saki_16.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "315",
    "name": "Saki 17",
    "character": "Saki",
    "img": "Saki/Saki_17.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "316",
    "name": "Saki 18",
    "character": "Saki",
    "img": "Saki/Saki_18.png",
    "color": "#F5B303",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "317",
    "name": "Shiho 01",
    "character": "Shiho",
    "img": "Shiho/Shiho_01.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "318",
    "name": "Shiho 02",
    "character": "Shiho",
    "img": "Shiho/Shiho_02.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "319",
    "name": "Shiho 03",
    "character": "Shiho",
    "img": "Shiho/Shiho_03.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "320",
    "name": "Shiho 04",
    "character": "Shiho",
    "img": "Shiho/Shiho_04.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "321",
    "name": "Shiho 06",
    "character": "Shiho",
    "img": "Shiho/Shiho_06.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "322",
    "name": "Shiho 07",
    "character": "Shiho",
    "img": "Shiho/Shiho_07.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "323",
    "name": "Shiho 08",
    "character": "Shiho",
    "img": "Shiho/Shiho_08.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "324",
    "name": "Shiho 09",
    "character": "Shiho",
    "img": "Shiho/Shiho_09.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "325",
    "name": "Shiho 11",
    "character": "Shiho",
    "img": "Shiho/Shiho_11.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "326",
    "name": "Shiho 12",
    "character": "Shiho",
    "img": "Shiho/Shiho_12.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "327",
    "name": "Shiho 13",
    "character": "Shiho",
    "img": "Shiho/Shiho_13.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "328",
    "name": "Shiho 14",
    "character": "Shiho",
    "img": "Shiho/Shiho_14.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "329",
    "name": "Shiho 16",
    "character": "Shiho",
    "img": "Shiho/Shiho_16.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "330",
    "name": "Shiho 17",
    "character": "Shiho",
    "img": "Shiho/Shiho_17.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "331",
    "name": "Shiho 18",
    "character": "Shiho",
    "img": "Shiho/Shiho_18.png",
    "color": "#A0C10B",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "332",
    "name": "Shizuku 01",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_01.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "333",
    "name": "Shizuku 02",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_02.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "334",
    "name": "Shizuku 03",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_03.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "335",
    "name": "Shizuku 04",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_04.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "336",
    "name": "Shizuku 06",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_06.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "337",
    "name": "Shizuku 07",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_07.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "338",
    "name": "Shizuku 08",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_08.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "339",
    "name": "Shizuku 09",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_09.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "340",
    "name": "Shizuku 11",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_11.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "341",
    "name": "Shizuku 12",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_12.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "342",
    "name": "Shizuku 13",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_13.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "343",
    "name": "Shizuku 14",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_14.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "344",
    "name": "Shizuku 16",
    "character": "Shizuku",
    "img": "Shizuku/Shizuku_16.png",
    "color": "#5CD0B9",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "345",
    "name": "Touya 01",
    "character": "Touya",
    "img": "Touya/Touya_01.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "346",
    "name": "Touya 02",
    "character": "Touya",
    "img": "Touya/Touya_02.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "347",
    "name": "Touya 03",
    "character": "Touya",
    "img": "Touya/Touya_03.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "348",
    "name": "Touya 04",
    "character": "Touya",
    "img": "Touya/Touya_04.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "349",
    "name": "Touya 06",
    "character": "Touya",
    "img": "Touya/Touya_06.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "350",
    "name": "Touya 07",
    "character": "Touya",
    "img": "Touya/Touya_07.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "351",
    "name": "Touya 08",
    "character": "Touya",
    "img": "Touya/Touya_08.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "352",
    "name": "Touya 09",
    "character": "Touya",
    "img": "Touya/Touya_09.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "353",
    "name": "Touya 11",
    "character": "Touya",
    "img": "Touya/Touya_11.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "354",
    "name": "Touya 12",
    "character": "Touya",
    "img": "Touya/Touya_12.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "355",
    "name": "Touya 13",
    "character": "Touya",
    "img": "Touya/Touya_13.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "356",
    "name": "Touya 14",
    "character": "Touya",
    "img": "Touya/Touya_14.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "357",
    "name": "Touya 16",
    "character": "Touya",
    "img": "Touya/Touya_16.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "358",
    "name": "Touya 17",
    "character": "Touya",
    "img": "Touya/Touya_17.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "359",
    "name": "Touya 18",
    "character": "Touya",
    "img": "Touya/Touya_18.png",
    "color": "#0077DD",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "360",
    "name": "Tsukasa 01",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_01.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "361",
    "name": "Tsukasa 02",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_02.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "362",
    "name": "Tsukasa 03",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_03.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "363",
    "name": "Tsukasa 04",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_04.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "364",
    "name": "Tsukasa 06",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_06.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "365",
    "name": "Tsukasa 07",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_07.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "366",
    "name": "Tsukasa 08",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_08.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "367",
    "name": "Tsukasa 09",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_09.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "368",
    "name": "Tsukasa 11",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_11.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "369",
    "name": "Tsukasa 12",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_12.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "370",
    "name": "Tsukasa 13",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_13.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "371",
    "name": "Tsukasa 14",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_14.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "372",
    "name": "Tsukasa 16",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_16.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "373",
    "name": "Tsukasa 17",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_17.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  },
  {
    "id": "374",
    "name": "Tsukasa 18",
    "character": "Tsukasa",
    "img": "Tsukasa/Tsukasa_18.png",
    "color": "#F09A04",
    "defaultText": {
      "text": "something",
      "x": 148,
      "y": 58,
      "r": -2,
      "s": 47
    }
  }

]
