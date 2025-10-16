// Updated Heroes with progression bonuses applied
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
    },
    
    // Unlockable Heroes (Level 3+)
    paladin: {
        name: 'Paladin',
        icon: '⚡',
        health: 10,
        mana: 4,
        defense: 3,
        attack: 3,
        special: 'divine_strike',
        description: 'Holy warrior with divine powers',
        unlockRequirement: 'Knight Level 3',
        abilities: {
            divine_strike: {
                name: 'Divine Strike',
                description: 'Deal massive damage and heal all allies',
                cooldown: 4,
                mana_cost: 3,
                target: 'enemy'
            }
        },
        story: 'A knight elevated by divine grace, wielding both sword and holy magic.'
    },
    necromancer: {
        name: 'Necromancer',
        icon: '💀',
        health: 4,
        mana: 6,
        defense: 0,
        attack: 2,
        special: 'death_magic',
        description: 'Master of death magic and undead minions',
        unlockRequirement: 'Wizard Level 3',
        abilities: {
            death_magic: {
                name: 'Death Magic',
                description: 'Sacrifice health to deal massive damage or raise undead minion',
                cooldown: 3,
                mana_cost: 1,
                target: 'enemy'
            }
        },
        story: 'A wizard who delved too deep into forbidden arts, now commanding death itself.'
    }
};

// Enhanced Hero class with progression and skill effects
class Hero {
    constructor(type, playerId, progressionManager = null) {
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
        
        // Progression properties
        this.level = 1;
        this.xp = 0;
        this.spellPower = 0;
        this.manaCostReduction = 0;
        this.treasureBonus = 0;
        this.healingBonus = 0;
        this.skillEffects = [];
        
        // Apply progression if available
        if (progressionManager) {
            progressionManager.applyHeroProgression(this);
        }
    }

    awardXP(amount, source = 'unknown') {
        if (window.gameInstance && window.gameInstance.progressionManager) {
            const result = window.gameInstance.progressionManager.awardXP(this.type, source, amount);
            if (result.levelUp) {
                this.level = result.newLevel;
                return {
                    xp: amount,
                    levelUp: true,
                    newLevel: result.newLevel,
                    skillPoints: result.skillPoints
                };
            }
        }
        return { xp: amount, levelUp: false };
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
        
        // Apply skill effects
        if (this.skillEffects.includes('damage_reduction')) {
            finalAmount = Math.max(1, finalAmount - 1);
        }
        
        if (this.skillEffects.includes('reflection') && Math.random() < 0.2) {
            // Damage will be reflected back to attacker
            this.statusEffects.push({ type: 'reflect_next', amount: finalAmount });
        }
        
        // Apply defense
        const actualDamage = Math.max(0, finalAmount - this.getTotalDefense());
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        
        // Berserker rage trigger
        if (this.skillEffects.includes('berserker') && this.currentHealth < this.maxHealth * 0.5) {
            if (!this.statusEffects.find(e => e.type === 'berserker_rage')) {
                this.statusEffects.push({ type: 'berserker_rage', duration: -1 }); // Permanent while below 50%
            }
        }
        
        return actualDamage;
    }

