// Room and encounter definitions
const ROOMS = [
    {
        id: 0,
        name: 'Entrance Hall',
        type: 'safe',
        icon: '🚪',
        description: 'A safe starting point. Draw an extra card to prepare for the dangers ahead.',
        encounter: null,
        reward: { type: 'card', amount: 1 },
        completed: false
    },
    {
        id: 1,
        name: 'Goblin Warren',
        type: 'combat',
        icon: '👹',
        description: 'Weak enemies guard small treasures in this cramped tunnel.',
        encounter: {
            type: 'monster',
            name: 'Goblin',
            health: 2,
            attack: 1,
            currentHealth: 2
        },
        reward: { type: 'treasure', amount: 1 },
        completed: false
    },
    {
        id: 2, 
        name: 'Trap Chamber',
        type: 'challenge',
        icon: '⚡',
        description: 'Navigate deadly traps for rich rewards.',
        encounter: {
            type: 'trap',
            name: 'Spike Trap',
            challenge: 'Discard 2 cards or take 1 damage'
        },
        reward: { type: 'treasure', amount: 2 },
        completed: false
    },
    {
        id: 3,
        name: 'Treasure Vault',
        type: 'reward',
        icon: '💰',
        description: 'Rich rewards, but heavily guarded.',
        encounter: {
            type: 'monster',
            name: 'Orc Guardian',
            health: 4,
            attack: 2,
            currentHealth: 4
        },
        reward: { type: 'treasure', amount: 3 },
        completed: false
    },
    {
        id: 4,
        name: "Dragon's Lair",
        type: 'boss',
        icon: '🐉',
        description: 'The final challenge - an ancient dragon guards the ultimate treasure.',
        encounter: {
            type: 'boss',
            name: 'Ancient Dragon',
            health: 10,
            attack: 3,
            currentHealth: 10,
            special: 'Fire Breath - hits all players'
        },
        reward: { type: 'victory', amount: 0 },
        completed: false
    }
];

const ACTION_CARDS = {
    attack: {
        name: 'Attack',
        icon: '⚔️',
        description: 'Deal damage to an enemy',
        type: 'combat',
        effect: 'damage'
    },
    defend: {
        name: 'Defend', 
        icon: '🛡️',
        description: 'Reduce incoming damage this turn',
        type: 'defense',
        effect: 'block'
    },
    heal: {
        name: 'Healing Potion',
        icon: '🧪',
        description: 'Restore health',
        type: 'support',
        effect: 'heal'
    },
    treasure: {
        name: 'Treasure Hunt',
        icon: '🔍',
        description: 'Find extra treasure in this room',
        type: 'utility',
        effect: 'treasure'
    }
};

class Room {
    constructor(roomData) {
        Object.assign(this, { ...roomData });
        if (this.encounter && this.encounter.health) {
            this.encounter.currentHealth = this.encounter.health;
        }
    }

    processEncounter(players, gameState) {
        const results = [];
        
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
                currentPlayer.hero.treasure += this.reward.amount;
                results.push({
                    type: 'reward',
                    message: `Found ${this.reward.amount} treasure!`
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
                    message: 'The dragon has been defeated! Victory is yours!'
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

class Deck {
    constructor() {
        this.cards = [];
        this.discardPile = [];
        this.generateDeck();
    }

    generateDeck() {
        const cardTypes = Object.keys(ACTION_CARDS);
        
        for (let i = 0; i < 40; i++) {
            const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            this.cards.push({
                id: i,
                ...ACTION_CARDS[cardType],
                cardType: cardType
            });
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
}