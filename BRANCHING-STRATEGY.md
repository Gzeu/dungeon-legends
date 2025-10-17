# 🌿 Dungeon Legends - Branching Strategy

> **Professional Git workflow with automated synchronization and deployment pipelines**

## 🏗️ **Branch Architecture**

### 📊 **Main Branches**

```
🌳 Repository Structure
├── main                    # 🚀 Production (GitHub Pages)
├── develop                 # 🔄 Integration & Testing
├── feature/vercel-mvp-rpg  # ☁️ Vercel Deployment
├── feature/advanced-ui     # 🎨 UI/UX Enhancements 
└── feature/graphics-expansion # 🖼️ Visual Assets
```

### 🎯 **Branch Purposes**

| Branch | Purpose | Deployment | Auto-Sync |
|--------|---------|------------|----------|
| **main** | 🌍 Production-ready code | GitHub Pages | ➖ |
| **develop** | 🔄 Integration & testing | Preview | ✅ from main |
| **feature/*** | 🔧 Feature development | Preview | ✅ from develop |
| **hotfix/*** | 🔥 Critical fixes | Immediate | ✅ to main+develop |

## 🔄 **Workflow Process**

### 1. **Feature Development**
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-awesome-feature

# Develop and commit changes
git add .
git commit -m "feat: Add awesome new feature"
git push origin feature/new-awesome-feature

# Create Pull Request to develop
```

### 2. **Integration Testing**
```bash
# Merge to develop for integration testing
# CI/CD runs automated tests
# Deploy preview version for testing
```

### 3. **Production Release**
```bash
# After testing, merge develop to main
git checkout main
git pull origin main
git merge develop --no-ff -m "release: Version X.Y.Z"
git push origin main

# Automatic deployment to production
```

## 🤖 **Automated Synchronization**

### ⚡ **CI/CD Pipeline Features**

- **📋 Quality Checks:** HTML validation, CSS linting, JS checks
- **📱 PWA Audit:** Lighthouse performance monitoring  
- **🚀 Auto-Deploy:** GitHub Pages + Vercel deployments
- **🔄 Branch Sync:** Automatic merge from main to develop
- **🏷️ Auto-Tagging:** Version releases with timestamps
- **📈 Monitoring:** Performance and accessibility tracking

### 🎯 **Sync Rules**

1. **main → develop:** ✅ Auto-sync after every main deployment
2. **main → feature/vercel-mvp-rpg:** ✅ Auto-sync latest updates
3. **develop → feature/*:** 🔄 Manual or on-demand
4. **hotfix/* → main + develop:** ⚡ Immediate sync

## 🛡️ **Branch Protection**

### 🔒 **Protection Rules**

#### **main branch:**
- 🚫 Direct pushes blocked
- 📋 Require PR reviews (1+ approvals)
- ✅ Require status checks to pass
- 🔄 Require branches to be up to date
- 💼 Require linear history

#### **develop branch:**
- 📋 Require PR reviews (optional)
- ✅ Require status checks to pass
- 🔄 Allow force pushes (for integration)

## 🚀 **Deployment Strategy**

### 🌍 **Production Deployments**

```yaml
main branch:
  triggers: [push, merge]
  deployments:
    - GitHub Pages: https://gzeu.github.io/dungeon-legends/
    - Vercel Production: https://dungeon-legends.vercel.app/
  
develop branch:
  triggers: [push, PR]
  deployments:
    - Vercel Preview: https://dungeon-legends-dev.vercel.app/
    - GitHub Actions Preview
    
feature/* branches:
  triggers: [push, PR to develop]
  deployments:
    - Vercel Branch Preview: https://feature-branch.vercel.app/
```

### 📦 **Release Process**

1. **📝 Feature Complete:** All features merged to develop
2. **🧪 Testing Phase:** Comprehensive testing on develop branch
3. **📄 Release PR:** Create PR from develop to main
4. **🔍 Code Review:** Team review and approval
5. **🏷️ Release Tag:** Auto-generated version tag
6. **🚀 Deployment:** Automatic production deployment
7. **📊 Monitoring:** Post-deployment health checks

## 📋 **Development Guidelines**

### 💻 **Commit Conventions**

```bash
feat: Add new game feature
fix: Fix critical bug in combat system  
docs: Update README with new instructions
style: Improve CSS animations
refactor: Reorganize game engine code
test: Add unit tests for hero system
chore: Update dependencies
```

### 🔧 **Local Development Setup**

```bash
# Clone and setup
git clone https://github.com/Gzeu/dungeon-legends.git
cd dungeon-legends

# Setup branch tracking
git branch --set-upstream-to=origin/main main
git branch --set-upstream-to=origin/develop develop

# Create feature branch
git checkout develop
git checkout -b feature/my-awesome-feature

# Development workflow
npm run dev        # Start local server
npm run test       # Run tests
npm run build      # Build for production
npm run deploy     # Deploy to staging
```

## 🎯 **Branch Status Overview**

### ✅ **Current Status**

- **main:** 🌍 Production-ready with landing page + game
- **develop:** 🔄 Integration branch (newly created)
- **feature/vercel-mvp-rpg:** 🔧 Needs sync with main updates
- **feature/advanced-ui:** 🎨 UI enhancements in progress
- **feature/graphics-expansion:** 🖼️ Graphics improvements

### 🎯 **Next Actions**

1. **🔄 Sync feature/vercel-mvp-rpg** with latest main changes
2. **🔍 Review and merge** feature branches to develop
3. **🚀 Test integration** on develop branch
4. **🏷️ Create release** from develop to main

## 🛠️ **Tools & Automation**

### 🤖 **GitHub Actions**
- **CI/CD Pipeline:** `.github/workflows/ci-cd.yml`
- **Quality Gates:** HTML, CSS, JS validation
- **PWA Audits:** Lighthouse performance testing
- **Auto-Deployment:** GitHub Pages + Vercel
- **Branch Sync:** Automated merging
- **Release Management:** Auto-tagging and changelogs

### 📊 **Monitoring**
- **Performance:** Lighthouse CI reports
- **Uptime:** Deployment health checks  
- **Quality:** Code coverage and metrics
- **Security:** Dependency vulnerability scanning

---

<div align="center">

**🏰 Dungeon Legends Professional Development Workflow**

*Automated • Synchronized • Production-Ready*

</div>