// PWA functionality
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = document.getElementById('install-pwa');
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
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
        });

        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.hideInstallButton();
        }
    }

    showInstallButton() {
        if (this.installButton) {
            this.installButton.classList.remove('hidden');
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.classList.add('hidden');
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
    }

    isStandalone() {
        return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    }

    getInstallStatus() {
        return {
            canInstall: !!this.deferredPrompt,
            isInstalled: this.isStandalone(),
            supportsServiceWorker: 'serviceWorker' in navigator
        };
    }
}