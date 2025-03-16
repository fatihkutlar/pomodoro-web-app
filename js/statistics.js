/**
 * Pomodoro İstatistik Yöneticisi
 * İstatistik grafiklerini ve verilerini yönetir
 */

class StatisticsManager {
    constructor() {
        // Chart.js grafik nesneleri
        this.dailyChart = null;
        this.weeklyChart = null;
        this.monthlyChart = null;
        
        // UI referansları
        this.statisticsTabs = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Event listener'ları başlat
        this.initializeEvents();
        
        // İstatistikleri yükle ve göster
        this.loadStatistics();
    }
    
    /**
     * Event listener'ları başlatır
     */
    initializeEvents() {
        // Sekme değiştirme
        this.statisticsTabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                const tabName = event.currentTarget.getAttribute('data-tab');
                this.changeTab(tabName);
            });
        });
    }
    
    /**
     * Grafikler için istatistikleri yükler
     */
    loadStatistics() {
        // Günlük grafiği oluştur
        this.createDailyChart();
        
        // Haftalık grafiği oluştur
        this.createWeeklyChart();
        
        // Aylık grafiği oluştur
        this.createMonthlyChart();
        
        // Özet istatistikleri güncelle
        this.updateSummaryStats();
    }
    
    /**
     * Sekmeyi değiştirir
     * @param {string} tabName - Görüntülenecek sekme adı
     */
    changeTab(tabName) {
        // Aktif sekmeyi kaldır
        this.statisticsTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Aktif içeriği kaldır
        this.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Yeni sekmeyi aktif yap
        const activeTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Yeni içeriği aktif yap
        const activeContent = document.getElementById(`${tabName}-stats`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Grafikleri yeniden boyutlandır
        this.resizeCharts();
    }
    
    /**
     * Grafikleri yeniden boyutlandırır
     */
    resizeCharts() {
        if (this.dailyChart) this.dailyChart.resize();
        if (this.weeklyChart) this.weeklyChart.resize();
        if (this.monthlyChart) this.monthlyChart.resize();
    }
    
    /**
     * Günlük grafiği oluşturur
     */
    createDailyChart() {
        const canvas = document.getElementById('daily-chart');
        if (!canvas) return;
        
        // Veri oluştur
        const chartData = PomodoroStorage.getDailyChartData();
        
        // Chart.js grafik oluştur
        this.dailyChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Tamamlanan Pomodoro',
                    data: chartData.data,
                    backgroundColor: 'rgba(255, 82, 82, 0.6)',
                    borderColor: 'rgba(255, 82, 82, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Haftalık grafiği oluşturur
     */
    createWeeklyChart() {
        const canvas = document.getElementById('weekly-chart');
        if (!canvas) return;
        
        // Örnek veri
        const weeks = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
        const data = [12, 19, 8, 15];
        
        // Chart.js grafik oluştur
        this.weeklyChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: weeks,
                datasets: [{
                    label: 'Haftalık Pomodoro',
                    data: data,
                    fill: false,
                    borderColor: 'rgba(76, 175, 80, 1)',
                    tension: 0.1,
                    pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Aylık grafiği oluşturur
     */
    createMonthlyChart() {
        const canvas = document.getElementById('monthly-chart');
        if (!canvas) return;
        
        // Örnek veri
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        const data = [50, 75, 60, 90, 80, 95];
        
        // Chart.js grafik oluştur
        this.monthlyChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Aylık Pomodoro',
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(63, 81, 181, 0.2)',
                    borderColor: 'rgba(63, 81, 181, 1)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(63, 81, 181, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Özet istatistikleri günceller
     */
    updateSummaryStats() {
        try {
            const todayCountElement = document.getElementById('today-count');
            const weekCountElement = document.getElementById('week-count');
            const monthCountElement = document.getElementById('month-count');
            
            if (todayCountElement) {
                todayCountElement.textContent = PomodoroStorage.getTodayPomodoros();
            }
            
            if (weekCountElement) {
                weekCountElement.textContent = PomodoroStorage.getWeekPomodoros();
            }
            
            if (monthCountElement) {
                monthCountElement.textContent = PomodoroStorage.getMonthPomodoros();
            }
        } catch (error) {
            console.error('İstatistikler güncellenirken hata oluştu:', error);
        }
    }
    
    /**
     * Tüm istatistikleri yeniler
     */
    refreshStatistics() {
        // Eski grafikleri yok et
        if (this.dailyChart) {
            this.dailyChart.destroy();
            this.dailyChart = null;
        }
        
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
            this.weeklyChart = null;
        }
        
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
            this.monthlyChart = null;
        }
        
        // Yeni grafikleri oluştur
        this.loadStatistics();
    }
}

// DOM yüklendiğinde StatisticsManager nesnesini oluştur
document.addEventListener('DOMContentLoaded', () => {
    // Chart.js mevcut olduğundan emin olalım
    if (typeof Chart !== 'undefined') {
        window.statisticsManager = new StatisticsManager();
    } else {
        console.error('Chart.js kütüphanesi yüklenemedi!');
    }
});