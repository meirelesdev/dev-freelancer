/**
 * Modal: Editar Apontamento de Tempo
 * Permite editar um apontamento de tempo existente
 */
class EditWorkLogModal {
  constructor(updateWorkLogUseCase, settingsRepository, onSuccess = null) {
    this.updateWorkLogUseCase = updateWorkLogUseCase;
    this.settingsRepository = settingsRepository;
    this.onSuccess = onSuccess;
  }

  /**
   * Exibe o modal para editar apontamento
   * @param {WorkLog} workLog - Apontamento a ser editado
   */
  async show(workLog) {
    const existingModal = document.querySelector('.modal-backdrop.active');
    if (existingModal) {
      return;
    }

    // Busca configurações para prévia
    const settings = await this.settingsRepository.find();
    const hourlyRate = settings?.hourlyRate || 60.00;
    const minimumBillableMinutes = settings?.minBillableMinutes || 30;

    // Formata valores iniciais
    const startDate = new Date(workLog.startTime);
    const endDate = new Date(workLog.endTime);
    const startTimeStr = this._formatDateTimeLocal(startDate);
    const endTimeStr = this._formatDateTimeLocal(endDate);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.setAttribute('data-modal-type', 'edit-worklog');
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h2>✏️ Editar Apontamento</h2>
          <button class="modal-close" id="modal-close-edit-worklog">×</button>
        </div>
        <div class="modal-body">
          <form id="form-edit-worklog">
            <div class="form-group">
              <label class="form-label">Início *</label>
              <input type="datetime-local" class="form-input" id="edit-worklog-start" 
                     value="${startTimeStr}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Fim *</label>
              <input type="datetime-local" class="form-input" id="edit-worklog-end" 
                     value="${endTimeStr}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Descrição (opcional)</label>
              <textarea class="form-input" id="edit-worklog-description" rows="3">${this._escapeHtml(workLog.description || '')}</textarea>
            </div>
            <div id="edit-worklog-preview" style="margin-top: var(--spacing-md); padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-md); display: none;">
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);">
                Prévia:
              </div>
              <div id="edit-worklog-duration" style="font-weight: var(--font-weight-medium);"></div>
              <div id="edit-worklog-amount" style="font-size: var(--font-size-lg); color: var(--color-primary); margin-top: var(--spacing-xs);"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit-worklog">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      document.body.classList.add('modal-open');
      document.getElementById('edit-worklog-start')?.focus();
    }, 10);

    // Event listeners
    this._setupEventListeners(modal, workLog, hourlyRate, minimumBillableMinutes);
    this._setupPreviewUpdates(hourlyRate, minimumBillableMinutes);
  }

  /**
   * Configura os event listeners do modal
   * @private
   */
  _setupEventListeners(modal, workLog, hourlyRate, minimumBillableMinutes) {
    // Fechar modal
    const closeBtn = document.getElementById('modal-close-edit-worklog');
    const cancelBtn = document.getElementById('btn-cancel-edit-worklog');
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
    const form = document.getElementById('form-edit-worklog');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this._handleSubmit(modal, workLog);
      });
    }
  }

  /**
   * Configura atualização em tempo real da prévia
   * @private
   */
  _setupPreviewUpdates(hourlyRate, minimumBillableMinutes) {
    const startInput = document.getElementById('edit-worklog-start');
    const endInput = document.getElementById('edit-worklog-end');
    const preview = document.getElementById('edit-worklog-preview');
    const durationEl = document.getElementById('edit-worklog-duration');
    const amountEl = document.getElementById('edit-worklog-amount');

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

      // Aplica regra de mínimo
      const billableMinutes = Math.max(durationMinutes, minimumBillableMinutes);
      const billableHours = billableMinutes / 60;
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
  async _handleSubmit(modal, workLog) {
    const startInput = document.getElementById('edit-worklog-start');
    const endInput = document.getElementById('edit-worklog-end');
    const descriptionInput = document.getElementById('edit-worklog-description');

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
      if (!this.updateWorkLogUseCase) {
        throw new Error('UpdateWorkLogUseCase não está disponível');
      }

      const result = await this.updateWorkLogUseCase.execute({
        workLogId: workLog.id,
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

        window.toast?.success('Apontamento atualizado com sucesso!');

        if (this.onSuccess) {
          this.onSuccess(result.data);
        }
      } else {
        window.toast?.error(`Erro ao atualizar apontamento: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      window.toast?.error(`Erro ao atualizar apontamento: ${error.message}`);
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
export { EditWorkLogModal };
