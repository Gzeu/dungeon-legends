// Server-side Game Engine for Dungeon Legends
// Responsible for authoritative game logic, validation, and state transitions

export class GameEngine {
  constructor(initialState) {
    this.state = initialState || this.createInitialState();
  }

  createInitialState() {
    return {
      status: 'active',
      currentRoom: 0,
      currentPlayer: 0,
      turnCounter: 1,
      roundCounter: 1,
      rooms: [],
      players: [],
      spellCombo: [],
      logs: []
    };
  }

  getState() {
    return this.state;
  }

  processAction(action, data) {
    const results = [];
    const animations = [];
    const sounds = [];

    switch (action) {
      case 'attack':
        this.handleAttack(results, animations, sounds);
        break;
      case 'defend':
        this.handleDefend(results, animations, sounds);
        break;
      case 'special':
        this.handleSpecial(results, animations, sounds);
        break;
      case 'pass':
        this.handlePass(results, animations, sounds);
        break;
      case 'playCard':
        this.handlePlayCard(data, results, animations, sounds);
        break;
      case 'allocateAttribute':
        this.handleAllocateAttribute(data, results);
        break;
      case 'confirmLevelUp':
        this.handleConfirmLevelUp(data, results);
        break;
      default:
        results.push({ type: 'info', message: 'Unknown action' });
    }

    // Check victory/defeat conditions
    this.checkRoomState(results, animations, sounds);

    // Advance turn
    this.advanceTurn();

    return {
      results,
      animations,
      sounds
    };
  }

  handleAttack(results, animations, sounds) {
    const room = this.state.rooms[this.state.currentRoom];
    const player = this.state.players[this.state.currentPlayer];

    if (room.enemy && room.enemy.currentHP > 0) {
      const damage = Math.max(1, (player.hero.attack || 1) - (room.enemy.defense || 0));
      room.enemy.currentHP = Math.max(0, room.enemy.currentHP - damage);
      results.push({ type: 'damage', message: `${player.name} hits ${room.enemy.name} for ${damage} damage!` });
      animations.push('damage');
      sounds.push('attack');

      if (room.enemy.currentHP <= 0) {
        results.push({ type: 'victory', message: `${room.enemy.name} is defeated!` });
        sounds.push('enemyDefeated');
        this.awardTreasure(player, room, results);
      } else {
        // Enemy counter-attack
        const counter = Math.max(1, (room.enemy.attack || 1) - (player.hero.defense || 0));
        player.hero.currentHealth = Math.max(0, player.hero.currentHealth - counter);
        results.push({ type: 'damage', message: `${room.enemy.name} counters for ${counter} damage!` });
        animations.push('damage');
        sounds.push('enemyHit');
      }
    } else {
      results.push({ type: 'info', message: 'No enemy to attack.' });
    }
  }

  handleDefend(results, animations, sounds) {
    const player = this.state.players[this.state.currentPlayer];
    player.hero.statusEffects = player.hero.statusEffects || [];
    player.hero.statusEffects.push({ type: 'defending', duration: 1 });
    results.push({ type: 'buff', message: `${player.name} braces for impact!` });
    animations.push('heal');
    sounds.push('defend');
  }

  handleSpecial(results, animations, sounds) {
    const player = this.state.players[this.state.currentPlayer];
    const ability = player.hero.special;
    const cd = player.hero.cooldowns || {};

    if (cd[ability] > 0) {
      results.push({ type: 'info', message: 'Ability is on cooldown.' });
      return;
    }

    switch (ability) {
      case 'shield_wall':
        player.hero.statusEffects = player.hero.statusEffects || [];
        player.hero.statusEffects.push({ type: 'protected', duration: 1 });
        results.push({ type: 'buff', message: `${player.name} raises a Shield Wall!` });
        animations.push('heal');
        sounds.push('special');
        cd[ability] = 2;
        break;
      case 'arcane_blast':
        const room = this.state.rooms[this.state.currentRoom];
        if (room.enemy) {
          const dmg = 4 + (player.hero.spellPower || 0);
          room.enemy.currentHP = Math.max(0, room.enemy.currentHP - dmg);
          results.push({ type: 'damage', message: `${player.name} casts Arcane Blast for ${dmg} damage!` });
          animations.push('damage');
          sounds.push('magic');
          cd[ability] = 3;
        }
        break;
      case 'shadow_step':
        player.hero.statusEffects = player.hero.statusEffects || [];
        player.hero.statusEffects.push({ type: 'stealth', duration: 2 });
        results.push({ type: 'buff', message: `${player.name} vanishes into the shadows!` });
        animations.push('heal');
        sounds.push('special');
        cd[ability] = 2;
        break;
      case 'divine_intervention':
        player.hero.currentHealth = Math.min(player.hero.maxHealth, player.hero.currentHealth + 4);
        results.push({ type: 'heal', message: `${player.name} invokes Divine Intervention!` });
        animations.push('heal');
        sounds.push('heal');
        cd[ability] = 2;
        break;
    }

    player.hero.cooldowns = cd;
  }

