/**
 * Use Case: Export Timesheet to CSV
 * Exporta timesheet mensal para formato CSV
 */
class ExportTimesheetToCSV {
  constructor(generateTimesheetReportUseCase) {
    if (!generateTimesheetReportUseCase) {
      throw new Error('GenerateTimesheetReportUseCase é obrigatório');
    }
    this.generateTimesheetReportUseCase = generateTimesheetReportUseCase;
  }

  /**
   * Executa a exportação para CSV
   * @param {number} month - Mês (1-12)
   * @param {number} year - Ano (ex: 2024)
   * @returns {Promise<Object>} - Resultado com CSV ou erro
   */
  async execute(month, year) {
    try {
      // Validação de entrada
      if (!month || month < 1 || month > 12) {
        throw new Error('Mês inválido (deve ser entre 1 e 12)');
      }
      if (!year || year < 2020 || year > 2100) {
        throw new Error('Ano inválido');
      }

      // Gera o timesheet
      const timesheetResult = await this.generateTimesheetReportUseCase.execute(month, year);
      
      if (!timesheetResult.success) {
        return {
          success: false,
          error: timesheetResult.error || 'Erro ao gerar timesheet'
        };
      }

      const data = timesheetResult.data;

      // Cria o CSV
      const csv = this._generateCSV(data);

      // Cria nome do arquivo
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const fileName = `timesheet_${monthNames[month - 1]}_${year}.csv`;

      return {
        success: true,
        data: {
          csv,
          fileName,
          entriesCount: data.entries.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera o conteúdo CSV
   * @private
   */
  _generateCSV(data) {
    const lines = [];

    // Cabeçalho
    lines.push('Data,Tarefa,Módulo,Duração Real (min),Duração Faturada (h),Valor (R$)');

    // Linhas de dados
    data.entries.forEach(entry => {
      const date = this._formatDate(entry.date);
      const taskTitle = this._escapeCSV(entry.taskTitle);
      const project = this._escapeCSV(entry.project);
      const durationMinutes = entry.durationMinutes;
      const billableHours = entry.billableHours.toFixed(1).replace('.', ',');
      const billableAmount = entry.billableAmount.toFixed(2).replace('.', ',');

      lines.push(`${date},${taskTitle},${project},${durationMinutes},${billableHours},${billableAmount}`);
    });

    // Linha de totais
    const totalDurationMinutes = data.totals.totalDurationMinutes;
    const totalBillableHours = data.totals.totalBillableHours.toFixed(1).replace('.', ',');
    const totalBillableAmount = data.totals.totalBillableAmount.toFixed(2).replace('.', ',');
    
    lines.push('');
    lines.push(`TOTAL,,,${totalDurationMinutes},${totalBillableHours},${totalBillableAmount}`);

    return lines.join('\n');
  }

  /**
   * Formata data para CSV (DD/MM/YYYY)
   * @private
   */
  _formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Escapa valores CSV (adiciona aspas se necessário)
   * @private
   */
  _escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Se contém vírgula, aspas ou quebra de linha, envolve em aspas e duplica aspas internas
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}

// Export para uso em módulos ES6
export { ExportTimesheetToCSV };
