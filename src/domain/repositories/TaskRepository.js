/**
 * Interface do Repositório de Tarefas
 * Define os contratos para persistência e consultas de tarefas
 */
class TaskRepository {
  /**
   * Salva uma tarefa (cria ou atualiza)
   * @param {Task} task - Instância da tarefa
   * @returns {Promise<Task>} - Tarefa salva
   */
  async save(task) {
    throw new Error('Método save deve ser implementado');
  }

  /**
   * Busca uma tarefa por ID
   * @param {string} id - ID da tarefa
   * @returns {Promise<Task|null>} - Tarefa encontrada ou null
   */
  async findById(id) {
    throw new Error('Método findById deve ser implementado');
  }

  /**
   * Lista todas as tarefas
   * @param {Object} options - Opções de filtro e ordenação
   * @param {string} options.status - Filtrar por status
   * @param {string} options.project - Filtrar por projeto
   * @param {string} options.orderBy - Campo para ordenação ('createdAt', 'title', 'project')
   * @param {string} options.order - Direção da ordenação ('asc', 'desc')
   * @returns {Promise<Task[]>} - Lista de tarefas
   */
  async findAll(options = {}) {
    throw new Error('Método findAll deve ser implementado');
  }

  /**
   * Remove uma tarefa por ID
   * @param {string} id - ID da tarefa
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Método delete deve ser implementado');
  }

  /**
   * Verifica se uma tarefa existe
   * @param {string} id - ID da tarefa
   * @returns {Promise<boolean>} - True se existe, false caso contrário
   */
  async exists(id) {
    throw new Error('Método exists deve ser implementado');
  }
}

// Export para uso em módulos ES6
export { TaskRepository };
