/**
 * Entidade de Domínio: Task
 * Agregado principal que representa uma tarefa de desenvolvimento
 */
class Task {
  // Constantes de status
  static STATUS_TODO = 'TODO';
  static STATUS_DOING = 'DOING';
  static STATUS_DONE = 'DONE';
  static STATUS_BILLED = 'BILLED';

  constructor(id, title, description = '', project = '', status = 'TODO', createdAt = null, finishedAt = null) {
    this._validateId(id);
    this._validateTitle(title);
    this._validateDescription(description);
    this._validateProject(project);
    this._validateStatus(status);

    this.id = id;
    this.title = title.trim();
    this.description = description.trim();
    this.project = project.trim();
    this.status = status;
    this.createdAt = createdAt || new Date().toISOString();
    this.finishedAt = finishedAt || null;
    this.updatedAt = this.createdAt;
  }

  /**
   * Valida o ID da tarefa
   * @private
   */
  _validateId(id) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('ID da tarefa é obrigatório');
    }
    if (id.length > 100) {
      throw new Error('ID da tarefa não pode ter mais de 100 caracteres');
    }
  }

  /**
   * Valida o título da tarefa
   * @private
   */
  _validateTitle(title) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Título da tarefa é obrigatório');
    }
    if (title.trim().length < 3) {
      throw new Error('Título da tarefa deve ter pelo menos 3 caracteres');
    }
    if (title.trim().length > 200) {
      throw new Error('Título da tarefa não pode ter mais de 200 caracteres');
    }
  }

  /**
   * Valida a descrição da tarefa
   * @private
   */
  _validateDescription(description) {
    if (description && typeof description !== 'string') {
      throw new Error('Descrição deve ser uma string');
    }
    if (description && description.length > 1000) {
      throw new Error('Descrição não pode ter mais de 1000 caracteres');
    }
  }

  /**
   * Valida o projeto/módulo da tarefa
   * @private
   */
  _validateProject(project) {
    if (!project || typeof project !== 'string' || project.trim() === '') {
      throw new Error('Projeto/Módulo da tarefa é obrigatório');
    }
    if (project.trim().length < 2) {
      throw new Error('Projeto/Módulo deve ter pelo menos 2 caracteres');
    }
    if (project.trim().length > 200) {
      throw new Error('Projeto/Módulo não pode ter mais de 200 caracteres');
    }
  }

  /**
   * Valida o status da tarefa
   * @private
   */
  _validateStatus(status) {
    const validStatuses = [
      Task.STATUS_TODO,
      Task.STATUS_DOING,
      Task.STATUS_DONE,
      Task.STATUS_BILLED
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido. Deve ser um dos: ${validStatuses.join(', ')}`);
    }
  }

  /**
   * Atualiza o título da tarefa
   */
  updateTitle(title) {
    this._validateTitle(title);
    this.title = title.trim();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Atualiza a descrição da tarefa
   */
  updateDescription(description) {
    this._validateDescription(description);
    this.description = description ? description.trim() : '';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Atualiza o projeto/módulo da tarefa
   */
  updateProject(project) {
    this._validateProject(project);
    this.project = project.trim();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Atualiza o status da tarefa
   */
  updateStatus(status) {
    this._validateStatus(status);
    this.status = status;
    
    // Se mudou para DONE e não tem finishedAt, define agora
    if (status === Task.STATUS_DONE && !this.finishedAt) {
      this.finishedAt = new Date().toISOString();
    }
    
    // Se mudou de DONE para outro status, limpa finishedAt
    if (status !== Task.STATUS_DONE && this.finishedAt) {
      this.finishedAt = null;
    }
    
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Atualiza múltiplos campos da tarefa
   */
  update(title, description, project, status) {
    if (title !== undefined) this.updateTitle(title);
    if (description !== undefined) this.updateDescription(description);
    if (project !== undefined) this.updateProject(project);
    if (status !== undefined) this.updateStatus(status);
  }

  /**
   * Verifica se a tarefa está pendente
   */
  isTodo() {
    return this.status === Task.STATUS_TODO;
  }

  /**
   * Verifica se a tarefa está em andamento
   */
  isDoing() {
    return this.status === Task.STATUS_DOING;
  }

  /**
   * Verifica se a tarefa está concluída
   */
  isDone() {
    return this.status === Task.STATUS_DONE;
  }

  /**
   * Verifica se a tarefa foi faturada
   */
  isBilled() {
    return this.status === Task.STATUS_BILLED;
  }

  /**
   * Verifica se a tarefa pode ser editada
   * Regra de negócio: Tarefas com status BILLED não podem ser editadas
   * @returns {boolean} - true se a tarefa pode ser editada, false caso contrário
   */
  get isEditable() {
    return this.status !== Task.STATUS_BILLED;
  }

  /**
   * Atualiza os detalhes da tarefa
   * Valida se a tarefa é editável antes de permitir a atualização
   * @param {Object} details - Detalhes a serem atualizados
   * @param {string} [details.title] - Novo título da tarefa
   * @param {string} [details.description] - Nova descrição da tarefa
   * @param {string} [details.project] - Novo projeto/módulo da tarefa
   * @param {string} [details.status] - Novo status da tarefa
   * @throws {Error} - Se a tarefa não for editável ou se os dados forem inválidos
   */
  updateDetails({ title, description, project, status }) {
    // Valida se a tarefa pode ser editada
    if (!this.isEditable) {
      throw new Error(
        `Tarefa não pode ser editada. Status atual: ${this.status}. ` +
        `Tarefas com status "Faturada" não podem ser editadas.`
      );
    }

    // Atualiza apenas os campos informados
    if (title !== undefined) {
      this.updateTitle(title);
    }
    if (description !== undefined) {
      this.updateDescription(description);
    }
    if (project !== undefined) {
      this.updateProject(project);
    }
    if (status !== undefined) {
      this.updateStatus(status);
    }

    // Atualiza timestamp de modificação
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Cria uma nova tarefa
   */
  static create(title, project, description = '') {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Task(id, title, description, project, Task.STATUS_TODO);
  }

  /**
   * Restaura uma tarefa a partir de dados serializados
   */
  static restore(data) {
    if (!data) {
      throw new Error('Dados da tarefa são obrigatórios');
    }
    
    return new Task(
      data.id,
      data.title || data.name || 'Tarefa sem título', // Compatibilidade com Event antigo
      data.description || '',
      data.project || data.client || 'Projeto não informado', // Compatibilidade com Event antigo
      data.status || Task.STATUS_TODO,
      data.createdAt || null,
      data.finishedAt || null
    );
  }
}

// Export para uso em módulos ES6
export { Task };
