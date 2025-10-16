// AI Player System for Single Player Mode
class AIPlayer {
    constructor(heroType, difficulty = 'normal', personality = 'tactical') {
        this.heroType = heroType;
        this.difficulty = difficulty;
        this.personality = personality;
        this.decisionDelay = this.getDecisionDelay();
        this.mistakeChance = this.getMistakeChance();
        this.isAI = true;
    }

    getDecisionDelay() {
        switch (this.difficulty) {
            case 'easy': return 2000 + Math.random() * 1000; // 2-3s
            case 'normal': return 1000 + Math.random() * 1000; // 1-2s
            case 'hard': return 500 + Math.random() * 500; // 0.5-1s
            default: return 1500;
        }
    }

    getMistakeChance() {
        switch (this.difficulty) {
            case 'easy': return 0.20;
            case 'normal': return 0.10;
            case 'hard': return 0.05;
            default: return 0.10;
        }
    }

    async makeDecision(gameState, availableActions) {
        await this.delay(this.decisionDelay);
        
        // Introduce random mistakes
        if (Math.random() < this.mistakeChance) {
            return this.makeRandomDecision(availableActions);
        }
        
        return this.makeOptimalDecision(gameState, availableActions);
    }

    makeOptimalDecision(gameState, availableActions) {
        const { currentPlayer, currentRoom, players } = gameState;
        const hero = currentPlayer.hero;
        const room = currentRoom;
        
        // Priority 1: Use special ability if valuable
        if (availableActions.includes('special') && this.shouldUseSpecial(hero, room, players)) {
            return { action: 'special', data: this.getSpecialTargetData(hero, players) };
        }
        
        // Priority 2: Kill enemy if possible this turn
        if (availableActions.includes('attack') && room.encounter) {
            const attackDamage = hero.getTotalAttack();
            if (room.encounter.currentHealth <= attackDamage) {
                return { action: 'attack', data: {} };
            }
        }
        
        // Priority 3: Heal critical ally
        const criticalAlly = this.findCriticalAlly(players, currentPlayer.id);
        if (criticalAlly && this.hasHealCard(currentPlayer.hand)) {
            const healCard = this.findBestHealCard(currentPlayer.hand);
            if (healCard) {
                return { 
                    action: 'playCard', 
                    data: { 
                        cardIndex: currentPlayer.hand.indexOf(healCard), 
                        card: healCard,
                        targetIndex: criticalAlly.id 
                    } 
                };
            }
        }
        
        // Priority 4: Attack if healthy
        if (availableActions.includes('attack') && hero.currentHealth > hero.maxHealth * 0.5) {
            return { action: 'attack', data: {} };
        }
        
        // Priority 5: Defend if low health
        if (hero.currentHealth < hero.maxHealth * 0.3) {
            return { action: 'defend', data: {} };
        }
        
        // Priority 6: Play utility cards
        const utilityCard = this.findBestUtilityCard(currentPlayer.hand, hero.currentMana);
        if (utilityCard) {
            return { 
                action: 'playCard', 
                data: { 
                    cardIndex: currentPlayer.hand.indexOf(utilityCard), 
                    card: utilityCard 
                } 
            };
        }
        
        // Priority 7: Pass
        return { action: 'pass', data: {} };
    }

    shouldUseSpecial(hero, room, players) {
        if (hero.cooldowns[hero.special] > 0) return false;
        if (hero.currentMana < (hero.abilities[hero.special]?.mana_cost || 0)) return false;
        
        switch (hero.special) {
            case 'shield_wall':
                return this.findCriticalAlly(players, hero.playerId) !== null;
            case 'arcane_blast':
                return room.encounter && room.encounter.currentHealth > 0;
            case 'shadow_step':
                return true; // Always good for stealth + treasure
            case 'divine_intervention':
                return this.findWoundedAlly(players, hero.playerId) !== null;
            default:
                return true;
        }
    }

    getSpecialTargetData(hero, players) {
        switch (hero.special) {
            case 'shield_wall':
            case 'divine_intervention':
                const target = this.findCriticalAlly(players, hero.playerId) || 
                              this.findWoundedAlly(players, hero.playerId);
                return target ? { targetIndex: target.id } : {};
            default:
                return {};
        }
    }

    findCriticalAlly(players, excludeId) {
        return players
            .filter(p => p.id !== excludeId && p.hero.isAlive())
            .find(p => p.hero.currentHealth < p.hero.maxHealth * 0.3);
    }

    findWoundedAlly(players, excludeId) {
        return players
            .filter(p => p.id !== excludeId && p.hero.isAlive())
            .reduce((worst, p) => {
                if (!worst) return p;
                const pHealthPercent = p.hero.currentHealth / p.hero.maxHealth;
                const worstHealthPercent = worst.hero.currentHealth / worst.hero.maxHealth;
                return pHealthPercent < worstHealthPercent ? p : worst;
            }, null);
    }

    hasHealCard(hand) {
        return hand.some(card => 
            card.type === 'spell' && 
            (card.effect.includes('Restore') || card.effect.includes('heal'))
        );
    }

    findBestHealCard(hand) {
        return hand
            .filter(card => card.type === 'spell' && card.effect.includes('Restore'))
            .sort((a, b) => {
                const aHeal = this.extractHealAmount(a.effect);
                const bHeal = this.extractHealAmount(b.effect);
                return bHeal - aHeal;
            })[0];
    }

    extractHealAmount(effect) {
        const match = effect.match(/(\d+) HP/);
        return match ? parseInt(match[1]) : 0;
    }

    findBestUtilityCard(hand, currentMana) {
        return hand
            .filter(card => 
                (card.mana_cost || 0) <= currentMana &&
                (card.type === 'equipment' || 
                 card.effect.includes('treasure') ||
                 card.effect.includes('buff'))
            )
            .sort((a, b) => {
                // Prioritize equipment, then treasure cards
                if (a.type === 'equipment' && b.type !== 'equipment') return -1;
                if (b.type === 'equipment' && a.type !== 'equipment') return 1;
                return (b.mana_cost || 0) - (a.mana_cost || 0);
            })[0];
    }

    makeRandomDecision(availableActions) {
        const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
        return { action: randomAction, data: {} };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}