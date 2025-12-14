/**
 * Caso de Uso: Adicionar Apontamento de Tempo
 * Cria um novo apontamento de tempo para uma tarefa
 */
import { WorkLog } from '../../domain/entities/WorkLog.js';

class AddWorkLog {
  constructor(workLogRepository, taskRepository, settingsRepository) {
    if (!workLogRepository) {
      throw new Error('WorkLogRepository é obrigatório');
    }
    if (!taskRepository) {
      throw new Error('TaskRepository é obrigatório');
    }
    if (!settingsRepository) {
      throw new Error('SettingsRepository é obrigatório');
    }
    this.workLogRepository = workLogRepository;
    this.taskRepository = taskRepository;
    this.settingsRepository = settingsRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} input - Dados de entrada
   * @param {string} input.taskId - ID da tarefa
   * @param {string} input.startTime - Data/hora de início (ISO string)
   * @param {string} input.endTime - Data/hora de fim (ISO string)
   * @param {string} [input.description] - Descrição opcional do apontamento
   * @returns {Promise<Object>} - Resultado com apontamento criado ou erro
   */
  async execute(input) {
    try {
      // Validação de entrada
      this._validateInput(input);

      // Verifica se a tarefa existe
      const task = await this.taskRepository.findById(input.taskId);
      if (!task) {
        return {
          success: false,
          error: 'Tarefa não encontrada'
        };
      }

      // Verifica se a tarefa pode receber apontamentos (não pode estar BILLED)
      if (task.status === 'BILLED') {
        return {
          success: false,
          error: 'Não é possível adicionar apontamentos em tarefas já faturadas'
        };
      }

      // Busca configurações para obter taxa horária e mínimo faturado
      const settings = await this.settingsRepository.find();
      const hourlyRate = settings?.hourlyRate || 60.00;
      const minimumBillableMinutes = settings?.minBillableMinutes || 30;

      // Cria o apontamento usando a factory method da entidade
      const workLog = WorkLog.create(
        input.taskId,
        input.startTime,
        input.endTime,
        hourlyRate,
        minimumBillableMinutes,
        input.description || ''
      );

      // Salva no repositório
      const savedWorkLog = await this.workLogRepository.save(workLog);

      return {
        success: true,
        data: savedWorkLog
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Valida os dados de entrada
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Dados de entrada são obrigatórios');
    }
    if (!input.taskId || typeof input.taskId !== 'string' || input.taskId.trim() === '') {
      throw new Error('ID da tarefa é obrigatório');
    }
    if (!input.startTime || typeof input.startTime !== 'string') {
      throw new Error('Data/hora de início é obrigatória');
    }
    if (!input.endTime || typeof input.endTime !== 'string') {
      throw new Error('Data/hora de fim é obrigatória');
    }
    
    // Valida formato de data
    const startDate = new Date(input.startTime);
    const endDate = new Date(input.endTime);
    
    if (isNaN(startDate.getTime())) {
      throw new Error('Data/hora de início inválida');
    }
    if (isNaN(endDate.getTime())) {
      throw new Error('Data/hora de fim inválida');
    }
    if (endDate <= startDate) {
      throw new Error('Data/hora de fim deve ser posterior à data/hora de início');
    }
  }
}

// Export para uso em módulos ES6
export { AddWorkLog };
