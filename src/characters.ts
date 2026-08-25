import fs from 'node:fs'
import path from 'node:path'

export interface Character {
  id: string
  name: string
  character: string
  img: string
  color: string
  defaultText: { text: string; x: number; y: number; r: number; s: number }
}

export const ASSETS = path.join(__dirname, 'assets')

export const CHARACTERS: Character[] = JSON.parse(
  fs.readFileSync(path.join(ASSETS, 'characters.json'), 'utf8'))

/** 前三张是总览图，之后才是按角色分的列表，序号即索引减三。 */
export const OVERVIEWS = ['characterListAll', 'characterListWithIndex', 'characterListNoIndex'] as const

export const NAMES = [
  'Airi', 'Akito', 'An', 'Emu', 'Ena', 'Haruka', 'Honami', 'Ichika', 'KAITO',
  'Kanade', 'Kohane', 'Len', 'Luka', 'Mafuyu', 'Meiko', 'Miku', 'Minori',
  'Mizuki', 'Nene', 'Rin', 'Rui', 'Saki', 'Shiho', 'Shizuku', 'Touya', 'Tsukasa',
]

/** 接受角色序号（从 0 开始）或角色名，返回规范化的角色名。 */
export function resolveName(input: string): string {
  const text = input?.trim().toLowerCase()
  if (!text) return null
  if (/^\d+$/.test(text)) return NAMES[Number(text)] ?? null
  return NAMES.find((name) => name.toLowerCase() === text) ?? null
}

/** 列表图的绝对路径；`name` 可以是角色名或总览图名。 */
export function listImage(name: string): Buffer {
  const file = path.join(ASSETS, 'list', `${name}.jpeg`)
  return fs.existsSync(file) ? fs.readFileSync(file) : null
}
