import { connectDB } from '../lib/db'

async function testConnection() {
  try {
    console.log('🔄 Conectare la MongoDB...')
    await connectDB()
    console.log('✅ Conexiune MongoDB reușită!')

    // Testăm dacă putem face o operație simplă
    const mongoose = (await import('mongoose')).default
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray()
      console.log(`📊 Bază de date găsită cu ${collections.length} colecții`)
    } else {
      console.log('📊 Conexiune stabilită, dar baza de date nu e încă pregătită')
    }

  } catch (error) {
    console.error('❌ Eroare conexiune MongoDB:', error)
    process.exit(1)
  }
}

testConnection()
