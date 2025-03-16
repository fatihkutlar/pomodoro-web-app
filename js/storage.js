/**
 * Pomodoro Depolama Yöneticisi
 * Local Storage üzerinde veri depolama ve alma işlemleri
 */

class PomodoroStorage {
    /**
     * Tüm depolanmış verileri alır
     * @returns {Object} Tüm pomodoro verileri
     */
    static getAllData() {
        try {
            const data = localStorage.getItem('pomodoro-data');
            return data ? JSON.parse(data) : this.getInitialData();
        } catch (error) {
            console.error('Veri alınamadı:', error);
            return this.getInitialData();
        }
    }
    
    /**
     * Tüm verileri depolar
     * @param {Object} data - Depolanacak veri
     */
    static saveAllData(data) {
        try {
            localStorage.setItem('pomodoro-data', JSON.stringify(data));
        } catch (error) {
            console.error('Veri kaydedilemedi:', error);
        }
    }
    
    /**
     * Başlangıç veri yapısını oluşturur
     * @returns {Object} Başlangıç veri yapısı
     */
    static getInitialData() {
        return {
            settings: {
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
            },
            tasks: [],
            statistics: {
                completedPomodoros: 0,
                totalWorkTime: 0,
                dailyData: [],
                weeklyData: [],
                monthlyData: []
            }
        };
    }
    
    /**
     * Ayarları depolar
     * @param {Object} settings - Depolanacak ayarlar
     */
    static saveSettings(settings) {
        const data = this.getAllData();
        data.settings = settings;
        this.saveAllData(data);
    }
    
    /**
     * Ayarları alır
     * @returns {Object} Ayarlar
     */
    static getSettings() {
        return this.getAllData().settings;
    }
    
    /**
     * Görevleri depolar
     * @param {Array} tasks - Depolanacak görevler
     */
    static saveTasks(tasks) {
        const data = this.getAllData();
        data.tasks = tasks;
        this.saveAllData(data);
    }
    
    /**
     * Görevleri alır
     * @returns {Array} Görevler
     */
    static getTasks() {
        return this.getAllData().tasks;
    }
    
    /**
     * Tamamlanan pomodoro sayısını artırır
     * @returns {number} Güncel pomodoro sayısı
     */
    static incrementCompletedPomodoros() {
        const data = this.getAllData();
        data.statistics.completedPomodoros += 1;
        
        // Toplam çalışma süresini güncelle (dakika cinsinden)
        const settings = data.settings;
        data.statistics.totalWorkTime += settings.pomodoroDuration;
        
        // Günlük, haftalık ve aylık verileri güncelle
        this.updateStatisticalData(data);
        
        // Verileri kaydet
        this.saveAllData(data);
        
        return data.statistics.completedPomodoros;
    }
    
    /**
     * Tamamlanan pomodoro sayısını alır
     * @returns {number} Toplam pomodoro sayısı
     */
    static getCompletedPomodoros() {
        return this.getAllData().statistics.completedPomodoros;
    }
    
    /**
     * Bugün tamamlanan pomodoro sayısını alır
     * @returns {number} Bugün tamamlanan pomodoro sayısı
     */
    static getTodayPomodoros() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dailyData = this.getAllData().statistics.dailyData;
        
        const todayData = dailyData.find(item => item.date === today);
        return todayData ? todayData.count : 0;
    }
    
    /**
     * Bu hafta tamamlanan pomodoro sayısını alır
     * @returns {number} Bu hafta tamamlanan pomodoro sayısı
     */
    static getWeekPomodoros() {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        
        const weeklyData = this.getAllData().statistics.dailyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startOfWeek;
        });
        
        return weeklyData.reduce((total, item) => total + item.count, 0);
    }
    
    /**
     * Bu ay tamamlanan pomodoro sayısını alır
     * @returns {number} Bu ay tamamlanan pomodoro sayısı
     */
    static getMonthPomodoros() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyData = this.getAllData().statistics.dailyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startOfMonth;
        });
        
        return monthlyData.reduce((total, item) => total + item.count, 0);
    }
    
    /**
     * İstatistik verilerini alır
     * @returns {Object} İstatistik verileri
     */
    static getStatistics() {
        return this.getAllData().statistics;
    }
    
    /**
     * Günlük istatistik verilerine göre veri setini oluşturur
     * @returns {Object} Günlük grafik veri seti
     */
    static getDailyChartData() {
        const dailyData = this.getAllData().statistics.dailyData;
        // Son 7 günü al
        const last7Days = this.getLast7Days();
        
        // Her gün için etiket (kısa gün adı) ve değer oluştur
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('tr-TR', { weekday: 'short' });
        });
        
        const data = last7Days.map(date => {
            const dayData = dailyData.find(item => item.date === date);
            return dayData ? dayData.count : 0;
        });
        
        return { labels, data };
    }
    
    /**
     * Son 7 günün tarihlerini döndürür
     * @returns {Array} Son 7 günün tarihleri (YYYY-MM-DD formatında)
     */
    static getLast7Days() {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            result.push(d.toISOString().split('T')[0]);
        }
        return result;
    }
    
    /**
     * İstatistik verilerini günceller
     * @param {Object} data - Tüm pomodoro verileri
     */
    static updateStatisticalData(data) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Günlük veriyi güncelle
        let todayData = data.statistics.dailyData.find(item => item.date === today);
        
        if (todayData) {
            todayData.count += 1;
        } else {
            data.statistics.dailyData.push({
                date: today,
                count: 1
            });
        }
        
        // Verileri son 30 günle sınırla
        data.statistics.dailyData = data.statistics.dailyData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 30);
    }
    
    /**
     * Tüm verileri dışa aktarır
     * @returns {string} JSON formatında veriler
     */
    static exportData() {
        return JSON.stringify(this.getAllData(), null, 2);
    }
    
    /**
     * Verileri içe aktarır
     * @param {string} jsonData - İçe aktarılacak JSON verisi
     * @returns {boolean} İçe aktarmanın başarılı olup olmadığı
     */
    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Gerekli alanları kontrol et
            if (!data.settings || !data.tasks || !data.statistics) {
                return false;
            }
            
            this.saveAllData(data);
            return true;
        } catch (error) {
            console.error('Veri içe aktarılamadı:', error);
            return false;
        }
    }
    
    /**
     * Tüm verileri temizler
     */
    static clearAllData() {
        localStorage.removeItem('pomodoro-data');
    }
}

// Veri yükleme ve içe/dışa aktarma işlemleri için event listener'lar
document.addEventListener('DOMContentLoaded', () => {
    // Veri dışa aktarma düğmesi
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = PomodoroStorage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // Veri içe aktarma düğmesi
    const importBtn = document.getElementById('import-data-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const success = PomodoroStorage.importData(e.target.result);
                        if (success) {
                            alert('Veriler başarıyla içe aktarıldı. Sayfa yenileniyor...');
                            location.reload();
                        } else {
                            alert('Veriler içe aktarılamadı. Geçersiz dosya formatı.');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            
            input.click();
        });
    }
});