/**
 * Pomodoro Zamanlayıcı Yöneticisi
 * Ana zamanlayıcı işlevselliğini kontrol eder
 */

class Timer {
    constructor() {
        // Timer durumu
        this.isRunning = false;
        this.mode = 'pomodoro'; // pomodoro, shortBreak, longBreak
        this.timeLeft = 0; // Saniye cinsinden kalan süre
        this.totalTime = 0; // Toplam süre
        this.interval = null; // setInterval referansı
        this.pomodoroCount = 0; // Tamamlanan pomodoro sayısı
        
        // Audio nesneleri
        this.alarmSound = new Audio();
        this.tickingSound = new Audio();
        
        // Varsayılan sesler
        this.sounds = {
            bell: 'assets/sounds/bell.mp3',
            digital: 'assets/sounds/digital.mp3',
            kitchen: 'assets/sounds/kitchen.mp3',
            wood: 'assets/sounds/wood.mp3'
        };
        
        // UI Referansları
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.progressRing = document.querySelector('.progress-ring-circle');
        
        // Düğmeler
        this.startButton = document.getElementById('start-btn');
        this.pauseButton = document.getElementById('pause-btn');
        this.resetButton = document.getElementById('reset-btn');
        
        // Mod düğmeleri
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        // İstatistik alanları
        this.completedCountElement = document.getElementById('completed-count');
        this.todayCountElement = document.getElementById('today-count');
        this.weekCountElement = document.getElementById('week-count');
        this.monthCountElement = document.getElementById('month-count');
        
        // Bildirim izni kontrolü
        this.notificationsEnabled = false;
        this.requestNotificationPermission();
        
        // İlk ayarları yükle
        this.loadSettings();
        
        // İstatistikleri yükle
        this.updateStatistics();
        
        // Ses dosyalarını hazırla
        this.prepareAudio();
        
        // UI eventlerini başlat
        this.initializeEvents();
        
        // Zamanlayıcıyı başlat
        this.resetTimer();
    }
    
    /**
     * Zamanlayıcı ayarlarını yükler
     */
    loadSettings() {
        // Local Storage'dan ayarları al
        const settings = PomodoroStorage.getSettings();
        
        // Süreleri dakikadan saniyeye çevir
        this.durations = {
            pomodoro: settings.pomodoroDuration * 60,
            shortBreak: settings.shortBreakDuration * 60,
            longBreak: settings.longBreakDuration * 60
        };
        
        // Diğer ayarlar
        this.longBreakInterval = settings.longBreakInterval;
        this.autoStartBreaks = settings.autoStartBreaks;
        this.autoStartPomodoros = settings.autoStartPomodoros;
        this.alarmSoundName = settings.alarmSound;
        this.alarmVolume = settings.alarmVolume / 100;
        this.tickingEnabled = settings.tickingEnabled;
        this.tickingVolume = settings.tickingVolume / 100;
        
        // Pomodoro sayısını yükle
        this.pomodoroCount = PomodoroStorage.getCompletedPomodoros();
        this.updateCompletedCount();
        
        // Ses dosyalarını güncelle
        this.prepareAudio();
    }
    
    /**
     * Audio nesnelerini hazırlar
     */
    prepareAudio() {
        // Ses dosyaları hazırla
        const alarmSoundPath = this.sounds[this.alarmSoundName] || this.sounds.bell;
        this.alarmSound.src = alarmSoundPath;
        this.alarmSound.volume = this.alarmVolume;
        
        this.tickingSound.src = 'assets/sounds/ticking.mp3';
        this.tickingSound.loop = true;
        this.tickingSound.volume = this.tickingVolume;
    }
    
