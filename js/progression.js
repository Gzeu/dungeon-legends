// Progression System - XP, Leveling, Skill Trees, Achievements
class ProgressionManager {
    constructor() {
        this.profileData = this.loadProfile();
        this.skillTrees = this.initializeSkillTrees();
        this.achievementDefinitions = this.initializeAchievements();
    }

    loadProfile() {
        const defaultProfile = {
            playerStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalTreasure: 0,
                dragonsDefeated: 0,
                highestLevelReached: 1,
                favoriteHero: 'knight'
            },
            heroProgress: {
                knight: { level: 1, xp: 0, skillsUnlocked: [], gamesPlayed: 0, attributeBonus: {atk: 0, def: 0, hp: 0, mp: 0} },
                wizard: { level: 1, xp: 0, skillsUnlocked: [], gamesPlayed: 0, attributeBonus: {atk: 0, def: 0, hp: 0, mp: 0} },
                rogue: { level: 1, xp: 0, skillsUnlocked: [], gamesPlayed: 0, attributeBonus: {atk: 0, def: 0, hp: 0, mp: 0} },
                cleric: { level: 1, xp: 0, skillsUnlocked: [], gamesPlayed: 0, attributeBonus: {atk: 0, def: 0, hp: 0, mp: 0} }
            },
            achievements: {
                firstVictory: false,
                dragonSlayer: false,
                treasureHoarder: false,
                spellMaster: false,
                guardianAngel: false
            },
            unlockedContent: {
                heroes: ['knight', 'wizard', 'rogue', 'cleric'],
                dungeons: ['classic'],
                equipment: []
            }
        };
        