  handlePass(results) {
    const player = this.state.players[this.state.currentPlayer];
    results.push({ type: 'info', message: `${player.name} passes their turn.` });
  }

  handlePlayCard(data, results, animations, sounds) {
    const player = this.state.players[this.state.currentPlayer];
    const room = this.state.rooms[this.state.currentRoom];

    const cardIndex = typeof data.cardIndex === 'number' 
      ? data.cardIndex 
      : player.hand.findIndex(c => c.id === data.cardId);

    if (cardIndex < 0) {
      results.push({ type: 'info', message: 'Card not found.' });
      return;
    }

    const card = player.hand[cardIndex];

    // Mana cost validation
    if ((player.hero.currentMana || 0) < (card.manaCost || data.manaCost || 0)) {
      results.push({ type: 'info', message: 'Not enough mana.' });
      return;
    }

    // Spend mana
    player.hero.currentMana -= (card.manaCost || data.manaCost || 0);

    // Apply card effect
    switch (card.type) {
      case 'spell':
        this.applySpell(card, player, room, data, results, animations, sounds);
        break;
      case 'equipment':
        player.hero.equipment = player.hero.equipment || {};
        if (card.slot) {
          player.hero.equipment[card.slot] = { name: card.name, effect: card.effect };
        }
        results.push({ type: 'buff', message: `${player.name} equips ${card.name}.` });
        sounds.push('equip');
        break;
      case 'event':
        results.push({ type: 'info', message: `${player.name} triggers ${card.name}.` });
        break;
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);

    // Draw a new card (simplified)
    player.hand.push(this.drawCard());
  }

  applySpell(card, player, room, data, results, animations, sounds) {
    const school = card.school || 'arcane';
    this.state.spellCombo.push(school);

    switch (school) {
      case 'fire':
        if (room.enemy) {
          const dmg = 3 + (player.hero.spellPower || 0);
          room.enemy.currentHP = Math.max(0, room.enemy.currentHP - dmg);
          results.push({ type: 'damage', message: `${player.name} casts Fireball for ${dmg} damage!` });
          animations.push('damage');
          sounds.push('spellFire');
          // Ignite effect (DOT)
          room.enemy.statusEffects = room.enemy.statusEffects || [];
          room.enemy.statusEffects.push({ type: 'ignite', duration: 2 });
        }
        break;
      case 'ice':
        if (room.enemy) {
          const dmg = 2 + (player.hero.spellPower || 0);
          room.enemy.currentHP = Math.max(0, room.enemy.currentHP - dmg);
          results.push({ type: 'damage', message: `${player.name} casts Ice Shard for ${dmg} damage!` });
          animations.push('damage');
          sounds.push('spellIce');
          // Slow effect
          room.enemy.statusEffects = room.enemy.statusEffects || [];
          room.enemy.statusEffects.push({ type: 'slow', duration: 1 });
        }
        break;
      case 'nature':
        // Heal ally or self
        const targetIndex = typeof data.targetIndex === 'number' ? data.targetIndex : this.state.currentPlayer;
        const target = this.state.players[targetIndex];
        const healed = Math.min(target.hero.maxHealth, target.hero.currentHealth + 3) - target.hero.currentHealth;
        target.hero.currentHealth += healed;
        results.push({ type: 'heal', message: `${player.name} casts Nature's Grace and heals ${target.name} for ${healed}!` });
        animations.push('heal');
        sounds.push('spellHeal');
        break;
      case 'shadow':
        if (room.enemy) {
          const dmg = 3 + (player.hero.spellPower || 0);
          room.enemy.currentHP = Math.max(0, room.enemy.currentHP - dmg);
          results.push({ type: 'damage', message: `${player.name} casts Shadow Strike for ${dmg} damage!` });
          animations.push('damage');
          sounds.push('spellShadow');
          room.enemy.statusEffects = room.enemy.statusEffects || [];
          room.enemy.statusEffects.push({ type: 'poison', duration: 2 });
        }
        break;
      case 'light':
        // Blessing buff
        this.state.players.forEach(p => {
          p.hero.statusEffects = p.hero.statusEffects || [];
          p.hero.statusEffects.push({ type: 'blessing', duration: 2 });
        });
        results.push({ type: 'buff', message: `${player.name} casts Blessing. The party is empowered!` });
        animations.push('heal');
        sounds.push('spellLight');
        break;
      default:
        results.push({ type: 'info', message: `${player.name} channels arcane power.` });
        sounds.push('magic');
    }

    // Check combo (2 spells of same school in round)
    const comboCount = this.state.spellCombo.filter(s => s === school).length;
    if (comboCount >= 2) {
      results.push({ type: 'combo', message: `Spell combo activated: ${school.toUpperCase()}!` });
      sounds.push('combo');
      // Apply enhanced effect
      if (school === 'fire' && room.enemy) {
        room.enemy.statusEffects.push({ type: 'intense_burn', duration: 2 });
      }
    }
  }

