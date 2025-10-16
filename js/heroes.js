// Enhanced Heroes with Mana and Advanced Abilities
const HEROES = {
    knight: {
        name: 'Knight',
        icon: '🛡️',
        health: 8,
        mana: 3,
        defense: 2,
        attack: 2,
        special: 'shield_wall',
        description: 'Stalwart defender who protects allies',
        abilities: {
            shield_wall: {
                name: 'Shield Wall',
                description: 'Grant target ally immunity to next attack',
                cooldown: 2,
                mana_cost: 1,
                target: 'ally'
            }
        },
        story: 'A noble warrior sworn to protect the innocent, wielding ancient techniques passed down through generations of knights.'
    },
    wizard: {
        name: 'Wizard', 
        icon: '🧙',
        health: 5,
        mana: 5,
        defense: 0,
        attack: 1,
        special: 'arcane_blast',
        description: 'Master of elemental magic with devastating spells',
        abilities: {
            arcane_blast: {
                name: 'Arcane Blast',
                description: 'Deal 4 damage + ignite, or 6 damage to boss enemies',
                cooldown: 3,
                mana_cost: 2,
                target: 'enemy'
            }
        },
        story: 'An ancient scholar of the mystical arts, this wizard has spent decades mastering the elemental forces.'
    },
    rogue: {
        name: 'Rogue',
        icon: '🗡️', 
        health: 6,
        mana: 4,
        defense: 1,
        attack: 2,
        special: 'shadow_step',
        description: 'Swift and cunning, strikes from the shadows',
        abilities: {
            shadow_step: {
                name: 'Shadow Step',
                description: 'Enter stealth, next attack deals +2 damage and grants +1 treasure',
                cooldown: 2,
                mana_cost: 1,
                target: 'self'
            }
        },
        story: 'Once a street thief, now an expert dungeon delver who knows every trick for finding hidden treasures.'
    },
    cleric: {
        name: 'Cleric',
        icon: '⛪',
        health: 7,
        mana: 4,
        defense: 1,
        attack: 1,
        special: 'divine_intervention',
        description: 'Holy healer blessed with divine powers',
        abilities: {
            divine_intervention: {
                name: 'Divine Intervention',
                description: 'Heal target for 4 HP + cleanse all debuffs + grant regeneration',
                cooldown: 2,
                mana_cost: 2,
                target: 'ally'
            }
        },
        story: 'A devoted servant of the light, this cleric channels divine power to heal and protect the faithful.'
    }
};

// Enhanced Hero class with Mana and Advanced Effects
class Hero {
    constructor(type, playerId) {
        const template = HEROES[type];
        this.type = type;
        this.playerId = playerId;
        this.name = template.name;
        this.icon = template.icon;
        this.maxHealth = template.health;
        this.currentHealth = template.health;
        this.maxMana = template.mana;
        this.currentMana = template.mana;
        this.defense = template.defense;
        this.attack = template.attack;
        this.special = template.special;
        this.description = template.description;
        this.story = template.story;
        this.abilities = { ...template.abilities };
        this.treasure = 0;
        this.cooldowns = {};
        this.statusEffects = [];
        this.equipment = { weapon: null, armor: null };
        this.spellsUsedThisTurn = [];
    }

    takeDamage(amount) {
        // Check for protection effects
        const protectedEffect = this.statusEffects.find(e => e.type === 'protected');
        if (protectedEffect) {
            this.statusEffects = this.statusEffects.filter(e => e.type !== 'protected');
            return 0; // Damage absorbed
        }
        
        // Check for defending effect
        let finalAmount = amount;
        const defendingEffect = this.statusEffects.find(e => e.type === 'defending');
        if (defendingEffect) {
            finalAmount = Math.max(0, amount - 2);
        }
        
        // Apply defense
        const actualDamage = Math.max(0, finalAmount - this.getTotalDefense());
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        return this.currentHealth - oldHealth;
    }

    spendMana(amount) {
        if (this.currentMana >= amount) {
            this.currentMana -= amount;
            return true;
        }
        return false;
    }

    regenerateMana(amount = 1) {
        // Base regen + equipment bonus
        let regenAmount = amount;
        if (this.equipment.armor && this.equipment.armor.effect.includes('Mana regeneration')) {
            regenAmount++;
        }
        
        this.currentMana = Math.min(this.maxMana, this.currentMana + regenAmount);
        return regenAmount;
    }

    getTotalAttack() {
        let totalAttack = this.attack;
        
        // Equipment bonus
        if (this.equipment.weapon) {
            const weaponBonus = this.equipment.weapon.effect.match(/\+(\d+) Attack/);
            if (weaponBonus) {
                totalAttack += parseInt(weaponBonus[1]);
            }
        }
        
        // Status effects
        const blessingEffect = this.statusEffects.find(e => e.type === 'blessing');
        if (blessingEffect) {
            totalAttack += 1;
        }
        
        const curseEffect = this.statusEffects.find(e => e.type === 'weakness');
        if (curseEffect) {
            totalAttack -= 1;
        }
        
        return Math.max(0, totalAttack);
    }

