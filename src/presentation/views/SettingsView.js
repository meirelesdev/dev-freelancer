/**
 * View: Configurações
 * Permite alterar valor por hora e tempo mínimo faturado
 */
import { Settings } from '../../domain/entities/Settings.js';
import { DEFAULT_VALUES } from '../../domain/constants/DefaultValues.js';
import { ConfirmModal } from '../components/modals/ConfirmModal.js';

class SettingsView {
  constructor(settingsRepository, updateSettingsUseCase, exportDataUseCase = null, importDataUseCase = null, taskRepository = null, workLogRepository = null) {
    this.settingsRepository = settingsRepository;
    this.updateSettingsUseCase = updateSettingsUseCase;
    this.exportDataUseCase = exportDataUseCase;
    this.importDataUseCase = importDataUseCase;
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
  }

  async render() {
    const container = document.getElementById('settings-content');
    if (!container) return;

    container.innerHTML = '<div class="loading">Carregando...</div>';

    try {
      let settings = await this.settingsRepository.find();
      if (!settings) {
        settings = Settings.createDefault();
        await this.settingsRepository.save(settings);
      }

      container.innerHTML = `
        <div class="card">
          <h2>Configurações</h2>
          <p class="text-muted">Configure os valores padrão do sistema</p>
        </div>

        <div class="card">
          <form id="form-settings">
            <div class="form-group">
              <label class="form-label">Valor Hora (R$)</label>
              <input type="number" class="form-input" id="settings-hourly-rate" 
                     step="0.01" min="0" value="${settings.hourlyRate || DEFAULT_VALUES.HOURLY_RATE}" required>
              <small class="text-muted">Valor cobrado por hora trabalhada</small>
            </div>

            <div class="form-group">
              <label class="form-label">Tempo Mínimo Faturável (min)</label>
              <input type="number" class="form-input" id="settings-min-billable-minutes" 
                     step="1" min="1" max="480" value="${settings.minBillableMinutes || DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES}" required>
              <small class="text-muted">Tempo mínimo que será cobrado mesmo se a tarefa durar menos (regra de ${settings.minBillableMinutes || DEFAULT_VALUES.MINIMUM_BILLABLE_MINUTES} minutos)</small>
            </div>

            <div class="form-group">
              <label class="form-label">Moeda</label>
              <input type="text" class="form-input" value="BRL" disabled style="background-color: var(--color-surface-dark); cursor: not-allowed;">
              <small class="text-muted">Moeda fixa em Real Brasileiro (BRL)</small>
            </div>

            <div class="modal-footer" style="margin-top: var(--spacing-xl);">
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>

        ${this.exportDataUseCase ? `
        <div class="card" style="margin-top: var(--spacing-lg); border-left: 4px solid var(--color-primary);">
          <h3 style="margin-bottom: var(--spacing-md); color: var(--color-text);">
            🔐 Gestão de Dados
          </h3>
          <p class="text-muted" style="margin-bottom: var(--spacing-lg);">
            Faça backup dos seus dados para evitar perda de informações. Essencial ao trocar de dispositivo ou limpar o cache.
          </p>

          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <button class="btn btn-primary" id="btn-export-backup" style="width: 100%;">
              ⬇️ Fazer Backup Completo
            </button>

            <label class="btn btn-secondary" style="width: 100%; cursor: pointer; text-align: center; display: flex; align-items: center; justify-content: center;">
              <input type="file" id="input-restore-backup" accept=".json" style="display: none;">
              ⬆️ Restaurar Backup
            </label>
          </div>
        </div>

        <div class="card" style="margin-top: var(--spacing-lg); border-left: 4px solid var(--color-info); background: linear-gradient(135deg, #1E293B 0%, #334155 100%);">
          <h3 style="margin-bottom: var(--spacing-md); color: var(--color-info);">
            🔄 Atualização do Sistema
          </h3>
          <p class="text-muted" style="margin-bottom: var(--spacing-md);">
            Force a atualização do aplicativo para carregar as últimas versões dos arquivos. 
            <strong>Seus dados serão preservados</strong> (tarefas, apontamentos e configurações).
          </p>
          <button class="btn btn-info" id="btn-force-update" style="width: 100%;">
            🔄 Atualizar Aplicativo
          </button>
          <small class="text-muted" style="display: block; margin-top: var(--spacing-xs);">
            Útil após fazer alterações no código ou quando o sistema não atualiza automaticamente.
          </small>
        </div>

        <div class="card" style="margin-top: var(--spacing-lg); border-left: 4px solid var(--color-danger); background: linear-gradient(135deg, #1E293B 0%, #334155 100%);">
          <h3 style="margin-bottom: var(--spacing-md); color: var(--color-danger);">
            ⚠️ Zona de Perigo
          </h3>
          <p class="text-muted" style="margin-bottom: var(--spacing-md);">
            Esta ação apagará <strong>todos</strong> os dados do sistema (tarefas, apontamentos e configurações). 
            Esta ação não pode ser desfeita. Certifique-se de ter feito um backup antes.
          </p>
          <button class="btn btn-danger" id="btn-reset-all" style="width: 100%;">
            🗑️ Apagar Tudo
          </button>
        </div>
        ` : ''}
      `;

      document.getElementById('form-settings').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveSettings();
      });

