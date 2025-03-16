/**
 * Pomodoro Görev Yöneticisi
 * Görevlerin oluşturulması, düzenlenmesi ve silinmesi
 */

class TaskManager {
    constructor() {
        // UI Referansları
        this.tasksContainer = document.getElementById('tasks-container');
        this.taskForm = document.getElementById('task-form');
        this.taskInput = document.getElementById('task-input');
        this.pomodoroEstimateInput = document.getElementById('pomodoro-estimate-input');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.saveTaskBtn = document.getElementById('save-task-btn');
        this.cancelTaskBtn = document.getElementById('cancel-task-btn');
        
        // Görev listesi
        this.tasks = [];
        
        // Düzenleme modu
        this.editingTaskId = null;
        
        // Görevleri yükle
        this.loadTasks();
        
        // Event listener'ları ekle
        this.initializeEvents();
    }
    
    /**
     * Event dinleyicileri başlatır
     */
    initializeEvents() {
        // Görev formunu göster/gizle
        this.addTaskBtn.addEventListener('click', () => this.showTaskForm());
        
        // Görev kaydet
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());
        
        // Görevi iptal et
        this.cancelTaskBtn.addEventListener('click', () => this.hideTaskForm());
        
        // Form gönderildiğinde görev kaydet
        this.taskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.saveTask();
        });
    }
    
    /**
     * Görev listesini yükler
     */
    loadTasks() {
        this.tasks = PomodoroStorage.getTasks();
        this.renderTasks();
    }
    
    /**
     * Görevleri ekrana çizer
     */
    renderTasks() {
        // Görev konteynırını temizle
        this.tasksContainer.innerHTML = '';
        
        if (this.tasks.length === 0) {
            // Görev yoksa mesaj göster
            this.tasksContainer.innerHTML = '<div class="empty-tasks-message">Henüz görev eklenmedi</div>';
            return;
        }
        
        // Her görevi oluştur
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item');
            if (task.completed) taskElement.classList.add('completed');
            
            taskElement.innerHTML = `
                <div class="task-item-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-item-name">${task.name}</span>
                </div>
                <div class="task-item-right">
                    <div class="task-pomodoro-count">
                        <span>${task.completedPomodoros}/${task.estimatedPomodoros}</span>
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-btn" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete-btn" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Checkbox event'i
            const checkbox = taskElement.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));
            
            // Düzenle butonu event'i
            const editBtn = taskElement.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => this.editTask(task.id));
            
            // Sil butonu event'i
            const deleteBtn = taskElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            this.tasksContainer.appendChild(taskElement);
        });
    }
    
    /**
     * Görev formunu gösterir
     */
    showTaskForm() {
        this.taskForm.classList.remove('hidden');
        this.taskInput.focus();
        this.editingTaskId = null;
        this.taskInput.value = '';
        this.pomodoroEstimateInput.value = '1';
    }
    
    /**
     * Görev formunu gizler
     */
    hideTaskForm() {
        this.taskForm.classList.add('hidden');
        this.editingTaskId = null;
        this.taskInput.value = '';
        this.pomodoroEstimateInput.value = '1';
    }
    
    /**
     * Yeni görev ekler veya mevcut görevi günceller
     */
    saveTask() {
        const taskName = this.taskInput.value.trim();
        const estimatedPomodoros = parseInt(this.pomodoroEstimateInput.value, 10) || 1;
        
        if (!taskName) {
            alert('Lütfen bir görev adı girin.');
            return;
        }
        
        if (this.editingTaskId) {
            // Görevi güncelle
            const taskIndex = this.tasks.findIndex(task => task.id === this.editingTaskId);
            
            if (taskIndex !== -1) {
                this.tasks[taskIndex].name = taskName;
                this.tasks[taskIndex].estimatedPomodoros = estimatedPomodoros;
            }
        } else {
            // Yeni görev ekle
            const newTask = {
                id: Date.now().toString(),
                name: taskName,
                estimatedPomodoros: estimatedPomodoros,
                completedPomodoros: 0,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.tasks.push(newTask);
        }
        
        // Görevleri kaydet ve formu gizle
        PomodoroStorage.saveTasks(this.tasks);
        this.renderTasks();
        this.hideTaskForm();
    }
    
    /**
     * Görevi düzenleme moduna alır
     * @param {string} taskId - Düzenlenecek görevin ID'si
     */
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task) {
            this.editingTaskId = taskId;
            this.taskInput.value = task.name;
            this.pomodoroEstimateInput.value = task.estimatedPomodoros;
            this.showTaskForm();
        }
    }
    
    /**
     * Görevi siler
     * @param {string} taskId - Silinecek görevin ID'si
     */
    deleteTask(taskId) {
        if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;
        
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        PomodoroStorage.saveTasks(this.tasks);
        this.renderTasks();
    }
    
    /**
     * Görevin tamamlanma durumunu değiştirir
     * @param {string} taskId - Değiştirilecek görevin ID'si
     */
    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            PomodoroStorage.saveTasks(this.tasks);
            this.renderTasks();
        }
    }
    
    /**
     * Görevin pomodoro sayısını artırır
     * @param {string} taskId - Görevin ID'si (null ise aktif görev kullanılır)
     */
    incrementTaskPomodoro(taskId = null) {
        // TaskId verilmediyse, seçili görev veya ilk tamamlanmamış görevi kullan
        const targetId = taskId || this.getActiveTaskId();
        
        if (!targetId) return;
        
        const taskIndex = this.tasks.findIndex(task => task.id === targetId);
        
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completedPomodoros += 1;
            
            // Tüm pomodorolar tamamlandıysa, görevi tamamlandı olarak işaretle
            if (this.tasks[taskIndex].completedPomodoros >= this.tasks[taskIndex].estimatedPomodoros) {
                this.tasks[taskIndex].completed = true;
            }
            
            PomodoroStorage.saveTasks(this.tasks);
            this.renderTasks();
        }
    }
    
    /**
     * Aktif görevi bulur
     * @returns {string|null} Aktif görevin ID'si veya null
     */
    getActiveTaskId() {
        // İlk tamamlanmamış görevi bul
        const activeTask = this.tasks.find(task => !task.completed);
        return activeTask ? activeTask.id : null;
    }
}

// DOM yüklendiğinde TaskManager nesnesini oluştur
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
