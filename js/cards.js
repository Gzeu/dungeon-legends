// Enhanced Cards with Mana, Spells, Equipment, and Events
const SPELL_CARDS = {
    fireball: {
        name: 'Fireball',
        type: 'spell',
        school: 'fire',
        icon: '🔥',
        effect: 'Deal 4 damage + ignite (1 damage/turn)',
        mana_cost: 2,
        target: 'enemy',
        rarity: 'common',
        description: 'A burst of flames that burns enemies over time'
    },
    ice_shard: {
        name: 'Ice Shard',
        type: 'spell', 
        school: 'ice',
        icon: '❄️',
        effect: 'Deal 3 damage + slow (-1 attack next turn)',
        mana_cost: 2,
        target: 'enemy',
        rarity: 'common',
        description: 'Sharp ice that slows enemy attacks'
    },
    greater_heal: {
        name: 'Greater Heal',
        type: 'spell',
        school: 'light',
        icon: '✨',
        effect: 'Restore 5 HP + remove 1 debuff',
        mana_cost: 3,
        target: 'ally',
        rarity: 'uncommon',
        description: 'Powerful healing magic that purifies'
    },
    shadow_strike: {
        name: 'Shadow Strike',
        type: 'spell',
        school: 'shadow', 
        icon: '🗡️',
        effect: 'Deal 3 damage + poison (2 damage over 2 turns)',
        mana_cost: 2,
        target: 'enemy',
        rarity: 'uncommon',
        description: 'Strike from shadows with poisoned blade'
    },
    nature_regeneration: {
        name: 'Nature\'s Grace',
        type: 'spell',
        school: 'nature',
        icon: '🌿',
        effect: 'Restore 2 HP + regeneration (1 HP/turn for 3 turns)',
        mana_cost: 2,
        target: 'ally',
        rarity: 'common',
        description: 'Healing over time with nature\'s power'
    },
    light_blessing: {
        name: 'Divine Blessing',
        type: 'spell',
        school: 'light',
        icon: '⭐',
        effect: 'Target gains +1 ATK and immunity to debuffs this turn',
        mana_cost: 2,
        target: 'ally',
        rarity: 'rare',
        description: 'Divine protection and strength'
    }
};

const EQUIPMENT_CARDS = {
    iron_sword: {
        name: 'Iron Sword',
        type: 'weapon',
        icon: '⚔️',
        effect: '+2 Attack',
        mana_cost: 0,
        rarity: 'common',
        persistent: true,
        description: 'Sturdy iron blade for reliable damage'
    },
    flame_blade: {
        name: 'Flame Blade', 
        type: 'weapon',
        icon: '🔥',
        effect: '+1 Attack, all attacks apply ignite',
        mana_cost: 1,
        rarity: 'rare',
        persistent: true,
        description: 'Enchanted blade wreathed in flames'
    },
    chain_mail: {
        name: 'Chain Mail',
        type: 'armor', 
        icon: '🛡️',
        effect: '+2 Defense',
        mana_cost: 0,
        rarity: 'common',
        persistent: true,
        description: 'Heavy armor that reduces incoming damage'
    },
    magic_robes: {
        name: 'Magic Robes',
        type: 'armor',
        icon: '👘',
        effect: '+1 Defense, +1 Mana regeneration per turn',
        mana_cost: 0,
        rarity: 'uncommon',
        persistent: true,
        description: 'Robes that enhance magical abilities'
    }
};

const EVENT_CARDS = {
    ancient_blessing: {
        name: 'Ancient Blessing',
        type: 'event',
        icon: '⭐',
        story: 'You discover an ancient shrine radiating divine energy. Its blessing could strengthen your entire party permanently.',
        choices: [
            { text: 'Accept blessing', effect: { type: 'permanent_hp', amount: 1 } },
            { text: 'Leave untouched', effect: { type: 'draw_card', amount: 2 } }
        ],
        rarity: 'rare'
    },
    mysterious_merchant: {
        name: 'Mysterious Merchant',
        type: 'event',
        icon: '🎭',
        story: 'A hooded figure emerges from the shadows, offering to trade rare magical items for your hard-earned treasure.',
        choices: [
            { text: 'Trade 2 treasure for rare equipment', cost: 2, effect: { type: 'equipment', rarity: 'rare' } },
            { text: 'Decline politely', effect: { type: 'draw_card', amount: 1 } }
        ],
        rarity: 'uncommon'
    },
    cursed_treasure: {
        name: 'Cursed Treasure',
        type: 'event',
        icon: '💀',
        story: 'A ornate chest pulses with dark energy. Great wealth lies within, but curses often accompany such treasures.',
        choices: [
            { text: 'Take the treasure', effect: { type: 'cursed_treasure', treasure: 3, curse: 'weakness' } },
            { text: 'Leave it sealed', effect: { type: 'blessing', type_name: 'wisdom' } }
        ],
        rarity: 'uncommon'
    }
};

