/**
 * Componente: Gráfico de Produtividade
 * Exibe gráfico simples de horas trabalhadas usando HTML/CSS puro
 */
class ProductivityChart {
  /**
   * Gera HTML do gráfico de horas por dia da semana
   * @param {Array<WorkLog>} workLogs - Lista de apontamentos
   * @returns {string} - HTML do gráfico
   */
  static generateWeeklyChart(workLogs) {
    if (!workLogs || workLogs.length === 0) {
      return `
        <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-secondary);">
          <p>Nenhum dado disponível para o gráfico</p>
        </div>
      `;
    }

    // Agrupa por dia da semana
    const weeklyData = {
      'Dom': 0,
      'Seg': 0,
      'Ter': 0,
      'Qua': 0,
      'Qui': 0,
      'Sex': 0,
      'Sáb': 0
    };

    workLogs.forEach(workLog => {
      const date = new Date(workLog.startTime);
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dayName = dayNames[dayOfWeek];
      const hours = (workLog.durationMinutes || 0) / 60;
      weeklyData[dayName] += hours;
    });

    // Encontra o valor máximo para normalizar
    const maxHours = Math.max(...Object.values(weeklyData), 1);

    // Gera HTML do gráfico
    const bars = Object.entries(weeklyData).map(([day, hours]) => {
      const percentage = (hours / maxHours) * 100;
      const height = Math.max(percentage, 5); // Mínimo de 5% para visibilidade

      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs);">
          <div style="width: 100%; height: 120px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 80%; background: linear-gradient(to top, var(--color-primary), #3B82F6); border-radius: var(--radius-sm) var(--radius-sm) 0 0; height: ${height}%; min-height: 4px; position: relative; transition: all 0.3s;">
              <div style="position: absolute; top: -24px; left: 50%; transform: translateX(-50%); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: var(--color-text); white-space: nowrap;">
                ${hours > 0 ? hours.toFixed(1) + 'h' : ''}
              </div>
            </div>
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium);">
            ${day}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="padding: var(--spacing-md);">
        <div style="display: flex; gap: var(--spacing-sm); align-items: flex-end; height: 160px;">
          ${bars}
        </div>
        <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            Total: ${Object.values(weeklyData).reduce((a, b) => a + b, 0).toFixed(1)}h trabalhadas
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gera HTML do gráfico de horas por dia do mês
   * @param {Array<WorkLog>} workLogs - Lista de apontamentos
   * @returns {string} - HTML do gráfico
   */
  static generateMonthlyChart(workLogs) {
    if (!workLogs || workLogs.length === 0) {
      return `
        <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-secondary);">
          <p>Nenhum dado disponível para o gráfico</p>
        </div>
      `;
    }

    // Agrupa por dia do mês
    const dailyData = {};

    workLogs.forEach(workLog => {
      const date = new Date(workLog.startTime);
      const dayKey = `${date.getDate()}/${date.getMonth() + 1}`;
      const hours = (workLog.durationMinutes || 0) / 60;
      dailyData[dayKey] = (dailyData[dayKey] || 0) + hours;
    });

    // Ordena por data
    const sortedEntries = Object.entries(dailyData).sort((a, b) => {
      const [dayA, monthA] = a[0].split('/').map(Number);
      const [dayB, monthB] = b[0].split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });

    // Limita a 30 dias para não ficar muito grande
    const limitedEntries = sortedEntries.slice(-30);

    if (limitedEntries.length === 0) {
      return `
        <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-secondary);">
          <p>Nenhum dado disponível</p>
        </div>
      `;
    }

    // Encontra o valor máximo
    const maxHours = Math.max(...limitedEntries.map(([, hours]) => hours), 1);

    // Gera HTML do gráfico (formato compacto)
    const bars = limitedEntries.map(([day, hours]) => {
      const percentage = (hours / maxHours) * 100;
      const height = Math.max(percentage, 3);

      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0;">
          <div style="width: 100%; height: 80px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 90%; background: linear-gradient(to top, var(--color-success), #10B981); border-radius: 2px 2px 0 0; height: ${height}%; min-height: 2px;" title="${day}: ${hours.toFixed(1)}h"></div>
          </div>
          ${limitedEntries.length <= 15 ? `
            <div style="font-size: 9px; color: var(--color-text-secondary); transform: rotate(-45deg); transform-origin: center; white-space: nowrap;">
              ${day.split('/')[0]}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div style="padding: var(--spacing-md); overflow-x: auto;">
        <div style="display: flex; gap: 2px; align-items: flex-end; height: 100px; min-width: ${limitedEntries.length * 20}px;">
          ${bars}
        </div>
        <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            Últimos ${limitedEntries.length} dias • Total: ${limitedEntries.reduce((sum, [, hours]) => sum + hours, 0).toFixed(1)}h
          </div>
        </div>
      </div>
    `;
  }
}

// Export para uso em módulos ES6
export { ProductivityChart };
