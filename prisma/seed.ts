import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with initial data...')

  // Create default achievements
  const achievements = [
    {
      name: 'first_victory',
      title: 'First Steps',
      description: 'Complete your first dungeon adventure',
      icon: '🎯',
      category: 'PROGRESSION',
      rarity: 'COMMON',
      points: 10,
      requirements: { gamesWon: 1 },
      rewards: { xp: 50, title: 'Adventurer' }
    },
    {
      name: 'dragon_slayer',
      title: 'Dragon Slayer',
      description: 'Defeat the Ancient Dragon',
      icon: '🐉',
      category: 'COMBAT',
      rarity: 'EPIC',
      points: 100,
      requirements: { dragonsKilled: 1 },
      rewards: { xp: 200, item: 'dragon_scale_armor', title: 'Dragon Slayer' }
    },
    {
      name: 'treasure_hoarder',
      title: 'Treasure Hoarder',
      description: 'Collect 100+ treasure in a single game',
      icon: '💰',
      category: 'COLLECTION',
      rarity: 'RARE',
      points: 50,
      requirements: { singleGameTreasure: 100 },
      rewards: { xp: 150, permanentBonus: 'treasure_sense' }
    },
    {
      name: 'spell_master',
      title: 'Arcane Master',
      description: 'Cast 1000 spells across all heroes',
      icon: '✨',
      category: 'PROGRESSION',
      rarity: 'RARE',
      points: 75,
      requirements: { totalSpellsCast: 1000 },
      rewards: { xp: 250, permanentBonus: 'spell_power' }
    },
    {
      name: 'guild_founder',
      title: 'Guild Master',
      description: 'Create and lead a successful guild',
      icon: '👑',
      category: 'SOCIAL',
      rarity: 'LEGENDARY',
      points: 200,
      requirements: { guildMembers: 10, guildLevel: 5 },
      rewards: { xp: 500, title: 'Guild Master', specialAbility: 'guild_blessing' }
    }
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    })
  }

  // Create sample daily challenge
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  await prisma.dailyChallenge.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      title: 'Dragon Hunter',
      description: 'Defeat the Ancient Dragon using only Knight abilities',
      type: 'COMBAT',
      difficulty: 'HARD',
      requirements: {
        heroRestriction: ['knight'],
        objective: 'defeat_dragon',
        noSpellCards: true
      },
      xpReward: 100,
      treasureReward: 25,
      specialRewards: {
        title: 'Dragon Hunter',
        equipment: 'dragonslayer_sword'
      }
    }
  })

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })