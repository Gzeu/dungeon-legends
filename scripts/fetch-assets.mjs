import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const files = [
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/a41f53d1-29f2-419c-8bd2-bc915a9161b5.png', out: 'public/icons/icon-512x512.png' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/97a15603-4cbc-4a60-afc0-6204f66ca76c.png', out: 'public/screenshots/screenshot-wide.png' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/ca56566f-ad3e-4230-933f-5704eb069165.png', out: 'public/screenshots/screenshot-mobile.png' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/11f4ff83-8599-419c-85cd-0e1ae6cf4b8e.png', out: 'public/images/teaser-dungeon.png' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/9eae1dbb-3412-4af3-8b23-8243a91e6753.png', out: 'public/images/teaser-guild.png' }
]

function ensureDir(p) {
  const dir = path.dirname(p)
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
  for (const f of files) {
    try {
      console.log('Downloading', f.url, '->', f.out)
      await download(f.url, f.out)
    } catch (e) {
      console.error('Failed', f.url, e)
      process.exitCode = 1
    }
  }
  console.log('Done.')
}

run()
