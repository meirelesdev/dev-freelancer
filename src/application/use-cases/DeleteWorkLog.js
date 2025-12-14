/**
 * Caso de Uso: Excluir Apontamento de Tempo
 * Remove um apontamento de tempo
 */
class DeleteWorkLog {
  constructor(workLogRepository, taskRepository) {
    if (!workLogRepository) {
      throw new Error('WorkLogRepository é obrigatório');
    }
    if (!taskRepository) {
      throw new Error('TaskRepository é obrigatório');
    }
    this.workLogRepository = workLogRepository;
    this.taskRepository = taskRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} input - Dados de entrada
   * @param {string} input.workLogId - ID do apontamento a ser excluído
   * @returns {Promise<Object>} - Resultado da exclusão ou erro
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

      // Verifica se a tarefa pode ter apontamentos removidos (não pode estar BILLED)
      const task = await this.taskRepository.findById(workLog.taskId);
      if (task && task.status === 'BILLED') {
        return {
          success: false,
          error: 'Não é possível excluir apontamentos de tarefas faturadas'
        };
      }

      // Remove o apontamento
      await this.workLogRepository.delete(input.workLogId);

      return {
        success: true,
        message: 'Apontamento excluído com sucesso'
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
export { DeleteWorkLog };