        try {
            const saved = localStorage.getItem('dungeonLegends_profile');
            return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
        } catch {
            return defaultProfile;
        }
    }

    saveProfile() {
        try {
            localStorage.setItem('dungeonLegends_profile', JSON.stringify(this.profileData));
            return true;
        } catch (error) {
            console.error('Failed to save profile:', error);
            return false;
        }
    }

    initializeSkillTrees() {
        return {
            knight: {
                combat: {
                    2: { name: 'Weapon Master', effect: 'atk_bonus_1', description: '+1 Attack permanently' },
                    3: { name: 'Shield Bash', effect: 'shield_bash', description: 'Shield Wall deals 2 damage to attacker' },
                    4: { name: 'Berserker Rage', effect: 'berserker', description: 'When below 50% HP: +2 Attack' },
                    5: { name: 'Guardian Angel', effect: 'guardian', description: 'When ally would die, take damage instead' }
                },
                defense: {
                    2: { name: 'Armor Expert', effect: 'def_bonus_1', description: '+1 Defense permanently' },
                    3: { name: 'Damage Reduction', effect: 'damage_reduction', description: 'All damage -1 (minimum 1)' },
                    4: { name: 'Reflection Shield', effect: 'reflection', description: '20% chance to reflect damage back' },
                    5: { name: 'Immortal Guardian', effect: 'immortal', description: '+5 max HP, death immunity once per dungeon' }
                },
                support: {
                    2: { name: 'Rally Cry', effect: 'rally', description: 'Special ability gives all allies +1 ATK this turn' },
                    3: { name: 'Inspiration', effect: 'inspiration', description: '+1 mana regen for all allies' },
                    4: { name: 'Tactical Genius', effect: 'tactical', description: 'Party draws +1 card when knight uses special' },
                    5: { name: 'Legendary Commander', effect: 'commander', description: 'All abilities cost -1 mana, party abilities -1 cooldown' }
                }
            },
            wizard: {
                elemental: {
                    2: { name: 'Spell Power', effect: 'spell_power', description: '+1 damage to all spells' },
                    3: { name: 'Elemental Mastery', effect: 'mastery', description: 'Spell combos trigger with 1 spell' },
                    4: { name: 'Arcane Missiles', effect: 'missiles', description: 'Spells can target multiple enemies' },
                    5: { name: 'Meteor Storm', effect: 'meteor', description: 'Special hits all enemies for massive damage' }
                },
                mana: {
                    2: { name: 'Mana Efficiency', effect: 'efficiency', description: 'All spells cost -1 mana (minimum 1)' },
                    3: { name: 'Arcane Intellect', effect: 'intellect', description: '+2 max mana permanently' },
                    4: { name: 'Mana Burn', effect: 'mana_burn', description: 'Attacks drain 1 mana from enemies' },
                    5: { name: 'Infinite Power', effect: 'infinite', description: 'Mana regenerates 2x faster' }
                },
                utility: {
                    2: { name: 'Spell Scholar', effect: 'scholar', description: 'Draw +1 spell card each turn' },
                    3: { name: 'Transmutation', effect: 'transmute', description: 'Convert any card into a spell' },
                    4: { name: 'Time Magic', effect: 'time_magic', description: 'Take 2 actions per turn' },
                    5: { name: 'Reality Bender', effect: 'reality', description: 'Skip encounters once per dungeon' }
                }
            },
            rogue: {
                stealth: {
                    2: { name: 'Shadow Mastery', effect: 'shadow_mastery', description: '+1 treasure from all sources' },
                    3: { name: 'Assassinate', effect: 'assassinate', description: 'Stealth attacks deal double damage' },
                    4: { name: 'Master Thief', effect: 'master_thief', description: 'Bypass all traps, steal from enemies' },
                    5: { name: 'Shadow Clone', effect: 'clone', description: 'Create shadow copy that acts each turn' }
                },
                agility: {
                    2: { name: 'Swift Strike', effect: 'swift', description: 'Can attack twice per turn' },
                    3: { name: 'Evasion', effect: 'evasion', description: '25% chance to dodge attacks' },
                    4: { name: 'Counter Attack', effect: 'counter', description: 'When dodging, counter for full damage' },
                    5: { name: 'Phantom Step', effect: 'phantom', description: 'Cannot be targeted by enemy attacks' }
                },
                treasure: {
                    2: { name: 'Treasure Sense', effect: 'treasure_sense', description: 'Find +1 treasure in every room' },
                    3: { name: 'Lucky Find', effect: 'lucky', description: '20% chance to find rare equipment' },
                    4: { name: 'Treasure Magnet', effect: 'magnet', description: 'Collect treasure from defeated enemies' },
                    5: { name: 'Dragon Hoarder', effect: 'hoarder', description: 'Double all treasure from final boss' }
                }
            },
            cleric: {
                healing: {
                    2: { name: 'Greater Healing', effect: 'greater_healing', description: 'All healing +2 effectiveness' },
                    3: { name: 'Mass Heal', effect: 'mass_heal', description: 'Healing affects all allies' },
                    4: { name: 'Resurrection', effect: 'resurrect', description: 'Can revive fallen allies to 1 HP' },
                    5: { name: 'Divine Avatar', effect: 'avatar', description: 'Become immortal for 3 turns, heal others to full' }
                },
                divine: {
                    2: { name: 'Divine Favor', effect: 'favor', description: 'Bless all allies at start of combat' },
                    3: { name: 'Turn Undead', effect: 'turn_undead', description: 'Instantly defeat undead enemies' },
                    4: { name: 'Sacred Ground', effect: 'sacred', description: 'Party regenerates 1 HP per turn' },
                    5: { name: 'Miracle', effect: 'miracle', description: 'Once per dungeon: reset all cooldowns and restore all resources' }
                },
                support: {
                    2: { name: 'Aura of Protection', effect: 'aura', description: 'All allies +1 Defense' },
                    3: { name: 'Mana Channel', effect: 'channel', description: 'Can give mana to other players' },
                    4: { name: 'Divine Insight', effect: 'insight', description: 'Party can see next 3 cards in deck' },
                    5: { name: 'Saint', effect: 'saint', description: 'When cleric dies, all allies gain all their abilities permanently' }
                }
            }
        };
    }

    initializeAchievements() {
        return {
            firstVictory: { name: 'First Victory', description: 'Complete your first dungeon', reward: 'xp_bonus_50' },
            dragonSlayer: { name: 'Dragon Slayer', description: 'Defeat the Ancient Dragon', reward: 'legendary_weapon' },
            treasureHoarder: { name: 'Treasure Hoarder', description: 'Collect 50+ treasure in single game', reward: 'treasure_multiplier' },
            spellMaster: { name: 'Spell Master', description: 'Activate 10+ spell combos', reward: 'spell_power_permanent' },
            guardianAngel: { name: 'Guardian Angel', description: 'Save an ally from death 5+ times', reward: 'guardian_aura' },
            perfectRun: { name: 'Perfect Run', description: 'Complete dungeon without anyone taking damage', reward: 'divine_blessing' },
            speedRunner: { name: 'Speed Runner', description: 'Complete dungeon in under 20 turns', reward: 'haste_permanent' },
            soloMaster: { name: 'Solo Master', description: 'Defeat dragon in single player mode', reward: 'hero_of_legend' }
        };
    }

    awardXP(heroType, source, amount) {
        if (!this.profileData.heroProgress[heroType]) return false;
        
        const hero = this.profileData.heroProgress[heroType];
        const oldLevel = hero.level;
        
        hero.xp += amount;
        hero.level = this.calculateLevel(hero.xp);
        
        // Level up rewards
        if (hero.level > oldLevel) {
            this.handleLevelUp(heroType, hero.level, oldLevel);
            return { levelUp: true, newLevel: hero.level, skillPoints: hero.level - oldLevel };
        }
        
        this.saveProfile();
        return { levelUp: false, xp: amount };
    }

    calculateLevel(xp) {
        if (xp >= 700) return 5;
        if (xp >= 450) return 4;
        if (xp >= 250) return 3;
        if (xp >= 100) return 2;
        return 1;
    }

    handleLevelUp(heroType, newLevel, oldLevel) {
        const levelsGained = newLevel - oldLevel;
        
        // Award attribute points (1 per level)
        this.profileData.heroProgress[heroType].pendingAttributePoints = 
            (this.profileData.heroProgress[heroType].pendingAttributePoints || 0) + levelsGained;
        
        // Award skill points (1 per level)  
        this.profileData.heroProgress[heroType].pendingSkillPoints = 
            (this.profileData.heroProgress[heroType].pendingSkillPoints || 0) + levelsGained;
        
        // Check for content unlocks
        this.checkContentUnlocks(heroType, newLevel);
        
        // Update player stats
        this.profileData.playerStats.highestLevelReached = Math.max(
            this.profileData.playerStats.highestLevelReached,
            newLevel
        );
        
        this.saveProfile();
    }

    checkContentUnlocks(heroType, level) {
        const unlocks = [];
        
        // Unlock new heroes at level 3
        if (level >= 3) {
            const newHeroes = {
                knight: 'paladin',
                wizard: 'necromancer', 
                rogue: 'assassin',
                cleric: 'druid'
            };
            
            if (newHeroes[heroType] && !this.profileData.unlockedContent.heroes.includes(newHeroes[heroType])) {
                this.profileData.unlockedContent.heroes.push(newHeroes[heroType]);
                unlocks.push(`New Hero Unlocked: ${newHeroes[heroType]}`);
            }
        }
        
        // Unlock legendary equipment at level 5
        if (level >= 5) {
            const legendaryItems = {
                knight: 'excalibur',
                wizard: 'staff_of_power',
                rogue: 'shadow_cloak', 
                cleric: 'divine_artifact'
            };
            
            if (legendaryItems[heroType] && !this.profileData.unlockedContent.equipment.includes(legendaryItems[heroType])) {
                this.profileData.unlockedContent.equipment.push(legendaryItems[heroType]);
                unlocks.push(`Legendary Equipment Unlocked: ${legendaryItems[heroType]}`);
            }
        }
        
        return unlocks;
    }

    getAvailableSkills(heroType, level) {
        const hero = this.profileData.heroProgress[heroType];
        if (!hero) return [];
        
        const tree = this.skillTrees[heroType];
        const available = [];
        
        Object.entries(tree).forEach(([treeName, skills]) => {
            Object.entries(skills).forEach(([skillLevel, skill]) => {
                const requiredLevel = parseInt(skillLevel);
                if (requiredLevel <= level && !hero.skillsUnlocked.includes(skill.effect)) {
                    available.push({
                        tree: treeName,
                        level: requiredLevel,
                        ...skill
                    });
                }
            });
        });
        
        return available.sort((a, b) => a.level - b.level);
    }

    unlockSkill(heroType, skillEffect) {
        const hero = this.profileData.heroProgress[heroType];
        if (!hero || hero.skillsUnlocked.includes(skillEffect)) return false;
        
        if ((hero.pendingSkillPoints || 0) > 0) {
            hero.skillsUnlocked.push(skillEffect);
            hero.pendingSkillPoints--;
            this.saveProfile();
            return true;
        }
        
        return false;
    }

    allocateAttributePoint(heroType, attribute) {
        const hero = this.profileData.heroProgress[heroType];
        if (!hero || (hero.pendingAttributePoints || 0) <= 0) return false;
        
        const validAttributes = ['atk', 'def', 'hp', 'mp'];
        if (!validAttributes.includes(attribute)) return false;
        
        hero.attributeBonus[attribute] = (hero.attributeBonus[attribute] || 0) + 1;
        hero.pendingAttributePoints--;
        
        this.saveProfile();
        return true;
    }

    applyHeroProgression(hero) {
        const heroType = hero.type;
        const progress = this.profileData.heroProgress[heroType];
        if (!progress) return;
        
        // Apply attribute bonuses
        hero.attack += progress.attributeBonus.atk || 0;
        hero.defense += progress.attributeBonus.def || 0;
        hero.maxHealth += progress.attributeBonus.hp || 0;
        hero.currentHealth += progress.attributeBonus.hp || 0;
        hero.maxMana += progress.attributeBonus.mp || 0;
        hero.currentMana += progress.attributeBonus.mp || 0;
        
        // Apply skill effects
        progress.skillsUnlocked.forEach(skillEffect => {
            this.applySkillEffect(hero, skillEffect);
        });
        
        hero.level = progress.level;
        hero.xp = progress.xp;
    }

    applySkillEffect(hero, effect) {
        switch (effect) {
            case 'atk_bonus_1':
                hero.attack += 1;
                break;
            case 'def_bonus_1':
                hero.defense += 1;
                break;
            case 'spell_power':
                hero.spellPower = (hero.spellPower || 0) + 1;
                break;
            case 'efficiency':
                hero.manaCostReduction = (hero.manaCostReduction || 0) + 1;
                break;
            case 'intellect':
                hero.maxMana += 2;
                hero.currentMana += 2;
                break;
            case 'shadow_mastery':
                hero.treasureBonus = (hero.treasureBonus || 0) + 1;
                break;
            case 'greater_healing':
                hero.healingBonus = (hero.healingBonus || 0) + 2;
                break;
            // Add more skill effects as needed
        }
    }

    checkAchievements(gameData) {
        const achievements = [];
        
        // First Victory
        if (gameData.victory && !this.profileData.achievements.firstVictory) {
            this.profileData.achievements.firstVictory = true;
            achievements.push('firstVictory');
        }
        
        // Dragon Slayer
        if (gameData.dragonDefeated && !this.profileData.achievements.dragonSlayer) {
            this.profileData.achievements.dragonSlayer = true;
            this.profileData.playerStats.dragonsDefeated++;
            achievements.push('dragonSlayer');
        }
        
        // Treasure Hoarder
        if (gameData.totalTreasure >= 50 && !this.profileData.achievements.treasureHoarder) {
            this.profileData.achievements.treasureHoarder = true;
            achievements.push('treasureHoarder');
        }
        
        // Spell Master
        if (gameData.spellCombos >= 10 && !this.profileData.achievements.spellMaster) {
            this.profileData.achievements.spellMaster = true;
            achievements.push('spellMaster');
        }
        
        this.saveProfile();
        return achievements;
    }

    getHeroStats(heroType) {
        const progress = this.profileData.heroProgress[heroType];
        if (!progress) return null;
        
        return {
            level: progress.level,
            xp: progress.xp,
            xpToNext: this.getXPToNextLevel(progress.xp),
            skillsUnlocked: progress.skillsUnlocked.length,
            gamesPlayed: progress.gamesPlayed,
            pendingPoints: {
                attributes: progress.pendingAttributePoints || 0,
                skills: progress.pendingSkillPoints || 0
            }
        };
    }

    getXPToNextLevel(currentXP) {
        const requirements = [0, 100, 250, 450, 700, 999999];
        const currentLevel = this.calculateLevel(currentXP);
        return currentLevel >= 5 ? 0 : requirements[currentLevel] - currentXP;
    }

    getPlayerProfile() {
        return {
            stats: this.profileData.playerStats,
            heroes: Object.entries(this.profileData.heroProgress).map(([type, data]) => ({
                type,
                ...this.getHeroStats(type)
            })),
            achievements: Object.entries(this.profileData.achievements)
                .filter(([_, unlocked]) => unlocked)
                .map(([name, _]) => name),
            unlocked: this.profileData.unlockedContent
        };
    }

    awardPostGameXP(players, gameResults) {
        const xpAwards = [];
        
        players.forEach(player => {
            if (player.isAI) return; // Only human players get XP
            
            let totalXP = 0;
            const awards = [];
            
            // Combat XP
            if (gameResults.enemiesDefeated > 0) {
                const combatXP = gameResults.enemiesDefeated * 10;
                totalXP += combatXP;
                awards.push(`Combat: ${combatXP} XP`);
            }
            
            // Room completion XP
            if (gameResults.roomsCompleted > 0) {
                const roomXP = gameResults.roomsCompleted * 15;
                totalXP += roomXP;
                awards.push(`Rooms: ${roomXP} XP`);
            }
            
            // Boss XP
            if (gameResults.dragonDefeated) {
                totalXP += 50;
                awards.push(`Dragon: 50 XP`);
            }
            
            // Treasure XP
            if (player.hero.treasure > 0) {
                const treasureXP = player.hero.treasure * 5;
                totalXP += treasureXP;
                awards.push(`Treasure: ${treasureXP} XP`);
            }
            
            // Survival bonus
            if (player.hero.isAlive() && gameResults.victory) {
                totalXP += 20;
                awards.push(`Survival: 20 XP`);
            }
            
            // Award XP
            const result = this.awardXP(player.hero.type, 'game_completion', totalXP);
            
            xpAwards.push({
                playerName: player.name,
                heroType: player.hero.type,
                totalXP,
                awards,
                levelUp: result.levelUp,
                newLevel: result.newLevel
            });
        });
        
        return xpAwards;
    }
}

// Make available globally
window.ProgressionManager = ProgressionManager;