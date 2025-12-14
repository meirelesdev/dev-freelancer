/**
 * Caso de Uso: Atualizar Tarefa
 * Atualiza os dados de uma tarefa existente
 */
class UpdateTask {
  constructor(taskRepository) {
    if (!taskRepository) {
      throw new Error('TaskRepository é obrigatório');
    }
    this.taskRepository = taskRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} input - Dados de entrada
   * @param {string} input.taskId - ID da tarefa
   * @param {string} [input.title] - Novo título
   * @param {string} [input.description] - Nova descrição
   * @param {string} [input.project] - Novo projeto/módulo
   * @param {string} [input.status] - Novo status
   * @returns {Promise<Object>} - Resultado com tarefa atualizada ou erro
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

      // Verifica se a tarefa pode ser editada
      if (!task.isEditable) {
        return {
          success: false,
          error: 'Tarefas faturadas não podem ser editadas'
        };
      }

      // Atualiza campos fornecidos
      if (input.title !== undefined) {
        task.updateTitle(input.title);
      }
      if (input.description !== undefined) {
        task.updateDescription(input.description);
      }
      if (input.project !== undefined) {
        task.updateProject(input.project);
      }
      if (input.status !== undefined) {
        task.updateStatus(input.status);
      }

      // Atualiza timestamp
      task.updatedAt = new Date().toISOString();

      // Salva no repositório
      const savedTask = await this.taskRepository.save(task);

      return {
        success: true,
        data: savedTask
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
export { UpdateTask };
