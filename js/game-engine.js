// Enhanced Game Engine with Mana, Spells, Equipment, and Events
class GameEngine {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentRoomIndex = 0;
        this.rooms = [];
        this.deck = null;
        this.gameMode = 'cooperative';
        this.gameState = 'menu';
        this.selectedHeroes = [];
        this.turnCounter = 0;
        this.roundCounter = 0; // Track rounds for boss patterns
        this.spellCombo = []; // Track spell school combos
        this.eventQueue = []; // Queue of events to trigger
        
        this.initializeRooms();
    }

    initializeRooms() {
        this.rooms = ROOMS.map(roomData => new Room(roomData));
    }

    startGame(playerCount, gameMode, heroSelections) {
        this.gameMode = gameMode;
        this.gameState = 'playing';
        this.currentPlayerIndex = 0;
        this.currentRoomIndex = 0;
        this.turnCounter = 0;
        this.roundCounter = 0;
        this.spellCombo = [];
        this.eventQueue = [];
        
        this.players = [];
        for (let i = 0; i < playerCount; i++) {
            const heroType = heroSelections[i];
            this.players.push({
                id: i,
                name: `Player ${i + 1}`,
                hero: new Hero(heroType, i),
                hand: [],
                actionsThisTurn: 0,
                spellsPlayedThisTurn: 0
            });
        }
        
        this.deck = new Deck();
        this.dealInitialCards();
        
        this.rooms.forEach(room => {
            room.completed = false;
            room.eventTriggered = false;
            if (room.encounter && room.encounter.health) {
                room.encounter.currentHealth = room.encounter.health;
            }
        });
        
        return this.getCurrentGameState();
    }

    dealInitialCards() {
        this.players.forEach(player => {
            player.hand = this.deck.drawCards(5);
        });
    }

    getCurrentGameState() {
        return {
            gameState: this.gameState,
            currentPlayer: this.getCurrentPlayer(),
            currentRoom: this.getCurrentRoom(),
            players: this.players.map(p => ({
                ...p,
                heroStatus: p.hero.getStatus()
            })),
            roomProgress: {
                current: this.currentRoomIndex,
                total: this.rooms.length,
                roomName: this.getCurrentRoom().name
            },
            turnCounter: this.turnCounter,
            roundCounter: this.roundCounter,
            spellCombo: this.spellCombo
        };
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getCurrentRoom() {
        return this.rooms[this.currentRoomIndex];
    }

    processAction(action, data = {}) {
        const currentPlayer = this.getCurrentPlayer();
        const currentRoom = this.getCurrentRoom();
        const results = [];

        switch (action) {
            case 'attack':
                results.push(...this.processAttack(currentPlayer, currentRoom, data));
                break;
            case 'defend':
                results.push(...this.processDefend(currentPlayer, data));
                break;
            case 'special':
                results.push(...this.processSpecial(currentPlayer, data));
                break;
            case 'pass':
                results.push({ type: 'info', message: `${currentPlayer.name} passes their turn.` });
                break;
            case 'playCard':
                results.push(...this.processCardPlay(currentPlayer, currentRoom, data));
                break;
            case 'eventChoice':
                results.push(...this.processEventChoice(data));
                break;
            case 'challenge':
                results.push(...this.processChallenge(currentPlayer, currentRoom, data));
                break;
        }

        if (currentRoom.isEncounterDefeated() && !currentRoom.completed) {
            results.push(...currentRoom.completeRoom(this.players, this));
        }

        this.endTurn();
        
        const gameEnd = this.checkGameEnd();
        if (gameEnd) {
            results.push(gameEnd);
            this.gameState = 'ended';
        }

        return {
            results,
            gameState: this.getCurrentGameState()
        };
    }

    processCardPlay(player, room, data) {
        const { cardIndex, card, targetIndex } = data;
        const results = [];
        
        if (cardIndex >= player.hand.length) {
            return [{ type: 'error', message: 'Invalid card!' }];
        }
        
        const playedCard = player.hand[cardIndex];
        
        // Check mana cost
        if (playedCard.mana_cost && !player.hero.spendMana(playedCard.mana_cost)) {
            return [{ type: 'error', message: 'Not enough mana!' }];
        }
        
        // Remove card from hand
        player.hand.splice(cardIndex, 1);
        
        // Track spell combo
        if (playedCard.school) {
            this.spellCombo.push(playedCard.school);
            player.spellsPlayedThisTurn++;
        }
        
        // Execute card effect
        switch (playedCard.type) {
            case 'spell':
                results.push(...this.processSpellCard(player, room, playedCard, targetIndex));
                break;
            case 'equipment':
                results.push(...this.processEquipmentCard(player, playedCard));
                break;
            default:
                // Legacy card types
                results.push(...this.processLegacyCard(player, room, playedCard, targetIndex));
                break;
        }
        
        // Check for spell combos
        if (this.spellCombo.length >= 2) {
            const comboResults = this.checkSpellCombo();
            results.push(...comboResults);
        }
        
        this.deck.discard(playedCard);
        return results;
    }

    processSpellCard(player, room, card, targetIndex) {
        const results = [];
        
        switch (card.cardType || card.name.toLowerCase().replace(/\s+/g, '_')) {
            case 'fireball':
                if (room.encounter && room.encounter.currentHealth > 0) {
                    room.encounter.currentHealth -= 4;
                    room.encounter.statusEffects = room.encounter.statusEffects || [];
                    room.encounter.statusEffects.push({ type: 'ignite', duration: 2 });
                    results.push({
                        type: 'combat',
                        message: `${player.name} casts Fireball for 4 damage + ignite!`
                    });
                }
                break;
                
            case 'ice_shard':
                if (room.encounter && room.encounter.currentHealth > 0) {
                    room.encounter.currentHealth -= 3;
                    room.encounter.statusEffects = room.encounter.statusEffects || [];
                    room.encounter.statusEffects.push({ type: 'slow', duration: 1 });
                    results.push({
                        type: 'combat',
                        message: `${player.name} casts Ice Shard for 3 damage + slow!`
                    });
                }
                break;
                
            case 'greater_heal':
                const target = targetIndex !== undefined ? this.players[targetIndex] : player;
                const healed = target.hero.heal(5);
                // Cleanse debuffs
                target.hero.statusEffects = target.hero.statusEffects.filter(e => 
                    !['weakness', 'poison', 'ignite', 'slow'].includes(e.type)
                );
                results.push({
                    type: 'heal',
                    message: `${player.name} casts Greater Heal on ${target.name} for ${healed} HP + cleanse!`
                });
                break;
                
            case 'shadow_strike':
                if (room.encounter && room.encounter.currentHealth > 0) {
                    room.encounter.currentHealth -= 3;
                    room.encounter.statusEffects = room.encounter.statusEffects || [];
                    room.encounter.statusEffects.push({ type: 'poison', duration: 2 });
                    results.push({
                        type: 'combat',
                        message: `${player.name} strikes from shadows for 3 damage + poison!`
                    });
                }
                break;
                
            case 'nature_regeneration':
                const healTarget = targetIndex !== undefined ? this.players[targetIndex] : player;
                const immediateHeal = healTarget.hero.heal(2);
                healTarget.hero.statusEffects.push({ type: 'regeneration', duration: 3 });
                results.push({
                    type: 'heal',
                    message: `${player.name} grants ${healTarget.name} regeneration! (+${immediateHeal} HP now)`
                });
                break;
        }
        
        return results;
    }

    processEquipmentCard(player, card) {
        player.hero.equipItem(card);
        return [{
            type: 'equipment',
            message: `${player.name} equips ${card.name}!`
        }];
    }

    processLegacyCard(player, room, card, targetIndex) {
        const results = [];
        
        switch (card.cardType) {
            case 'attack':
                if (room.encounter && room.encounter.currentHealth > 0) {
                    const damage = player.hero.getTotalAttack() + 1;
                    room.encounter.currentHealth -= damage;
                    results.push({
                        type: 'combat',
                        message: `${player.name} uses ${card.name} for ${damage} damage!`
                    });
                    
                    if (room.encounter.currentHealth <= 0) {
                        results.push({
                            type: 'victory',
                            message: `${room.encounter.name} defeated!`
                        });
                    }
                }
                break;
                
            case 'defend':
                player.hero.statusEffects.push({ type: 'defending', duration: 2 });
                results.push({
                    type: 'defense',
                    message: `${player.name} uses ${card.name} - defense increased!`
                });
                break;
                
            case 'heal':
                const target = targetIndex !== undefined ? this.players[targetIndex] : player;
                const healed = target.hero.heal(3);
                results.push({
                    type: 'heal',
                    message: `${player.name} heals ${target.name} for ${healed} HP!`
                });
                break;
                
            case 'treasure':
                player.hero.statusEffects.push({ type: 'treasure_hunter', duration: 1 });
                results.push({
                    type: 'buff',
                    message: `${player.name} uses ${card.name} - extra treasure this room!`
                });
                break;
        }
        
        return results;
    }

    checkSpellCombo() {
        const results = [];
        const comboSchools = {};
        
        this.spellCombo.forEach(school => {
            comboSchools[school] = (comboSchools[school] || 0) + 1;
        });
        
        Object.entries(comboSchools).forEach(([school, count]) => {
            if (count >= 2) {
                results.push(...this.activateSpellCombo(school, count));
            }
        });
        
        return results;
    }

    activateSpellCombo(school, count) {
        const results = [];
        const currentPlayer = this.getCurrentPlayer();
        const room = this.getCurrentRoom();
        
        switch (school) {
            case 'fire':
                // Enhanced ignite
                if (room.encounter) {
                    room.encounter.statusEffects = room.encounter.statusEffects || [];
                    room.encounter.statusEffects.push({ type: 'intense_burn', duration: 3, damage: 2 });
                }
                results.push({
                    type: 'combo',
                    message: `Fire Combo! Enhanced burning effect!`
                });
                break;
                
            case 'ice':
                // Freeze effect
                if (room.encounter) {
                    room.encounter.statusEffects = room.encounter.statusEffects || [];
                    room.encounter.statusEffects.push({ type: 'frozen', duration: 1 });
                }
                results.push({
                    type: 'combo',
                    message: `Ice Combo! Enemy frozen for 1 turn!`
                });
                break;
                
            case 'light':
                // Party blessing
                this.players.forEach(player => {
                    player.hero.statusEffects.push({ type: 'blessing', duration: 2 });
                });
                results.push({
                    type: 'combo',
                    message: `Light Combo! All heroes blessed!`
                });
                break;
        }
        
        return results;
    }

    processEventChoice(data) {
        const { event, choiceIndex } = data;
        const choice = event.choices[choiceIndex];
        const results = [];
        
        // Check if choice has cost
        if (choice.cost) {
            const currentPlayer = this.getCurrentPlayer();
            if (currentPlayer.hero.treasure >= choice.cost) {
                currentPlayer.hero.treasure -= choice.cost;
            } else {
                return [{ type: 'error', message: 'Not enough treasure!' }];
            }
        }
        
        // Apply effect
        switch (choice.effect.type) {
            case 'permanent_hp':
                this.players.forEach(player => {
                    player.hero.maxHealth += choice.effect.amount;
                    player.hero.currentHealth += choice.effect.amount;
                });
                results.push({
                    type: 'blessing',
                    message: 'All heroes gain +1 max HP permanently!'
                });
                break;
                
            case 'equipment':
                const currentPlayer = this.getCurrentPlayer();
                // Add random equipment to hand
                const equipmentKeys = Object.keys(EQUIPMENT_CARDS).filter(k => 
                    EQUIPMENT_CARDS[k].rarity === choice.effect.rarity
                );
                if (equipmentKeys.length > 0) {
                    const randomEquip = equipmentKeys[Math.floor(Math.random() * equipmentKeys.length)];
                    const equipCard = { ...EQUIPMENT_CARDS[randomEquip], cardType: randomEquip };
                    currentPlayer.hand.push(equipCard);
                    results.push({
                        type: 'reward',
                        message: `Received ${equipCard.name}!`
                    });
                }
                break;
                
            case 'cursed_treasure':
                const player = this.getCurrentPlayer();
                player.hero.treasure += choice.effect.treasure;
                player.hero.statusEffects.push({ type: choice.effect.curse, duration: -1 }); // Permanent until cleansed
                results.push({
                    type: 'mixed',
                    message: `Gained ${choice.effect.treasure} treasure but cursed with weakness!`
                });
                break;
                
            case 'draw_card':
                const drawnCards = this.deck.drawCards(choice.effect.amount);
                this.getCurrentPlayer().hand.push(...drawnCards);
                results.push({
                    type: 'reward',
                    message: `Drew ${choice.effect.amount} cards!`
                });
                break;
        }
        
        return results;
    }

    processEnemyAttack(enemy) {
        const results = [];
        
        // Check if enemy is frozen
        if (enemy.statusEffects && enemy.statusEffects.find(e => e.type === 'frozen')) {
            results.push({
                type: 'info',
                message: `${enemy.name} is frozen and cannot attack!`
            });
            return results;
        }
        
        // Dragon boss pattern - Fire Breath every 3rd round
        if (enemy.name === 'Ancient Dragon' && this.roundCounter > 0 && this.roundCounter % 3 === 0) {
            results.push({
                type: 'boss_special',
                message: `${enemy.name} unleashes devastating FIRE BREATH!`
            });
            
            this.players.forEach(player => {
                if (player.hero.isAlive()) {
                    const damage = player.hero.takeDamage(enemy.attack + 1); // +1 for fire breath
                    results.push({
                        type: 'damage',
                        message: `${player.name} takes ${damage} fire damage!`
                    });
                }
            });
        } else {
            // Normal single target attack
            const targetPlayer = this.getCurrentPlayer();
            let attackDamage = enemy.attack;
            
            // Reduce damage if enemy is slowed
            if (enemy.statusEffects && enemy.statusEffects.find(e => e.type === 'slow')) {
                attackDamage = Math.max(1, attackDamage - 1);
            }
            
            const damage = targetPlayer.hero.takeDamage(attackDamage);
            results.push({
                type: 'damage',
                message: `${enemy.name} attacks ${targetPlayer.name} for ${damage} damage!`
            });
        }
        
        return results;
    }

    endTurn() {
        const currentPlayer = this.getCurrentPlayer();
        
        // Tick hero effects and cooldowns
        currentPlayer.hero.tickCooldowns();
        currentPlayer.actionsThisTurn = 0;
        currentPlayer.spellsPlayedThisTurn = 0;
        
        // Tick enemy effects
        const room = this.getCurrentRoom();
        if (room.encounter && room.encounter.statusEffects) {
            room.encounter.statusEffects.forEach(effect => {
                if (effect.type === 'ignite') {
                    room.encounter.currentHealth -= 1;
                } else if (effect.type === 'intense_burn') {
                    room.encounter.currentHealth -= effect.damage;
                } else if (effect.type === 'poison') {
                    room.encounter.currentHealth -= 2;
                }
            });
            
            // Remove expired effects
            room.encounter.statusEffects = room.encounter.statusEffects.filter(effect => {
                effect.duration--;
                return effect.duration > 0;
            });
        }
        
        // Draw card at end of turn (if hand not full)
        if (currentPlayer.hand.length < 7) {
            const newCard = this.deck.drawCard();
            if (newCard) {
                currentPlayer.hand.push(newCard);
            }
        }
        
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turnCounter++;
        
        // Increment round when back to first player
        if (this.currentPlayerIndex === 0) {
            this.roundCounter++;
            this.spellCombo = []; // Reset spell combo at round end
        }
        
        // Check room advancement
        if (this.currentPlayerIndex === 0 && room.isEncounterDefeated() && room.completed) {
            this.advanceRoom();
        }
    }

    advanceRoom() {
        if (this.currentRoomIndex < this.rooms.length - 1) {
            this.currentRoomIndex++;
        }
    }

    checkGameEnd() {
        const alivePlayers = this.players.filter(p => p.hero.isAlive());
        if (alivePlayers.length === 0) {
            return {
                type: 'defeat',
                message: 'All heroes have fallen. The dungeon claims another party...'
            };
        }
        
        const finalRoom = this.rooms[this.rooms.length - 1];
        if (finalRoom.completed) {
            const totalTreasure = this.players.reduce((sum, p) => sum + p.hero.treasure, 0);
            
            if (this.gameMode === 'cooperative') {
                return {
                    type: 'victory',
                    message: `Victory! The ancient dragon falls! The party collected ${totalTreasure} treasure and saved the realm!`
                };
            } else {
                const winner = this.players.reduce((max, p) => 
                    p.hero.treasure > max.hero.treasure ? p : max
                );
                return {
                    type: 'victory',
                    message: `${winner.name} wins with ${winner.hero.treasure} treasure! The dragon's hoard is theirs!`
                };
            }
        }
        
        return null;
    }

    saveGame() {
        try {
            const gameData = {
                players: this.players,
                currentPlayerIndex: this.currentPlayerIndex,
                currentRoomIndex: this.currentRoomIndex,
                gameMode: this.gameMode,
                rooms: this.rooms,
                turnCounter: this.turnCounter,
                roundCounter: this.roundCounter
            };
            localStorage.setItem('dungeonLegends_save', JSON.stringify(gameData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem('dungeonLegends_save');
            if (saveData) {
                const gameData = JSON.parse(saveData);
                this.players = gameData.players.map(playerData => ({
                    ...playerData,
                    hero: Object.assign(new Hero(playerData.hero.type, playerData.id), playerData.hero)
                }));
                this.currentPlayerIndex = gameData.currentPlayerIndex;
                this.currentRoomIndex = gameData.currentRoomIndex;
                this.gameMode = gameData.gameMode;
                this.rooms = gameData.rooms.map(roomData => new Room(roomData));
                this.turnCounter = gameData.turnCounter || 0;
                this.roundCounter = gameData.roundCounter || 0;
                this.gameState = 'playing';
                return true;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }
}