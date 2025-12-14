/**
 * Calculadora Financeira
 * Centraliza a lógica de cálculo de faturamento
 */
import { DEFAULT_VALUES } from '../constants/DefaultValues.js';

class FinancialCalculator {
  /**
   * Calcula o valor faturado de uma tarefa baseado na duração
   * Regra: Se durou menos de 30 minutos, cobra 30 minutos (0.5h)
   * @param {number} durationMinutes - Duração real em minutos
   * @param {number} hourlyRate - Valor por hora (padrão: DEFAULT_VALUES.HOURLY_RATE)
   * @returns {Object} - Objeto com durationMinutes, billableMinutes, billableHours e billableAmount
   */
  static calculateTaskCost(durationMinutes, hourlyRate = DEFAULT_VALUES.HOURLY_RATE) {
    if (durationMinutes === null || durationMinutes === undefined) {
      throw new Error('Duração em minutos é obrigatória');
    }
    if (typeof durationMinutes !== 'number' || isNaN(durationMinutes)) {
      throw new Error('Duração deve ser um número');
    }
    if (durationMinutes < 0) {
      throw new Error('Duração não pode ser negativa');
    }
    
    const minimumBillableMinutes = DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES;
    
    // Aplica regra de mínimo: se durou menos que o mínimo, cobra o mínimo
    const billableMinutes = Math.max(durationMinutes, minimumBillableMinutes);
    const billableHours = billableMinutes / 60;
    const billableAmount = billableHours * hourlyRate;
    
    return {
      durationMinutes,      // Duração real trabalhada
      billableMinutes,      // Duração faturada (aplicando mínimo)
      billableHours,        // Horas faturadas
      billableAmount        // Valor faturado em R$
    };
  }

  /**
   * Calcula o total faturado de uma lista de apontamentos
   * @param {Array<WorkLog>} workLogs - Lista de apontamentos
   * @returns {Object} - Objeto com totais calculados
   */
  static calculateTotalBillable(workLogs) {
    if (!Array.isArray(workLogs)) {
      throw new Error('workLogs deve ser um array');
    }
    
    let totalDurationMinutes = 0;
    let totalBillableMinutes = 0;
    let totalBillableAmount = 0;
    
    workLogs.forEach(workLog => {
      totalDurationMinutes += workLog.durationMinutes || 0;
      totalBillableAmount += workLog.billableAmount || 0;
      
      // Calcula minutos faturados baseado no valor faturado e taxa por hora
      // Isso pode não ser preciso se a taxa mudou, mas é uma aproximação
      const minimumBillableMinutes = DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES;
      const billableMinutes = Math.max(workLog.durationMinutes || 0, minimumBillableMinutes);
      totalBillableMinutes += billableMinutes;
    });
    
    const totalBillableHours = totalBillableMinutes / 60;
    
    return {
      totalDurationMinutes,
      totalBillableMinutes,
      totalBillableHours,
      totalBillableAmount
    };
  }
}

// Export para uso em módulos ES6
export { FinancialCalculator };