      // Event listeners para gestão de dados
      if (this.exportDataUseCase) {
        this._setupDataManagementListeners();
      }

      // Event listener para atualização forçada
      const btnForceUpdate = document.getElementById('btn-force-update');
      if (btnForceUpdate) {
        btnForceUpdate.addEventListener('click', () => this.forceUpdate());
      }
    } catch (error) {
      container.innerHTML = `
        <div class="card" style="border-left-color: var(--color-danger);">
          <p style="color: var(--color-danger);">Erro ao carregar configurações: ${error.message}</p>
        </div>
      `;
    }
  }

  async saveSettings() {
    const hourlyRate = parseFloat(document.getElementById('settings-hourly-rate').value);
    const minBillableMinutes = parseInt(document.getElementById('settings-min-billable-minutes').value);

    const result = await this.updateSettingsUseCase.execute({
      hourlyRate,
      minBillableMinutes
    });

    if (result.success) {
      window.toast.success('Configurações salvas com sucesso!');
      // Mostra feedback visual
      const btn = document.querySelector('#form-settings button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = '✓ Salvo!';
      btn.style.background = 'var(--color-success)';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    } else {
      window.toast.error(`Erro: ${result.error}`);
    }
  }

  /**
   * Configura os event listeners para gestão de dados
   * @private
   */
  _setupDataManagementListeners() {
    // Exportar Backup
    const btnExportBackup = document.getElementById('btn-export-backup');
    if (btnExportBackup) {
      btnExportBackup.addEventListener('click', () => this.exportBackup());
    }

    // Restaurar Backup
    const inputRestoreBackup = document.getElementById('input-restore-backup');
    if (inputRestoreBackup) {
      inputRestoreBackup.addEventListener('change', (e) => this.restoreBackup(e));
    }

    // Reset de Fábrica
    const btnResetAll = document.getElementById('btn-reset-all');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => this.resetAll());
    }
  }

  /**
   * Exporta backup completo em JSON
   */
  async exportBackup() {
    try {
      if (!this.exportDataUseCase) {
        window.toast.error('Funcionalidade de exportação não disponível');
        return;
      }

      const btn = document.getElementById('btn-export-backup');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Exportando...';

      const backupData = await this.exportDataUseCase.execute();

      // Validação dos dados exportados
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Erro ao gerar backup: dados inválidos');
      }

      if (!backupData.version) {
        throw new Error('Erro ao gerar backup: versão não encontrada');
      }

      // Gera nome do arquivo com data e hora
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const filename = `backup_dev_freelancer_${dateStr}_${timeStr}.json`;

      // Cria blob e faz download
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const tasksCount = backupData.tasks ? backupData.tasks.length : 0;
      const workLogsCount = backupData.workLogs ? backupData.workLogs.length : 0;
      const settingsInfo = backupData.settings ? 'com configurações' : 'sem configurações';
      window.toast.success(`Backup exportado com sucesso! (${tasksCount} tarefas, ${workLogsCount} apontamentos, ${settingsInfo})`);
      
      btn.disabled = false;
      btn.textContent = originalText;
    } catch (error) {
      window.toast.error(`Erro ao exportar backup: ${error.message}`);
      const btn = document.getElementById('btn-export-backup');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '⬇️ Fazer Backup Completo';
      }
    }
  }

  /**
   * Restaura backup de arquivo JSON
   * @param {Event} event - Evento do input file
   */
  async restoreBackup(event) {
    try {
      if (!this.importDataUseCase) {
        window.toast.error('Funcionalidade de importação não disponível');
        return;
      }

      const file = event.target.files[0];
      if (!file) {
        return;
      }

      // Lê o arquivo primeiro para validar antes de pedir confirmação
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = e.target.result;
          
          // Validação básica do arquivo antes de pedir confirmação
          let parsedData;
          try {
            parsedData = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
          } catch (parseError) {
            window.toast.error('Arquivo de backup inválido: formato JSON incorreto');
            event.target.value = '';
            return;
          }

          // Validação da estrutura básica
          if (!parsedData.version) {
            window.toast.error('Arquivo de backup inválido: versão não encontrada');
            event.target.value = '';
            return;
          }

          const tasksCount = parsedData.tasks ? parsedData.tasks.length : 0;
          const workLogsCount = parsedData.workLogs ? parsedData.workLogs.length : 0;

          // Confirmação usando modal (após validar arquivo)
          const confirmed = await ConfirmModal.show({
            title: '⚠️ Restaurar Backup',
            message: `Esta ação substituirá TODOS os dados atuais pelos dados do backup.\n\nArquivo contém:\n• ${tasksCount} tarefas\n• ${workLogsCount} apontamentos\n\nCertifique-se de que este é o arquivo correto.\n\nDeseja continuar?`,
            confirmText: 'Sim, Restaurar',
            cancelText: 'Cancelar',
            type: 'confirm',
            danger: true
          });

          if (!confirmed) {
            event.target.value = ''; // Limpa o input
            return;
          }

          // Executa a importação (já validado acima)
          const result = await this.importDataUseCase.execute(backupData);

          window.toast.success(
            `Backup restaurado com sucesso! ` +
            `(${result.tasksCount || 0} tarefas, ${result.workLogsCount || 0} apontamentos restaurados)`
          );

          // Recarrega a página para aplicar os dados novos
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Erro ao restaurar backup:', error);
          window.toast.error(`Erro ao restaurar backup: ${error.message}`);
          event.target.value = ''; // Limpa o input em caso de erro
        }
      };

      reader.onerror = () => {
        window.toast.error('Erro ao ler arquivo de backup');
        event.target.value = '';
      };

      reader.readAsText(file);
    } catch (error) {
      window.toast.error(`Erro ao processar backup: ${error.message}`);
      event.target.value = '';
    }
  }

  /**
   * Reset de fábrica - Apaga todos os dados
   */
  async resetAll() {
    try {
      // Primeira confirmação com prompt
      const firstConfirm = await ConfirmModal.show({
        title: '⚠️ ATENÇÃO CRÍTICA ⚠️',
        message: 'Esta ação apagará PERMANENTEMENTE:\n• Todas as tarefas\n• Todos os apontamentos\n• Todas as configurações\n\nEsta ação NÃO PODE SER DESFEITA!\n\nDigite "DELETAR" (em maiúsculas) para confirmar:',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'prompt',
        promptPlaceholder: 'Digite DELETAR',
        promptValue: '',
        danger: true
      });

      if (firstConfirm !== 'DELETAR') {
        window.toast.info('Operação cancelada');
        return;
      }

      // Segunda confirmação
      const secondConfirm = await ConfirmModal.show({
        title: '⚠️ ÚLTIMA CONFIRMAÇÃO ⚠️',
        message: 'Você tem CERTEZA ABSOLUTA que deseja apagar TODOS os dados?\n\nCertifique-se de ter feito um backup antes de continuar.\n\nEsta ação é IRREVERSÍVEL!',
        confirmText: 'Sim, Apagar Tudo',
        cancelText: 'Cancelar',
        type: 'confirm',
        danger: true
      });

      if (!secondConfirm) {
        window.toast.info('Operação cancelada');
        return;
      }

      const btn = document.getElementById('btn-reset-all');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Apagando...';

      try {
        // Limpa todas as tarefas diretamente do localStorage
        if (this.taskRepository) {
          const tasks = await this.taskRepository.findAll();
          for (const task of tasks) {
            await this.taskRepository.delete(task.id);
          }
          // Garante limpeza completa
          window.localStorage.removeItem('devtracker_tasks');
        }

        // Limpa todos os apontamentos diretamente do localStorage
        if (this.workLogRepository) {
          const workLogs = await this.workLogRepository.findAll();
          for (const workLog of workLogs) {
            await this.workLogRepository.delete(workLog.id);
          }
          // Garante limpeza completa
          window.localStorage.removeItem('devtracker_worklogs');
        }

        // Restaura configurações padrão
        if (this.settingsRepository) {
          const defaultSettings = Settings.createDefault();
          await this.settingsRepository.save(defaultSettings);
        }

        // Limpa também chaves antigas que possam existir (compatibilidade)
        window.localStorage.removeItem('dev_tasks');
        window.localStorage.removeItem('dev_worklogs');
        window.localStorage.removeItem('gi_financas_settings');
        window.localStorage.removeItem('chef_finance_settings');
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        // Tenta limpar diretamente mesmo em caso de erro
        window.localStorage.removeItem('devtracker_tasks');
        window.localStorage.removeItem('devtracker_worklogs');
        window.localStorage.removeItem('devtracker_settings');
      }

      window.toast.success('Todos os dados foram apagados. A página será recarregada...');

      // Recarrega a página
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      window.toast.error(`Erro ao apagar dados: ${error.message}`);
      const btn = document.getElementById('btn-reset-all');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🗑️ Apagar Tudo';
      }
    }
  }

  /**
   * Força atualização do PWA sem perder dados
   * Desregistra service workers, limpa cache e recarrega a página
   */
  async forceUpdate() {
    try {
      const btn = document.getElementById('btn-force-update');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Atualizando...';

      // Confirmação usando modal
      const confirmed = await ConfirmModal.show({
        title: '🔄 Atualizar Aplicativo',
        message: 'Esta ação irá:\n• Desregistrar o service worker atual\n• Limpar o cache do navegador\n• Recarregar a página com os arquivos mais recentes\n\n✅ Seus dados serão preservados (tarefas, apontamentos e configurações)\n\nDeseja continuar?',
        confirmText: 'Sim, Atualizar',
        cancelText: 'Cancelar',
        type: 'confirm'
      });

      if (!confirmed) {
        btn.disabled = false;
        btn.textContent = originalText;
        return;
      }

      // Passo 1: Desregistrar todos os service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ Service Worker desregistrado:', registration.scope);
        }
      }

      // Passo 2: Limpar cache do navegador (Cache API)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Limpando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        console.log('✅ Cache limpo');
      }

      window.toast.success('Atualização concluída! A página será recarregada...');

      // Passo 3: Recarregar a página com bypass do cache
      setTimeout(() => {
        // Força reload sem cache
        window.location.reload(true);
        // Fallback caso o navegador não suporte o parâmetro true
        if (!window.location.reload(true)) {
          window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
        }
      }, 1000);

    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
      window.toast.error(`Erro ao atualizar: ${error.message}`);
      
      const btn = document.getElementById('btn-force-update');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🔄 Atualizar Aplicativo';
      }
    }
  }
}

// Export para uso em módulos ES6
export { SettingsView };
