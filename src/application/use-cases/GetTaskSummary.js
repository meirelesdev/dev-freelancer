/**
 * Caso de Uso: Obter Resumo da Tarefa
 * Calcula totais de tempo trabalhado e faturamento de uma tarefa
 */
import { FinancialCalculator } from '../../domain/utils/FinancialCalculator.js';

class GetTaskSummary {
  constructor(taskRepository, workLogRepository, settingsRepository) {
    if (!taskRepository) {
      throw new Error('TaskRepository é obrigatório');
    }
    if (!workLogRepository) {
      throw new Error('WorkLogRepository é obrigatório');
    }
    if (!settingsRepository) {
      throw new Error('SettingsRepository é obrigatório');
    }
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
    this.settingsRepository = settingsRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} input - Dados de entrada
   * @param {string} input.taskId - ID da tarefa
   * @returns {Promise<Object>} - Resultado com resumo da tarefa ou erro
   */
  async execute(input) {
    try {
      // Validação de entrada
      if (!input || !input.taskId) {
        throw new Error('ID da tarefa é obrigatório');
      }

      // Busca a tarefa
      const task = await this.taskRepository.findById(input.taskId);
      if (!task) {
        return {
          success: false,
          error: 'Tarefa não encontrada'
        };
      }

      // Busca todos os apontamentos da tarefa
      const workLogs = await this.workLogRepository.findByTaskId(input.taskId);

      // Busca configurações para obter taxa horária
      const settings = await this.settingsRepository.find();
      const hourlyRate = settings?.hourlyRate || 60.00;

      // Calcula totais usando FinancialCalculator
      const totals = FinancialCalculator.calculateTotalBillable(workLogs);

      return {
        success: true,
        data: {
          task,
          workLogs,
          totals: {
            totalDurationMinutes: totals.totalDurationMinutes,
            totalBillableMinutes: totals.totalBillableMinutes,
            totalBillableHours: totals.totalBillableHours,
            totalBillableAmount: totals.totalBillableAmount,
            workLogsCount: workLogs.length
          },
          settings: {
            hourlyRate
          }
        }
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
export { GetTaskSummary };
