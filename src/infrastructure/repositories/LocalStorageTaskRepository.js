/**
 * Implementação do Repositório de Tarefas usando localStorage
 */
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';
import { Task } from '../../domain/entities/Task.js';

class LocalStorageTaskRepository extends TaskRepository {
  constructor() {
    super();
    this.storageKey = 'devtracker_tasks';
  }

  /**
   * Salva uma tarefa no localStorage
   * @param {Task} task - Instância da tarefa
   * @returns {Promise<Task>} - Tarefa salva
   */
  async save(task) {
    try {
      const tasks = await this._getAll();
      const index = tasks.findIndex(t => t.id === task.id);

      const data = {
        id: task.id,
        title: task.title,
        description: task.description,
        project: task.project,
        status: task.status,
        createdAt: task.createdAt,
        finishedAt: task.finishedAt,
        updatedAt: task.updatedAt
      };

      if (index >= 0) {
        tasks[index] = data;
      } else {
        tasks.push(data);
      }

      window.localStorage.setItem(this.storageKey, JSON.stringify(tasks));
      return task;
    } catch (error) {
      throw new Error(`Erro ao salvar tarefa: ${error.message}`);
    }
  }

  /**
   * Busca uma tarefa por ID
   * @param {string} id - ID da tarefa
   * @returns {Promise<Task|null>} - Tarefa encontrada ou null
   */
  async findById(id) {
    try {
      const tasks = await this._getAll();
      const data = tasks.find(t => t.id === id);
      if (!data) {
        return null;
      }
      return Task.restore(data);
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      return null;
    }
  }

  /**
   * Lista todas as tarefas com filtros e ordenação
   * @param {Object} options - Opções de filtro e ordenação
   * @param {string} options.status - Filtrar por status
   * @param {string} options.project - Filtrar por projeto
   * @param {string} options.orderBy - Campo para ordenação ('createdAt', 'title', 'project')
   * @param {string} options.order - Direção da ordenação ('asc', 'desc')
   * @returns {Promise<Task[]>} - Lista de tarefas
   */
  async findAll(options = {}) {
    try {
      let tasks = await this._getAll();

      // Aplicar filtro por status
      if (options.status) {
        tasks = tasks.filter(t => t.status === options.status);
      }

      // Aplicar filtro por projeto
      if (options.project) {
        tasks = tasks.filter(t => t.project === options.project);
      }

      // Converter para instâncias de Task
      let taskInstances = tasks.map(data => Task.restore(data));

      // Aplicar ordenação
      const orderBy = options.orderBy || 'createdAt';
      const order = options.order || 'desc';

      taskInstances.sort((a, b) => {
        let aValue, bValue;

        switch (orderBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'project':
            aValue = a.project.toLowerCase();
            bValue = b.project.toLowerCase();
            break;
          case 'createdAt':
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
        }

        if (order === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      return taskInstances;
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      return [];
    }
  }

  /**
   * Remove uma tarefa por ID
   * @param {string} id - ID da tarefa
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const tasks = await this._getAll();
      const filtered = tasks.filter(t => t.id !== id);
      window.localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Erro ao remover tarefa: ${error.message}`);
    }
  }

  /**
   * Verifica se uma tarefa existe
   * @param {string} id - ID da tarefa
   * @returns {Promise<boolean>} - True se existe, false caso contrário
   */
  async exists(id) {
    try {
      const task = await this.findById(id);
      return task !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém todas as tarefas do localStorage
   * @private
   * @returns {Promise<Array>} - Array de objetos de tarefas
   */
  async _getAll() {
    try {
      const data = window.localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      // Se for erro de sintaxe JSON (dados corrompidos), faz backup e retorna vazio
      if (error instanceof SyntaxError) {
        const backupKey = `${this.storageKey}_corrupted_bkp_${Date.now()}`;
        try {
          const corruptedData = window.localStorage.getItem(this.storageKey);
          window.localStorage.setItem(backupKey, corruptedData);
          window.localStorage.removeItem(this.storageKey);
          console.error('⚠️ DADOS CORROMPIDOS DETECTADOS:', {
            storageKey: this.storageKey,
            backupKey: backupKey,
            error: error.message,
            message: 'Os dados foram movidos para backup. O sistema iniciará com dados vazios.'
          });
          if (window.toast) {
            window.toast.error('Dados corrompidos detectados. Backup criado. Sistema iniciado com dados vazios.');
          }
        } catch (backupError) {
          console.error('Erro ao criar backup de dados corrompidos:', backupError);
        }
        return [];
      }
      throw new Error(`Erro ao ler tarefas do localStorage: ${error.message}`);
    }
  }
}

// Export para uso em módulos ES6
export { LocalStorageTaskRepository };
