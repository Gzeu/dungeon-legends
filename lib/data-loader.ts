import fs from 'fs/promises'
import path from 'path'

export async function loadJSON(file) {
  const dataPath = path.join(process.cwd(), 'data', file)
  const content = await fs.readFile(dataPath, 'utf-8')
  return JSON.parse(content)
}

export async function hydrateInitialGameState({ players }) {
  const roomsJSON = await loadJSON('rooms.json')
  const heroesJSON = await loadJSON('heroes.json')
  const spellsJSON = await loadJSON('spells.json')
  const equipmentJSON = await loadJSON('equipment.json')

  // Create player objects
  const playersState = players.map((p, i) => {
    const heroDef = heroesJSON.heroes.find(h => h.type === p.heroType)
    return {
      id: p.userId,
      name: p.name || `Player ${i+1}`,
      hero: {
        type: heroDef.type,
        name: heroDef.name,
        icon: heroDef.icon,
        maxHealth: heroDef.base.health,
        currentHealth: heroDef.base.health,
        maxMana: heroDef.base.mana,
        currentMana: heroDef.base.mana,
        attack: heroDef.base.attack,
        defense: heroDef.base.defense,
        special: heroDef.special,
        statusEffects: [],
        cooldowns: {},
        equipment: {},
        treasure: 0
      },
      hand: generateStartingHand(spellsJSON),
      isAI: p.isAI || false
    }
  })

  return {
    status: 'active',
    currentRoom: 0,
    currentPlayer: 0,
    turnCounter: 1,
    roundCounter: 1,
    rooms: roomsJSON.rooms,
    players: playersState,
    spellCombo: [],
    logs: []
  }
}

function generateStartingHand(spellsJSON) {
  const pool = spellsJSON.spells
  const pick = () => pool[Math.floor(Math.random() * pool.length)]
  return [
    { ...pick(), id: `c_${Date.now()}_${Math.random()}` },
    { ...pick(), id: `c_${Date.now()}_${Math.random()}` },
    { ...pick(), id: `c_${Date.now()}_${Math.random()}` }
  ]
}