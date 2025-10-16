'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { 
  Sword, Shield, Sparkles, Heart, Zap, Crown,
  Target, Users, Trophy, Star, Settings, Volume2
} from 'lucide-react'

interface GameState {
  id: string
  currentRoom: number
  currentPlayer: number
  players: Player[]
  rooms: Room[]
  turnCounter: number
  roundCounter: number
  status: 'waiting' | 'active' | 'completed'
  spellCombo: string[]
}

interface Player {
  id: string
  name: string
  heroType: string
  level: number
  xp: number
  currentHP: number
  maxHP: number
  currentMP: number
  maxMP: number
  treasure: number
  hand: GameCard[]
  statusEffects: StatusEffect[]
  equipment: Equipment
  cooldowns: Record<string, number>
  isAI: boolean
  aiDifficulty?: string
  aiPersonality?: string
}

interface GameCard {
  id: string
  name: string
  type: 'spell' | 'equipment' | 'event'
  school?: string
  manaCost: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  effect: string
  description: string
  icon: string
  image?: string
  targetType?: 'self' | 'ally' | 'enemy' | 'all'
}

interface Room {
  id: number
  name: string
  type: 'safe' | 'combat' | 'challenge' | 'boss' | 'event'
  description: string
  icon: string
  enemy?: Enemy
  challenge?: Challenge
  event?: GameEvent
  completed: boolean
  rewards: RoomReward[]
  backgroundImage: string
}

interface Enemy {
  name: string
  currentHP: number
  maxHP: number
  attack: number
  defense: number
  abilities: string[]
  statusEffects: StatusEffect[]
  image: string
  lootTable: LootItem[]
}

interface StatusEffect {
  id: string
  type: string
  duration: number
  value?: number
  icon: string
  description: string
  stackable: boolean
}

interface Equipment {
  weapon?: EquipmentItem
  armor?: EquipmentItem
  accessory?: EquipmentItem
  trinket?: EquipmentItem
}

interface AudioSettings {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  isEnabled: boolean
}

