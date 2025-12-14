/**
 * Ponto de Entrada Principal - Dev Freelancer
 * Inicializa a aplicação com todas as dependências usando Injeção de Dependência
 */

// ============================================
// 1. IMPORTS
// ============================================
// NOTA: Handlers globais de erro estão registrados no index.html ANTES deste script

// Domain Entities (necessárias para os repositórios usarem métodos estáticos)
import { Settings } from './domain/entities/Settings.js';
import { Task } from './domain/entities/Task.js';
import { WorkLog } from './domain/entities/WorkLog.js';

// Domain Repository Interfaces (necessárias para os repositórios estenderem)
import { SettingsRepository } from './domain/repositories/SettingsRepository.js';
import { TaskRepository } from './domain/repositories/TaskRepository.js';
import { WorkLogRepository } from './domain/repositories/WorkLogRepository.js';

// Infrastructure Repositories
import { 
  LocalStorageSettingsRepository,
  LocalStorageTaskRepository,
  LocalStorageWorkLogRepository
} from './infrastructure/index.js';

// Application Use Cases
import { CreateTask } from './application/use-cases/CreateTask.js';
import { GetTaskSummary } from './application/use-cases/GetTaskSummary.js';
import { AddWorkLog } from './application/use-cases/AddWorkLog.js';
import { UpdateTask } from './application/use-cases/UpdateTask.js';
import { DeleteTask } from './application/use-cases/DeleteTask.js';
import { UpdateWorkLog } from './application/use-cases/UpdateWorkLog.js';
import { DeleteWorkLog } from './application/use-cases/DeleteWorkLog.js';
import { UpdateSettings } from './application/use-cases/UpdateSettings.js';
import { GenerateTimesheetReport } from './application/use-cases/GenerateTimesheetReport.js';
import { ExportTimesheetToCSV } from './application/use-cases/data/ExportTimesheetToCSV.js';
import { ExportData } from './application/use-cases/data/ExportData.js';
import { ImportData } from './application/use-cases/data/ImportData.js';

// Presentation Layer
import { App } from './presentation/App.js';
import { toast } from './presentation/utils/Toast.js';

// ============================================
// 2. INSTÂNCIA DOS REPOSITÓRIOS
// ============================================

// Criar repositório de apontamentos (não tem dependências)
const workLogRepository = new LocalStorageWorkLogRepository();

// Criar repositório de tarefas (não tem dependências)
const taskRepository = new LocalStorageTaskRepository();

// Criar repositório de configurações (não tem dependências)
const settingsRepository = new LocalStorageSettingsRepository();

// ============================================
// 3. INSTÂNCIA DOS USE CASES
// ============================================

// Use Case: Criar Tarefa
const createTask = new CreateTask(taskRepository);

// Use Case: Obter Resumo da Tarefa
const getTaskSummary = new GetTaskSummary(taskRepository, workLogRepository, settingsRepository);

// Use Case: Adicionar Apontamento de Tempo
const addWorkLog = new AddWorkLog(workLogRepository, taskRepository, settingsRepository);

// Use Case: Atualizar Tarefa
const updateTask = new UpdateTask(taskRepository);

// Use Case: Excluir Tarefa
const deleteTask = new DeleteTask(taskRepository, workLogRepository);

// Use Case: Atualizar Apontamento de Tempo
const updateWorkLog = new UpdateWorkLog(workLogRepository, taskRepository, settingsRepository);

// Use Case: Excluir Apontamento de Tempo
const deleteWorkLog = new DeleteWorkLog(workLogRepository, taskRepository);

// Use Case: Atualizar Configurações
const updateSettings = new UpdateSettings(settingsRepository);

// Use Case: Gerar Timesheet
const generateTimesheetReport = new GenerateTimesheetReport(taskRepository, workLogRepository, settingsRepository);

// Use Case: Exportar Timesheet para CSV
const exportTimesheetToCSV = new ExportTimesheetToCSV(generateTimesheetReport);

// Use Case: Exportar Dados (Backup)
const exportData = new ExportData(taskRepository, workLogRepository, settingsRepository);

// Use Case: Importar Dados (Restaurar Backup)
const importData = new ImportData(taskRepository, workLogRepository, settingsRepository);

// ============================================
// 4. INICIALIZAÇÃO DA UI
// ============================================

// Aguarda o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Objeto com todas as dependências para a App
    const dependencies = {
      // Repositórios
      taskRepository,
      workLogRepository,
      settingsRepository,
      
      // Use Cases
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
    };

    // Inicializar a aplicação
    const app = new App(dependencies);
    
    // Torna toast disponível globalmente
    window.toast = toast;
    
    // Executa testes de validação em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      import('./tests/ValidationTests.js').then(({ ValidationTests }) => {
        ValidationTests.runAll().then(results => {
          if (results.failed > 0) {
            console.warn('⚠️ Alguns testes falharam. Verifique os cálculos.');
          } else {
            console.log('✅ Todos os testes passaram!');
          }
        }).catch(err => {
          console.warn('⚠️ Não foi possível executar testes:', err);
        });
      }).catch(() => {
        // Arquivo de testes não encontrado - não é crítico
      });
    }
    
    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Detecta o caminho base (para funcionar tanto localmente quanto no GitHub Pages)
        const basePath = window.location.pathname.includes('/control-gi-mendes/') 
          ? '/control-gi-mendes/sw.js' 
          : '/sw.js';
        
        navigator.serviceWorker.register(basePath, { scope: '/control-gi-mendes/' })
          .then((registration) => {
            // Verifica atualizações do service worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Novo service worker disponível
                }
              });
            });
          })
          .catch((error) => {
            // Service Worker não pôde ser registrado (não crítico)
          });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Dev Freelancer:', error);
    
    // Mostra mensagem de erro na tela
    const dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent) {
      dashboardContent.innerHTML = `
        <div class="card" style="border-left-color: var(--color-danger);">
          <h2 style="color: var(--color-danger);">Erro ao Inicializar</h2>
          <p>Ocorreu um erro ao carregar a aplicação.</p>
          <p class="text-muted">${error.message}</p>
          <p class="text-muted">Verifique o console do navegador para mais detalhes.</p>
        </div>
      `;
    }
  }
});
