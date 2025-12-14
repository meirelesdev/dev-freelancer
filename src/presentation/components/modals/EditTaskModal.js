/**
 * Modal: Editar Tarefa
 * Permite editar os dados de uma tarefa existente
 */
class EditTaskModal {
  constructor(updateTaskUseCase, onSuccess = null) {
    this.updateTaskUseCase = updateTaskUseCase;
    this.onSuccess = onSuccess;
  }

  /**
   * Exibe o modal para editar tarefa
   * @param {Task} task - Tarefa a ser editada
   */
  show(task) {
    const existingModal = document.querySelector('.modal-backdrop.active');
    if (existingModal) {
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.setAttribute('data-modal-type', 'edit-task');
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h2>✏️ Editar Tarefa</h2>
          <button class="modal-close" id="modal-close-edit-task">×</button>
        </div>
        <div class="modal-body">
          <form id="form-edit-task">
            <div class="form-group">
              <label class="form-label">Projeto/Cliente *</label>
              <input type="text" class="form-input" id="edit-task-project" 
                     value="${this._escapeHtml(task.project)}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Título da Tarefa *</label>
              <input type="text" class="form-input" id="edit-task-title" 
                     value="${this._escapeHtml(task.title)}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Descrição (opcional)</label>
              <textarea class="form-input" id="edit-task-description" rows="3">${this._escapeHtml(task.description || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-input" id="edit-task-status">
                <option value="TODO" ${task.status === 'TODO' ? 'selected' : ''}>A Fazer</option>
                <option value="DOING" ${task.status === 'DOING' ? 'selected' : ''}>Em Andamento</option>
                <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>Concluída</option>
                <option value="BILLED" ${task.status === 'BILLED' ? 'selected' : ''}>Faturada</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit-task">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      document.body.classList.add('modal-open');
      document.getElementById('edit-task-title')?.focus();
    }, 10);

    // Event listeners
    this._setupEventListeners(modal, task);
  }

  /**
   * Configura os event listeners do modal
   * @private
   */
  _setupEventListeners(modal, task) {
    // Fechar modal
    const closeBtn = document.getElementById('modal-close-edit-task');
    const cancelBtn = document.getElementById('btn-cancel-edit-task');
    const closeModal = () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Fechar ao clicar no backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Submeter formulário
    const form = document.getElementById('form-edit-task');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this._handleSubmit(modal, task);
      });
    }
  }

  /**
   * Processa o submit do formulário
   * @private
   */
  async _handleSubmit(modal, task) {
    const titleInput = document.getElementById('edit-task-title');
    const projectInput = document.getElementById('edit-task-project');
    const descriptionInput = document.getElementById('edit-task-description');
    const statusInput = document.getElementById('edit-task-status');

    if (!titleInput || !projectInput || !statusInput) {
      window.toast?.error('Erro ao processar formulário');
      return;
    }

    const title = titleInput.value.trim();
    const project = projectInput.value.trim();
    const description = descriptionInput?.value?.trim() || '';
    const status = statusInput.value;

    if (!title || title.length < 3) {
      window.toast?.error('Título deve ter pelo menos 3 caracteres');
      return;
    }

    if (!project || project.length < 2) {
      window.toast?.error('Projeto/Módulo deve ter pelo menos 2 caracteres');
      return;
    }

    try {
      if (!this.updateTaskUseCase) {
        throw new Error('UpdateTaskUseCase não está disponível');
      }

      const result = await this.updateTaskUseCase.execute({
        taskId: task.id,
        title,
        project,
        description: description || null,
        status
      });

      if (result.success) {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }

        window.toast?.success('Tarefa atualizada com sucesso!');

        if (this.onSuccess) {
          this.onSuccess(result.data);
        }
      } else {
        window.toast?.error(`Erro ao atualizar tarefa: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      window.toast?.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  }

  /**
   * Escapa HTML para prevenir XSS
   * @private
   */
  _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }
}

// Export para uso em módulos ES6
export { EditTaskModal };