    getTotalDefense() {
        let totalDefense = this.defense;
        
        // Equipment bonus
        if (this.equipment.armor) {
            const armorBonus = this.equipment.armor.effect.match(/\+(\d+) Defense/);
            if (armorBonus) {
                totalDefense += parseInt(armorBonus[1]);
            }
        }
        
        return totalDefense;
    }

    useSpecial(target = null) {
        const ability = this.abilities[this.special];
        
        if (this.cooldowns[this.special] > 0) {
            return { success: false, message: 'Ability on cooldown' };
        }
        
        if (!this.spendMana(ability.mana_cost)) {
            return { success: false, message: 'Not enough mana' };
        }

        let result = { success: true, message: '' };
        
        switch (this.special) {
            case 'shield_wall':
                if (target && target !== this) {
                    target.statusEffects.push({ type: 'protected', duration: 1 });
                    result.message = `${this.name} protects ${target.name} with Shield Wall!`;
                } else {
                    result.message = 'No valid target for Shield Wall!';
                    result.success = false;
                }
                break;
                
            case 'arcane_blast':
                result.damage = 4;
                result.effects = [{ type: 'ignite', duration: 2 }];
                result.message = `${this.name} unleashes Arcane Blast!`;
                break;
                
            case 'shadow_step':
                this.statusEffects.push({ type: 'stealth', duration: 2 });
                this.statusEffects.push({ type: 'treasure_hunter', duration: 1 });
                result.message = `${this.name} vanishes into the shadows!`;
                break;
                
            case 'divine_intervention':
                if (target) {
                    const healed = target.heal(4);
                    // Cleanse all debuffs
                    target.statusEffects = target.statusEffects.filter(e => 
                        !['weakness', 'poison', 'ignite', 'slow'].includes(e.type)
                    );
                    // Add regeneration
                    target.statusEffects.push({ type: 'regeneration', duration: 3 });
                    result.message = `${this.name} channels divine power to heal ${target.name} for ${healed} HP!`;
                } else {
                    result.message = 'No target for Divine Intervention!';
                    result.success = false;
                }
                break;
        }

        if (result.success) {
            this.cooldowns[this.special] = ability.cooldown;
        }
        return result;
    }

    equipItem(item) {
        if (item.type === 'weapon') {
            this.equipment.weapon = item;
        } else if (item.type === 'armor') {
            this.equipment.armor = item;
        }
    }

    tickCooldowns() {
        // Reduce cooldowns
        Object.keys(this.cooldowns).forEach(ability => {
            if (this.cooldowns[ability] > 0) {
                this.cooldowns[ability]--;
            }
        });
        
        // Process status effects
        const newEffects = [];
        this.statusEffects.forEach(effect => {
            switch (effect.type) {
                case 'ignite':
                    this.takeDamage(1);
                    break;
                case 'poison':
                    this.takeDamage(2);
                    break;
                case 'regeneration':
                    this.heal(1);
                    break;
            }
            
            effect.duration--;
            if (effect.duration > 0) {
                newEffects.push(effect);
            }
        });
        
        this.statusEffects = newEffects;
        
        // Regenerate mana
        this.regenerateMana();
        
        // Clear spells used this turn
        this.spellsUsedThisTurn = [];
    }

    isAlive() {
        return this.currentHealth > 0;
    }

    getStatus() {
        return {
            name: this.name,
            icon: this.icon,
            health: `${this.currentHealth}/${this.maxHealth}`,
            mana: `${this.currentMana}/${this.maxMana}`,
            treasure: this.treasure,
            effects: this.statusEffects.map(e => ({
                type: e.type,
                duration: e.duration,
                icon: this.getEffectIcon(e.type)
            })),
            cooldowns: Object.entries(this.cooldowns)
                .filter(([_, cd]) => cd > 0)
                .map(([ability, cd]) => `${ability}: ${cd}`),
            equipment: {
                weapon: this.equipment.weapon?.name || 'None',
                armor: this.equipment.armor?.name || 'None'
            }
        };
    }

    getEffectIcon(effectType) {
        const icons = {
            'defending': '🛡️',
            'protected': '✨',
            'stealth': '👤',
            'ignite': '🔥',
            'poison': '☠️',
            'slow': '🐢',
            'regeneration': '🌿',
            'blessing': '⭐',
            'weakness': '💀',
            'treasure_hunter': '💰'
        };
        return icons[effectType] || '•';
    }
}