    heal(amount) {
        let healAmount = amount + (this.healingBonus || 0);
        
        // Apply skill bonuses
        if (this.skillEffects.includes('greater_healing')) {
            healAmount += 2;
        }
        
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + healAmount);
        return this.currentHealth - oldHealth;
    }

    spendMana(amount) {
        let cost = Math.max(1, amount - (this.manaCostReduction || 0));
        
        if (this.currentMana >= cost) {
            this.currentMana -= cost;
            return true;
        }
        return false;
    }

    regenerateMana(amount = 1) {
        let regenAmount = amount;
        
        // Equipment bonus
        if (this.equipment.armor && this.equipment.armor.effect.includes('Mana regeneration')) {
            regenAmount++;
        }
        
        // Skill bonuses
        if (this.skillEffects.includes('infinite')) {
            regenAmount *= 2;
        }
        
        if (this.skillEffects.includes('inspiration')) {
            regenAmount++;
        }
        
        this.currentMana = Math.min(this.maxMana, this.currentMana + regenAmount);
        return regenAmount;
    }

    getTotalAttack() {
        let totalAttack = this.attack;
        
        // Equipment bonus
        if (this.equipment.weapon) {
            const weaponBonus = this.equipment.weapon.effect.match(/(\d+) Attack/);
            if (weaponBonus) {
                totalAttack += parseInt(weaponBonus[1]);
            }
        }
        
        // Status effects
        const blessingEffect = this.statusEffects.find(e => e.type === 'blessing');
        if (blessingEffect) totalAttack += 1;
        
        const berserkerEffect = this.statusEffects.find(e => e.type === 'berserker_rage');
        if (berserkerEffect) totalAttack += 2;
        
        const curseEffect = this.statusEffects.find(e => e.type === 'weakness');
        if (curseEffect) totalAttack -= 1;
        
        return Math.max(0, totalAttack);
    }

    getTotalDefense() {
        let totalDefense = this.defense;
        
        // Equipment bonus
        if (this.equipment.armor) {
            const armorBonus = this.equipment.armor.effect.match(/(\d+) Defense/);
            if (armorBonus) {
                totalDefense += parseInt(armorBonus[1]);
            }
        }
        
        // Skill effects
        if (this.skillEffects.includes('aura')) {
            totalDefense += 1;
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

        let result = { success: true, message: '', xpAwarded: 0 };
        
        switch (this.special) {
            case 'shield_wall':
                if (target && target !== this) {
                    target.statusEffects.push({ type: 'protected', duration: 1 });
                    result.message = `${this.name} protects ${target.name} with Shield Wall!`;
                    
                    // Shield Bash skill effect
                    if (this.skillEffects.includes('shield_bash')) {
                        result.reflectDamage = 2;
                        result.message += ' (Shield Bash active!)';
                    }
                    
                    result.xpAwarded = 5;
                } else {
                    result.message = 'No valid target for Shield Wall!';
                    result.success = false;
                }
                break;
                
            case 'arcane_blast':
                let damage = 4 + (this.spellPower || 0);
                
                // Meteor Storm skill effect
                if (this.skillEffects.includes('meteor')) {
                    damage += 3;
                    result.areaEffect = true;
                }
                
                result.damage = damage;
                result.effects = [{ type: 'ignite', duration: 2 }];
                result.message = `${this.name} unleashes Arcane Blast!`;
                result.xpAwarded = 8;
                break;
                
            case 'shadow_step':
                this.statusEffects.push({ type: 'stealth', duration: 2 });
                this.statusEffects.push({ type: 'treasure_hunter', duration: 1 });
                result.message = `${this.name} vanishes into the shadows!`;
                result.xpAwarded = 5;
                break;
                
            case 'divine_intervention':
                if (target) {
                    let healAmount = 4 + (this.healingBonus || 0);
                    const healed = target.heal(healAmount);
                    
                    // Cleanse all debuffs
                    target.statusEffects = target.statusEffects.filter(e => 
                        !['weakness', 'poison', 'ignite', 'slow'].includes(e.type)
                    );
                    
                    // Add regeneration
                    target.statusEffects.push({ type: 'regeneration', duration: 3 });
                    
                    // Mass Heal skill effect
                    if (this.skillEffects.includes('mass_heal')) {
                        result.massHeal = true;
                        result.message = `${this.name} channels divine power to heal all allies!`;
                    } else {
                        result.message = `${this.name} channels divine power to heal ${target.name} for ${healed} HP!`;
                    }
                    
                    result.xpAwarded = 6;
                } else {
                    result.message = 'No target for Divine Intervention!';
                    result.success = false;
                }
                break;
                
            case 'divine_strike': // Paladin ability
                result.damage = 6 + (this.spellPower || 0);
                result.healAllies = 3;
                result.message = `${this.name} strikes with divine power!`;
                result.xpAwarded = 10;
                break;
                
            case 'death_magic': // Necromancer ability
                const healthCost = 2;
                this.currentHealth = Math.max(1, this.currentHealth - healthCost);
                result.damage = 8 + (this.spellPower || 0);
                result.summonUndead = true;
                result.message = `${this.name} channels death magic! (-${healthCost} HP)`;
                result.xpAwarded = 10;
                break;
        }

        if (result.success) {
            let cooldown = ability.cooldown;
            
            // Commander skill effect
            if (this.skillEffects.includes('commander')) {
                cooldown = Math.max(1, cooldown - 1);
            }
            
            this.cooldowns[this.special] = cooldown;
            
            // Award XP for using special
            if (result.xpAwarded > 0) {
                this.awardXP(result.xpAwarded, 'special_ability');
            }
        }
        
        return result;
    }

    equipItem(item) {
        if (item.type === 'weapon') {
            this.equipment.weapon = item;
        } else if (item.type === 'armor') {
            this.equipment.armor = item;
        }
        
        // Award XP for equipping items
        this.awardXP(3, 'equipment');
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
            
            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration > 0) {
                    newEffects.push(effect);
                }
            } else if (effect.duration === -1) {
                // Permanent effect
                newEffects.push(effect);
            }
        });
        
        this.statusEffects = newEffects;
        
        // Regenerate mana
        this.regenerateMana();
        
        // Clear spells used this turn
        this.spellsUsedThisTurn = [];
    }

    getStatus() {
        return {
            name: this.name,
            icon: this.icon,
            level: this.level,
            xp: this.xp,
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
            },
            skillEffects: this.skillEffects
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
            'treasure_hunter': '💰',
            'berserker_rage': '😤',
            'reflect_next': '🔄'
        };
        return icons[effectType] || '•';
    }

    isAlive() {
        return this.currentHealth > 0;
    }

    // Calculate XP needed for next level
    getXPToNextLevel() {
        const requirements = [0, 100, 250, 450, 700, 999999];
        return this.level >= 5 ? 0 : requirements[this.level] - this.xp;
    }
}

// Make classes available globally
window.Hero = Hero;
window.AIPlayer = AIPlayer;