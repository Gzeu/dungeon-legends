// Main game engine for Dungeon Legends
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
        
        this.players = [];
        for (let i = 0; i < playerCount; i++) {
            const heroType = heroSelections[i];
            this.players.push({
                id: i,
                name: `Player ${i + 1}`,
                hero: new Hero(heroType, i),
                hand: [],
                actionsThisTurn: 0
            });
        }
        
        this.deck = new Deck();
        this.dealInitialCards();
        
        this.rooms.forEach(room => {
            room.completed = false;
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
            }
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

    processAttack(player, room, data) {
        const results = [];
        
        if (!room.encounter || room.encounter.currentHealth <= 0) {
            return [{ type: 'error', message: 'No enemy to attack!' }];
        }

        const damage = player.hero.attack + (data.bonus || 0);
        room.encounter.currentHealth -= damage;
        
        results.push({
            type: 'combat',
            message: `${player.name} attacks ${room.encounter.name} for ${damage} damage!`
        });

        if (room.encounter.currentHealth <= 0) {
            results.push({
                type: 'victory',
                message: `${room.encounter.name} defeated!`
            });
        } else {
            results.push(...this.processEnemyAttack(room.encounter));
        }

        return results;
    }

    processDefend(player, data) {
        player.hero.statusEffects.push({ type: 'defending', duration: 1 });
        return [{
            type: 'defense',
            message: `${player.name} takes a defensive stance.`
        }];
    }

    processSpecial(player, data) {
        const target = data.target ? this.players[data.target] : null;
        const targetHero = target ? target.hero : null;
        
        const result = player.hero.useSpecial(targetHero);
        
        if (result.success) {
            const results = [{
                type: 'special',
                message: result.message
            }];
            
            if (result.damage) {
                const room = this.getCurrentRoom();
                if (room.encounter && room.encounter.currentHealth > 0) {
                    room.encounter.currentHealth -= result.damage;
                    if (room.encounter.currentHealth <= 0) {
                        results.push({
                            type: 'victory',
                            message: `${room.encounter.name} defeated by ${player.hero.name}'s special ability!`
                        });
                    }
                }
            }
            
            return results;
        } else {
            return [{
                type: 'error',
                message: result.message
            }];
        }
    }

    processChallenge(player, room, data) {
        const results = [];
        
        if (data.choice === 'discard') {
            if (player.hand.length >= 2) {
                for (let i = 0; i < 2; i++) {
                    const card = player.hand.pop();
                    this.deck.discard(card);
                }
                results.push({
                    type: 'success',
                    message: `${player.name} discards 2 cards to avoid the trap.`
                });
            } else {
                results.push({
                    type: 'error',
                    message: 'Not enough cards to discard!'
                });
                return results;
            }
        } else {
            const damage = player.hero.takeDamage(1);
            results.push({
                type: 'damage',
                message: `${player.name} takes ${damage} damage from the trap!`
            });
        }
        
        return results;
    }

    processEnemyAttack(enemy) {
        const results = [];
        const targetPlayer = this.getCurrentPlayer();
        
        if (enemy.special && Math.random() < 0.3) {
            results.push({
                type: 'combat',
                message: `${enemy.name} uses ${enemy.special}!`
            });
            
            this.players.forEach(player => {
                if (player.hero.isAlive()) {
                    const damage = player.hero.takeDamage(enemy.attack);
                    results.push({
                        type: 'damage',
                        message: `${player.name} takes ${damage} damage!`
                    });
                }
            });
        } else {
            const damage = targetPlayer.hero.takeDamage(enemy.attack);
            results.push({
                type: 'damage',
                message: `${enemy.name} attacks ${targetPlayer.name} for ${damage} damage!`
            });
        }
        
        return results;
    }

    endTurn() {
        const currentPlayer = this.getCurrentPlayer();
        
        currentPlayer.hero.tickCooldowns();
        currentPlayer.actionsThisTurn = 0;
        
        const room = this.getCurrentRoom();
        if (room.type === 'safe' || room.isEncounterDefeated()) {
            const newCard = this.deck.drawCard();
            if (newCard) {
                currentPlayer.hand.push(newCard);
            }
        }
        
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
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
                    message: `Victory! The party has defeated the dragon and collected ${totalTreasure} treasure!`
                };
            } else {
                const winner = this.players.reduce((max, p) => 
                    p.hero.treasure > max.hero.treasure ? p : max
                );
                return {
                    type: 'victory',
                    message: `${winner.name} wins with ${winner.hero.treasure} treasure!`
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
                rooms: this.rooms
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
                this.gameState = 'playing';
                return true;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }
}