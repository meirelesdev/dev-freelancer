/**
 * Caso de Uso: Criar Tarefa
 * Cria uma nova tarefa no sistema
 */
import { Task } from '../../domain/entities/Task.js';

class CreateTask {
  constructor(taskRepository) {
    if (!taskRepository) {
      throw new Error('TaskRepository é obrigatório');
    }
    this.taskRepository = taskRepository;
  }

  /**
   * Executa o caso de uso
   * @param {Object} input - Dados de entrada
   * @param {string} input.title - Título da tarefa
   * @param {string} input.project - Projeto/Módulo da tarefa
   * @param {string} [input.description] - Descrição opcional da tarefa
   * @param {string} [input.status] - Status inicial (padrão: 'TODO')
   * @returns {Promise<Object>} - Resultado com tarefa criada ou erro
   */
  async execute(input) {
    try {
      // Validação de entrada
      this._validateInput(input);

      // Cria a tarefa usando a factory method da entidade
      const task = Task.create(
        input.title,
        input.project,
        input.description || ''
      );

      // Se foi informado um status, atualiza
      if (input.status) {
        task.updateStatus(input.status);
      }

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

  /**
   * Valida os dados de entrada
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Dados de entrada são obrigatórios');
    }
    if (!input.title || typeof input.title !== 'string' || input.title.trim() === '') {
      throw new Error('Título da tarefa é obrigatório');
    }
    if (!input.project || typeof input.project !== 'string' || input.project.trim() === '') {
      throw new Error('Projeto/Módulo da tarefa é obrigatório');
    }
    if (input.title.trim().length < 3) {
      throw new Error('Título da tarefa deve ter pelo menos 3 caracteres');
    }
    if (input.project.trim().length < 2) {
      throw new Error('Projeto/Módulo deve ter pelo menos 2 caracteres');
    }
  }
}

// Export para uso em módulos ES6
export { CreateTask };
