/**
 * Pomodoro Ayarlar Yöneticisi
 * Uygulama ayarlarını yönetir
 */

class SettingsManager {
    constructor() {
        // Varsayılan ayarlar
        this.defaultSettings = {
            pomodoroDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            alarmSound: 'bell',
            alarmVolume: 50,
            tickingEnabled: false,
            tickingVolume: 20,
            darkMode: false
        };
        
        // UI Referansları
        this.settingsForm = {
            pomodoroDuration: document.getElementById('pomodoro-duration'),
            shortBreakDuration: document.getElementById('short-break-duration'),
            longBreakDuration: document.getElementById('long-break-duration'),
            longBreakInterval: document.getElementById('long-break-interval'),
            autoStartBreaks: document.getElementById('auto-start-breaks'),
            autoStartPomodoros: document.getElementById('auto-start-pomodoros'),
            alarmSound: document.getElementById('alarm-sound'),
            alarmVolume: document.getElementById('alarm-volume'),
            tickingEnabled: document.getElementById('ticking-enabled'),
            tickingVolume: document.getElementById('ticking-volume'),
            testSoundBtn: document.getElementById('test-sound-btn'),
            saveBtn: document.getElementById('save-settings-btn'),
            resetBtn: document.getElementById('reset-settings-btn'),
            themeSwitch: document.getElementById('theme-switch')
        };
        
        // Test ses objesi
        this.testSound = new Audio();
        
        // Ayarları yükle
        this.loadSettings();
        
        // Event listener'ları ekle
        this.initializeEvents();
    }
    
    /**
     * Event dinleyicileri başlatır
     */
    initializeEvents() {
        // Kaydet düğmesi
        this.settingsForm.saveBtn.addEventListener('click', this.saveSettings.bind(this));
        
        // Sıfırla düğmesi
        this.settingsForm.resetBtn.addEventListener('click', this.resetSettings.bind(this));
        
        // Test sesi düğmesi
        this.settingsForm.testSoundBtn.addEventListener('click', this.testSound.bind(this));
        
        // Tema değiştirme düğmesi
        this.settingsForm.themeSwitch.addEventListener('change', this.toggleTheme.bind(this));
    }
    
    /**
     * Ayarları yükler ve formu doldurur
     */
    loadSettings() {
        // Ayarları local storage'dan al
        const settings = PomodoroStorage.getSettings();
        
        // Form alanlarını doldur
        this.settingsForm.pomodoroDuration.value = settings.pomodoroDuration;
        this.settingsForm.shortBreakDuration.value = settings.shortBreakDuration;
        this.settingsForm.longBreakDuration.value = settings.longBreakDuration;
        this.settingsForm.longBreakInterval.value = settings.longBreakInterval;
        this.settingsForm.autoStartBreaks.checked = settings.autoStartBreaks;
        this.settingsForm.autoStartPomodoros.checked = settings.autoStartPomodoros;
        this.settingsForm.alarmSound.value = settings.alarmSound;
        this.settingsForm.alarmVolume.value = settings.alarmVolume;
        this.settingsForm.tickingEnabled.checked = settings.tickingEnabled;
        this.settingsForm.tickingVolume.value = settings.tickingVolume;
        this.settingsForm.themeSwitch.checked = settings.darkMode;
    }
    
    /**
     * Ayarları kaydeder
     */
    saveSettings() {
        // Form değerlerini al
        const settings = {
            pomodoroDuration: parseInt(this.settingsForm.pomodoroDuration.value, 10) || 25,
            shortBreakDuration: parseInt(this.settingsForm.shortBreakDuration.value, 10) || 5,
            longBreakDuration: parseInt(this.settingsForm.longBreakDuration.value, 10) || 15,
            longBreakInterval: parseInt(this.settingsForm.longBreakInterval.value, 10) || 4,
            autoStartBreaks: this.settingsForm.autoStartBreaks.checked,
            autoStartPomodoros: this.settingsForm.autoStartPomodoros.checked,
            alarmSound: this.settingsForm.alarmSound.value,
            alarmVolume: parseInt(this.settingsForm.alarmVolume.value, 10),
            tickingEnabled: this.settingsForm.tickingEnabled.checked,
            tickingVolume: parseInt(this.settingsForm.tickingVolume.value, 10),
            darkMode: this.settingsForm.themeSwitch.checked
        };
        
        // Ayarları kaydet
        PomodoroStorage.saveSettings(settings);
        
        // Zamanlayıcıyı güncelle
        if (window.pomodoroTimer) {
            window.pomodoroTimer.loadSettings();
            window.pomodoroTimer.resetTimer();
        }
        
        // Kullanıcıya bildir
        this.showNotification('Ayarlar kaydedildi!', 'Ayarlarınız başarıyla güncellendi.');
    }
    
    /**
     * Ayarları varsayılanlara sıfırlar
     */
    resetSettings() {
        // Varsayılan ayarları kaydet
        PomodoroStorage.saveSettings(this.defaultSettings);
        
        // Formu güncelle
        this.loadSettings();
        
        // Zamanlayıcıyı güncelle
        if (window.pomodoroTimer) {
            window.pomodoroTimer.loadSettings();
            window.pomodoroTimer.resetTimer();
        }
        
        // Temayı güncelle
        this.applyTheme(this.defaultSettings.darkMode);
        
        // Kullanıcıya bildir
        this.showNotification('Ayarlar sıfırlandı!', 'Ayarlarınız varsayılan değerlere döndürüldü.');
    }
    
    /**
     * Test sesi çalar
     */
    testSound() {
        const soundName = this.settingsForm.alarmSound.value;
        const volume = parseInt(this.settingsForm.alarmVolume.value, 10) / 100;
        const sounds = {
            bell: 'assets/sounds/bell.mp3',
            digital: 'assets/sounds/digital.mp3',
            kitchen: 'assets/sounds/kitchen.mp3',
            wood: 'assets/sounds/wood.mp3'
        };
        
        // Ses dosyasını ayarla
        this.testSound.src = sounds[soundName] || sounds.bell;
        this.testSound.volume = volume;
        
        // Sesi çal
        this.testSound.play().catch(e => console.error('Test sesi çalınamadı:', e));
    }
    
    /**
     * Tema değiştirir
     */
    toggleTheme() {
        const darkMode = this.settingsForm.themeSwitch.checked;
        this.applyTheme(darkMode);
        
        // Tema ayarını kaydet
        const settings = PomodoroStorage.getSettings();
        settings.darkMode = darkMode;
        PomodoroStorage.saveSettings(settings);
    }
    
    /**
     * Temayı uygular
     * @param {boolean} darkMode - Karanlık mod aktif mi?
     */
    applyTheme(darkMode) {
        if (darkMode) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }
    }
    
    /**
     * Bildirim gösterir
     * @param {string} title - Bildirim başlığı
     * @param {string} message - Bildirim mesajı
     */
    showNotification(title, message) {
        // Hem bir alert gösterelim hem de tarayıcı bildirimi
        alert(`${title} ${message}`);
        
        // Tarayıcı bildirimi
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'assets/icons/pomodoro-icon.png'
            });
        }
    }
}

// DOM yüklendiğinde SettingsManager nesnesini oluştur
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});