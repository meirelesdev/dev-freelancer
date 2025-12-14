/**
 * View: Dashboard
 * Exibe KPIs e lista de tarefas recentes
 */
import { Formatters } from '../utils/Formatters.js';
import { Task } from '../../domain/entities/Task.js';

class DashboardView {
  constructor(taskRepository, workLogRepository, settingsRepository, createTaskUseCase = null) {
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
    this.settingsRepository = settingsRepository;
    this.createTaskUseCase = createTaskUseCase;
    this._handleCreateNewTask = null;
  }

  async render() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    container.innerHTML = '<div class="loading">Carregando...</div>';

    try {
      // Busca todas as tarefas
      const tasks = await this.taskRepository.findAll({
        orderBy: 'createdAt',
        order: 'desc'
      });

      // Busca todas os apontamentos do mês atual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const allWorkLogs = await this.workLogRepository.findAll({
        startDate: firstDayOfMonth.toISOString(),
        endDate: lastDayOfMonth.toISOString()
      });

      // Calcula KPIs
      const monthlyBilling = allWorkLogs.reduce((sum, w) => sum + (w.billableAmount || 0), 0);
      const totalWorkedMinutes = allWorkLogs.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
      const totalWorkedHours = (totalWorkedMinutes / 60).toFixed(1);
      const pendingTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'DOING').length;

      // Calcula valor acumulado por tarefa
      const tasksWithValue = await Promise.all(
        tasks.slice(0, 10).map(async (task) => {
          const taskWorkLogs = await this.workLogRepository.findByTaskId(task.id);
          const taskValue = taskWorkLogs.reduce((sum, w) => sum + (w.billableAmount || 0), 0);
          return { ...task, accumulatedValue: taskValue };
        })
      );

      // Renderiza
      container.innerHTML = `
        <!-- Cards de KPI -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
          <!-- Card 1: Faturamento Mês -->
          <div class="card" style="background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); border: none; color: white;">
            <div style="font-size: var(--font-size-sm); opacity: 0.9; margin-bottom: var(--spacing-xs);">
              💰 Faturamento Mês
            </div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">
              ${this.formatCurrency(monthlyBilling)}
            </div>
            <div style="font-size: var(--font-size-xs); opacity: 0.8; margin-top: var(--spacing-xs);">
              ${allWorkLogs.length} apontamento(s)
            </div>
          </div>

          <!-- Card 2: Horas Trabalhadas -->
          <div class="card" style="background: linear-gradient(135deg, #065F46 0%, #10B981 100%); border: none; color: white;">
            <div style="font-size: var(--font-size-sm); opacity: 0.9; margin-bottom: var(--spacing-xs);">
              ⏱️ Horas Trabalhadas
            </div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">
              ${totalWorkedHours}h
            </div>
            <div style="font-size: var(--font-size-xs); opacity: 0.8; margin-top: var(--spacing-xs);">
              ${totalWorkedMinutes} minutos
            </div>
          </div>

          <!-- Card 3: Tarefas Pendentes -->
          <div class="card" style="background: linear-gradient(135deg, #6B21A8 0%, #9333EA 100%); border: none; color: white;">
            <div style="font-size: var(--font-size-sm); opacity: 0.9; margin-bottom: var(--spacing-xs);">
              📋 Tarefas Pendentes
            </div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">
              ${pendingTasks}
            </div>
            <div style="font-size: var(--font-size-xs); opacity: 0.8; margin-top: var(--spacing-xs);">
              ${tasks.filter(t => t.status === 'TODO').length} TODO • ${tasks.filter(t => t.status === 'DOING').length} DOING
            </div>
          </div>
        </div>

        <!-- Lista de Tarefas Recentes -->
        <div style="margin-bottom: var(--spacing-md);">
          <h2 style="margin: 0;">Tarefas Recentes</h2>
        </div>
        
        ${tasksWithValue.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><></div>
            <p>Nenhuma tarefa no momento.</p>
            <p class="text-muted" style="font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">
              Use o botão ➕ abaixo para criar sua primeira tarefa
            </p>
          </div>
        ` : `
          <div class="task-list">
            ${tasksWithValue.map(task => this.renderTaskItem(task)).join('')}
          </div>
        `}
      `;

      // Adiciona event listeners para navegação
      container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => {
          const taskId = item.dataset.taskId;
          this.navigateToTask(taskId);
        });
      });

      // Event listener para criar tarefa (FAB)
      if (this.createTaskUseCase) {
        // Remove listener anterior se existir
        if (DashboardView._globalCreateTaskHandler) {
          window.removeEventListener('create-new-task', DashboardView._globalCreateTaskHandler);
          DashboardView._globalCreateTaskHandler = null;
        }
        
        // Cria função handler
        const handler = () => {
          const existingModal = document.querySelector('.modal-backdrop.active');
          if (existingModal) {
            return;
          }
          
          const container = document.getElementById('dashboard-content');
          if (container && container.classList.contains('active')) {
            this.showCreateTaskModal();
          }
        };
        
        DashboardView._globalCreateTaskHandler = handler;
        this._handleCreateNewTask = handler;
        
        window.addEventListener('create-new-task', handler);
      }

    } catch (error) {
      container.innerHTML = `
        <div class="card" style="border-left-color: var(--color-danger);">
          <p style="color: var(--color-danger);">Erro ao carregar dashboard: ${error.message}</p>
        </div>
      `;
    }
  }

  renderTaskItem(task) {
    const statusConfig = this._getStatusConfig(task.status);
    const formattedDate = this.formatDate(task.createdAt);
    
    return `
      <div class="task-item" data-task-id="${task.id}" style="cursor: pointer; padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-md); margin-bottom: var(--spacing-sm); border-left: 3px solid ${statusConfig.borderColor}; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--spacing-md);">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
              <span style="font-size: var(--font-size-lg);">\<\></span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: var(--font-weight-semibold); color: var(--color-text); margin-bottom: 2px;">
                  <span style="color: var(--color-primary); font-size: var(--font-size-sm);">[${this.escapeHtml(task.project)}]</span> ${this.escapeHtml(task.title)}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap;">
              <span class="badge" style="background-color: ${statusConfig.badgeColor}; color: ${statusConfig.badgeTextColor}; font-size: 11px;">
                ${statusConfig.label}
              </span>
              <span style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">•</span>
              <span style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">${formattedDate}</span>
            </div>
          </div>
          ${task.accumulatedValue > 0 ? `
            <div style="text-align: right; flex-shrink: 0;">
              <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-success);">
                ${this.formatCurrency(task.accumulatedValue)}
              </div>
              <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                acumulado
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Retorna configuração visual do status
   * @private
   */
  _getStatusConfig(status) {
    const configs = {
      'TODO': {
        label: 'A Fazer',
        badgeColor: '#6b7280',
        badgeTextColor: '#fff',
        borderColor: '#6b7280'
      },
      'DOING': {
        label: 'Em Andamento',
        badgeColor: '#3b82f6',
        badgeTextColor: '#fff',
        borderColor: '#3b82f6'
      },
      'DONE': {
        label: 'Concluída',
        badgeColor: '#10b981',
        badgeTextColor: '#fff',
        borderColor: '#10b981'
      },
      'BILLED': {
        label: 'Faturada',
        badgeColor: '#9333ea',
        badgeTextColor: '#fff',
        borderColor: '#9333ea'
      }
    };

    return configs[status] || configs['TODO'];
  }

  navigateToTask(taskId) {
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { view: 'task-detail', taskId } 
    }));
  }

  formatCurrency(value) {
    return Formatters.currency(value);
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  escapeHtml(text) {
    return Formatters.escapeHtml(text);
  }

  async showCreateTaskModal() {
    const existingModal = document.querySelector('.modal-backdrop.active');
    if (existingModal) {
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.setAttribute('data-modal-type', 'create-task');
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h2>Nova Tarefa</h2>
          <button class="modal-close" id="modal-close-create-task">×</button>
        </div>
        <div class="modal-body">
          <form id="form-create-task">
            <div class="form-group">
              <label class="form-label">Projeto/Cliente *</label>
              <input type="text" class="form-input" id="task-project" required 
                     placeholder="Ex: Importador XML, Loja Virtual">
            </div>
            <div class="form-group">
              <label class="form-label">Título da Tarefa *</label>
              <input type="text" class="form-input" id="task-title" required 
                     placeholder="Ex: Corrigir bug no login">
            </div>
            <div class="form-group">
              <label class="form-label">Descrição (opcional)</label>
              <textarea class="form-input" id="task-description" rows="3" 
                        placeholder="Detalhes sobre a tarefa..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-create-task">Cancelar</button>
              <button type="submit" class="btn btn-primary">Criar Tarefa</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');

      const closeModal = () => {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      };

      const closeBtn = modal.querySelector('#modal-close-create-task');
      const cancelBtn = modal.querySelector('#btn-cancel-create-task');
      const form = modal.querySelector('#form-create-task');

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      const modalContent = modal.querySelector('.modal');
      if (modalContent) {
        modalContent.addEventListener('click', (e) => e.stopPropagation());
      }

      if (form) {
        let isSubmitting = false;
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (isSubmitting) return;
          isSubmitting = true;
          
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Criando...';
          }
          
          try {
            await this.createTask(modal);
          } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            window.toast.error('Erro ao criar tarefa. Tente novamente.');
          } finally {
            isSubmitting = false;
            if (submitBtn && document.body.contains(modal)) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Criar Tarefa';
            }
          }
        });
      }
    }, 0);
  }

  async createTask(modal) {
    const projectInput = modal.querySelector('#task-project');
    const titleInput = modal.querySelector('#task-title');
    const descriptionInput = modal.querySelector('#task-description');

    if (!projectInput || !titleInput) {
      window.toast.error('Erro ao processar formulário. Tente novamente.');
      return;
    }

    const project = projectInput.value.trim();
    const title = titleInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!project || project.length < 2) {
      window.toast.warning('O projeto deve ter pelo menos 2 caracteres.');
      projectInput.focus();
      return;
    }

    if (!title || title.length < 3) {
      window.toast.warning('O título da tarefa deve ter pelo menos 3 caracteres.');
      titleInput.focus();
      return;
    }

    try {
      if (this.createTaskUseCase) {
        const result = await this.createTaskUseCase.execute({
          title,
          project,
          description: description || null
        });

        if (result.success) {
          document.body.classList.remove('modal-open');
          document.documentElement.classList.remove('modal-open');
          if (document.body.contains(modal)) {
            document.body.removeChild(modal);
          }
          
          window.toast.success('Tarefa criada com sucesso!');
          
          if (result.data && result.data.id) {
            setTimeout(() => {
              this.navigateToTask(result.data.id);
            }, 100);
          } else {
            await this.render();
          }
        } else {
          window.toast.error(`Erro ao criar tarefa: ${result.error || 'Erro desconhecido'}`);
        }
      } else {
        // Fallback: cria diretamente via repositório
        const task = Task.create(title, project, description);
        await this.taskRepository.save(task);
        
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        
        window.toast.success('Tarefa criada com sucesso!');
        await this.render();
      }
    } catch (error) {
      window.toast.error(`Erro ao criar tarefa: ${error.message}`);
    }
  }
}

// Export para uso em módulos ES6
export { DashboardView };