export default function GameInterface({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null)
  const [targetingMode, setTargetingMode] = useState(false)
  const [gameMessages, setGameMessages] = useState<string[]>([])
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    isEnabled: true
  })
  
  const websocketRef = useRef<WebSocket | null>(null)
  const audioManagerRef = useRef<any>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    if (session?.user?.id && gameId) {
      initializeWebSocket()
      initializeAudio()
    }
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [session, gameId])

  const initializeWebSocket = () => {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:3001'
      
    const ws = new WebSocket(wsUrl)
    websocketRef.current = ws

    ws.onopen = () => {
      console.log('✅ Connected to game server')
      // Join the game room
      ws.send(JSON.stringify({
        type: 'joinGame',
        gameId,
        userId: session?.user?.id
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onclose = (event) => {
      console.log('🔌 Disconnected from game server:', event.code)
      
      // Attempt reconnection if not intentional
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect...')
          initializeWebSocket()
        }, 3000)
      }
    }

    ws.onerror = (error) => {
      console.error('🚨 WebSocket error:', error)
    }
  }

  const initializeAudio = async () => {
    try {
      // Dynamic import of audio manager
      const { AudioManager } = await import('@/lib/audio-manager')
      audioManagerRef.current = new AudioManager(audioSettings)
      
      // Load background music for current room
      if (gameState?.currentRoom !== undefined) {
        audioManagerRef.current.setRoomAmbience(gameState.currentRoom)
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'gameStateUpdate':
        setGameState(data.gameState)
        playAudioForState(data.gameState)
        break
        
      case 'actionResult':
        handleActionResult(data)
        break
        
      case 'playerJoined':
        addGameMessage(`${data.playerName} joined the game`)
        playAudio('playerJoin')
        break
        
      case 'playerLeft':
        addGameMessage(`${data.playerName} left the game`)
        break
        
      case 'levelUp':
        setLevelUpData(data.levelUpInfo)
        setShowLevelUp(true)
        playAudio('levelUp')
        break
        
      case 'gameEnded':
        handleGameEnd(data.results)
        break
        
      case 'error':
        toast({
          title: 'Game Error',
          description: data.message,
          variant: 'destructive'
        })
        break
    }
  }

  const handleActionResult = (data: any) => {
    const { results, animations, sounds } = data
    
    // Process each result
    results.forEach((result: any, index: number) => {
      setTimeout(() => {
        addGameMessage(result.message)
        
        // Play appropriate sound
        if (sounds && sounds[index]) {
          playAudio(sounds[index])
        }
        
        // Trigger visual effects
        if (animations && animations[index]) {
          triggerAnimation(animations[index])
        }
        
        // Handle XP gains
        if (result.xpGained) {
          showXPGain(result.xpGained, result.heroType)
        }
      }, index * 500)
    })
  }

  const playAudio = (soundType: string, options?: any) => {
    if (audioManagerRef.current && audioSettings.isEnabled) {
      audioManagerRef.current.playSound(soundType, {
        volume: audioSettings.sfxVolume,
        ...options
      })
    }
  }

  const playAudioForState = (newGameState: GameState) => {
    if (!gameState) return
    
    // Room transition
    if (newGameState.currentRoom !== gameState.currentRoom) {
      playAudio('roomTransition')
      if (audioManagerRef.current) {
        audioManagerRef.current.setRoomAmbience(newGameState.currentRoom)
      }
    }
    
    // Combat state changes
    const currentRoom = newGameState.rooms[newGameState.currentRoom]
    const oldRoom = gameState.rooms[gameState.currentRoom]
    
    if (currentRoom.enemy && oldRoom.enemy) {
      if (currentRoom.enemy.currentHP < oldRoom.enemy.currentHP) {
        playAudio('enemyHit')
        triggerScreenShake()
      }
      
      if (currentRoom.enemy.currentHP <= 0 && oldRoom.enemy.currentHP > 0) {
        playAudio('enemyDefeated')
        triggerVictoryAnimation()
      }
    }
  }

  const sendGameAction = (action: string, data: any = {}) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'gameAction',
        action,
        data,
        gameId,
        userId: session?.user?.id,
        timestamp: Date.now()
      }))
      
      // Optimistic UI feedback
      playAudio('buttonClick')
    } else {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to game server',
        variant: 'destructive'
      })
    }
  }

  const playCard = async (card: GameCard, targetIndex?: number) => {
    if (!gameState || !isMyTurn()) return

    const currentPlayer = getCurrentPlayer()
    if (!currentPlayer) return

    // Validate mana cost
    if (card.manaCost > currentPlayer.currentMP) {
      toast({
        title: 'Insufficient Mana',
        description: `This spell costs ${card.manaCost} mana, but you only have ${currentPlayer.currentMP}`,
        variant: 'destructive'
      })
      playAudio('error')
      return
    }

    // Handle targeting
    if (card.targetType && card.targetType !== 'self' && targetIndex === undefined) {
      setSelectedCard(card)
      setTargetingMode(true)
      addGameMessage(`Select a ${card.targetType} to target with ${card.name}`)
      return
    }

    // Send action to server
    sendGameAction('playCard', {
      cardId: card.id,
      targetIndex,
      manaCost: card.manaCost
    })

    // Reset targeting
    setSelectedCard(null)
    setTargetingMode(false)
    
    // Play card-specific audio
    if (card.school) {
      playAudio(`spell${card.school.charAt(0).toUpperCase() + card.school.slice(1)}`)
    } else {
      playAudio('cardPlay')
    }
  }

  const useAbility = (abilityType: string) => {
    if (!isMyTurn()) return
    
    const currentPlayer = getCurrentPlayer()
    if (!currentPlayer) return
    
    // Check cooldowns
    const cooldown = currentPlayer.cooldowns[abilityType] || 0
    if (cooldown > 0) {
      toast({
        title: 'Ability on Cooldown',
        description: `${abilityType} is ready in ${cooldown} turns`,
        variant: 'destructive'
      })
      playAudio('error')
      return
    }
    
    sendGameAction('useAbility', { abilityType })
    playAudio(abilityType)
  }

  const selectTarget = (targetIndex: number) => {
    if (!targetingMode || !selectedCard) return
    
    playCard(selectedCard, targetIndex)
  }

  const getCurrentPlayer = (): Player | undefined => {
    return gameState?.players.find(p => p.id === session?.user?.id)
  }

  const isMyTurn = (): boolean => {
    if (!gameState) return false
    const currentPlayer = getCurrentPlayer()
    return currentPlayer?.id === gameState.players[gameState.currentPlayer]?.id
  }

  const addGameMessage = (message: string) => {
    setGameMessages(prev => [...prev.slice(-4), message])
    setTimeout(() => {
      setGameMessages(prev => prev.slice(1))
    }, 5000)
  }

  const triggerAnimation = (animationType: string) => {
    const container = gameContainerRef.current
    if (!container) return
    
    switch (animationType) {
      case 'damage':
        container.classList.add('shake')
        setTimeout(() => container.classList.remove('shake'), 600)
        break
        
      case 'heal':
        container.classList.add('heal-glow')
        setTimeout(() => container.classList.remove('heal-glow'), 1000)
        break
        
      case 'levelUp':
        container.classList.add('level-up-burst')
        setTimeout(() => container.classList.remove('level-up-burst'), 2000)
        break
    }
  }

  const triggerScreenShake = () => {
    triggerAnimation('damage')
  }

  const triggerVictoryAnimation = () => {
    const container = gameContainerRef.current
    if (container) {
      container.classList.add('victory-glow')
      setTimeout(() => container.classList.remove('victory-glow'), 3000)
    }
  }

  const showXPGain = (amount: number, heroType: string) => {
    // Create floating XP animation
    const xpElement = document.createElement('div')
    xpElement.className = 'xp-gain-float'
    xpElement.textContent = `+${amount} XP`
    xpElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #FFD700;
      font-size: 2rem;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `
    
    document.body.appendChild(xpElement)
    
    // Animate and remove
    const animation = xpElement.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)', offset: 0 },
      { opacity: 1, transform: 'translate(-50%, -70%) scale(1.2)', offset: 0.3 },
      { opacity: 1, transform: 'translate(-50%, -90%) scale(1)', offset: 0.7 },
      { opacity: 0, transform: 'translate(-50%, -120%) scale(0.8)', offset: 1 }
    ], {
      duration: 2000,
      easing: 'ease-out'
    })
    
    animation.onfinish = () => {
      document.body.removeChild(xpElement)
    }
  }

  const handleGameEnd = (results: any) => {
    playAudio(results.victory ? 'victory' : 'defeat')
    
    // Show end game statistics and rewards
    toast({
      title: results.victory ? '🏆 Victory!' : '💀 Defeat',
      description: results.message,
      duration: 5000
    })
    
    // Process XP rewards
    if (results.xpAwards) {
      Object.entries(results.xpAwards).forEach(([heroType, xp]) => {
        setTimeout(() => {
          showXPGain(xp as number, heroType)
        }, 1000)
      })
    }
    
    // Check for achievements
    if (results.achievements) {
      results.achievements.forEach((achievement: any) => {
        toast({
          title: '🏆 Achievement Unlocked!',
          description: `${achievement.icon} ${achievement.title}`,
          duration: 8000
        })
      })
    }
  }

  const updateAudioSettings = (newSettings: Partial<AudioSettings>) => {
    const updated = { ...audioSettings, ...newSettings }
    setAudioSettings(updated)
    
    if (audioManagerRef.current) {
      audioManagerRef.current.updateSettings(updated)
    }
    
    // Persist to localStorage
    localStorage.setItem('dungeonLegends_audio', JSON.stringify(updated))
  }

  if (!gameState) {
    return (
      <div className="game-loading-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        >
          ⚔️
        </motion.div>
        <p className="loading-text">Connecting to adventure...</p>
      </div>
    )
  }

  const currentPlayer = getCurrentPlayer()
  const currentRoom = gameState.rooms[gameState.currentRoom]
  const myTurn = isMyTurn()

  return (
    <div ref={gameContainerRef} className="game-interface">
      {/* Audio Settings */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="audio-settings-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="settings-content">
            <div className="setting-row">
              <label>Master Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.masterVolume}
                onChange={(e) => updateAudioSettings({ masterVolume: parseFloat(e.target.value) })}
              />
            </div>
            
            <div className="setting-row">
              <label>Sound Effects</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.sfxVolume}
                onChange={(e) => updateAudioSettings({ sfxVolume: parseFloat(e.target.value) })}
              />
            </div>
            
            <div className="setting-row">
              <label>Background Music</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.musicVolume}
                onChange={(e) => updateAudioSettings({ musicVolume: parseFloat(e.target.value) })}
              />
            </div>
            
            <div className="setting-row">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={audioSettings.isEnabled}
                  onChange={(e) => updateAudioSettings({ isEnabled: e.target.checked })}
                />
                Enable Audio
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Header */}
      <motion.div 
        className="game-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="room-progress">
          <div className="room-info">
            <h2 className="room-name">{currentRoom.name}</h2>
            <div className="room-subtitle">{currentRoom.description}</div>
          </div>
          
          <div className="progress-visualization">
            {gameState.rooms.map((room, index) => (
              <motion.div
                key={index}
                className={`progress-node ${
                  index === gameState.currentRoom ? 'active' : ''
                } ${
                  room.completed ? 'completed' : ''
                } ${
                  room.type === 'boss' ? 'boss' : ''
                }`}
                whileHover={{ scale: 1.2 }}
                title={room.name}
              >
                <span className="node-icon">{room.icon}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="game-status">
          <div className="turn-info">
            <div className="current-player">
              {gameState.players[gameState.currentPlayer]?.name}'s Turn
            </div>
            <div className="turn-counter">Turn {gameState.turnCounter}</div>
            <div className="round-counter">Round {gameState.roundCounter}</div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="settings-btn"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Room Display with Background */}
      <motion.div 
        className="room-display"
        key={currentRoom.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${currentRoom.backgroundImage})`
        }}
      >
        <div className="room-content">
          <div className="room-atmosphere">
            <motion.div 
              className="room-icon"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {currentRoom.icon}
            </motion.div>
          </div>
          
          {/* Enemy Display */}
          {currentRoom.enemy && currentRoom.enemy.currentHP > 0 && (
            <motion.div 
              className="enemy-container"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="enemy-portrait">
                <img 
                  src={currentRoom.enemy.image} 
                  alt={currentRoom.enemy.name}
                  className="enemy-image"
                />
                
                {/* Enemy Status Effects */}
                {currentRoom.enemy.statusEffects.length > 0 && (
                  <div className="enemy-effects">
                    {currentRoom.enemy.statusEffects.map((effect, i) => (
                      <motion.div
                        key={`${effect.type}-${i}`}
                        className="status-effect"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        title={effect.description}
                      >
                        <span className="effect-icon">{effect.icon}</span>
                        {effect.duration > 0 && (
                          <span className="effect-duration">{effect.duration}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="enemy-stats">
                <h3 className="enemy-name">{currentRoom.enemy.name}</h3>
                
                <div className="enemy-health-display">
                  <Progress 
                    value={(currentRoom.enemy.currentHP / currentRoom.enemy.maxHP) * 100}
                    className="enemy-health-bar"
                  />
                  <span className="health-text">
                    {currentRoom.enemy.currentHP}/{currentRoom.enemy.maxHP} HP
                  </span>
                </div>
                
                <div className="enemy-attack-display">
                  <Sword className="w-4 h-4" />
                  <span>{currentRoom.enemy.attack} ATK</span>
                </div>
                
                {currentRoom.enemy.abilities.length > 0 && (
                  <div className="enemy-abilities">
                    <span className="abilities-label">Abilities:</span>
                    {currentRoom.enemy.abilities.map((ability, i) => (
                      <Badge key={i} variant="destructive" className="ability-badge">
                        {ability}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Continue with players display, actions, hand, etc... */}
      {/* This component is getting quite large - would normally split into smaller components */}
      
      {/* Game Messages Toast */}
      <div className="game-messages-container">
        <AnimatePresence>
          {gameMessages.map((message, index) => (
            <motion.div
              key={`${message}-${index}`}
              className="game-message-toast"
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              style={{ top: `${20 + index * 60}px` }}
            >
              {message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Level Up Modal */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
        <DialogContent className="level-up-modal">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="level-up-content"
          >
            <DialogHeader>
              <DialogTitle className="level-up-title">
                <Crown className="w-8 h-8 text-yellow-500" />
                LEVEL UP!
              </DialogTitle>
            </DialogHeader>
            
            {levelUpData && (
              <div className="level-up-details">
                <div className="hero-level-display">
                  <img 
                    src={`/images/heroes/${levelUpData.heroType}-portrait.jpg`}
                    alt={levelUpData.heroType}
                    className="hero-portrait-large"
                  />
                  <div className="level-info">
                    <div className="old-level">Level {levelUpData.oldLevel}</div>
                    <motion.div 
                      className="level-arrow"
                      animate={{ x: [0, 20, 0] }}
                      transition={{ duration: 1, repeat: 3 }}
                    >
                      →
                    </motion.div>
                    <div className="new-level">Level {levelUpData.newLevel}</div>
                  </div>
                </div>
                
                <Tabs defaultValue="skills" className="level-up-tabs">
                  <TabsList className="w-full">
                    <TabsTrigger value="skills">🌟 Skills</TabsTrigger>
                    <TabsTrigger value="attributes">📊 Attributes</TabsTrigger>
                    <TabsTrigger value="rewards">🎁 Rewards</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="skills" className="skills-tab">
                    <h4>Choose New Skills:</h4>
                    <div className="skills-selection">
                      {levelUpData.availableSkills?.map((skill: any) => (
                        <Card key={skill.id} className="skill-card selectable">
                          <CardHeader>
                            <CardTitle className="skill-name">
                              {skill.icon} {skill.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="skill-description">{skill.description}</p>
                            <Badge className="skill-tree">{skill.tree}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="attributes" className="attributes-tab">
                    <h4>Allocate Attribute Points: ({levelUpData.attributePoints} available)</h4>
                    <div className="attributes-allocation">
                      {['attack', 'defense', 'health', 'mana'].map(attr => (
                        <div key={attr} className="attribute-row">
                          <span className="attr-name">{attr.toUpperCase()}</span>
                          <Button 
                            size="sm"
                            onClick={() => allocateAttribute(attr)}
                            disabled={levelUpData.attributePoints <= 0}
                          >
                            +1
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="rewards" className="rewards-tab">
                    <h4>Level Up Rewards:</h4>
                    <div className="rewards-list">
                      {levelUpData.rewards?.map((reward: any, i: number) => (
                        <motion.div
                          key={i}
                          className="reward-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                        >
                          <span className="reward-icon">{reward.icon}</span>
                          <span className="reward-description">{reward.description}</span>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="level-up-actions">
                  <Button 
                    onClick={() => confirmLevelUp()}
                    className="confirm-btn"
                    size="lg"
                  >
                    Confirm Upgrades
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => setShowLevelUp(false)}
                    size="sm"
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
      
      {/* Rest of the game interface would continue here... */}
    </div>
  )

  function allocateAttribute(attr: string) {
    // Implementation for attribute allocation
    sendGameAction('allocateAttribute', { attribute: attr })
  }

  function confirmLevelUp() {
    // Implementation for confirming level up choices
    sendGameAction('confirmLevelUp', levelUpData)
    setShowLevelUp(false)
  }
}