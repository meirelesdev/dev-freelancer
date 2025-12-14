/**
 * Modal: Registrar Tempo
 * Permite registrar um apontamento de tempo (início e fim)
 */
class TimeLogModal {
  constructor(addWorkLogUseCase, onSuccess = null) {
    this.addWorkLogUseCase = addWorkLogUseCase;
    this.onSuccess = onSuccess;
  }

  /**
   * Exibe o modal para registrar tempo
   * @param {string} taskId - ID da tarefa
   */
  show(taskId) {
    const existingModal = document.querySelector('.modal-backdrop.active');
    if (existingModal) {
      return;
    }

    // Define valores padrão: início agora, fim em 1 hora
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    const startTimeStr = this._formatDateTimeLocal(now);
    const endTimeStr = this._formatDateTimeLocal(oneHourLater);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.setAttribute('data-modal-type', 'time-log');
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h2>⏱️ Registrar Tempo</h2>
          <button class="modal-close" id="modal-close-time-log">×</button>
        </div>
        <div class="modal-body">
          <form id="form-time-log">
            <div class="form-group">
              <label class="form-label">Início *</label>
              <input type="datetime-local" class="form-input" id="time-log-start" 
                     value="${startTimeStr}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Fim *</label>
              <input type="datetime-local" class="form-input" id="time-log-end" 
                     value="${endTimeStr}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Descrição (opcional)</label>
              <textarea class="form-input" id="time-log-description" rows="3" 
                        placeholder="O que foi feito neste período..."></textarea>
            </div>
            <div id="time-log-preview" style="margin-top: var(--spacing-md); padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-md); display: none;">
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
                Prévia:
              </div>
              <div id="time-log-duration" style="font-weight: var(--font-weight-medium);"></div>
              <div id="time-log-amount" style="font-size: var(--font-size-lg); color: var(--color-primary); margin-top: var(--spacing-xs);"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-time-log">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Tempo</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      document.body.classList.add('modal-open');
      document.getElementById('time-log-start')?.focus();
    }, 10);

    // Event listeners
    this._setupEventListeners(modal, taskId);
    this._setupPreviewUpdates();
  }

  /**
   * Configura os event listeners do modal
   * @private
   */
  _setupEventListeners(modal, taskId) {
    // Fechar modal
    const closeBtn = document.getElementById('modal-close-time-log');
    const cancelBtn = document.getElementById('btn-cancel-time-log');
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
    const form = document.getElementById('form-time-log');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this._handleSubmit(modal, taskId);
      });
    }
  }

  /**
   * Configura atualização em tempo real da prévia
   * @private
   */
  _setupPreviewUpdates() {
    const startInput = document.getElementById('time-log-start');
    const endInput = document.getElementById('time-log-end');
    const preview = document.getElementById('time-log-preview');
    const durationEl = document.getElementById('time-log-duration');
    const amountEl = document.getElementById('time-log-amount');

    const updatePreview = () => {
      if (!startInput || !endInput || !preview || !durationEl || !amountEl) return;

      const startTime = new Date(startInput.value);
      const endTime = new Date(endInput.value);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) {
        preview.style.display = 'none';
        return;
      }

      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      // Aplica regra de mínimo de 30 minutos
      const billableMinutes = Math.max(durationMinutes, 30);
      const billableHours = billableMinutes / 60;
      const hourlyRate = 60.00; // TODO: buscar das configurações
      const billableAmount = billableHours * hourlyRate;

      durationEl.textContent = `${hours}h ${minutes}min trabalhados → ${billableHours.toFixed(1)}h faturadas`;
      amountEl.textContent = `R$ ${billableAmount.toFixed(2)}`;

      preview.style.display = 'block';
    };

    if (startInput) startInput.addEventListener('change', updatePreview);
    if (startInput) startInput.addEventListener('input', updatePreview);
    if (endInput) endInput.addEventListener('change', updatePreview);
    if (endInput) endInput.addEventListener('input', updatePreview);

    // Atualiza imediatamente
    setTimeout(updatePreview, 100);
  }

  /**
   * Processa o submit do formulário
   * @private
   */
  async _handleSubmit(modal, taskId) {
    const startInput = document.getElementById('time-log-start');
    const endInput = document.getElementById('time-log-end');
    const descriptionInput = document.getElementById('time-log-description');

    if (!startInput || !endInput) {
      window.toast?.error('Erro ao processar formulário');
      return;
    }

    const startTime = new Date(startInput.value);
    const endTime = new Date(endInput.value);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      window.toast?.error('Datas inválidas');
      return;
    }

    if (endTime <= startTime) {
      window.toast?.error('Data/hora de fim deve ser posterior à data/hora de início');
      return;
    }

    try {
      if (!this.addWorkLogUseCase) {
        throw new Error('AddWorkLogUseCase não está disponível');
      }

      const result = await this.addWorkLogUseCase.execute({
        taskId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: descriptionInput?.value?.trim() || ''
      });

      if (result.success) {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }

        window.toast?.success('Tempo registrado com sucesso!');

        if (this.onSuccess) {
          this.onSuccess(result.data);
        }
      } else {
        window.toast?.error(`Erro ao registrar tempo: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      window.toast?.error(`Erro ao registrar tempo: ${error.message}`);
    }
  }

  /**
   * Formata data para formato datetime-local (YYYY-MM-DDTHH:mm)
   * @private
   */
  _formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

// Export para uso em módulos ES6
export { TimeLogModal };
