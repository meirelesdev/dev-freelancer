/**
 * Caso de Uso: Gerar Relatório de Timesheet
 * Gera um relatório mensal de apontamentos de tempo (timesheet)
 */
import { FinancialCalculator } from '../../domain/utils/FinancialCalculator.js';

class GenerateTimesheetReport {
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
   * @param {number} month - Mês (1-12)
   * @param {number} year - Ano (ex: 2024)
   * @returns {Promise<Object>} - Resultado com dados do timesheet ou erro
   */
  async execute(month, year) {
    try {
      // Validação de entrada
      if (!month || month < 1 || month > 12) {
        throw new Error('Mês inválido (deve ser entre 1 e 12)');
      }
      if (!year || year < 2020 || year > 2100) {
        throw new Error('Ano inválido');
      }

      // Calcula datas de início e fim do mês
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Busca todos os apontamentos do período
      const workLogs = await this.workLogRepository.findAll({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (workLogs.length === 0) {
        return {
          success: true,
          data: {
            header: {
              period: this._formatPeriod(month, year),
              month,
              year
            },
            entries: [],
            totals: {
              totalDurationMinutes: 0,
              totalBillableMinutes: 0,
              totalBillableHours: 0,
              totalBillableAmount: 0
            },
            settings: {
              hourlyRate: 60.00
            }
          }
        };
      }

      // Busca todas as tarefas relacionadas
      const taskIds = [...new Set(workLogs.map(wl => wl.taskId))];
      const tasks = await Promise.all(
        taskIds.map(id => this.taskRepository.findById(id))
      );
      const taskMap = new Map(tasks.filter(t => t).map(t => [t.id, t]));

      // Busca configurações
      const settings = await this.settingsRepository.find();
      const hourlyRate = settings?.hourlyRate || 60.00;

      // Agrupa apontamentos por data e tarefa
      const entries = [];
      for (const workLog of workLogs) {
        const task = taskMap.get(workLog.taskId);
        if (!task) continue;

        // Extrai a data usando métodos locais para evitar problemas de timezone
        const workLogDate = new Date(workLog.startTime);
        // Usa métodos locais para garantir que a data seja extraída corretamente
        const year = workLogDate.getFullYear();
        const month = String(workLogDate.getMonth() + 1).padStart(2, '0');
        const day = String(workLogDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Calcula minutos faturados (aplicando mínimo)
        const minimumBillableMinutes = settings?.minBillableMinutes || 30;
        const billableMinutes = Math.max(workLog.durationMinutes, minimumBillableMinutes);

        entries.push({
          date: dateStr,
          dateObj: workLogDate,
          taskId: task.id,
          taskTitle: task.title,
          project: task.project,
          durationMinutes: workLog.durationMinutes,
          billableMinutes: billableMinutes,
          billableHours: billableMinutes / 60,
          billableAmount: workLog.billableAmount,
          description: workLog.description || '',
          startTime: workLog.startTime,
          endTime: workLog.endTime
        });
      }

      // Ordena por data e depois por tarefa
      entries.sort((a, b) => {
        const dateCompare = a.dateObj.getTime() - b.dateObj.getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.taskTitle.localeCompare(b.taskTitle);
      });

      // Calcula totais
      const totals = FinancialCalculator.calculateTotalBillable(workLogs);

      return {
        success: true,
        data: {
          header: {
            period: this._formatPeriod(month, year),
            month,
            year
          },
          entries,
          totals: {
            totalDurationMinutes: totals.totalDurationMinutes,
            totalBillableMinutes: totals.totalBillableMinutes,
            totalBillableHours: totals.totalBillableHours,
            totalBillableAmount: totals.totalBillableAmount,
            entriesCount: entries.length
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

  /**
   * Formata o período para exibição
   * @private
   */
  _formatPeriod(month, year) {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[month - 1]} de ${year}`;
  }
}

// Export para uso em módulos ES6
export { GenerateTimesheetReport };
