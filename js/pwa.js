// PWA Manager - Fixed Install Button
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInitialized = false;
        
        // Initialize after DOM is ready
        this.init();
    }

    init() {
        try {
            // Find install button
            this.installButton = document.getElementById('install-pwa');
            
            if ('serviceWorker' in navigator) {
                this.registerServiceWorker();
            }
            
            this.setupInstallPrompt();
            this.isInitialized = true;
            console.log('PWA Manager initialized');
        } catch (error) {
            console.error('PWA Manager initialization failed:', error);
        }
    }

    registerServiceWorker() {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        if (this.installButton) {
            this.installButton.addEventListener('click', () => {
                this.installApp();
            });
        }

        window.addEventListener('appinstalled', (evt) => {
            console.log('App installed');
            this.hideInstallButton();
            this.deferredPrompt = null;
        });

        // Hide install button if already in standalone mode
        if (this.isStandalone()) {
            this.hideInstallButton();
        }
    }

    showInstallButton() {
        try {
            if (this.installButton) {
                this.installButton.classList.remove('hidden');
                console.log('Install button shown');
            }
        } catch (error) {
            console.error('Error showing install button:', error);
        }
    }

    hideInstallButton() {
        try {
            if (this.installButton) {
                this.installButton.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error hiding install button:', error);
        }
    }

    async installApp() {
        try {
            if (!this.deferredPrompt) {
                console.log('No deferred prompt available');
                return;
            }

            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`User ${outcome} the install prompt`);
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        } catch (error) {
            console.error('Error installing app:', error);
        }
    }

    isStandalone() {
        return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
               (window.navigator && window.navigator.standalone);
    }

    getInstallStatus() {
        return {
            canInstall: !!this.deferredPrompt,
            isInstalled: this.isStandalone(),
            supportsServiceWorker: 'serviceWorker' in navigator,
            isInitialized: this.isInitialized
        };
    }
}

// Make PWAManager available globally
window.PWAManager = PWAManager;