    /**
     * Bildirim izni iste
     */
    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.notificationsEnabled = permission === 'granted';
            });
        }
    }
    
    /**
     * UI eventlerini başlatır
     */
    initializeEvents() {
        // Başlat butonu
        this.startButton.addEventListener('click', () => this.startTimer());
        
        // Duraklat butonu
        this.pauseButton.addEventListener('click', () => this.pauseTimer());
        
        // Sıfırla butonu
        this.resetButton.addEventListener('click', () => this.resetTimer());
        
        // Mod düğmeleri
        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.getAttribute('data-mode');
                this.changeMode(mode);
            });
        });
    }
    
    /**
     * Zamanlayıcıyı başlatır
     */
    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startButton.classList.add('hidden');
        this.pauseButton.classList.remove('hidden');
        
        // Tik tak sesi
        if (this.tickingEnabled) {
            this.tickingSound.play().catch(e => console.error('Tik tak sesi çalınamadı:', e));
        }
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            this.updateProgress();
            
            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }
    
    /**
     * Zamanlayıcıyı duraklatır
     */
    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
        this.pauseButton.classList.add('hidden');
        this.startButton.classList.remove('hidden');
        
        // Tik tak sesini durdur
        this.tickingSound.pause();
    }
    
    /**
     * Zamanlayıcıyı sıfırlar
     */
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.durations[this.mode];
        this.totalTime = this.timeLeft;
        this.updateTimerDisplay();
        this.updateProgress();
    }
    
    /**
     * Modu değiştirir
     * @param {string} mode - Yeni mod (pomodoro, shortBreak, longBreak)
     */
    changeMode(mode) {
        if (!['pomodoro', 'shortBreak', 'longBreak'].includes(mode)) return;
        
        try {
            // Eski aktif düğmeyi kaldır
            const activeBtn = document.querySelector(`.mode-btn.active`);
            if (activeBtn) {
                activeBtn.classList.remove('active');
            }
            
            // Yeni aktif düğmeyi ayarla
            const newActiveBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
            if (newActiveBtn) {
                newActiveBtn.classList.add('active');
            }
        } catch (error) {
            console.error('Mod düğmesi güncellenirken hata:', error);
        }
        
        // Modu değiştir
        this.mode = mode;
        
        // Body'ye mod veri özelliğini ekle
        document.body.setAttribute('data-mode', mode);
        
        // Zamanlayıcıyı sıfırla
        this.resetTimer();
    }
    
    /**
     * Zamanlayıcı tamamlandığında çağrılır
     */
    timerComplete() {
        this.pauseTimer();
        
        // Alarm sesini çal
        this.alarmSound.play().catch(e => console.error('Alarm sesi çalınamadı:', e));
        
        // Tarayıcı bildirimi gönder
        this.showNotification();
        
        // Mevcut mod pomodoro ise, sayacı artır
        if (this.mode === 'pomodoro') {
            this.pomodoroCount = PomodoroStorage.incrementCompletedPomodoros();
            this.updateCompletedCount();
            this.updateStatistics();
            
            // Uzun mola zamanı mı?
            const isLongBreakTime = this.pomodoroCount % this.longBreakInterval === 0;
            const nextMode = isLongBreakTime ? 'longBreak' : 'shortBreak';
            
            // Otomatik mola başlatma aktifse
            if (this.autoStartBreaks) {
                this.changeMode(nextMode);
                this.startTimer();
            } else {
                this.changeMode(nextMode);
            }
        } else {
            // Mola tamamlandı, pomodoro moduna geç
            if (this.autoStartPomodoros) {
                this.changeMode('pomodoro');
                this.startTimer();
            } else {
                this.changeMode('pomodoro');
            }
        }
    }
    
    /**
     * Tarayıcı bildirimi gösterir
     */
    showNotification() {
        if (!this.notificationsEnabled) return;
        
        let title, body;
        
        if (this.mode === 'pomodoro') {
            title = 'Pomodoro Tamamlandı!';
            body = 'Şimdi mola zamanı. Biraz dinlenin.';
        } else if (this.mode === 'shortBreak') {
            title = 'Kısa Mola Bitti!';
            body = 'Çalışmaya geri dönme zamanı.';
        } else {
            title = 'Uzun Mola Bitti!';
            body = 'Yeni bir pomodoro başlatmaya hazır mısınız?';
        }
        
        new Notification(title, {
            body: body,
            icon: 'assets/icons/pomodoro-icon.png'
        });
    }
    
    /**
     * Zamanlayıcı görüntüsünü günceller
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    /**
     * İlerleme halkasını günceller
     */
    updateProgress() {
        const progress = (this.timeLeft / this.totalTime);
        const circumference = parseFloat(this.progressRing.getAttribute('stroke-dasharray'));
        const offset = circumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    /**
     * Tamamlanan pomodoro sayısını günceller
     */
    updateCompletedCount() {
        if (this.completedCountElement) {
            this.completedCountElement.textContent = this.pomodoroCount;
        }
    }
    
    /**
     * İstatistik alanlarını günceller
     */
    updateStatistics() {
        // İstatistikleri güncelle
        if (this.todayCountElement) {
            this.todayCountElement.textContent = PomodoroStorage.getTodayPomodoros();
        }
        
        if (this.weekCountElement) {
            this.weekCountElement.textContent = PomodoroStorage.getWeekPomodoros();
        }
        
        if (this.monthCountElement) {
            this.monthCountElement.textContent = PomodoroStorage.getMonthPomodoros();
        }
    }
}

// Ses efektlerini önce yükle
const loadAudioFiles = () => {
    // Sesleri önceden yükle ve önbelleğe al
    const preloadAudio = (url) => {
        const audio = new Audio();
        audio.src = url;
    };
    
    // Ses dosyalarını önbelleğe al
    preloadAudio('assets/sounds/bell.mp3');
    preloadAudio('assets/sounds/digital.mp3');
    preloadAudio('assets/sounds/kitchen.mp3');
    preloadAudio('assets/sounds/wood.mp3');
    preloadAudio('assets/sounds/ticking.mp3');
};

// DOM yüklendiğinde Timer nesnesini oluştur
document.addEventListener('DOMContentLoaded', () => {
    loadAudioFiles();
    window.pomodoroTimer = new Timer();
});