/**
 * Aplicação Principal - Dev Freelancer
 * Gerencia navegação e inicialização das views
 */
import { DashboardView } from './views/DashboardView.js';
import { TaskDetailView } from './views/TaskDetailView.js';
import { TimesheetView } from './views/TimesheetView.js';
import { SettingsView } from './views/SettingsView.js';

class App {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.currentView = 'dashboard';
    this.currentEventId = null;
    this.init();
  }

  navigateTo(view) {
    this.currentView = view;
    this.render();
  }

  init() {
    this.setupNavigation();
    this.setupEventListeners();
    // Garante que o FAB está visível inicialmente (dashboard)
    const fab = document.getElementById('fab-new-task') || document.getElementById('fab-new-event');
    if (fab) {
      fab.classList.remove('hidden');
    }
    this.render();
  }

  setupNavigation() {
    // Event listeners para bottom navigation
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) {
          this.navigateTo(view);
        }
      });
    });

    // Event listener para FAB (Nova Tarefa)
    const fabNewTask = document.getElementById('fab-new-task') || document.getElementById('fab-new-event');
    if (fabNewTask) {
      fabNewTask.addEventListener('click', () => {
        // Dispara evento customizado para criar nova tarefa
        window.dispatchEvent(new CustomEvent('create-new-task'));
        // Compatibilidade: também dispara evento antigo
        window.dispatchEvent(new CustomEvent('create-new-event'));
      });
    }

    // Event listener para navegação customizada (ex: ir para detalhe da tarefa ou voltar ao dashboard)
    window.addEventListener('navigate', (e) => {
      const { view, taskId, eventId } = e.detail;
      if (view === 'task-detail' && taskId) {
        this.currentTaskId = taskId;
        this.navigateTo('task-detail');
      } else if (view === 'event-detail' && eventId) {
        // Compatibilidade com código antigo
        this.currentTaskId = eventId;
        this.navigateTo('task-detail');
      } else if (view === 'dashboard') {
        this.currentTaskId = null; // Limpa o ID da tarefa ao voltar ao dashboard
        this.navigateTo('dashboard');
      } else if (view === 'timesheet' || view === 'monthly-report') {
        this.navigateTo('timesheet');
      } else if (view === 'settings') {
        this.navigateTo('settings');
      }
    });
  }

  setupEventListeners() {
    // Botão voltar do detalhe da tarefa
    window.addEventListener('popstate', () => {
      if (this.currentView === 'task-detail' || this.currentView === 'event-detail') {
        this.navigateTo('dashboard');
      }
    });
  }

  navigateTo(view) {
    // Atualiza bottom navigation
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      }
    });

    // Oculta todos os conteúdos
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Controla visibilidade do FAB (só aparece no dashboard)
    const fab = document.getElementById('fab-new-task') || document.getElementById('fab-new-event');
    if (fab) {
      if (view === 'dashboard') {
        fab.classList.remove('hidden');
      } else {
        fab.classList.add('hidden');
      }
    }

    // Mostra conteúdo selecionado
    this.currentView = view;
    this.render();
  }

  async render() {
    const { 
      taskRepository, 
      workLogRepository, 
      settingsRepository,
      createTask,
      getTaskSummary,
      addWorkLog,
      updateTask,
      deleteTask,
      updateWorkLog,
      deleteWorkLog,
      updateSettings,
      generateTimesheetReport,
      exportTimesheetToCSV,
      exportData,
      importData
    } = this.dependencies;

    if (this.currentView === 'dashboard') {
      const dashboardView = new DashboardView(
        taskRepository,
        workLogRepository,
        settingsRepository,
        createTask
      );
      const content = document.getElementById('dashboard-content');
      if (content) {
        content.classList.add('active');
        await dashboardView.render();
      }
    } else if (this.currentView === 'task-detail' || this.currentView === 'event-detail') {
      const taskDetailView = new TaskDetailView(
        taskRepository,
        workLogRepository,
        settingsRepository,
        getTaskSummary,
        addWorkLog,
        updateTask,
        deleteTask,
        updateWorkLog,
        deleteWorkLog
      );
      const content = document.getElementById('event-detail-content') || document.getElementById('task-detail-content');
      if (content) {
        content.classList.add('active');
        const taskId = this.currentTaskId;
        if (taskId) {
          await taskDetailView.render(taskId);
        }
      }
    } else if (this.currentView === 'timesheet' || this.currentView === 'monthly-report') {
      const timesheetView = new TimesheetView(
        generateTimesheetReport,
        exportTimesheetToCSV,
        settingsRepository
      );
      const content = document.getElementById('monthly-report-content') || document.getElementById('timesheet-content');
      if (content) {
        content.classList.add('active');
        await timesheetView.render();
      }
    } else if (this.currentView === 'settings') {
      const settingsView = new SettingsView(
        settingsRepository,
        updateSettings,
        exportData,
        importData,
        null, // exportTransactionsToCSV - não mais necessário
        taskRepository,
        workLogRepository
      );
      const content = document.getElementById('settings-content');
      if (content) {
        content.classList.add('active');
        await settingsView.render();
      }
    }
  }
}

// Export para uso em módulos ES6
export { App };

