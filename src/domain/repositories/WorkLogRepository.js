/**
 * Interface do Repositório de Apontamentos de Tempo
 * Define os contratos para persistência e consultas de work logs
 */
class WorkLogRepository {
  /**
   * Salva um apontamento (cria ou atualiza)
   * @param {WorkLog} workLog - Instância do apontamento
   * @returns {Promise<WorkLog>} - Apontamento salvo
   */
  async save(workLog) {
    throw new Error('Método save deve ser implementado');
  }

  /**
   * Busca um apontamento por ID
   * @param {string} id - ID do apontamento
   * @returns {Promise<WorkLog|null>} - Apontamento encontrado ou null
   */
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  /**
   * Lista todos os apontamentos de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<WorkLog[]>} - Lista de apontamentos
   */
  async findByTaskId(taskId) {
    throw new Error('Método findByTaskId deve ser implementado');
  }

  /**
   * Lista todos os apontamentos
   * @param {Object} options - Opções de filtro
   * @param {string} options.taskId - Filtrar por tarefa
   * @param {string} options.startDate - Filtrar por data inicial (ISO string)
   * @param {string} options.endDate - Filtrar por data final (ISO string)
   * @returns {Promise<WorkLog[]>} - Lista de apontamentos
   */
  async findAll(options = {}) {
    throw new Error('Método findAll deve ser implementado');
  }

  /**
   * Remove um apontamento por ID
   * @param {string} id - ID do apontamento
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  /**
   * Remove todos os apontamentos de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<void>}
   */
  async deleteByTaskId(taskId) {
    throw new Error('Método deleteByTaskId deve ser implementado');
  }

  /**
   * Calcula o total faturado de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<number>} - Total faturado
   */
  async calculateTotalBillable(taskId) {
    throw new Error('Método calculateTotalBillable deve ser implementado');
  }

  /**
   * Calcula o total de minutos trabalhados de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<number>} - Total de minutos trabalhados
   */
  async calculateTotalDurationMinutes(taskId) {
    throw new Error('Método calculateTotalDurationMinutes deve ser implementado');
  }
}

// Export para uso em módulos ES6
export { WorkLogRepository };
