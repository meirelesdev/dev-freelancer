/**
 * Modal: Confirmação
 * Modal genérico para confirmações e prompts
 */
class ConfirmModal {
  /**
   * Exibe modal de confirmação simples
   * @param {Object} options - Opções do modal
   * @param {string} options.title - Título do modal
   * @param {string} options.message - Mensagem de confirmação
   * @param {string} options.confirmText - Texto do botão de confirmação
   * @param {string} options.cancelText - Texto do botão de cancelamento
   * @param {string} options.type - Tipo: 'confirm', 'prompt', 'danger'
   * @param {string} options.promptPlaceholder - Placeholder para input (se type='prompt')
   * @param {string} options.promptValue - Valor padrão do input (se type='prompt')
   * @returns {Promise<boolean|string|null>} - true se confirmado, false se cancelado, string se prompt
   */
  static show(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmar',
        message = 'Tem certeza que deseja continuar?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'confirm',
        promptPlaceholder = '',
        promptValue = '',
        confirmButtonClass = 'btn-primary',
        danger = false
      } = options;

      const existingModal = document.querySelector('.modal-backdrop.active');
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.className = 'modal-backdrop active';
      modal.setAttribute('data-modal-type', 'confirm');
      
      const isPrompt = type === 'prompt';
      const isDanger = danger || type === 'danger';
      const confirmBtnClass = isDanger ? 'btn-danger' : confirmButtonClass;

      modal.innerHTML = `
        <div class="modal" style="max-width: 450px;">
          <div class="modal-header">
            <h2>${this._escapeHtml(title)}</h2>
            <button class="modal-close" id="modal-close-confirm">×</button>
          </div>
          <div class="modal-body">
            <p style="white-space: pre-line; line-height: 1.6; margin-bottom: ${isPrompt ? 'var(--spacing-md)' : 'var(--spacing-lg)'};">
              ${this._escapeHtml(message)}
            </p>
            ${isPrompt ? `
              <div class="form-group">
                <input type="text" class="form-input" id="confirm-prompt-input" 
                       placeholder="${this._escapeHtml(promptPlaceholder)}" 
                       value="${this._escapeHtml(promptValue)}"
                       style="width: 100%;">
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-confirm-cancel">
              ${this._escapeHtml(cancelText)}
            </button>
            <button type="button" class="btn ${confirmBtnClass}" id="btn-confirm-ok">
              ${this._escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');

      const closeModal = (result = null) => {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        resolve(result);
      };

      // Event listeners
      const closeBtn = modal.querySelector('#modal-close-confirm');
      const cancelBtn = modal.querySelector('#btn-confirm-cancel');
      const okBtn = modal.querySelector('#btn-confirm-ok');

      closeBtn.addEventListener('click', () => closeModal(false));
      cancelBtn.addEventListener('click', () => closeModal(false));

      okBtn.addEventListener('click', () => {
        if (isPrompt) {
          const input = modal.querySelector('#confirm-prompt-input');
          const value = input ? input.value.trim() : '';
          closeModal(value || null);
        } else {
          closeModal(true);
        }
      });

      // Fecha ao clicar no backdrop
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(false);
        }
      });

      // Enter para confirmar, Escape para cancelar
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          okBtn.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeModal(false);
        }
      };

      document.addEventListener('keydown', handleKeyPress, { once: true });

      // Foca no input se for prompt
      if (isPrompt) {
        setTimeout(() => {
          const input = modal.querySelector('#confirm-prompt-input');
          if (input) {
            input.focus();
            input.select();
          }
        }, 100);
      } else {
        okBtn.focus();
      }
    });
  }

  /**
   * Escapa HTML para prevenir XSS
   * @private
   */
  static _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }
}

// Export para uso em módulos ES6
export { ConfirmModal };
