import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

// COMPLETE ASSET INVENTORY pentru Dungeon Legends RPG
const ASSETS = [
  // PWA Icons (core)
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/a41f53d1-29f2-419c-8bd2-bc915a9161b5.png', out: 'public/icons/icon-512x512.png' },
  
  // PWA Screenshots
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/97a15603-4cbc-4a60-afc0-6204f66ca76c.png', out: 'public/screenshots/screenshot-wide.png' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/ca56566f-ad3e-4230-933f-5704eb069165.png', out: 'public/screenshots/screenshot-mobile.png' },
  
  // Teasers pentru landing page
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/11f4ff83-8599-419c-85cd-0e1ae6cf4b8e.png', out: 'public/images/teaser-dungeon.png' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/9eae1dbb-3412-4af3-8b23-8243a91e6753.png', out: 'public/images/teaser-guild.png' },
  
  // Auth logos
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/e772e0b5-5079-4000-ae1c-7eefec6433c6.png', out: 'public/google-logo.svg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/6f01c573-c070-4ceb-ba8c-0680f90968a2.png', out: 'public/github-logo.svg' },
  
  // Hero portraits (pentru HeroSelector și game UI)
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/2a0b4394-3e40-4501-bab6-d15b516ac606.png', out: 'public/images/heroes/knight-portrait.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/73aba8ab-7970-4c3a-aca9-d71616aa5f84.png', out: 'public/images/heroes/wizard-portrait.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/f237170b-6fbb-48da-bca3-337e2fdf691b.png', out: 'public/images/heroes/rogue-portrait.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/8321ae6a-4830-499c-b9e0-059cee1c12ca.png', out: 'public/images/heroes/cleric-portrait.jpg' },
  
  // Enemy images (referite în data/rooms.json)
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/593ae2ac-1f4b-4b8a-87ee-1673c63355e1.png', out: 'public/images/enemies/goblin.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/d66aaf30-a677-43bc-bff7-2633a512849c.png', out: 'public/images/enemies/orc.jpg' },
  // Dragon - folosesc imaginea generată anterior pentru dragon boss [197] din chat
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/c7c85b48-8b9c-492f-88d3-5d8a95bfe7ff.png', out: 'public/images/enemies/dragon.jpg' },
  
  // Room backgrounds (referite în data/rooms.json)
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/333d85be-b0fe-4a08-ac1d-c8ddfd98e3cc.png', out: 'public/images/rooms/entrance.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/795406ca-df9f-4706-8c07-e6c5c601f621.png', out: 'public/images/rooms/warren.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/815ba52d-44d6-4d4b-8981-f1f165fdd71e.png', out: 'public/images/rooms/trap.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/3d488311-f873-49ff-ae3d-fbafdb673e90.png', out: 'public/images/rooms/vault.jpg' },
  { url: 'https://user-gen-media-assets.s3.amazonaws.com/gemini_images/9134829a-7574-4e57-b3a9-93c638607fad.png', out: 'public/images/rooms/lair.jpg' }
]

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 Created directory: ${dir}`)
  }
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    ensureDir(outputPath)
    const file = fs.createWriteStream(outputPath)
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`))
      }
      
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`✅ ${outputPath}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}) // cleanup
      reject(err)
    })
  })
}

async function downloadAllAssets() {
  console.log('🚀 Downloading all Dungeon Legends assets...')
  console.log(`📊 Total assets to download: ${ASSETS.length}`)
  
  let success = 0
  let failed = 0
  
  for (const asset of ASSETS) {
    try {
      await downloadFile(asset.url, asset.out)
      success++
    } catch (error) {
      console.error(`❌ Failed ${asset.out}: ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n📈 Download Summary:`)
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total: ${ASSETS.length}`)
  
  if (failed > 0) {
    console.error(`\n⚠️  Some assets failed to download. Check network and URLs.`)
    process.exitCode = 1
  } else {
    console.log(`\n🎉 All assets downloaded successfully!`)
  }
}

// Verifică și listează fișierele existente
function checkExistingAssets() {
  console.log('🔍 Checking existing assets...')
  let existing = 0
  let missing = 0
  
  ASSETS.forEach(asset => {
    if (fs.existsSync(asset.out)) {
      console.log(`✅ ${asset.out} (exists)`)
      existing++
    } else {
      console.log(`❌ ${asset.out} (missing)`)
      missing++
    }
  })
  
  console.log(`\n📊 Asset Status:`)
  console.log(`✅ Existing: ${existing}`)
  console.log(`❌ Missing: ${missing}`)
  console.log(`📊 Total: ${ASSETS.length}`)
  
  return { existing, missing }
}

// Main execution
if (process.argv.includes('--check')) {
  checkExistingAssets()
} else {
  downloadAllAssets()
}
