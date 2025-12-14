/**
 * Caso de Uso: Atualizar Apontamento de Tempo
 * Atualiza um apontamento de tempo existente
 */
class UpdateWorkLog {
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
   * @param {string} input.workLogId - ID do apontamento
   * @param {string} [input.startTime] - Nova data/hora de início
   * @param {string} [input.endTime] - Nova data/hora de fim
   * @param {string} [input.description] - Nova descrição
   * @returns {Promise<Object>} - Resultado com apontamento atualizado ou erro
   */
  async execute(input) {
    try {
      // Validação de entrada
      if (!input || !input.workLogId) {
        throw new Error('ID do apontamento é obrigatório');
      }

      // Busca o apontamento
      const workLog = await this.workLogRepository.findById(input.workLogId);
      if (!workLog) {
        return {
          success: false,
          error: 'Apontamento não encontrado'
        };
      }

      // Verifica se a tarefa ainda existe e pode ser editada
      const task = await this.taskRepository.findById(workLog.taskId);
      if (!task) {
        return {
          success: false,
          error: 'Tarefa associada não encontrada'
        };
      }
      if (task.status === 'BILLED') {
        return {
          success: false,
          error: 'Não é possível editar apontamentos de tarefas faturadas'
        };
      }

      // Busca configurações para recalcular valores
      const settings = await this.settingsRepository.find();
      const hourlyRate = settings?.hourlyRate || 60.00;
      const minimumBillableMinutes = settings?.minBillableMinutes || 30;

      // Atualiza campos fornecidos
      if (input.startTime !== undefined || input.endTime !== undefined) {
        const newStartTime = input.startTime !== undefined ? input.startTime : workLog.startTime;
        const newEndTime = input.endTime !== undefined ? input.endTime : workLog.endTime;
        workLog.updateTimeRange(newStartTime, newEndTime, hourlyRate, minimumBillableMinutes);
      }
      if (input.description !== undefined) {
        workLog.updateDescription(input.description);
      }

      // Atualiza timestamp
      workLog.updatedAt = new Date().toISOString();

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
}

// Export para uso em módulos ES6
export { UpdateWorkLog };
