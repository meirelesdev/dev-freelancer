/**
 * View: Detalhe da Tarefa
 * Exibe detalhes da tarefa, botão de ação e lista de apontamentos de tempo
 */
import { Formatters } from '../utils/Formatters.js';
import { TimeLogModal } from '../components/modals/TimeLogModal.js';

class TaskDetailView {
  constructor(
    taskRepository,
    workLogRepository,
    settingsRepository,
    getTaskSummaryUseCase,
    addWorkLogUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
    updateWorkLogUseCase,
    deleteWorkLogUseCase
  ) {
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
    this.settingsRepository = settingsRepository;
    this.getTaskSummaryUseCase = getTaskSummaryUseCase;
    this.addWorkLogUseCase = addWorkLogUseCase;
    this.updateTaskUseCase = updateTaskUseCase;
    this.deleteTaskUseCase = deleteTaskUseCase;
    this.updateWorkLogUseCase = updateWorkLogUseCase;
    this.deleteWorkLogUseCase = deleteWorkLogUseCase;
    this.currentTaskId = null;
    this.timeLogModal = null;
  }

  async render(taskId) {
    const container = document.getElementById('event-detail-content') || document.getElementById('task-detail-content');
    if (!container) {
      console.error('Container não encontrado');
      return;
    }

    this.currentTaskId = taskId;

    container.innerHTML = '<div class="loading">Carregando...</div>';

    try {
      // Depende EXCLUSIVAMENTE do Use Case GetTaskSummary
      if (!this.getTaskSummaryUseCase) {
        container.innerHTML = `
          <div class="card" style="border-left-color: var(--color-danger);">
            <h2 style="color: var(--color-danger);">Erro de Configuração</h2>
            <p>GetTaskSummaryUseCase não está disponível. Não é possível exibir os detalhes da tarefa.</p>
            <p class="text-muted">Por favor, recarregue a página ou entre em contato com o suporte.</p>
          </div>
        `;
        return;
      }

      // Usa GetTaskSummary para obter todos os dados calculados
      const summaryResult = await this.getTaskSummaryUseCase.execute({ taskId });
      if (!summaryResult.success) {
        container.innerHTML = `
          <div class="card" style="border-left-color: var(--color-danger);">
            <h2 style="color: var(--color-danger);">Erro ao Carregar Tarefa</h2>
            <p>${summaryResult.error || 'Erro desconhecido ao carregar os dados da tarefa.'}</p>
            <button class="btn btn-secondary" onclick="window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'dashboard' } }))">
              Voltar ao Dashboard
            </button>
          </div>
        `;
        return;
      }

      const summary = summaryResult.data;
      const task = summary.task;
      const workLogs = summary.workLogs || [];
      const totals = summary.totals;

      // Define cores e labels por status
      const statusConfig = this._getStatusConfig(task.status);
      const statusBorderColor = statusConfig.borderColor;
      const statusBgColor = statusConfig.bgColor;

      // Formata valores
      const totalHours = Math.floor(totals.totalDurationMinutes / 60);
      const totalMinutes = totals.totalDurationMinutes % 60;
      const billableHours = totals.totalBillableHours.toFixed(1);

      container.innerHTML = `
        <div class="card" style="border-left: 4px solid ${statusBorderColor}; background-color: ${statusBgColor};">
          <!-- Título da Tarefa -->
          <div style="margin-bottom: var(--spacing-md);">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-md); flex-wrap: wrap;">
              <div style="flex: 1; min-width: 0;">
                <h2 style="margin: 0 0 var(--spacing-sm) 0; word-wrap: break-word; hyphens: auto;">${this.escapeHtml(task.title)}</h2>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap; margin-top: var(--spacing-xs);">
                  <span class="badge" style="background-color: ${statusConfig.badgeBg}; color: ${statusConfig.badgeColor};">
                    ${statusConfig.label}
                  </span>
                  <span class="text-muted" style="font-size: var(--font-size-sm);">
                    ${this.formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
              ${task.isEditable && this.updateTaskUseCase ? `
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-shrink: 0;">
                  <button class="btn btn-sm" id="btn-edit-task" 
                          style="background: transparent; color: ${statusBgColor === 'var(--color-surface)' ? 'var(--color-primary)' : 'white'}; padding: 6px 10px; border-radius: var(--radius-full); border: 1px solid ${statusBgColor === 'var(--color-surface)' ? 'var(--color-border)' : 'rgba(255,255,255,0.3)'}; font-size: 18px; line-height: 1; min-width: 36px; flex-shrink: 0;"
                          title="Editar Tarefa">
                    ✏️
                  </button>
                  ${this.deleteTaskUseCase ? `
                    <button class="btn btn-sm" id="btn-delete-task" 
                            style="background: transparent; color: var(--color-danger); padding: 6px 10px; border-radius: var(--radius-full); border: 1px solid var(--color-danger); font-size: 18px; line-height: 1; min-width: 36px; flex-shrink: 0;"
                            title="Excluir Tarefa">
                      🗑️
                    </button>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Informações da Tarefa -->
          <div style="margin-bottom: var(--spacing-md);">
            <div style="margin-bottom: var(--spacing-sm);">
              <strong style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Projeto/Módulo:</strong>
              <div style="margin-top: 2px;">${this.escapeHtml(task.project)}</div>
            </div>
            ${task.description ? `
              <div style="margin-top: var(--spacing-md);">
                <strong style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Descrição:</strong>
                <div style="margin-top: 2px; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(task.description)}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Cards de Resumo -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
          <!-- Tempo Trabalhado -->
          <div style="padding: var(--spacing-lg); background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: var(--radius-lg); border: 2px solid #4CAF50; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);">
            <div style="font-size: var(--font-size-base); color: #2E7D32; font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-xs);">
              ⏱️ Tempo Trabalhado
            </div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: #2E7D32;">
              ${totalHours}h ${totalMinutes}min
            </div>
            <div style="font-size: var(--font-size-xs); color: #388E3C; margin-top: var(--spacing-xs);">
              ${workLogs.length} apontamento${workLogs.length !== 1 ? 's' : ''}
            </div>
          </div>

          <!-- Tempo Faturado -->
          <div style="padding: var(--spacing-lg); background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: var(--radius-lg); border: 2px solid #2196F3; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);">
            <div style="font-size: var(--font-size-base); color: #1565C0; font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-xs);">
              💰 Tempo Faturado
            </div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: #1565C0;">
              ${billableHours}h
            </div>
            <div style="font-size: var(--font-size-xs); color: #1976D2; margin-top: var(--spacing-xs);">
              Aplicando mínimo de 30min
            </div>
          </div>

          <!-- Valor Faturado -->
          <div style="padding: var(--spacing-lg); background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: var(--radius-lg); border: 2px solid #FF9800; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);">
            <div style="font-size: var(--font-size-base); color: #E65100; font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-xs);">
              💵 Valor Faturado
            </div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: #E65100;">
              ${this.formatCurrency(totals.totalBillableAmount)}
            </div>
            <div style="font-size: var(--font-size-xs); color: #F57C00; margin-top: var(--spacing-xs);">
              R$ ${summary.settings.hourlyRate.toFixed(2)}/hora
            </div>
          </div>
        </div>

        ${task.status !== 'BILLED' ? `
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-md);">
            <h3 style="margin: 0;">Ações</h3>
            <button class="btn btn-primary" id="btn-add-time-log" 
                    style="display: flex; align-items: center; gap: var(--spacing-xs);">
              <span>⏱️</span>
              <span>Registrar Tempo</span>
            </button>
          </div>
        </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⏱️ Apontamentos de Tempo</h3>
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap;">
              ${workLogs.length > 0 ? `
                <span class="badge badge-info">${workLogs.length} apontamento${workLogs.length !== 1 ? 's' : ''}</span>
              ` : ''}
              ${task.status !== 'BILLED' ? `
                <button class="btn btn-sm btn-primary" id="btn-add-time-log-header" 
                        style="padding: 6px 12px; border-radius: var(--radius-full); font-size: 18px; line-height: 1; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                        title="Registrar Tempo">
                  ➕
                </button>
              ` : ''}
            </div>
          </div>
          ${workLogs.length === 0 ? `
            <div class="empty-state">
              <p class="text-muted">Nenhum apontamento de tempo registrado ainda.</p>
              ${task.status !== 'BILLED' ? `
                <button class="btn btn-primary" id="btn-add-time-log-empty" style="margin-top: var(--spacing-md);">
                  ⏱️ Registrar Primeiro Tempo
                </button>
              ` : ''}
            </div>
          ` : `
            <div class="worklog-list">
              ${workLogs.map(workLog => this.renderWorkLogItem(workLog, task.status)).join('')}
            </div>
          `}
        </div>
      `;

      // Configura event listeners
      this._setupEventListeners(task);
    } catch (error) {
      console.error('Erro ao renderizar detalhes da tarefa:', error);
      container.innerHTML = `
        <div class="card" style="border-left-color: var(--color-danger);">
          <h2 style="color: var(--color-danger);">Erro ao Carregar</h2>
          <p>${error.message}</p>
          <button class="btn btn-secondary" onclick="window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'dashboard' } }))">
            Voltar ao Dashboard
          </button>
        </div>
      `;
    }
  }

  /**
   * Renderiza um item de apontamento de tempo
   */
  renderWorkLogItem(workLog, taskStatus) {
    const startDate = new Date(workLog.startTime);
    const endDate = new Date(workLog.endTime);
    const durationHours = Math.floor(workLog.durationMinutes / 60);
    const durationMins = workLog.durationMinutes % 60;
    // Calcula horas faturadas baseado no valor faturado e taxa horária
    // Usa a taxa horária do apontamento (calculada quando foi criado)
    const minimumBillableMinutes = 30;
    const billableMinutes = Math.max(workLog.durationMinutes, minimumBillableMinutes);
    const billableHours = (billableMinutes / 60).toFixed(1);

    const canEdit = taskStatus !== 'BILLED';

    return `
      <div class="worklog-item" style="padding: var(--spacing-md); border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: flex-start; gap: var(--spacing-md);">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap; margin-bottom: var(--spacing-xs);">
            <strong style="color: var(--color-primary);">${this.formatDateTime(startDate)}</strong>
            <span class="text-muted">→</span>
            <strong style="color: var(--color-primary);">${this.formatDateTime(endDate)}</strong>
          </div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
            ${durationHours}h ${durationMins}min trabalhados → ${billableHours}h faturadas
          </div>
          ${workLog.description ? `
            <div style="font-size: var(--font-size-sm); color: var(--color-text); margin-top: var(--spacing-xs);">
              ${this.escapeHtml(workLog.description)}
            </div>
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-shrink: 0;">
          <div style="text-align: right;">
            <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-success);">
              ${this.formatCurrency(workLog.billableAmount)}
            </div>
          </div>
          ${canEdit ? `
            <button class="btn btn-sm" data-worklog-id="${workLog.id}" data-action="edit-worklog"
                    style="background: transparent; color: var(--color-primary); padding: 6px 10px; border-radius: var(--radius-full); border: 1px solid var(--color-border); font-size: 18px; line-height: 1; min-width: 36px; flex-shrink: 0;"
                    title="Editar Apontamento">
              ✏️
            </button>
            <button class="btn btn-sm" data-worklog-id="${workLog.id}" data-action="delete-worklog"
                    style="background: transparent; color: var(--color-danger); padding: 6px 10px; border-radius: var(--radius-full); border: 1px solid var(--color-danger); font-size: 18px; line-height: 1; min-width: 36px; flex-shrink: 0;"
                    title="Excluir Apontamento">
              🗑️
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Configura os event listeners
   * @private
   */
  _setupEventListeners(task) {
    // Botão Registrar Tempo
    const addTimeLogBtns = [
      document.getElementById('btn-add-time-log'),
      document.getElementById('btn-add-time-log-header'),
      document.getElementById('btn-add-time-log-empty')
    ].filter(Boolean);

    addTimeLogBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.timeLogModal = new TimeLogModal(this.addWorkLogUseCase, () => {
          this.render(this.currentTaskId);
        });
        this.timeLogModal.show(this.currentTaskId);
      });
    });

    // Botão Editar Tarefa
    const editTaskBtn = document.getElementById('btn-edit-task');
    if (editTaskBtn) {
      editTaskBtn.addEventListener('click', () => {
        this._showEditTaskModal(task);
      });
    }

    // Botão Excluir Tarefa
    const deleteTaskBtn = document.getElementById('btn-delete-task');
    if (deleteTaskBtn) {
      deleteTaskBtn.addEventListener('click', () => {
        this._confirmDeleteTask(task);
      });
    }

    // Botões Editar/Excluir Apontamento
    document.querySelectorAll('[data-action="edit-worklog"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const workLogId = e.currentTarget.getAttribute('data-worklog-id');
        this._showEditWorkLogModal(workLogId);
      });
    });

    document.querySelectorAll('[data-action="delete-worklog"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const workLogId = e.currentTarget.getAttribute('data-worklog-id');
        await this._confirmDeleteWorkLog(workLogId);
      });
    });
  }

  /**
   * Mostra modal de edição de tarefa
   * @private
   */
  async _showEditTaskModal(task) {
    // TODO: Implementar modal de edição
    const newTitle = window.prompt('Novo título:', task.title);
    if (!newTitle || newTitle.trim() === '') return;

    const newDescription = window.prompt('Nova descrição:', task.description || '');
    const newProject = window.prompt('Novo projeto/módulo:', task.project);
    if (!newProject || newProject.trim() === '') return;

    try {
      const result = await this.updateTaskUseCase.execute({
        taskId: task.id,
        title: newTitle.trim(),
        description: newDescription?.trim() || '',
        project: newProject.trim()
      });

      if (result.success) {
        window.toast?.success('Tarefa atualizada com sucesso!');
        await this.render(this.currentTaskId);
      } else {
        window.toast?.error(`Erro ao atualizar tarefa: ${result.error}`);
      }
    } catch (error) {
      window.toast?.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  }

  /**
   * Confirma exclusão de tarefa
   * @private
   */
  async _confirmDeleteTask(task) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a tarefa "${task.title}"?\n\n` +
      `Esta ação também excluirá todos os ${await this.workLogRepository.findByTaskId(task.id).then(logs => logs.length)} apontamentos associados.\n\n` +
      `Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      const result = await this.deleteTaskUseCase.execute({ taskId: task.id });
      if (result.success) {
        window.toast?.success('Tarefa excluída com sucesso!');
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'dashboard' } }));
      } else {
        window.toast?.error(`Erro ao excluir tarefa: ${result.error}`);
      }
    } catch (error) {
      window.toast?.error(`Erro ao excluir tarefa: ${error.message}`);
    }
  }

  /**
   * Mostra modal de edição de apontamento
   * @private
   */
  async _showEditWorkLogModal(workLogId) {
    // TODO: Implementar modal completo de edição
    window.toast?.info('Modal de edição de apontamento será implementado em breve');
  }

  /**
   * Confirma exclusão de apontamento
   * @private
   */
  async _confirmDeleteWorkLog(workLogId) {
    const confirmed = window.confirm('Tem certeza que deseja excluir este apontamento?');

    if (!confirmed) return;

    try {
      const result = await this.deleteWorkLogUseCase.execute({ workLogId });
      if (result.success) {
        window.toast?.success('Apontamento excluído com sucesso!');
        await this.render(this.currentTaskId);
      } else {
        window.toast?.error(`Erro ao excluir apontamento: ${result.error}`);
      }
    } catch (error) {
      window.toast?.error(`Erro ao excluir apontamento: ${error.message}`);
    }
  }

  /**
   * Obtém configuração de status
   * @private
   */
  _getStatusConfig(status) {
    const configs = {
      'TODO': {
        label: 'A Fazer',
        borderColor: '#9E9E9E',
        bgColor: 'var(--color-surface)',
        badgeBg: '#9E9E9E',
        badgeColor: 'white'
      },
      'DOING': {
        label: 'Em Andamento',
        borderColor: '#2196F3',
        bgColor: 'var(--color-surface)',
        badgeBg: '#2196F3',
        badgeColor: 'white'
      },
      'DONE': {
        label: 'Concluída',
        borderColor: '#4CAF50',
        bgColor: 'var(--color-surface)',
        badgeBg: '#4CAF50',
        badgeColor: 'white'
      },
      'BILLED': {
        label: 'Faturada',
        borderColor: '#FF9800',
        bgColor: 'var(--color-surface)',
        badgeBg: '#FF9800',
        badgeColor: 'white'
      }
    };
    return configs[status] || configs['TODO'];
  }

  /**
   * Formata data
   */
  formatDate(dateString) {
    return Formatters.dateShort(dateString);
  }

  /**
   * Formata data e hora
   */
  formatDateTime(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  /**
   * Formata moeda
   */
  formatCurrency(value) {
    return Formatters.currency(value);
  }

  /**
   * Escapa HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export para uso em módulos ES6
export { TaskDetailView };
