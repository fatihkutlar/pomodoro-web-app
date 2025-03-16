/**
 * Pomodoro Zamanlayıcı Uygulaması
 * Ana Uygulama Başlatma ve Koordinasyon
 */

// Uygulama modüllerini toplayan ana sınıf
class PomodoroApp {
    constructor() {
        this.initializeTheme();
        this.initializeGlobalListeners();
    }
    
    /**
     * Sayfa yüklendiğinde temayı ayarlar
     */
    initializeTheme() {
        // Kaydedilmiş tema ayarını kontrol et
        try {
            const settings = PomodoroStorage.getSettings();
            if (settings.darkMode) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            }
            
            // Mod bilgisini body'e ekle (zamanlayıcı rengi için)
            document.body.setAttribute('data-mode', 'pomodoro');
        } catch (error) {
            console.error('Tema ayarları yüklenemedi:', error);
            // Tarayıcı tercihini kontrol et
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.add('light-theme');
            }
        }
    }
    
    /**
     * Global event listener'ları başlatır
     */
    initializeGlobalListeners() {
        // Klavye kısayolları
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Tarayıcı bildirim izni talep et
        this.requestNotificationPermission();
    }
    
    /**
     * Klavye kısayollarını yönetir
     * @param {KeyboardEvent} event - Klavye olayı
     */
    handleKeyboardShortcuts(event) {
        // Ctrl + Alt + P = Pomodoro başlat/durdur
        if (event.ctrlKey && event.altKey && event.key === 'p') {
            event.preventDefault();
            this.toggleTimer();
        }
        
        // Ctrl + Alt + R = Zamanlayıcıyı sıfırla
        if (event.ctrlKey && event.altKey && event.key === 'r') {
            event.preventDefault();
            if (window.pomodoroTimer) {
                window.pomodoroTimer.resetTimer();
            }
        }
        
        // Ctrl + Alt + 1 = Pomodoro moduna geç
        if (event.ctrlKey && event.altKey && event.key === '1') {
            event.preventDefault();
            if (window.pomodoroTimer) {
                window.pomodoroTimer.changeMode('pomodoro');
            }
        }
        
        // Ctrl + Alt + 2 = Kısa mola moduna geç
        if (event.ctrlKey && event.altKey && event.key === '2') {
            event.preventDefault();
            if (window.pomodoroTimer) {
                window.pomodoroTimer.changeMode('shortBreak');
            }
        }
        
        // Ctrl + Alt + 3 = Uzun mola moduna geç
        if (event.ctrlKey && event.altKey && event.key === '3') {
            event.preventDefault();
            if (window.pomodoroTimer) {
                window.pomodoroTimer.changeMode('longBreak');
            }
        }
        
        // Ctrl + Alt + T = Yeni görev ekle
        if (event.ctrlKey && event.altKey && event.key === 't') {
            event.preventDefault();
            if (window.taskManager) {
                window.taskManager.showTaskForm();
            }
        }
    }
    
    /**
     * Zamanlayıcıyı başlatma/durdurma arasında geçiş yapar
     */
    toggleTimer() {
        if (!window.pomodoroTimer) return;
        
        if (window.pomodoroTimer.isRunning) {
            window.pomodoroTimer.pauseTimer();
        } else {
            window.pomodoroTimer.startTimer();
        }
    }
    
    /**
     * Bildirim izni ister
     */
    requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                // Bildirim izni talep et
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showWelcomeNotification();
                    }
                });
            } else if (Notification.permission === 'granted') {
                // Zaten izin verilmiş
                this.showWelcomeNotification();
            }
        }
    }
    
    /**
     * Hoş geldin bildirimi gösterir
     */
    showWelcomeNotification() {
        // İlk kez giriş yapıldıysa bildirimi göster
        const hasShownWelcome = localStorage.getItem('welcomeNotificationShown');
        
        if (!hasShownWelcome) {
            const notification = new Notification('Pomodoro Zamanlayıcı Hazır!', {
                body: 'Pomodoro tekniğiyle üretkenliğinizi artırın. Zamanlayıcıyı başlatmak için tıklayın.',
                icon: 'assets/icons/pomodoro-icon.png'
            });
            
            // Bildirime tıklandığında
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            // Bildirimin gösterildiğini kaydet
            localStorage.setItem('welcomeNotificationShown', 'true');
        }
    }
}

// DOM yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroApp = new PomodoroApp();
    
    // Gerekli diğer bileşenler Timer, TaskManager, SettingsManager
    // ve StatisticsManager gibi modüller tarafından oluşturulur
});