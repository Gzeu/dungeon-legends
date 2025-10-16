// Main UI controller for Dungeon Legends
class GameUI {
    constructor() {
        this.gameEngine = new GameEngine();
        this.audioManager = new AudioManager();
        this.pwaManager = new PWAManager();
        
        this.currentScreen = 'welcome';
        this.selectedHeroes = [];
        this.playerCount = 2;
        this.gameMode = 'cooperative';
        
        this.initializeUI();
        this.bindEvents();
    }

    initializeUI() {
        this.showScreen('welcome');
    }

    bindEvents() {
        document.getElementById('start-game')?.addEventListener('click', () => {
            this.showScreen('setup');
        });

        document.getElementById('how-to-play')?.addEventListener('click', () => {
            this.showScreen('how-to-play');
        });

        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            this.showScreen('welcome');
        });

        document.getElementById('player-count-select')?.addEventListener('change', (e) => {
            this.playerCount = parseInt(e.target.value);
            this.updateHeroSelection();
        });

        document.getElementById('game-mode-select')?.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
        });

        document.getElementById('start-dungeon')?.addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('back-to-welcome')?.addEventListener('click', () => {
            this.showScreen('welcome');
        });

        document.querySelectorAll('.hero-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.toggleHeroSelection(e.currentTarget.dataset.hero);
            });
        });

        document.getElementById('attack-btn')?.addEventListener('click', () => {
            this.processGameAction('attack');
        });

        document.getElementById('defend-btn')?.addEventListener('click', () => {
            this.processGameAction('defend');
        });

        document.getElementById('special-btn')?.addEventListener('click', () => {
            this.processGameAction('special');
        });

        document.getElementById('pass-btn')?.addEventListener('click', () => {
            this.processGameAction('pass');
        });

        document.getElementById('play-again')?.addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('back-to-main')?.addEventListener('click', () => {
            this.showScreen('welcome');
        });
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }

        switch (screenName) {
            case 'setup':
                this.resetHeroSelection();
                break;
            case 'game':
                this.updateGameDisplay();
                break;
        }
    }

    updateHeroSelection() {
        this.selectedHeroes = [];
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateStartButton();
    }

    toggleHeroSelection(heroType) {
        const heroCard = document.querySelector(`[data-hero="${heroType}"]`);
        
        if (this.selectedHeroes.includes(heroType)) {
            this.selectedHeroes = this.selectedHeroes.filter(h => h !== heroType);
            heroCard.classList.remove('selected');
        } else if (this.selectedHeroes.length < this.playerCount) {
            this.selectedHeroes.push(heroType);
            heroCard.classList.add('selected');
        }
        
        this.audioManager.playCardFlip();
        this.updateStartButton();
    }

    updateStartButton() {
        const startButton = document.getElementById('start-dungeon');
        if (this.selectedHeroes.length === this.playerCount) {
            startButton.classList.remove('disabled');
        } else {
            startButton.classList.add('disabled');
        }
    }

    resetHeroSelection() {
        this.selectedHeroes = [];
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateStartButton();
    }

    startGame() {
        if (this.selectedHeroes.length !== this.playerCount) {
            return;
        }

        this.showScreen('loading');
        
        setTimeout(() => {
            const gameState = this.gameEngine.startGame(
                this.playerCount,
                this.gameMode,
                this.selectedHeroes
            );
            
            this.showScreen('game');
            this.updateGameDisplay(gameState);
        }, 1000);
    }

    updateGameDisplay(gameState = null) {
        const state = gameState || this.gameEngine.getCurrentGameState();
        
        this.updateRoomDisplay(state.currentRoom);
        this.updatePlayersDisplay(state.players);
        this.updateTurnDisplay(state.currentPlayer, state.roomProgress);
        this.updateActionButtons(state.currentRoom);
    }

    updateRoomDisplay(room) {
        document.getElementById('room-name').textContent = room.name;
        document.getElementById('room-description').textContent = room.description;
        
        const roomCard = document.querySelector('.room-card .room-image');
        if (roomCard) {
            roomCard.textContent = room.icon;
        }
        
        const enemyDisplay = document.getElementById('room-enemy');
        if (room.encounter && room.encounter.currentHealth > 0) {
            enemyDisplay.classList.remove('hidden');
            enemyDisplay.querySelector('.enemy-name').textContent = room.encounter.name;
            enemyDisplay.querySelector('.hp-value').textContent = room.encounter.currentHealth;
            enemyDisplay.querySelector('.atk-value').textContent = room.encounter.attack;
        } else {
            enemyDisplay.classList.add('hidden');
        }
        
        const dots = document.querySelectorAll('.progress-dots .dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index < this.gameEngine.currentRoomIndex) {
                dot.classList.add('completed');
            } else if (index === this.gameEngine.currentRoomIndex) {
                dot.classList.add('active');
            }
        });
    }

    updatePlayersDisplay(players) {
        const playersContainer = document.getElementById('players-display');
        if (!playersContainer) return;
        
        playersContainer.innerHTML = '';
        
        players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-status';
            if (index === this.gameEngine.currentPlayerIndex) {
                playerDiv.classList.add('current-player');
            }
            
            playerDiv.innerHTML = `
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="hero-info">
                        <span class="hero-icon">${player.hero.icon}</span>
                        <span class="hero-name">${player.hero.name}</span>
                    </div>
                    <div class="player-stats">
                        <div class="health-bar">
                            <span class="stat-label">HP:</span>
                            <span class="stat-value">${player.hero.currentHealth}/${player.hero.maxHealth}</span>
                        </div>
                        <div class="treasure-count">
                            <span class="stat-label">💰:</span>
                            <span class="stat-value">${player.hero.treasure}</span>
                        </div>
                    </div>
                </div>
            `;
            
            playersContainer.appendChild(playerDiv);
        });
    }

    updateTurnDisplay(currentPlayer, roomProgress) {
        document.getElementById('current-turn').textContent = `${currentPlayer.name}'s Turn`;
        document.getElementById('round-counter').textContent = `Room ${roomProgress.current + 1}/${roomProgress.total}`;
    }

    updateActionButtons(room) {
        const attackBtn = document.getElementById('attack-btn');
        const defendBtn = document.getElementById('defend-btn');
        const specialBtn = document.getElementById('special-btn');
        
        if (room.encounter && room.encounter.currentHealth > 0) {
            attackBtn.disabled = false;
        } else {
            attackBtn.disabled = true;
        }
        
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        const cooldown = currentPlayer.hero.cooldowns[currentPlayer.hero.special];
        specialBtn.disabled = cooldown > 0;
        
        if (cooldown > 0) {
            specialBtn.textContent = `✨ Special (${cooldown})`;
        } else {
            specialBtn.textContent = '✨ Special';
        }
    }

    processGameAction(action, data = {}) {
        this.audioManager.playCombat();
        
        const result = this.gameEngine.processAction(action, data);
        
        this.displayActionResults(result.results);
        this.updateGameDisplay(result.gameState);
        
        if (result.gameState.gameState === 'ended') {
            setTimeout(() => {
                this.showVictoryScreen(result.results);
            }, 2000);
        }
    }

    displayActionResults(results) {
        results.forEach(result => {
            console.log(`${result.type}: ${result.message}`);
            
            switch (result.type) {
                case 'victory':
                case 'reward':
                    this.audioManager.playTreasure();
                    break;
                case 'damage':
                    this.addShakeEffect();
                    break;
            }
        });
    }

    addShakeEffect() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.add('shake');
            setTimeout(() => {
                gameContainer.classList.remove('shake');
            }, 600);
        }
    }

    showVictoryScreen(results) {
        const victoryContent = document.getElementById('victory-content');
        const finalResult = results[results.length - 1];
        
        let content = '';
        if (finalResult.type === 'victory') {
            content = `
                <h2>🏆 Victory!</h2>
                <p>${finalResult.message}</p>
                <div class="final-scores">
                    <h3>Final Scores:</h3>
                    ${this.gameEngine.players.map(player => `
                        <div class="score-line">
                            ${player.hero.icon} ${player.name}: ${player.hero.treasure} treasure
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            content = `
                <h2>💀 Defeat</h2>
                <p>${finalResult.message}</p>
                <p>Better luck next time, brave adventurers!</p>
            `;
        }
        
        victoryContent.innerHTML = content;
        this.showScreen('victory');
        
        this.saveHighScore();
    }

    saveHighScore() {
        const totalTreasure = this.gameEngine.players.reduce((sum, p) => sum + p.hero.treasure, 0);
        const highScores = JSON.parse(localStorage.getItem('dungeonLegends_highScores') || '[]');
        
        highScores.push({
            date: new Date().toLocaleDateString(),
            treasure: totalTreasure,
            players: this.gameEngine.players.length,
            mode: this.gameEngine.gameMode
        });
        
        highScores.sort((a, b) => b.treasure - a.treasure);
        localStorage.setItem('dungeonLegends_highScores', JSON.stringify(highScores.slice(0, 10)));
    }

    resetGame() {
        this.gameEngine = new GameEngine();
        this.selectedHeroes = [];
        this.showScreen('setup');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
});