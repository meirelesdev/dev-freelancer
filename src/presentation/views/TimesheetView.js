/**
 * View: Timesheet de Desenvolvimento
 * Permite selecionar mês/ano e gerar timesheet mensal
 */
import { ReportView } from './ReportView.js';

class TimesheetView {
  constructor(generateTimesheetReportUseCase, exportTimesheetToCSVUseCase = null, settingsRepository = null) {
    this.generateTimesheetReportUseCase = generateTimesheetReportUseCase;
    this.exportTimesheetToCSVUseCase = exportTimesheetToCSVUseCase;
    this.settingsRepository = settingsRepository;
    this.currentMonth = new Date().getMonth() + 1; // 1-12
    this.currentYear = new Date().getFullYear();
  }

  async render() {
    const container = document.getElementById('monthly-report-content') || document.getElementById('timesheet-content');
    if (!container) return;

    container.innerHTML = '<div class="loading">Carregando...</div>';

    try {
      // Renderiza interface de seleção de mês/ano
      container.innerHTML = `
        <div class="card">
          <h2 style="margin-bottom: var(--spacing-md);">⏱️ Timesheet de Desenvolvimento</h2>
          <p class="text-muted" style="margin-bottom: var(--spacing-lg);">
            Gere o timesheet mensal com todos os apontamentos de tempo trabalhado.
            O relatório mostra Data, Tarefa, Módulo, Duração Real, Duração Faturada e Valor.
          </p>
        </div>

        <div class="card">
          <form id="form-timesheet">
            <div class="form-group">
              <label class="form-label">Mês</label>
              <select class="form-input" id="timesheet-month" required>
                <option value="1" ${this.currentMonth === 1 ? 'selected' : ''}>Janeiro</option>
                <option value="2" ${this.currentMonth === 2 ? 'selected' : ''}>Fevereiro</option>
                <option value="3" ${this.currentMonth === 3 ? 'selected' : ''}>Março</option>
                <option value="4" ${this.currentMonth === 4 ? 'selected' : ''}>Abril</option>
                <option value="5" ${this.currentMonth === 5 ? 'selected' : ''}>Maio</option>
                <option value="6" ${this.currentMonth === 6 ? 'selected' : ''}>Junho</option>
                <option value="7" ${this.currentMonth === 7 ? 'selected' : ''}>Julho</option>
                <option value="8" ${this.currentMonth === 8 ? 'selected' : ''}>Agosto</option>
                <option value="9" ${this.currentMonth === 9 ? 'selected' : ''}>Setembro</option>
                <option value="10" ${this.currentMonth === 10 ? 'selected' : ''}>Outubro</option>
                <option value="11" ${this.currentMonth === 11 ? 'selected' : ''}>Novembro</option>
                <option value="12" ${this.currentMonth === 12 ? 'selected' : ''}>Dezembro</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ano</label>
              <input type="number" class="form-input" id="timesheet-year" 
                     value="${this.currentYear}" min="2020" max="2100" required>
            </div>

            <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl); flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary" id="btn-back-dashboard" style="flex: 1; min-width: 100px;">
                Voltar
              </button>
              <button type="submit" class="btn btn-primary" style="flex: 1; min-width: 140px; white-space: nowrap;">
                📄 Gerar Timesheet
              </button>
            </div>
          </form>
        </div>
      `;

      // Event listener para voltar ao dashboard
      const btnBack = document.getElementById('btn-back-dashboard');
      if (btnBack) {
        btnBack.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { view: 'dashboard' } 
          }));
        });
      }

      // Event listener para gerar timesheet
      const form = document.getElementById('form-timesheet');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.generateTimesheet();
        });
      }

      // Event listener para exportar CSV
      const exportCsvBtn = document.getElementById('btn-export-csv');
      if (exportCsvBtn && this.exportTimesheetToCSVUseCase) {
        exportCsvBtn.addEventListener('click', async () => {
          await this.exportToCSV();
        });
      }
    } catch (error) {
      container.innerHTML = `
        <div class="card" style="border-left-color: var(--color-danger);">
          <p style="color: var(--color-danger);">Erro ao carregar: ${error.message}</p>
        </div>
      `;
    }
  }

  async generateTimesheet() {
    try {
      const month = parseInt(document.getElementById('timesheet-month').value);
      const year = parseInt(document.getElementById('timesheet-year').value);

      if (!month || month < 1 || month > 12) {
        window.toast?.error('Mês inválido');
        return;
      }

      if (!year || year < 2020 || year > 2100) {
        window.toast?.error('Ano inválido');
        return;
      }

      // Mostra feedback de carregamento
      const submitBtn = document.querySelector('#form-timesheet button[type="submit"]');
      const originalText = submitBtn?.textContent || '📄 Gerar Timesheet';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Gerando...';
      }

      // Gera o timesheet
      const result = await this.generateTimesheetReportUseCase.execute(month, year);

      if (result.success) {
        // Renderiza o timesheet
        const reportView = new ReportView();
        reportView.render(result, false, true); // true = isTimesheet
        
        window.toast?.success('Timesheet gerado com sucesso!');
      } else {
        window.toast?.error(`Erro ao gerar timesheet: ${result.error}`);
      }

      // Restaura o botão
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (error) {
      console.error('Erro ao gerar timesheet:', error);
      window.toast?.error(`Erro ao gerar timesheet: ${error.message}`);
      
      // Restaura o botão em caso de erro
      const submitBtn = document.querySelector('#form-timesheet button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '📄 Gerar Timesheet';
      }
    }
  }

  async exportToCSV() {
    try {
      const month = parseInt(document.getElementById('timesheet-month').value);
      const year = parseInt(document.getElementById('timesheet-year').value);

      if (!month || month < 1 || month > 12) {
        window.toast?.error('Mês inválido');
        return;
      }

      if (!year || year < 2020 || year > 2100) {
        window.toast?.error('Ano inválido');
        return;
      }

      // Mostra feedback de carregamento
      const exportBtn = document.getElementById('btn-export-csv');
      const originalText = exportBtn?.textContent || '📊 Exportar CSV';
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = '⏳ Exportando...';
      }

      // Exporta para CSV
      const result = await this.exportTimesheetToCSVUseCase.execute(month, year);

      if (result.success) {
        // Cria blob e faz download
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        window.toast?.success(`CSV exportado com sucesso! (${result.data.entriesCount} registros)`);
      } else {
        window.toast?.error(`Erro ao exportar CSV: ${result.error}`);
      }

      // Restaura o botão
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = originalText;
      }
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      window.toast?.error(`Erro ao exportar CSV: ${error.message}`);
      
      // Restaura o botão em caso de erro
      const exportBtn = document.getElementById('btn-export-csv');
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = '📊 Exportar CSV';
      }
    }
  }
}

// Export para uso em módulos ES6
export { TimesheetView };
