/**
 * Caso de Uso: Excluir Tarefa
 * Remove uma tarefa e seus apontamentos associados
 */
class DeleteTask {
  constructor(taskRepository, workLogRepository) {
    if (!taskRepository) {
      throw new Error('TaskRepository é obrigatório');
    }
    if (!workLogRepository) {
      throw new Error('WorkLogRepository é obrigatório');
    }
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} input - Dados de entrada
   * @param {string} input.taskId - ID da tarefa a ser excluída
   * @returns {Promise<Object>} - Resultado da exclusão ou erro
   */
  async execute(input) {
    try {
      // Validação de entrada
      if (!input || !input.taskId) {
        throw new Error('ID da tarefa é obrigatório');
      }

      // Verifica se a tarefa existe
      const task = await this.taskRepository.findById(input.taskId);
      if (!task) {
        return {
          success: false,
          error: 'Tarefa não encontrada'
        };
      }

      // Verifica se a tarefa pode ser excluída (não pode estar BILLED)
      if (task.status === 'BILLED') {
        return {
          success: false,
          error: 'Tarefas faturadas não podem ser excluídas'
        };
      }

      // Remove todos os apontamentos da tarefa
      await this.workLogRepository.deleteByTaskId(input.taskId);

      // Remove a tarefa
      await this.taskRepository.delete(input.taskId);

      return {
        success: true,
        message: 'Tarefa excluída com sucesso'
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
export { DeleteTask };
