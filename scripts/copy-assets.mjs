import { cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// 表情素材、字体与那张空白页都要随包发布，页面靠 file:// 读取它们
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
await mkdir(resolve(root, 'lib'), { recursive: true })
await cp(resolve(root, 'src/assets'), resolve(root, 'lib/assets'), { recursive: true })
console.log('copied assets to lib/')
