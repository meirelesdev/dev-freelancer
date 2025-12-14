/**
 * Entidade de Domínio: Settings
 * Singleton que contém as configurações do sistema
 */
import { DEFAULT_VALUES } from '../constants/DefaultValues.js';

class Settings {
  constructor(
    hourlyRate = DEFAULT_VALUES.HOURLY_RATE,
    minBillableMinutes = DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES
  ) {
    this._validateHourlyRate(hourlyRate);
    this._validateMinBillableMinutes(minBillableMinutes);

    this.hourlyRate = hourlyRate;
    this.minBillableMinutes = minBillableMinutes;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Valida o valor por hora
   * @private
   */
  _validateHourlyRate(hourlyRate) {
    if (hourlyRate === null || hourlyRate === undefined) {
      throw new Error('Valor por hora é obrigatório');
    }
    if (typeof hourlyRate !== 'number' || isNaN(hourlyRate)) {
      throw new Error('Valor por hora deve ser um número');
    }
    if (hourlyRate < 0) {
      throw new Error('Valor por hora não pode ser negativo');
    }
    if (hourlyRate > 10000) {
      throw new Error('Valor por hora não pode ser superior a R$ 10.000,00');
    }
  }

  /**
   * Valida o tempo mínimo faturado em minutos
   * @private
   */
  _validateMinBillableMinutes(minBillableMinutes) {
    if (minBillableMinutes === null || minBillableMinutes === undefined) {
      throw new Error('Tempo mínimo faturado é obrigatório');
    }
    if (!Number.isInteger(minBillableMinutes)) {
      throw new Error('Tempo mínimo faturado deve ser um número inteiro');
    }
    if (minBillableMinutes < 1) {
      throw new Error('Tempo mínimo faturado deve ser pelo menos 1 minuto');
    }
    if (minBillableMinutes > 480) {
      throw new Error('Tempo mínimo faturado não pode ser superior a 480 minutos (8 horas)');
    }
  }

  /**
   * Atualiza as configurações
   */
  update(hourlyRate, minBillableMinutes) {
    if (hourlyRate !== undefined && hourlyRate !== null) {
      this._validateHourlyRate(hourlyRate);
      this.hourlyRate = hourlyRate;
    }
    if (minBillableMinutes !== undefined && minBillableMinutes !== null) {
      this._validateMinBillableMinutes(minBillableMinutes);
      this.minBillableMinutes = minBillableMinutes;
    }
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Calcula o valor faturado baseado na duração em minutos
   * Aplica a regra de mínimo: se durou menos que minBillableMinutes, cobra o mínimo
   * @param {number} durationMinutes - Duração em minutos
   * @returns {number} - Valor faturado
   */
  calculateBillableAmount(durationMinutes) {
    if (!durationMinutes || durationMinutes < 0) {
      throw new Error('Duração deve ser um número positivo');
    }
    
    const billableMinutes = Math.max(durationMinutes, this.minBillableMinutes);
    const billableHours = billableMinutes / 60;
    return billableHours * this.hourlyRate;
  }

  /**
   * Cria uma instância padrão
   */
  static createDefault() {
    return new Settings(
      DEFAULT_VALUES.HOURLY_RATE,
      DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES
    );
  }

  /**
   * Restaura uma instância a partir de dados serializados
   * Usa valores padrão para campos que não existirem nos dados antigos
   */
  static restore(data) {
    if (!data) {
      return Settings.createDefault();
    }
    
    // Compatibilidade com dados antigos: tenta extrair hourlyRate de vários campos possíveis
    let hourlyRate = DEFAULT_VALUES.HOURLY_RATE;
    if (data.hourlyRate !== undefined) {
      hourlyRate = data.hourlyRate;
    } else if (data.overtimeRate !== undefined) {
      hourlyRate = data.overtimeRate;
    } else if (data.standardDailyRate !== undefined) {
      // Se tinha diária, converte para hora (diária / 8 horas)
      hourlyRate = data.standardDailyRate / 8;
    }
    
    // Compatibilidade: usa valor padrão se não existir
    const minBillableMinutes = data.minBillableMinutes !== undefined 
      ? data.minBillableMinutes 
      : DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES;
    
    return new Settings(hourlyRate, minBillableMinutes);
  }
}

// Export para uso em módulos ES6
export { Settings };
