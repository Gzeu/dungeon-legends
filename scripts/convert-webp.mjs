import sharp from 'sharp'
import fs from 'node:fs'

const GLOBS = [
  'public/images/rooms',
  'public/images'
]

async function toWebp(input) {
  const out = input.replace(/\.(png|jpg|jpeg)$/i, '.webp')
  if (fs.existsSync(out)) return
  const buf = fs.readFileSync(input)
  await sharp(buf).webp({ quality: 86 }).toFile(out)
  console.log('WEBP', out)
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`
    if (e.isDirectory()) walk(p)
    else if (/\.(png|jpg|jpeg)$/i.test(p)) toWebp(p)
  }
}

async function run() {
  for (const g of GLOBS) if (fs.existsSync(g)) walk(g)
}

run()
