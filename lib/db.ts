import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readJson<T>(filename: string, defaultValue: T): T {
  const filepath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filepath)) return defaultValue
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as T
  } catch {
    return defaultValue
  }
}

export function writeJson<T>(filename: string, data: T): void {
  const filepath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
}
