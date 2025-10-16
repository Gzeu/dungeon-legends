// Heroes data and abilities
const HEROES = {
    knight: {
        name: 'Knight',
        icon: '🛡️',
        health: 8,
        defense: 2,
        attack: 2,
        special: 'protect',
        description: 'Can protect other players from damage',
        abilities: {
            protect: {
                name: 'Shield Wall',
                description: 'Block damage for another player',
                cooldown: 2
            }
        }
    },
    wizard: {
        name: 'Wizard', 
        icon: '🧙',
        health: 5,
        defense: 0,
        attack: 3,
        special: 'fireball',
        description: 'Powerful spells with area effects',
        abilities: {
            fireball: {
                name: 'Fireball',
                description: 'Deal +3 damage, can hit multiple enemies',
                cooldown: 3
            }
        }
    },
    rogue: {
        name: 'Rogue',
        icon: '🗡️', 
        health: 6,
        defense: 1,
        attack: 2,
        special: 'stealth',
        description: 'Extra treasure and trap detection',
        abilities: {
            stealth: {
                name: 'Stealth Strike',
                description: 'Bypass enemy defenses, auto-avoid traps',
                cooldown: 2
            }
        }
    },
    cleric: {
        name: 'Cleric',
        icon: '⛪',
        health: 7,
        defense: 1,
        attack: 1,
        special: 'heal',
        description: 'Healing and support abilities',
        abilities: {
            heal: {
                name: 'Divine Healing',
                description: 'Restore +2 health to any player',
                cooldown: 1
            }
        }
    }
};

// Hero management functions
class Hero {
    constructor(type, playerId) {
        const template = HEROES[type];
        this.type = type;
        this.playerId = playerId;
        this.name = template.name;
        this.icon = template.icon;
        this.maxHealth = template.health;
        this.currentHealth = template.health;
        this.defense = template.defense;
        this.attack = template.attack;
        this.special = template.special;
        this.description = template.description;
        this.abilities = { ...template.abilities };
        this.treasure = 0;
        this.cooldowns = {};
        this.statusEffects = [];
    }

    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.defense);
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        return this.currentHealth - oldHealth;
    }

    useSpecial(target = null) {
        if (this.cooldowns[this.special] > 0) {
            return { success: false, message: 'Ability on cooldown' };
        }

        let result = { success: true, message: '' };
        
        switch (this.special) {
            case 'protect':
                if (target && target !== this) {
                    target.statusEffects.push({ type: 'protected', duration: 1 });
                    result.message = `${this.name} protects ${target.name}!`;
                }
                break;
                
            case 'fireball':
                result.damage = this.attack + 3;
                result.message = `${this.name} casts Fireball for ${result.damage} damage!`;
                break;
                
            case 'stealth':
                this.statusEffects.push({ type: 'stealth', duration: 2 });
                result.message = `${this.name} enters stealth!`;
                break;
                
            case 'heal':
                if (target) {
                    const healed = target.heal(2);
                    result.message = `${this.name} heals ${target.name} for ${healed} HP!`;
                }
                break;
        }

        this.cooldowns[this.special] = this.abilities[this.special].cooldown;
        return result;
    }

    tickCooldowns() {
        Object.keys(this.cooldowns).forEach(ability => {
            if (this.cooldowns[ability] > 0) {
                this.cooldowns[ability]--;
            }
        });
        
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
    }

    isAlive() {
        return this.currentHealth > 0;
    }

    getStatus() {
        return {
            name: this.name,
            icon: this.icon,
            health: `${this.currentHealth}/${this.maxHealth}`,
            treasure: this.treasure,
            effects: this.statusEffects.map(e => e.type),
            cooldowns: Object.entries(this.cooldowns)
                .filter(([_, cd]) => cd > 0)
                .map(([ability, cd]) => `${ability}: ${cd}`)
        };
    }
}