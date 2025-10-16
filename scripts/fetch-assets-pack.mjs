import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const files = [
  // Logos
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/e772e0b5-5079-4000-ae1c-7eefec6433c6.png', out: 'public/google-logo.svg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/6f01c573-c070-4ceb-ba8c-0680f90968a2.png', out: 'public/github-logo.svg' },
  // Enemies
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/593ae2ac-1f4b-4b8a-87ee-1673c63355e1.png', out: 'public/images/enemies/goblin.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/d66aaf30-a677-43bc-bff7-2633a512849c.png', out: 'public/images/enemies/orc.jpg' },
  // Rooms
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/333d85be-b0fe-4a08-ac1d-c8ddfd98e3cc.png', out: 'public/images/rooms/entrance.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/795406ca-df9f-4706-8c07-e6c5c601f621.png', out: 'public/images/rooms/warren.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/815ba52d-44d6-4d4b-8981-f1f165fdd71e.png', out: 'public/images/rooms/trap.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/3d488311-f873-49ff-ae3d-fbafdb673e90.png', out: 'public/images/rooms/vault.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/9134829a-7574-4e57-b3a9-93c638607fad.png', out: 'public/images/rooms/lair.jpg' },
  // Heroes
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/2a0b4394-3e40-4501-bab6-d15b516ac606.png', out: 'public/images/heroes/knight-portrait.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/73aba8ab-7970-4c3a-aca9-d71616aa5f84.png', out: 'public/images/heroes/wizard-portrait.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/f237170b-6fbb-48da-bca3-337e2fdf691b.png', out: 'public/images/heroes/rogue-portrait.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/8321ae6a-4830-499c-b9e0-059cee1c12ca.png', out: 'public/images/heroes/cleric-portrait.jpg' }
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
  console.log('Assets pack done.')
}

run()
