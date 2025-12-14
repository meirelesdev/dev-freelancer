/**
 * Use Case: Import Data
 * Restaura dados de um backup JSON
 */
import { Task } from '../../../domain/entities/Task.js';
import { WorkLog } from '../../../domain/entities/WorkLog.js';
import { Settings } from '../../../domain/entities/Settings.js';

export class ImportData {
  constructor(taskRepository, workLogRepository, settingsRepository) {
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
    this.settingsRepository = settingsRepository;
  }

  /**
   * Valida a estrutura do backup
   * @param {Object} data - Dados do backup
   * @throws {Error} Se a estrutura for inválida
   */
  _validateBackupStructure(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Arquivo de backup inválido: estrutura não reconhecida');
    }

    if (!data.version) {
      throw new Error('Arquivo de backup inválido: versão não encontrada');
    }

    // Suporta tanto formato antigo (events/transactions) quanto novo (tasks/workLogs)
    const hasOldFormat = Array.isArray(data.events) && Array.isArray(data.transactions);
    const hasNewFormat = Array.isArray(data.tasks) && Array.isArray(data.workLogs);
    
    if (!hasOldFormat && !hasNewFormat) {
      throw new Error('Arquivo de backup inválido: formato não reconhecido');
    }

    if (!data.settings || typeof data.settings !== 'object') {
      throw new Error('Arquivo de backup inválido: configurações não encontradas');
    }
  }

  /**
   * Executa a importação de dados
   * @param {string|Object} backupData - String JSON ou objeto com os dados do backup
   * @returns {Promise<Object>} Resultado com contagens de dados importados
   */
  async execute(backupData) {
    try {
      // Parse se for string
      let data;
      if (typeof backupData === 'string') {
        data = JSON.parse(backupData);
      } else {
        data = backupData;
      }

      // Valida estrutura
      this._validateBackupStructure(data);

      // Limpa dados atuais e restaura backup
      // Importante: Substitui completamente os dados atuais
      
      // Limpa tarefas
      const currentTasks = await this.taskRepository.findAll();
      for (const task of currentTasks) {
        await this.taskRepository.delete(task.id);
      }

      // Limpa apontamentos
      const currentWorkLogs = await this.workLogRepository.findAll();
      for (const workLog of currentWorkLogs) {
        await this.workLogRepository.delete(workLog.id);
      }

      // Restaura tarefas (suporta formato antigo e novo)
      const tasksToRestore = data.tasks || [];
      for (const taskData of tasksToRestore) {
        const task = Task.restore(taskData);
        await this.taskRepository.save(task);
      }

      // Restaura apontamentos (suporta formato antigo e novo)
      const workLogsToRestore = data.workLogs || [];
      for (const workLogData of workLogsToRestore) {
        const workLog = WorkLog.restore(workLogData);
        await this.workLogRepository.save(workLog);
      }

      // Restaura configurações (usa restore para criar instância de Settings)
      const settings = Settings.restore(data.settings);
      await this.settingsRepository.save(settings);

      return {
        tasksCount: tasksToRestore.length,
        workLogsCount: workLogsToRestore.length,
        exportDate: data.exportDate
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Arquivo de backup inválido: formato JSON incorreto');
      }
      throw new Error(`Erro ao importar dados: ${error.message}`);
    }
  }
}
