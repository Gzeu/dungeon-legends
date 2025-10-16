// Updated Main UI with Single Player and Progression Integration
class GameUI {
    constructor() {
        this.progressionManager = new ProgressionManager();
        this.gameEngine = null;
        this.audioManager = null;
        this.pwaManager = null;
        
        this.currentScreen = 'welcome';
        this.selectedHeroes = [];
        this.selectedHero = null; // For single player
        this.playerCount = 2;
        this.gameMode = 'cooperative';
        this.isSinglePlayer = false;
        this.aiDifficulty = 'normal';
        
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
            setTimeout(() => this.initialize(), 100);
        }
    }

    initialize() {
        try {
            // Initialize managers with fallbacks
            this.gameEngine = window.GameEngine ? new GameEngine(this.progressionManager) : null;
            this.audioManager = window.AudioManager ? new AudioManager() : null;
            this.pwaManager = window.PWAManager ? new PWAManager() : null;
            
            this.initializeUI();
            this.bindEvents();
            this.updateHeroLevels();
            
            console.log('GameUI initialized successfully');
        } catch (error) {
            console.error('GameUI initialization failed:', error);
            this.fallbackInit();
        }
    }

    fallbackInit() {
        this.showScreen('welcome');
        this.bindBasicEvents();
    }

    initializeUI() {
        this.showScreen('welcome');
    }

    bindEvents() {
        this.bindBasicEvents();
        this.bindGameEvents();
        this.bindSinglePlayerEvents();
        this.bindProgressionEvents();
    }

    bindBasicEvents() {
        // Welcome screen
        this.safeAddListener('start-game', 'click', () => this.showScreen('setup'));
        this.safeAddListener('single-player', 'click', () => this.showSinglePlayerSetup());
        this.safeAddListener('how-to-play', 'click', () => this.showScreen('how-to-play'));
        this.safeAddListener('view-profile', 'click', () => this.showProfile());
        this.safeAddListener('back-to-menu', 'click', () => this.showScreen('welcome'));
        this.safeAddListener('back-to-welcome', 'click', () => this.showScreen('welcome'));
        this.safeAddListener('back-to-welcome-single', 'click', () => this.showScreen('welcome'));
        this.safeAddListener('back-to-menu-profile', 'click', () => this.showScreen('welcome'));

        // Setup events
        this.safeAddListener('player-count-select', 'change', (e) => {
            this.playerCount = parseInt(e.target.value);
            this.updateHeroSelection();
        });
        
        this.safeAddListener('game-mode-select', 'change', (e) => {
            this.gameMode = e.target.value;
        });
        
        this.safeAddListener('start-dungeon', 'click', () => this.startGame());

        // Hero selection
        document.querySelectorAll('.hero-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const heroType = e.currentTarget.dataset.hero;
                if (heroType) {
                    if (this.isSinglePlayer) {
                        this.selectSingleHero(heroType);
                    } else {
                        this.toggleHeroSelection(heroType);
                    }
                }
            });
        });
    }

    bindSinglePlayerEvents() {
        this.safeAddListener('ai-difficulty-select', 'change', (e) => {
            this.aiDifficulty = e.target.value;
        });
        
        this.safeAddListener('single-game-mode-select', 'change', (e) => {
            this.gameMode = e.target.value;
        });
        
        this.safeAddListener('single-party-size', 'change', (e) => {
            this.playerCount = parseInt(e.target.value);
        });
        
        this.safeAddListener('start-single-dungeon', 'click', () => this.startSinglePlayerGame());
    }

    bindProgressionEvents() {
        this.safeAddListener('continue-to-level-up', 'click', () => this.showLevelUpModal());
        this.safeAddListener('skip-to-menu', 'click', () => this.showScreen('welcome'));
        this.safeAddListener('confirm-level-up', 'click', () => this.confirmLevelUp());
        this.safeAddListener('skip-level-up', 'click', () => this.showScreen('welcome'));
        
        // Attribute buttons
        document.querySelectorAll('.attr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const attr = e.target.dataset.attr;
                if (attr) {
                    this.allocateAttributePoint(attr);
                }
            });
        });
    }

    bindGameEvents() {
        this.safeAddListener('attack-btn', 'click', () => this.processGameAction('attack'));
        this.safeAddListener('defend-btn', 'click', () => this.processGameAction('defend'));
        this.safeAddListener('special-btn', 'click', () => this.processGameAction('special'));
        this.safeAddListener('pass-btn', 'click', () => this.processGameAction('pass'));
        this.safeAddListener('play-again', 'click', () => this.resetGame());
        this.safeAddListener('back-to-main', 'click', () => this.showScreen('welcome'));
    }

    safeAddListener(elementId, event, handler) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
            }
        } catch (error) {
            console.warn(`Failed to bind ${event} to ${elementId}:`, error);
        }
    }

    showScreen(screenName) {
        try {
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
                    this.isSinglePlayer = false;
                    this.resetHeroSelection();
                    break;
                case 'game':
                    this.updateGameDisplay();
                    break;
            }
        } catch (error) {
            console.error('Error showing screen:', error);
        }
    }

    showSinglePlayerSetup() {
        this.isSinglePlayer = true;
        this.showScreen('single-player');
        this.populateSinglePlayerHeroes();
    }

    populateSinglePlayerHeroes() {
        const container = document.getElementById('single-heroes-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const availableHeroes = this.progressionManager.profileData.unlockedContent.heroes;
        
        Object.entries(HEROES).forEach(([heroType, heroData]) => {
            if (!availableHeroes.includes(heroType)) return;
            
            const heroStats = this.progressionManager.getHeroStats(heroType);
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-card';
            heroCard.dataset.hero = heroType;
            
            heroCard.innerHTML = `
                <div class="hero-icon">${heroData.icon}</div>
                <h4>${heroData.name}</h4>
                <p>${heroData.description}</p>
                <div class="hero-progression">
                    <div class="hero-level">Level ${heroStats.level}</div>
                    <div class="hero-xp">${heroStats.xp} XP</div>
                    <div class="xp-to-next">${heroStats.xpToNext > 0 ? `${heroStats.xpToNext} to next` : 'MAX'}</div>
                </div>
            `;
            
            heroCard.addEventListener('click', () => this.selectSingleHero(heroType));
            container.appendChild(heroCard);
        });
    }

    selectSingleHero(heroType) {
        // Clear previous selection
        document.querySelectorAll('#single-heroes-container .hero-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new hero
        const heroCard = document.querySelector(`#single-heroes-container [data-hero="${heroType}"]`);
        if (heroCard) {
            heroCard.classList.add('selected');
            this.selectedHero = heroType;
            
            const startBtn = document.getElementById('start-single-dungeon');
            if (startBtn) {
                startBtn.classList.remove('disabled');
            }
        }
        
        if (this.audioManager) {
            this.audioManager.playCardFlip();
        }
    }

    startSinglePlayerGame() {
        if (!this.selectedHero) return;
        
        this.showScreen('loading');
        
        setTimeout(() => {
            try {
                // Create AI players
                const aiHeroes = [];
                const availableHeroes = ['knight', 'wizard', 'rogue', 'cleric'].filter(h => h !== this.selectedHero);
                
                for (let i = 1; i < this.playerCount; i++) {
                    const randomHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
                    aiHeroes.push(randomHero);
                }
                
                const allHeroes = [this.selectedHero, ...aiHeroes];
                
                const gameState = this.gameEngine.startGame(
                    this.playerCount,
                    this.gameMode,
                    allHeroes,
                    true, // isSinglePlayer
                    this.aiDifficulty
                );
                
                this.showScreen('game');
                this.updateGameDisplay(gameState);
                
                // Start AI turn processing if needed
                this.processAITurns();
                
            } catch (error) {
                console.error('Error starting single player game:', error);
                this.showScreen('single-player');
            }
        }, 1000);
    }

    async processAITurns() {
        if (!this.gameEngine || this.gameEngine.gameState === 'ended') return;
        
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        if (currentPlayer.isAI) {
            const gameState = this.gameEngine.getCurrentGameState();
            const availableActions = ['attack', 'defend', 'special', 'pass'];
            
            const decision = await currentPlayer.aiPlayer.makeDecision(gameState, availableActions);
            
            this.showMessage(`${currentPlayer.name} is thinking...`, 1000);
            
            setTimeout(() => {
                this.processGameAction(decision.action, decision.data);
                
                // Continue with next AI turn if needed
                setTimeout(() => {
                    this.processAITurns();
                }, 500);
            }, decision.delay || 1000);
        }
    }

    showProfile() {
        this.showScreen('profile');
        this.populateProfile();
    }

    populateProfile() {
        const profile = this.progressionManager.getPlayerProfile();
        
        // Player stats
        const statsGrid = document.getElementById('player-stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-item">Games Played: ${profile.stats.gamesPlayed}</div>
                <div class="stat-item">Games Won: ${profile.stats.gamesWon}</div>
                <div class="stat-item">Total Treasure: ${profile.stats.totalTreasure}</div>
                <div class="stat-item">Dragons Defeated: ${profile.stats.dragonsDefeated}</div>
                <div class="stat-item">Highest Level: ${profile.stats.highestLevelReached}</div>
            `;
        }
        
        // Heroes progress
        const heroesGrid = document.getElementById('heroes-progress-grid');
        if (heroesGrid) {
            heroesGrid.innerHTML = profile.heroes.map(hero => `
                <div class="hero-progress-card">
                    <div class="hero-icon">${HEROES[hero.type].icon}</div>
                    <h4>${HEROES[hero.type].name}</h4>
                    <div class="level-info">Level ${hero.level}</div>
                    <div class="xp-info">${hero.xp} XP</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${hero.level >= 5 ? 100 : (hero.xp % 100)}%"></div>
                    </div>
                    <div class="skills-count">${hero.skillsUnlocked || 0} Skills Unlocked</div>
                </div>
            `).join('');
        }
        
        // Achievements
        const achievementsGrid = document.getElementById('achievements-grid');
        if (achievementsGrid) {
            achievementsGrid.innerHTML = profile.achievements.map(achievement => `
                <div class="achievement-badge">
                    <div class="achievement-icon">🏆</div>
                    <div class="achievement-name">${achievement}</div>
                </div>
            `).join('');
            
            if (profile.achievements.length === 0) {
                achievementsGrid.innerHTML = '<div class="no-achievements">No achievements yet. Start your adventure!</div>';
            }
        }
    }

    updateHeroLevels() {
        document.querySelectorAll('.hero-card').forEach(card => {
            const heroType = card.dataset.hero;
            if (heroType) {
                const heroStats = this.progressionManager.getHeroStats(heroType);
                const levelDisplay = card.querySelector('.level-display');
                if (levelDisplay && heroStats) {
                    levelDisplay.textContent = heroStats.level;
                }
            }
        });
    }

    updateHeroSelection() {
        this.selectedHeroes = [];
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateStartButton();
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
        const startButton = document.getElementById('start-dungeon');
        if (startButton) {
            if (this.selectedHeroes.length === this.playerCount) {
                startButton.classList.remove('disabled');
            } else {
                startButton.classList.add('disabled');
            }
        }
    }

    resetHeroSelection() {
        this.selectedHeroes = [];
        this.selectedHero = null;
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateStartButton();
    }

    startGame() {
        if (this.selectedHeroes.length !== this.playerCount || !this.gameEngine) return;

        this.showScreen('loading');
        
        setTimeout(() => {
            try {
                const gameState = this.gameEngine.startGame(
                    this.playerCount,
                    this.gameMode,
                    this.selectedHeroes,
                    false, // not single player
                    'normal'
                );
                
                this.showScreen('game');
                this.updateGameDisplay(gameState);
            } catch (error) {
                console.error('Error starting game:', error);
                this.showScreen('setup');
            }
        }, 1000);
    }

    // Rest of methods remain similar but with progression integration...
    processGameAction(action, data = {}) {
        try {
            if (!this.gameEngine) return;

            if (this.audioManager) {
                this.audioManager.playCombat();
            }
            
            const result = this.gameEngine.processAction(action, data);
            
            if (result?.results) {
                this.displayActionResults(result.results);
            }
            
            if (result?.gameState) {
                this.updateGameDisplay(result.gameState);
            }
            
            if (result?.gameState?.gameState === 'ended') {
                setTimeout(() => {
                    this.handleGameEnd(result);
                }, 2000);
            } else if (this.isSinglePlayer) {
                // Continue AI processing
                setTimeout(() => this.processAITurns(), 500);
            }
        } catch (error) {
            console.error('Error processing game action:', error);
        }
    }

    handleGameEnd(result) {
        // Award XP to all human players
        const xpAwards = this.progressionManager.awardPostGameXP(
            this.gameEngine.players,
            this.getGameResults()
        );
        
        if (xpAwards.some(award => award.levelUp)) {
            this.showXPSummary(xpAwards);
        } else {
            this.showVictoryScreen(result.results);
        }
    }

    getGameResults() {
        const finalRoom = this.gameEngine.rooms[this.gameEngine.rooms.length - 1];
        return {
            victory: finalRoom.completed,
            dragonDefeated: finalRoom.completed,
            roomsCompleted: this.gameEngine.rooms.filter(r => r.completed).length,
            enemiesDefeated: this.gameEngine.rooms.filter(r => r.encounter && r.completed).length,
            totalTreasure: this.gameEngine.players.reduce((sum, p) => sum + p.hero.treasure, 0),
            spellCombos: this.gameEngine.spellCombo?.length || 0
        };
    }

    showXPSummary(xpAwards) {
        const xpSummary = document.getElementById('xp-summary');
        if (xpSummary) {
            xpSummary.innerHTML = xpAwards.map(award => `
                <div class="xp-award">
                    <h3>${HEROES[award.heroType].icon} ${award.playerName}</h3>
                    <div class="xp-breakdown">
                        ${award.awards.map(a => `<div class="xp-line">${a}</div>`).join('')}
                    </div>
                    <div class="total-xp">Total: ${award.totalXP} XP</div>
                    ${award.levelUp ? `<div class="level-up-notice">🎆 LEVEL UP! Now Level ${award.newLevel}</div>` : ''}
                </div>
            `).join('');
        }
        
        this.showScreen('xp');
    }

    showMessage(text, duration = 3000) {
        try {
            let messageEl = document.getElementById('game-message');
            if (!messageEl) {
                messageEl = document.createElement('div');
                messageEl.id = 'game-message';
                messageEl.className = 'game-message';
                const gameContainer = document.querySelector('.game-container') || document.body;
                gameContainer.appendChild(messageEl);
            }
            
            messageEl.textContent = text;
            messageEl.classList.add('visible');
            
            setTimeout(() => {
                messageEl.classList.remove('visible');
            }, duration);
        } catch (error) {
            console.error('Error showing message:', error);
        }
    }

    // Placeholder methods for game display - will be implemented based on working version
    updateGameDisplay(gameState) {
        console.log('Game display update:', gameState);
    }

    displayActionResults(results) {
        console.log('Action results:', results);
    }

    resetGame() {
        if (window.GameEngine) {
            this.gameEngine = new GameEngine(this.progressionManager);
        }
        this.selectedHeroes = [];
        this.selectedHero = null;
        this.showScreen(this.isSinglePlayer ? 'single-player' : 'setup');
    }
}

// Initialize game
function initializeGame() {
    try {
        if (window.gameInstance) {
            console.warn('Game already initialized');
            return;
        }
        
        window.gameInstance = new GameUI();
        console.log('Dungeon Legends with progression initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        setTimeout(initializeGame, 1000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

window.addEventListener('load', () => {
    if (!window.gameInstance) {
        initializeGame();
    }
});