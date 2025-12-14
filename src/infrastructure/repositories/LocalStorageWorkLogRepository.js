/**
 * Implementação do Repositório de Apontamentos de Tempo usando localStorage
 */
import { WorkLogRepository } from '../../domain/repositories/WorkLogRepository.js';
import { WorkLog } from '../../domain/entities/WorkLog.js';

class LocalStorageWorkLogRepository extends WorkLogRepository {
  constructor() {
    super();
    this.storageKey = 'devtracker_worklogs';
  }

  /**
   * Salva um apontamento no localStorage
   * @param {WorkLog} workLog - Instância do apontamento
   * @returns {Promise<WorkLog>} - Apontamento salvo
   */
  async save(workLog) {
    try {
      const workLogs = await this._getAll();
      const index = workLogs.findIndex(w => w.id === workLog.id);

      const data = {
        id: workLog.id,
        taskId: workLog.taskId,
        startTime: workLog.startTime,
        endTime: workLog.endTime,
        durationMinutes: workLog.durationMinutes,
        billableAmount: workLog.billableAmount,
        description: workLog.description,
        createdAt: workLog.createdAt,
        updatedAt: workLog.updatedAt
      };

      if (index >= 0) {
        workLogs[index] = data;
      } else {
        workLogs.push(data);
      }

      window.localStorage.setItem(this.storageKey, JSON.stringify(workLogs));
      return workLog;
    } catch (error) {
      throw new Error(`Erro ao salvar apontamento: ${error.message}`);
    }
  }

  /**
   * Busca um apontamento por ID
   * @param {string} id - ID do apontamento
   * @returns {Promise<WorkLog|null>} - Apontamento encontrado ou null
   */
  async findById(id) {
    try {
      const workLogs = await this._getAll();
      const data = workLogs.find(w => w.id === id);
      if (!data) {
        return null;
      }
      return WorkLog.restore(data);
    } catch (error) {
      console.error('Erro ao buscar apontamento:', error);
      return null;
    }
  }

  /**
   * Lista todos os apontamentos de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<WorkLog[]>} - Lista de apontamentos
   */
  async findByTaskId(taskId) {
    try {
      const workLogs = await this._getAll();
      const filtered = workLogs.filter(w => w.taskId === taskId);
      return filtered.map(data => WorkLog.restore(data));
    } catch (error) {
      console.error('Erro ao buscar apontamentos da tarefa:', error);
      return [];
    }
  }

  /**
   * Lista todos os apontamentos com filtros opcionais
   * @param {Object} options - Opções de filtro
   * @param {string} options.taskId - Filtrar por tarefa
   * @param {string} options.startDate - Filtrar por data inicial (ISO string)
   * @param {string} options.endDate - Filtrar por data final (ISO string)
   * @returns {Promise<WorkLog[]>} - Lista de apontamentos
   */
  async findAll(options = {}) {
    try {
      let workLogs = await this._getAll();

      if (options.taskId) {
        workLogs = workLogs.filter(w => w.taskId === options.taskId);
      }

      if (options.startDate) {
        const startDate = new Date(options.startDate);
        workLogs = workLogs.filter(w => {
          const workLogDate = new Date(w.startTime);
          return workLogDate >= startDate;
        });
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        workLogs = workLogs.filter(w => {
          const workLogDate = new Date(w.startTime);
          return workLogDate <= endDate;
        });
      }

      return workLogs.map(data => WorkLog.restore(data));
    } catch (error) {
      console.error('Erro ao listar apontamentos:', error);
      return [];
    }
  }

  /**
   * Remove um apontamento por ID
   * @param {string} id - ID do apontamento
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const workLogs = await this._getAll();
      const filtered = workLogs.filter(w => w.id !== id);
      window.localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Erro ao remover apontamento: ${error.message}`);
    }
  }

  /**
   * Remove todos os apontamentos de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<void>}
   */
  async deleteByTaskId(taskId) {
    try {
      const workLogs = await this._getAll();
      const filtered = workLogs.filter(w => w.taskId !== taskId);
      window.localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Erro ao remover apontamentos da tarefa: ${error.message}`);
    }
  }

  /**
   * Calcula o total faturado de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<number>} - Total faturado
   */
  async calculateTotalBillable(taskId) {
    try {
      const workLogs = await this.findByTaskId(taskId);
      return workLogs.reduce((total, w) => total + (w.billableAmount || 0), 0);
    } catch (error) {
      console.error('Erro ao calcular total faturado:', error);
      return 0;
    }
  }

  /**
   * Calcula o total de minutos trabalhados de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<number>} - Total de minutos trabalhados
   */
  async calculateTotalDurationMinutes(taskId) {
    try {
      const workLogs = await this.findByTaskId(taskId);
      return workLogs.reduce((total, w) => total + (w.durationMinutes || 0), 0);
    } catch (error) {
      console.error('Erro ao calcular total de minutos:', error);
      return 0;
    }
  }

  /**
   * Obtém todos os apontamentos do localStorage
   * @private
   * @returns {Promise<Array>} - Array de objetos de apontamentos
   */
  async _getAll() {
    try {
      const data = window.localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      // Se for erro de sintaxe JSON (dados corrompidos), faz backup e retorna vazio
      if (error instanceof SyntaxError) {
        const backupKey = `${this.storageKey}_corrupted_bkp_${Date.now()}`;
        try {
          const corruptedData = window.localStorage.getItem(this.storageKey);
          window.localStorage.setItem(backupKey, corruptedData);
          window.localStorage.removeItem(this.storageKey);
          console.error('⚠️ DADOS CORROMPIDOS DETECTADOS:', {
            storageKey: this.storageKey,
            backupKey: backupKey,
            error: error.message,
            message: 'Os dados foram movidos para backup. O sistema iniciará com dados vazios.'
          });
          if (window.toast) {
            window.toast.error('Dados corrompidos detectados. Backup criado. Sistema iniciado com dados vazios.');
          }
        } catch (backupError) {
          console.error('Erro ao criar backup de dados corrompidos:', backupError);
        }
        return [];
      }
      throw new Error(`Erro ao ler apontamentos do localStorage: ${error.message}`);
    }
  }
}

// Export para uso em módulos ES6
export { LocalStorageWorkLogRepository };
