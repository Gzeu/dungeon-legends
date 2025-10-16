// Fixed Main UI Controller - Defensive Programming
class GameUI {
    constructor() {
        this.gameEngine = null;
        this.audioManager = null;
        this.pwaManager = null;
        
        this.currentScreen = 'welcome';
        this.selectedHeroes = [];
        this.playerCount = 2;
        this.gameMode = 'cooperative';
        
        // Card system state
        this.selectedCard = null;
        this.targetingMode = false;
        this.targetType = null;
        
        this.waitForDOMAndInit();
    }

    waitForDOMAndInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        try {
            // Initialize managers with fallbacks
            this.gameEngine = window.GameEngine ? new GameEngine() : null;
            this.audioManager = window.AudioManager ? new AudioManager() : null;
            this.pwaManager = window.PWAManager ? new PWAManager() : null;
            
            this.initializeUI();
            this.bindEvents();
            
            console.log('GameUI initialized successfully');
        } catch (error) {
            console.error('GameUI initialization failed:', error);
            this.fallbackInit();
        }
    }

    fallbackInit() {
        // Minimal initialization if main classes fail
        this.showScreen('welcome');
        this.bindBasicEvents();
    }

    initializeUI() {
        this.showScreen('welcome');
    }

    bindEvents() {
        this.bindBasicEvents();
        this.bindGameEvents();
    }

    bindBasicEvents() {
        // Welcome screen events
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showScreen('setup');
            });
        }

        const howToPlayBtn = document.getElementById('how-to-play');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showScreen('how-to-play');
            });
        }

        const backToMenuBtn = document.getElementById('back-to-menu');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showScreen('welcome');
            });
        }

        const backToWelcomeBtn = document.getElementById('back-to-welcome');
        if (backToWelcomeBtn) {
            backToWelcomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showScreen('welcome');
            });
        }

        // Setup events
        const playerCountSelect = document.getElementById('player-count-select');
        if (playerCountSelect) {
            playerCountSelect.addEventListener('change', (e) => {
                this.playerCount = parseInt(e.target.value);
                this.updateHeroSelection();
            });
        }

        const gameModeSelect = document.getElementById('game-mode-select');
        if (gameModeSelect) {
            gameModeSelect.addEventListener('change', (e) => {
                this.gameMode = e.target.value;
            });
        }

        const startDungeonBtn = document.getElementById('start-dungeon');
        if (startDungeonBtn) {
            startDungeonBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startGame();
            });
        }

        // Hero selection
        document.querySelectorAll('.hero-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const heroType = e.currentTarget.dataset.hero;
                if (heroType) {
                    this.toggleHeroSelection(heroType);
                }
            });
        });
    }

    bindGameEvents() {
        // Game action buttons
        const attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => this.processGameAction('attack'));
        }

        const defendBtn = document.getElementById('defend-btn');
        if (defendBtn) {
            defendBtn.addEventListener('click', () => this.processGameAction('defend'));
        }

        const specialBtn = document.getElementById('special-btn');
        if (specialBtn) {
            specialBtn.addEventListener('click', () => this.processGameAction('special'));
        }

        const passBtn = document.getElementById('pass-btn');
        if (passBtn) {
            passBtn.addEventListener('click', () => this.processGameAction('pass'));
        }

        // Victory screen
        const playAgainBtn = document.getElementById('play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.resetGame());
        }

        const backToMainBtn = document.getElementById('back-to-main');
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', () => this.showScreen('welcome'));
        }
    }

    showScreen(screenName) {
        try {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });

            // Show target screen
            const targetScreen = document.getElementById(`${screenName}-screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenName;
            } else {
                console.warn(`Screen ${screenName}-screen not found`);
                return;
            }

            // Screen-specific setup
            switch (screenName) {
                case 'setup':
                    this.resetHeroSelection();
                    break;
                case 'game':
                    if (this.gameEngine) {
                        this.updateGameDisplay();
                    }
                    break;
            }
        } catch (error) {
            console.error('Error showing screen:', error);
        }
    }

    updateHeroSelection() {
        try {
            this.selectedHeroes = [];
            document.querySelectorAll('.hero-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.updateStartButton();
        } catch (error) {
            console.error('Error updating hero selection:', error);
        }
    }

    toggleHeroSelection(heroType) {
        try {
            const heroCard = document.querySelector(`[data-hero="${heroType}"]`);
            if (!heroCard) return;
            
            if (this.selectedHeroes.includes(heroType)) {
                this.selectedHeroes = this.selectedHeroes.filter(h => h !== heroType);
                heroCard.classList.remove('selected');
            } else if (this.selectedHeroes.length < this.playerCount) {
                this.selectedHeroes.push(heroType);
                heroCard.classList.add('selected');
            }
            
            if (this.audioManager) {
                this.audioManager.playCardFlip();
            }
            this.updateStartButton();
        } catch (error) {
            console.error('Error toggling hero selection:', error);
        }
    }

    updateStartButton() {
        try {
            const startButton = document.getElementById('start-dungeon');
            if (startButton) {
                if (this.selectedHeroes.length === this.playerCount) {
                    startButton.classList.remove('disabled');
                } else {
                    startButton.classList.add('disabled');
                }
            }
        } catch (error) {
            console.error('Error updating start button:', error);
        }
    }

    resetHeroSelection() {
        try {
            this.selectedHeroes = [];
            document.querySelectorAll('.hero-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.updateStartButton();
        } catch (error) {
            console.error('Error resetting hero selection:', error);
        }
    }

    startGame() {
        try {
            if (this.selectedHeroes.length !== this.playerCount) {
                return;
            }

            if (!this.gameEngine) {
                console.error('Game engine not initialized');
                return;
            }

            this.showScreen('loading');
            
            setTimeout(() => {
                try {
                    const gameState = this.gameEngine.startGame(
                        this.playerCount,
                        this.gameMode,
                        this.selectedHeroes
                    );
                    
                    this.showScreen('game');
                    this.updateGameDisplay(gameState);
                } catch (error) {
                    console.error('Error starting game:', error);
                    this.showScreen('setup');
                }
            }, 1000);
        } catch (error) {
            console.error('Error in startGame:', error);
        }
    }

    updateGameDisplay(gameState = null) {
        try {
            if (!this.gameEngine) return;
            
            const state = gameState || this.gameEngine.getCurrentGameState();
            
            this.updateRoomDisplay(state.currentRoom);
            this.updatePlayersDisplay(state.players, this.gameEngine.currentPlayerIndex);
            this.updateTurnDisplay(state.currentPlayer, state.roomProgress);
            this.updateActionButtons(state.currentRoom);
            
            if (state.currentPlayer && state.currentPlayer.hand) {
                this.updateHandDisplay(state.currentPlayer);
            }
        } catch (error) {
            console.error('Error updating game display:', error);
        }
    }

    updateRoomDisplay(room) {
        try {
            if (!room) return;
            
            const roomNameEl = document.getElementById('room-name');
            if (roomNameEl) roomNameEl.textContent = room.name || 'Unknown Room';
            
            const roomDescEl = document.getElementById('room-description');
            if (roomDescEl) roomDescEl.textContent = room.description || '';
            
            const roomImageEl = document.querySelector('.room-card .room-image');
            if (roomImageEl && room.icon) {
                roomImageEl.textContent = room.icon;
            }
            
            const enemyDisplay = document.getElementById('room-enemy');
            if (enemyDisplay) {
                if (room.encounter && room.encounter.currentHealth > 0) {
                    enemyDisplay.classList.remove('hidden');
                    
                    const enemyName = enemyDisplay.querySelector('.enemy-name');
                    const hpValue = enemyDisplay.querySelector('.hp-value');
                    const atkValue = enemyDisplay.querySelector('.atk-value');
                    
                    if (enemyName) enemyName.textContent = room.encounter.name || 'Enemy';
                    if (hpValue) hpValue.textContent = room.encounter.currentHealth || 0;
                    if (atkValue) atkValue.textContent = room.encounter.attack || 0;
                } else {
                    enemyDisplay.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error updating room display:', error);
        }
    }

    updatePlayersDisplay(players, currentPlayerIndex) {
        try {
            const playersContainer = document.getElementById('players-display');
            if (!playersContainer || !players) return;
            
            playersContainer.innerHTML = '';
            
            players.forEach((player, index) => {
                if (!player || !player.hero) return;
                
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-status';
                playerDiv.dataset.playerId = index;
                
                if (index === currentPlayerIndex) {
                    playerDiv.classList.add('current-player');
                }
                
                const hero = player.hero;
                
                playerDiv.innerHTML = `
                    <div class="player-info">
                        <div class="player-name">${player.name || `Player ${index + 1}`}</div>
                        <div class="hero-info">
                            <span class="hero-icon">${hero.icon || '❓'}</span>
                            <span class="hero-name">${hero.name || 'Hero'}</span>
                        </div>
                        <div class="player-stats">
                            <div class="health-bar">
                                <span class="stat-label">HP:</span>
                                <span class="stat-value">${hero.currentHealth || 0}/${hero.maxHealth || 0}</span>
                                <div class="bar-visual">
                                    <div class="bar-fill" style="width: ${hero.maxHealth ? (hero.currentHealth/hero.maxHealth)*100 : 0}%"></div>
                                </div>
                            </div>
                            <div class="mana-bar">
                                <span class="stat-label">MP:</span>
                                <span class="stat-value">${hero.currentMana || 0}/${hero.maxMana || 0}</span>
                                <div class="bar-visual">
                                    <div class="bar-fill" style="width: ${hero.maxMana ? (hero.currentMana/hero.maxMana)*100 : 0}%"></div>
                                </div>
                            </div>
                            <div class="treasure-count">
                                <span class="stat-label">💰:</span>
                                <span class="stat-value">${hero.treasure || 0}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                playersContainer.appendChild(playerDiv);
            });
        } catch (error) {
            console.error('Error updating players display:', error);
        }
    }

    updateTurnDisplay(currentPlayer, roomProgress) {
        try {
            const currentTurnEl = document.getElementById('current-turn');
            if (currentTurnEl && currentPlayer) {
                currentTurnEl.textContent = `${currentPlayer.name || 'Player'}'s Turn`;
            }

            const roundCounterEl = document.getElementById('round-counter');
            if (roundCounterEl && roomProgress) {
                roundCounterEl.textContent = `Room ${(roomProgress.current || 0) + 1}/${roomProgress.total || 5}`;
            }
        } catch (error) {
            console.error('Error updating turn display:', error);
        }
    }

    updateActionButtons(room) {
        try {
            const attackBtn = document.getElementById('attack-btn');
            const defendBtn = document.getElementById('defend-btn');
            const specialBtn = document.getElementById('special-btn');
            
            if (attackBtn) {
                if (room && room.encounter && room.encounter.currentHealth > 0) {
                    attackBtn.disabled = false;
                } else {
                    attackBtn.disabled = true;
                }
            }
            
            if (specialBtn && this.gameEngine) {
                const currentPlayer = this.gameEngine.getCurrentPlayer();
                if (currentPlayer && currentPlayer.hero) {
                    const cooldown = currentPlayer.hero.cooldowns && currentPlayer.hero.cooldowns[currentPlayer.hero.special] || 0;
                    specialBtn.disabled = cooldown > 0;
                    
                    if (cooldown > 0) {
                        specialBtn.textContent = `✨ Special (${cooldown})`;
                    } else {
                        specialBtn.textContent = '✨ Special';
                    }
                }
            }
        } catch (error) {
            console.error('Error updating action buttons:', error);
        }
    }

    updateHandDisplay(currentPlayer) {
        try {
            const handDisplay = document.getElementById('hand-display');
            if (!handDisplay) return;
            
            const cardsContainer = handDisplay.querySelector('.cards-container');
            if (!cardsContainer) return;
            
            cardsContainer.innerHTML = '';
            
            if (!currentPlayer.hand || currentPlayer.hand.length === 0) {
                cardsContainer.innerHTML = '<div class="no-cards">No cards in hand</div>';
                return;
            }
            
            currentPlayer.hand.forEach((card, index) => {
                if (!card) return;
                
                const cardElement = document.createElement('div');
                cardElement.className = 'game-card';
                cardElement.dataset.cardIndex = index;
                
                const manaCost = card.mana_cost || 0;
                const canPlay = (currentPlayer.hero.currentMana || 0) >= manaCost;
                
                if (!canPlay) {
                    cardElement.classList.add('unplayable');
                }
                
                cardElement.innerHTML = `
                    <div class="mana-cost">${manaCost}</div>
                    <div class="rarity-gem rarity-${card.rarity || 'common'}"></div>
                    <div class="card-content">
                        <div class="card-icon">${card.icon || '❓'}</div>
                        <div class="card-name">${card.name || 'Card'}</div>
                        <div class="card-type">${card.type || ''}</div>
                        <div class="card-effect">${card.effect || card.description || ''}</div>
                    </div>
                `;
                
                if (canPlay) {
                    cardElement.addEventListener('click', () => this.playCard(index, card));
                }
                
                cardsContainer.appendChild(cardElement);
            });
        } catch (error) {
            console.error('Error updating hand display:', error);
        }
    }

    playCard(cardIndex, card) {
        try {
            if (this.audioManager) {
                this.audioManager.playCardFlip();
            }
            
            // Check if card requires targeting
            if (card.target === 'ally' && card.type === 'spell') {
                this.startTargeting(cardIndex, card);
            } else {
                this.processGameAction('playCard', { cardIndex, card });
            }
        } catch (error) {
            console.error('Error playing card:', error);
        }
    }

    startTargeting(cardIndex, card) {
        this.selectedCard = cardIndex;
        this.targetingMode = true;
        this.targetType = card.target;
        
        // Highlight valid targets
        document.querySelectorAll('.player-status').forEach((playerEl, index) => {
            playerEl.classList.add('targetable');
            
            const clickHandler = () => {
                this.selectTarget(index, cardIndex, card);
            };
            
            playerEl.addEventListener('click', clickHandler, { once: true });
        });
        
        this.showMessage('Select a target player');
    }

    selectTarget(targetIndex, cardIndex, card) {
        this.targetingMode = false;
        
        // Remove targeting highlights
        document.querySelectorAll('.player-status').forEach(playerEl => {
            playerEl.classList.remove('targetable');
        });
        
        this.processGameAction('playCard', { 
            cardIndex, 
            card, 
            targetIndex 
        });
        
        this.selectedCard = null;
    }

    showMessage(text, duration = 3000) {
        try {
            let messageEl = document.getElementById('game-message');
            if (!messageEl) {
                messageEl = document.createElement('div');
                messageEl.id = 'game-message';
                messageEl.className = 'game-message';
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    gameContainer.appendChild(messageEl);
                }
            }
            
            if (messageEl) {
                messageEl.textContent = text;
                messageEl.classList.add('visible');
                
                setTimeout(() => {
                    messageEl.classList.remove('visible');
                }, duration);
            }
        } catch (error) {
            console.error('Error showing message:', error);
        }
    }

    processGameAction(action, data = {}) {
        try {
            if (!this.gameEngine) {
                console.error('Game engine not available');
                return;
            }

            if (this.audioManager) {
                this.audioManager.playCombat();
            }
            
            const result = this.gameEngine.processAction(action, data);
            
            if (result && result.results) {
                this.displayActionResults(result.results);
            }
            
            if (result && result.gameState) {
                this.updateGameDisplay(result.gameState);
            }
            
            if (result && result.gameState && result.gameState.gameState === 'ended') {
                setTimeout(() => {
                    this.showVictoryScreen(result.results);
                }, 2000);
            }
        } catch (error) {
            console.error('Error processing game action:', error);
        }
    }

    displayActionResults(results) {
        if (!results || !Array.isArray(results)) return;
        
        results.forEach(result => {
            if (!result) return;
            
            console.log(`${result.type}: ${result.message}`);
            
            if (result.message) {
                this.showMessage(result.message);
            }
            
            switch (result.type) {
                case 'victory':
                case 'reward':
                    if (this.audioManager) {
                        this.audioManager.playTreasure();
                    }
                    break;
                case 'damage':
                    this.addShakeEffect();
                    break;
            }
        });
    }

    addShakeEffect() {
        try {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.classList.add('shake');
                setTimeout(() => {
                    gameContainer.classList.remove('shake');
                }, 600);
            }
        } catch (error) {
            console.error('Error adding shake effect:', error);
        }
    }

    showVictoryScreen(results) {
        try {
            const victoryContent = document.getElementById('victory-content');
            if (!victoryContent || !results) return;
            
            const finalResult = results[results.length - 1];
            if (!finalResult) return;
            
            let content = '';
            if (finalResult.type === 'victory') {
                const players = this.gameEngine ? this.gameEngine.players : [];
                content = `
                    <h2>🏆 Victory!</h2>
                    <p>${finalResult.message}</p>
                    <div class="final-scores">
                        <h3>Final Scores:</h3>
                        ${players.map(player => `
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
        } catch (error) {
            console.error('Error showing victory screen:', error);
        }
    }

    saveHighScore() {
        try {
            if (!this.gameEngine || !this.gameEngine.players) return;
            
            const totalTreasure = this.gameEngine.players.reduce((sum, p) => sum + (p.hero.treasure || 0), 0);
            const highScores = JSON.parse(localStorage.getItem('dungeonLegends_highScores') || '[]');
            
            highScores.push({
                date: new Date().toLocaleDateString(),
                treasure: totalTreasure,
                players: this.gameEngine.players.length,
                mode: this.gameEngine.gameMode
            });
            
            highScores.sort((a, b) => b.treasure - a.treasure);
            localStorage.setItem('dungeonLegends_highScores', JSON.stringify(highScores.slice(0, 10)));
        } catch (error) {
            console.error('Error saving high score:', error);
        }
    }

    resetGame() {
        try {
            if (window.GameEngine) {
                this.gameEngine = new GameEngine();
            }
            this.selectedHeroes = [];
            this.showScreen('setup');
        } catch (error) {
            console.error('Error resetting game:', error);
            this.showScreen('welcome');
        }
    }
}

// Initialize only when all dependencies are loaded
function initializeGame() {
    try {
        if (window.GameUI) {
            console.warn('Game already initialized');
            return;
        }
        
        window.GameUI = GameUI;
        window.gameInstance = new GameUI();
        console.log('Dungeon Legends initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        // Retry after a short delay
        setTimeout(initializeGame, 1000);
    }
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Fallback initialization
window.addEventListener('load', () => {
    if (!window.gameInstance) {
        console.log('Fallback initialization triggered');
        initializeGame();
    }
});