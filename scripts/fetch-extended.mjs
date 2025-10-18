import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const EXT = JSON.parse(fs.readFileSync('scripts/assets-extended.json','utf-8'))

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function download(url, out) {
  return new Promise((resolve, reject) => {
    ensureDir(out)
    const file = fs.createWriteStream(out)
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', reject)
  })
}

async function run() {
  const col = process.argv[2]
  if (!col || !EXT.collections[col]) {
    console.error('Usage: node scripts/fetch-extended.mjs <collection>')
    console.error('Available:', Object.keys(EXT.collections).join(', '))
    process.exit(1)
  }
  const items = EXT.collections[col]
  console.log('Downloading collection:', col)
  for (const it of items) {
    try { await download(it.url, it.out); console.log('OK', it.out) } catch(e) { console.error('FAIL', it.out, e.message) }
  }
}

run()
