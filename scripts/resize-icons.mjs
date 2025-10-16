import sharp from 'sharp'
import fs from 'node:fs'

async function main() {
  if (!fs.existsSync('public/icons/icon-512x512.png')) {
    console.error('Missing public/icons/icon-512x512.png, run fetch-assets first')
    process.exit(1)
  }
  await sharp('public/icons/icon-512x512.png').resize(384,384).toFile('public/icons/icon-384x384.png')
  await sharp('public/icons/icon-512x512.png').resize(192,192).toFile('public/icons/icon-192x192.png')
  console.log('Icons resized')
}

main()
