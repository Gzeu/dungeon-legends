# 🏰 Dungeon Legends - Dark Gothic Card Game

A dark fantasy dungeon crawler card game for 2-4 players, built with HTML5, CSS3, and JavaScript. Perfect for GitHub Pages deployment with PWA capabilities!

## 🎮 Game Features

### Dark Gothic Theme
- **Atmospheric Design**: Torch-lit dungeons, stone textures, and medieval aesthetics
- **Gothic Typography**: Cinzel font family for authentic fantasy feel
- **Immersive Audio**: Combat sounds, card flips, and treasure collection
- **Responsive UI**: Optimized for desktop, tablet, and mobile devices

### Gameplay
- **2-4 Players**: Pass-and-play multiplayer on single device
- **5 Dungeon Rooms**: Progress through increasingly dangerous encounters
- **4 Unique Heroes**: Knight, Wizard, Rogue, and Cleric with special abilities
- **Cooperative & Competitive**: Choose your preferred game mode
- **Strategic Combat**: Turn-based battles with resource management

## 🗡️ Heroes & Abilities

| Hero | Health | Special Ability | Description |
|------|--------|----------------|-------------|
| 🛡️ **Knight** | 8 HP | Shield Wall | +2 Defense, can protect other players |
| 🧙 **Wizard** | 5 HP | Fireball | +3 Spell damage, area effects |
| 🗡️ **Rogue** | 6 HP | Stealth Strike | +1 Treasure, bypass traps automatically |
| ⛪ **Cleric** | 7 HP | Divine Healing | +2 Heal power, can revive allies |

## 🏰 Dungeon Rooms

1. **🚪 Entrance Hall** - Safe start, draw extra card
2. **👹 Goblin Warren** - Combat: Goblin (2HP/1ATK), reward: 1 treasure
3. **⚡ Trap Chamber** - Challenge: Discard 2 cards OR take damage, reward: 2 treasure
4. **💰 Treasure Vault** - Combat: Orc Guardian (4HP/2ATK), reward: 3 treasure
5. **🐉 Dragon's Lair** - Boss: Ancient Dragon (10HP/3ATK), Fire Breath AoE

## 🎯 How to Play

### Setup
1. Select number of players (2-4)
2. Choose game mode (Cooperative or Competitive)
3. Each player selects a unique hero
4. Start your dungeon adventure!

### Gameplay
- **Turns**: Players take turns performing actions
- **Actions**: Attack, Defend, Use Special Ability, or Pass
- **Combat**: Deal damage to monsters based on hero stats
- **Challenges**: Navigate traps and obstacles
- **Progression**: Clear rooms to advance through the dungeon

### Victory Conditions
- **Cooperative**: All players survive and defeat the Dragon
- **Competitive**: Player with most treasure when Dragon falls wins

## 💻 Technical Features

### Modern Web Technologies
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Grid/Flexbox layout, animations, responsive design
- **JavaScript ES6+**: Modern syntax, classes, modules
- **Web Audio API**: Dynamic sound effects
- **Local Storage**: Save high scores and game state

### PWA (Progressive Web App)
- **Offline Ready**: Service Worker caching for offline play
- **Installable**: Add to home screen on mobile devices
- **Responsive**: Adapts to any screen size and orientation
- **Fast Loading**: Optimized assets and lazy loading

### GitHub Pages Optimized
- **Static Hosting**: No backend required, 100% client-side
- **Small Bundle**: Optimized for fast loading and minimal bandwidth
- **Cross-Browser**: Compatible with modern browsers
- **Mobile First**: Touch-optimized interface

## 🚀 Play Now!

