import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const files = [
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/6ce29b9f-54cc-4be6-9892-370054e6bf4e.png', out: 'public/images/enemies/dragon.jpg' }
]

function ensureDir(p) { const dir = path.dirname(p); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }
function download(url, out) { return new Promise((resolve, reject) => { ensureDir(out); const f = fs.createWriteStream(out); https.get(url, (res) => { if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`)); res.pipe(f); f.on('finish', () => f.close(resolve))}).on('error', reject) }) }

(async function run(){
  for (const f of files) { try { console.log('Downloading', f.url); await download(f.url, f.out) } catch (e) { console.error('Failed', f.url, e); process.exitCode = 1 } }
  console.log('Dragon image fetched.')
})()
