/**
 * Entidade de Domínio: WorkLog
 * Representa um apontamento de tempo trabalhado em uma tarefa
 */
class WorkLog {
  constructor(id, taskId, startTime, endTime, durationMinutes, billableAmount, description = '') {
    this._validateId(id);
    this._validateTaskId(taskId);
    this._validateTimeRange(startTime, endTime);
    this._validateDurationMinutes(durationMinutes);
    this._validateBillableAmount(billableAmount);
    this._validateDescription(description);

    this.id = id;
    this.taskId = taskId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.durationMinutes = durationMinutes;
    this.billableAmount = billableAmount;
    this.description = description.trim();
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
  }

  /**
   * Valida o ID do apontamento
   * @private
   */
  _validateId(id) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ID do apontamento é obrigatório');
    }
    if (id.length > 100) {
      throw new Error('ID do apontamento não pode ter mais de 100 caracteres');
    }
  }

  /**
   * Valida o ID da tarefa
   * @private
   */
  _validateTaskId(taskId) {
    if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
      throw new Error('ID da tarefa é obrigatório');
    }
  }

  /**
   * Valida o intervalo de tempo (início e fim)
   * @private
   */
  _validateTimeRange(startTime, endTime) {
    if (!startTime) {
      throw new Error('Horário de início é obrigatório');
    }
    if (!endTime) {
      throw new Error('Horário de fim é obrigatório');
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime())) {
      throw new Error('Horário de início inválido');
    }
    if (isNaN(end.getTime())) {
      throw new Error('Horário de fim inválido');
    }
    
    if (end <= start) {
      throw new Error('Horário de fim deve ser posterior ao horário de início');
    }
  }

  /**
   * Valida a duração em minutos
   * @private
   */
  _validateDurationMinutes(durationMinutes) {
    if (durationMinutes === null || durationMinutes === undefined) {
      throw new Error('Duração em minutos é obrigatória');
    }
    if (typeof durationMinutes !== 'number' || isNaN(durationMinutes)) {
      throw new Error('Duração deve ser um número');
    }
    if (durationMinutes < 0) {
      throw new Error('Duração não pode ser negativa');
    }
    if (durationMinutes > 1440) {
      throw new Error('Duração não pode ser superior a 24 horas (1440 minutos)');
    }
  }

  /**
   * Valida o valor faturado
   * @private
   */
  _validateBillableAmount(billableAmount) {
    if (billableAmount === null || billableAmount === undefined) {
      throw new Error('Valor faturado é obrigatório');
    }
    if (typeof billableAmount !== 'number' || isNaN(billableAmount)) {
      throw new Error('Valor faturado deve ser um número');
    }
    if (billableAmount < 0) {
      throw new Error('Valor faturado não pode ser negativo');
    }
    if (billableAmount > 100000) {
      throw new Error('Valor faturado não pode ser superior a R$ 100.000,00');
    }
  }

  /**
   * Valida a descrição do apontamento
   * @private
   */
  _validateDescription(description) {
    if (description && typeof description !== 'string') {
      throw new Error('Descrição deve ser uma string');
    }
    if (description && description.length > 500) {
      throw new Error('Descrição não pode ter mais de 500 caracteres');
    }
  }

  /**
   * Atualiza a descrição do apontamento
   */
  updateDescription(description) {
    this._validateDescription(description);
    this.description = description.trim();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Atualiza o intervalo de tempo e recalcula duração e valor faturado
   * @param {string|Date} startTime - Novo horário de início
   * @param {string|Date} endTime - Novo horário de fim
   * @param {number} hourlyRate - Taxa por hora para recalcular o valor faturado
   * @param {number} minimumBillableMinutes - Mínimo de minutos faturados
   */
  updateTimeRange(startTime, endTime, hourlyRate, minimumBillableMinutes) {
    this._validateTimeRange(startTime, endTime);
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    // Aplica regra de mínimo: se durou menos que o mínimo, cobra o mínimo
    const billableMinutes = Math.max(durationMinutes, minimumBillableMinutes);
    const billableHours = billableMinutes / 60;
    const billableAmount = billableHours * hourlyRate;
    
    this.startTime = startTime instanceof Date ? startTime.toISOString() : startTime;
    this.endTime = endTime instanceof Date ? endTime.toISOString() : endTime;
    this.durationMinutes = durationMinutes;
    this.billableAmount = billableAmount;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Atualiza os detalhes do apontamento
   * @param {Object} details - Detalhes a serem atualizados
   * @param {string} [details.description] - Nova descrição
   * @param {string|Date} [details.startTime] - Novo horário de início
   * @param {string|Date} [details.endTime] - Novo horário de fim
   * @param {number} [details.hourlyRate] - Taxa por hora (necessária se atualizar tempo)
   * @param {number} [details.minimumBillableMinutes] - Mínimo de minutos faturados (necessário se atualizar tempo)
   */
  updateDetails({ description, startTime, endTime, hourlyRate, minimumBillableMinutes }) {
    if (description !== undefined) {
      this.updateDescription(description);
    }
    if (startTime !== undefined || endTime !== undefined) {
      const finalStartTime = startTime !== undefined ? startTime : this.startTime;
      const finalEndTime = endTime !== undefined ? endTime : this.endTime;
      if (hourlyRate === undefined || minimumBillableMinutes === undefined) {
        throw new Error('hourlyRate e minimumBillableMinutes são obrigatórios ao atualizar intervalo de tempo');
      }
      this.updateTimeRange(finalStartTime, finalEndTime, hourlyRate, minimumBillableMinutes);
    }
  }

  /**
   * Cria um novo apontamento de tempo
   * @param {string} taskId - ID da tarefa
   * @param {string|Date} startTime - Horário de início
   * @param {string|Date} endTime - Horário de fim
   * @param {number} hourlyRate - Taxa por hora
   * @param {number} minimumBillableMinutes - Mínimo de minutos faturados
   * @param {string} [description=''] - Descrição opcional
   */
  static create(taskId, startTime, endTime, hourlyRate, minimumBillableMinutes, description = '') {
    const id = `worklog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    const durationMs = end - start;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    // Aplica regra de mínimo: se durou menos que o mínimo, cobra o mínimo
    const billableMinutes = Math.max(durationMinutes, minimumBillableMinutes);
    const billableHours = billableMinutes / 60;
    const billableAmount = billableHours * hourlyRate;
    
    const startTimeStr = startTime instanceof Date ? startTime.toISOString() : startTime;
    const endTimeStr = endTime instanceof Date ? endTime.toISOString() : endTime;
    
    return new WorkLog(id, taskId, startTimeStr, endTimeStr, durationMinutes, billableAmount, description);
  }

  /**
   * Restaura um apontamento a partir de dados serializados
   */
  static restore(data) {
    if (!data) {
      throw new Error('Dados do apontamento são obrigatórios');
    }
    
    // Compatibilidade com Transaction antigo
    const taskId = data.taskId || data.eventId || '';
    const startTime = data.startTime || data.createdAt || new Date().toISOString();
    const endTime = data.endTime || data.updatedAt || new Date().toISOString();
    const durationMinutes = data.durationMinutes || 0;
    const billableAmount = data.billableAmount || data.amount || 0;
    const description = data.description || '';
    
    return new WorkLog(
      data.id,
      taskId,
      startTime,
      endTime,
      durationMinutes,
      billableAmount,
      description
    );
  }
}

// Export para uso em módulos ES6
export { WorkLog };