**[🎮 Play Dungeon Legends](https://gzeu.github.io/dungeon-legends/)**

*Works on desktop, tablet, and mobile. Install as PWA for offline play!*

## 🛠️ Development

### Local Setup
```bash
# Clone the repository
git clone https://github.com/Gzeu/dungeon-legends.git

# Navigate to project directory
cd dungeon-legends

# Serve locally (Python 3)
python -m http.server 8000

# Or use any static file server
# npx serve .
# php -S localhost:8000
```

### File Structure
```
dungeon-legends/
├── index.html              # Main game HTML
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker
├── css/
│   ├── styles.css          # Base styles
│   ├── themes.css          # Dark Gothic theme
│   ├── animations.css      # CSS animations
│   └── responsive.css      # Responsive design
├── js/
│   ├── main.js             # UI controller
│   ├── game-engine.js      # Core game logic
│   ├── heroes.js           # Hero definitions
│   ├── cards.js            # Room and card data
│   ├── audio.js            # Audio management
│   └── pwa.js              # PWA functionality
└── README.md               # This file
```

## 🧪 Quality Assurance Checklist

### Performance
- [x] LCP (Largest Contentful Paint) < 2.5s on mobile
- [x] JavaScript bundle < 300KB minified
- [x] Images optimized (WebP format recommended)
- [x] Lazy loading implemented for non-critical assets
- [x] Service Worker caching active

### Compatibility
- [x] Chrome, Firefox, Safari, Edge (last 2 versions)
- [x] iOS Safari and Android Chrome
- [x] Touch interactions work on mobile
- [x] Keyboard navigation functional
- [x] Screen reader accessibility

### Functionality  
- [x] 2-4 player setup works correctly
- [x] All hero abilities function as intended
- [x] Room progression and combat system
- [x] Cooperative and competitive modes
- [x] High score persistence in LocalStorage
- [x] Game state save/load functionality

### PWA Requirements
- [x] Service Worker registers and caches assets
- [x] Manifest file validates
- [x] "Add to Home Screen" prompt appears on mobile
- [x] App works offline after initial load
- [x] Icons display correctly in app switcher

### GitHub Pages
- [x] All asset paths relative or absolute from root
- [x] No server-side dependencies
- [x] 404 page or fallback handling
- [x] Repository size under 1GB
- [x] No files over 100MB

## 🎨 Customization

### Themes
The game uses CSS custom properties for easy theming:

```css
:root {
    --color-primary: #8B4513;    /* Brown */
    --color-secondary: #696969;  /* Gray */
    --color-accent: #FF4500;     /* Orange */
    --color-bg: #2F2F2F;         /* Dark Gray */
    --color-card: #404040;       /* Charcoal */
    --color-text: #D3D3D3;       /* Light Gray */
}
```

### Adding New Heroes
1. Add hero definition to `js/heroes.js`
2. Update hero selection UI in `index.html`
3. Add hero card styles in `css/styles.css`

### Adding New Rooms
1. Add room data to `js/cards.js` ROOMS array
2. Update room progression logic if needed
3. Add new encounter types in game engine

## 🔧 Development Roadmap

### Phase 1: MVP Complete ✅
- [x] Core game mechanics
- [x] Dark Gothic theme
- [x] PWA functionality
- [x] GitHub Pages deployment

### Phase 2: Enhanced Multiplayer
- [ ] WebRTC peer-to-peer online multiplayer
- [ ] Room codes for remote play
- [ ] Real-time game state synchronization
- [ ] Chat functionality

### Phase 3: Extended Content
- [ ] Additional hero classes
- [ ] More dungeon rooms and encounters
- [ ] Daily challenges and achievements
- [ ] Customizable difficulty levels

### Phase 4: Polish & Features
- [ ] Enhanced animations and particle effects
- [ ] Background music and ambient sounds
- [ ] Tutorial system for new players
- [ ] Statistics tracking and analytics

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|----------|
| Chrome | 80+ | ✅ Full |
| Firefox | 75+ | ✅ Full |
| Safari | 13+ | ✅ Full |
| Edge | 80+ | ✅ Full |
| iOS Safari | 13+ | ✅ Mobile |
| Android Chrome | 80+ | ✅ Mobile |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

### Assets & Credits
- **Fonts**: Google Fonts (Cinzel family) - Open Font License
- **Icons**: Unicode emoji characters - No license required
- **Sounds**: Web Audio API generated tones - Original creation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports & Features

Please use GitHub Issues to report bugs or request features:
- **Bug Report**: Include browser, device, and steps to reproduce
- **Feature Request**: Describe the feature and its benefits
- **Performance**: Include device specs and performance metrics

## 💡 Tips for Players

### Strategy Tips
- **Cooperative Mode**: Focus on keeping all players alive
- **Competitive Mode**: Balance helping others with collecting treasure
- **Hero Synergy**: Combine abilities (Cleric healing, Knight protection)
- **Resource Management**: Save special abilities for tough encounters

### Technical Tips
- **Mobile Play**: Use landscape mode for better visibility
- **Performance**: Close other browser tabs for smoother gameplay
- **Offline**: Install as PWA for offline play anywhere
- **Saves**: Game auto-saves progress to localStorage

---

**Enjoy your dark dungeon adventure! 🗡️⚔️🏰**

For support or questions, please open an issue on GitHub.