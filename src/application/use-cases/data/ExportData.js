/**
 * Use Case: Export Data
 * Exporta todos os dados do sistema para um arquivo JSON de backup
 */
export class ExportData {
  constructor(taskRepository, workLogRepository, settingsRepository) {
    this.taskRepository = taskRepository;
    this.workLogRepository = workLogRepository;
    this.settingsRepository = settingsRepository;
  }

  /**
   * Executa a exportação de dados
   * @returns {Promise<Object>} Objeto com todos os dados do sistema
   */
  /**
   * Converte entidade para objeto simples (para serialização JSON)
   * @param {Object} entity - Instância de entidade
   * @returns {Object} Objeto simples
   * @private
   */
  _entityToPlainObject(entity) {
    if (!entity) return null;
    // Cria um objeto simples com todas as propriedades da entidade
    return { ...entity };
  }

  async execute() {
    try {
      // Busca todos os dados
      const tasks = await this.taskRepository.findAll();
      const workLogs = await this.workLogRepository.findAll();
      const settings = await this.settingsRepository.find();

      // Converte entidades para objetos simples (garante serialização correta)
      const tasksData = (tasks || []).map(task => this._entityToPlainObject(task));
      const workLogsData = (workLogs || []).map(workLog => this._entityToPlainObject(workLog));
      const settingsData = settings ? this._entityToPlainObject(settings) : {};

      // Estrutura do backup
      const backupData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        tasks: tasksData,
        workLogs: workLogsData,
        settings: settingsData
      };

      return backupData;
    } catch (error) {
      throw new Error(`Erro ao exportar dados: ${error.message}`);
    }
  }
}
