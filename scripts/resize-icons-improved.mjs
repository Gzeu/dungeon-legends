import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const ICON_SIZES = [192, 384, 512]
const SOURCE_ICON = 'public/icons/icon-512x512.png'

async function resizeIcons() {
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`)
    console.error(`   Run: node scripts/fetch-all-assets.mjs first`)
    process.exit(1)
  }
  
  console.log('🔄 Resizing PWA icons...')
  
  for (const size of ICON_SIZES) {
    const outputPath = `public/icons/icon-${size}x${size}.png`
    
    try {
      if (size === 512) {
        console.log(`✅ ${outputPath} (source)`)
        continue
      }
      
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .png({ quality: 90, compressionLevel: 6 })
        .toFile(outputPath)
        
      console.log(`✅ ${outputPath}`)
    } catch (error) {
      console.error(`❌ Failed to resize ${outputPath}: ${error.message}`)
    }
  }
  
  console.log('🎉 Icon resizing complete!')
}

resizeIcons()