// Enhanced Room class with events
class Room {
    constructor(roomData) {
        Object.assign(this, { ...roomData });
        if (this.encounter && this.encounter.health) {
            this.encounter.currentHealth = this.encounter.health;
        }
        this.eventTriggered = false;
    }

    processEncounter(players, gameState) {
        const results = [];
        
        // Random event chance (20% in non-boss rooms)
        if (!this.eventTriggered && this.type !== 'boss' && Math.random() < 0.2) {
            this.eventTriggered = true;
            const eventKeys = Object.keys(EVENT_CARDS);
            const randomEvent = EVENT_CARDS[eventKeys[Math.floor(Math.random() * eventKeys.length)]];
            
            results.push({
                type: 'event',
                message: randomEvent.story,
                event: randomEvent
            });
            return results;
        }
        
        switch (this.type) {
            case 'safe':
                results.push({
                    type: 'info',
                    message: `Entered ${this.name}. ${this.description}`
                });
                break;
                
            case 'combat':
            case 'reward':
            case 'boss':
                if (this.encounter && !this.completed) {
                    results.push({
                        type: 'combat',
                        message: `A ${this.encounter.name} blocks your path!`,
                        enemy: { ...this.encounter }
                    });
                }
                break;
                
            case 'challenge':
                if (!this.completed) {
                    results.push({
                        type: 'challenge',
                        message: this.encounter.challenge,
                        challenge: this.encounter
                    });
                }
                break;
        }
        
        return results;
    }

    completeRoom(players, gameState) {
        if (this.completed) return [];
        
        const results = [];
        this.completed = true;
        
        switch (this.reward.type) {
            case 'treasure':
                const currentPlayer = players[gameState.currentPlayerIndex];
                let treasureAmount = this.reward.amount;
                
                // Check for treasure hunter effect
                if (currentPlayer.hero.statusEffects.find(e => e.type === 'treasure_hunter')) {
                    treasureAmount++;
                    results.push({
                        type: 'bonus',
                        message: 'Treasure Hunter bonus: +1 extra treasure!'
                    });
                }
                
                currentPlayer.hero.treasure += treasureAmount;
                results.push({
                    type: 'reward',
                    message: `Found ${treasureAmount} treasure!`
                });
                break;
                
            case 'card':
                results.push({
                    type: 'reward',
                    message: `Draw ${this.reward.amount} extra card(s)!`
                });
                break;
                
            case 'victory':
                results.push({
                    type: 'victory',
                    message: 'The ancient dragon falls! The dungeon\'s treasure is yours!'
                });
                break;
        }
        
        return results;
    }

    isEncounterDefeated() {
        return !this.encounter || 
               this.completed || 
               (this.encounter.currentHealth !== undefined && this.encounter.currentHealth <= 0);
    }
}

// Enhanced Deck with spell/equipment cards
class Deck {
    constructor() {
        this.cards = [];
        this.discardPile = [];
        this.generateEnhancedDeck();
    }

    generateEnhancedDeck() {
        const allCards = { ...ACTION_CARDS, ...SPELL_CARDS, ...EQUIPMENT_CARDS };
        const cardKeys = Object.keys(allCards);
        
        // Generate balanced deck with rarities
        const rarityWeights = { common: 60, uncommon: 30, rare: 10 };
        
        for (let i = 0; i < 50; i++) {
            const randomCard = cardKeys[Math.floor(Math.random() * cardKeys.length)];
            const cardData = allCards[randomCard];
            
            // Weight by rarity
            const rarityRoll = Math.random() * 100;
            let shouldInclude = false;
            
            switch (cardData.rarity || 'common') {
                case 'common': shouldInclude = rarityRoll < 60; break;
                case 'uncommon': shouldInclude = rarityRoll >= 60 && rarityRoll < 90; break;
                case 'rare': shouldInclude = rarityRoll >= 90; break;
            }
            
            if (shouldInclude) {
                this.cards.push({
                    id: i,
                    ...cardData,
                    cardType: randomCard
                });
            }
        }
        
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    drawCard() {
        if (this.cards.length === 0) {
            this.reshuffle();
        }
        return this.cards.pop();
    }

    drawCards(count) {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            const card = this.drawCard();
            if (card) drawn.push(card);
        }
        return drawn;
    }

    discard(card) {
        this.discardPile.push(card);
    }

    reshuffle() {
        this.cards = [...this.discardPile];
        this.discardPile = [];
        this.shuffle();
    }

    // Add specific card to deck (for events that give equipment)
    addCard(cardType) {
        const allCards = { ...SPELL_CARDS, ...EQUIPMENT_CARDS };
        if (allCards[cardType]) {
            this.cards.push({
                id: Date.now(),
                ...allCards[cardType],
                cardType: cardType
            });
        }
    }
}