  awardTreasure(player, room, results) {
    const reward = (room.rewards && room.rewards[0]?.amount) || 1;
    player.hero.treasure = (player.hero.treasure || 0) + reward;
    results.push({ type: 'reward', message: `${player.name} finds ${reward} treasure!` });
  }

  drawCard() {
    // Minimal card generator for MVP
    const pool = [
      { id: `atk_${Date.now()}`, name: 'Strike', type: 'spell', school: 'fire', manaCost: 1, icon: '🔥' },
      { id: `ice_${Date.now()}`, name: 'Ice Shard', type: 'spell', school: 'ice', manaCost: 1, icon: '❄️' },
      { id: `nat_${Date.now()}`, name: "Nature's Grace", type: 'spell', school: 'nature', manaCost: 1, icon: '🌿' },
      { id: `shd_${Date.now()}`, name: 'Shadow Strike', type: 'spell', school: 'shadow', manaCost: 1, icon: '🗡️' },
      { id: `lgt_${Date.now()}`, name: 'Blessing', type: 'spell', school: 'light', manaCost: 1, icon: '✨' },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  checkRoomState(results, animations, sounds) {
    const room = this.state.rooms[this.state.currentRoom];

    // If enemy dead → mark room complete, go next
    if (room.enemy && room.enemy.currentHP <= 0) {
      room.completed = true;
      results.push({ type: 'info', message: `${room.name} cleared!` });
      sounds.push('roomClear');

      if (this.state.currentRoom < this.state.rooms.length - 1) {
        this.state.currentRoom++;
        results.push({ type: 'info', message: `Entering ${this.state.rooms[this.state.currentRoom].name}...` });
        sounds.push('roomTransition');
      } else {
        // Dungeon complete
        this.state.status = 'completed';
        results.push({ type: 'victory', message: 'The Ancient Dragon falls! Dungeon complete!' });
        sounds.push('victory');
      }
    }

    // Check party defeat
    const alive = this.state.players.some(p => p.hero.currentHealth > 0);
    if (!alive) {
      this.state.status = 'completed';
      results.push({ type: 'defeat', message: 'All heroes have fallen. The dungeon claims another party.' });
      sounds.push('defeat');
    }
  }

  advanceTurn() {
    // Reduce cooldowns and tick effects for current player
    const player = this.state.players[this.state.currentPlayer];
    if (player?.hero) {
      const cd = player.hero.cooldowns || {};
      Object.keys(cd).forEach(k => { if (cd[k] > 0) cd[k]--; });
      player.hero.cooldowns = cd;

      // Tick status effects
      player.hero.statusEffects = (player.hero.statusEffects || []).reduce((acc, eff) => {
        if (eff.duration > 0) {
          eff.duration--;
          if (eff.duration > 0) acc.push(eff);
        } else if (eff.duration === -1) {
          acc.push(eff); // Permanent
        }
        return acc;
      }, []);

      // Regenerate mana
      player.hero.currentMana = Math.min(player.hero.maxMana, (player.hero.currentMana || 0) + 1);
    }

    // Next player
    this.state.currentPlayer = (this.state.currentPlayer + 1) % this.state.players.length;

    // Turn/round tracking
    this.state.turnCounter++;
    if (this.state.currentPlayer === 0) {
      this.state.roundCounter++;
      this.state.spellCombo = [];
    }
  }
}
