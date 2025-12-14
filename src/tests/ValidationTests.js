/**
 * Testes de Validação - Dev Freelancer
 * Valida cálculos financeiros e funcionalidades principais
 */
import { FinancialCalculator } from '../domain/utils/FinancialCalculator.js';
import { DEFAULT_VALUES } from '../domain/constants/DefaultValues.js';
import { Task } from '../domain/entities/Task.js';
import { WorkLog } from '../domain/entities/WorkLog.js';
import { Settings } from '../domain/entities/Settings.js';

class ValidationTests {
  /**
   * Executa todos os testes de validação
   */
  static async runAll() {
    console.log('🧪 Iniciando testes de validação...\n');

    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Teste 1: Cálculo de tempo mínimo faturado
    results.tests.push(this._testMinimumBillableTime());
    
    // Teste 2: Cálculo de valor faturado
    results.tests.push(this._testBillableAmount());
    
    // Teste 3: Criação de tarefa
    results.tests.push(this._testTaskCreation());
    
    // Teste 4: Criação de apontamento
    results.tests.push(this._testWorkLogCreation());
    
    // Teste 5: Cálculo de totais
    results.tests.push(this._testTotalCalculation());

    // Conta resultados
    results.tests.forEach(test => {
      if (test.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    });

    // Exibe resultados
    console.log('\n📊 Resumo dos Testes:');
    console.log(`✅ Passou: ${results.passed}`);
    console.log(`❌ Falhou: ${results.failed}`);
    console.log(`📈 Total: ${results.tests.length}\n`);

    // Exibe detalhes dos testes que falharam
    const failedTests = results.tests.filter(t => !t.passed);
    if (failedTests.length > 0) {
      console.log('❌ Testes que falharam:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
    }

    return results;
  }

  /**
   * Testa regra de tempo mínimo faturado
   * @private
   */
  static _testMinimumBillableTime() {
    const testName = 'Tempo Mínimo Faturável';
    
    try {
      // Teste 1: 10 minutos deve cobrar 30 minutos
      const result1 = FinancialCalculator.calculateTaskCost(10, 60);
      if (result1.billableMinutes !== 30) {
        return { name: testName, passed: false, error: `Esperado 30min, recebido ${result1.billableMinutes}min` };
      }

      // Teste 2: 45 minutos deve cobrar 45 minutos (acima do mínimo)
      const result2 = FinancialCalculator.calculateTaskCost(45, 60);
      if (result2.billableMinutes !== 45) {
        return { name: testName, passed: false, error: `Esperado 45min, recebido ${result2.billableMinutes}min` };
      }

      // Teste 3: Valor faturado para 10 minutos deve ser 0.5h * R$ 60 = R$ 30
      if (result1.billableAmount !== 30) {
        return { name: testName, passed: false, error: `Esperado R$ 30, recebido R$ ${result1.billableAmount}` };
      }

      console.log(`✅ ${testName}: Passou`);
      return { name: testName, passed: true };
    } catch (error) {
      return { name: testName, passed: false, error: error.message };
    }
  }

  /**
   * Testa cálculo de valor faturado
   * @private
   */
  static _testBillableAmount() {
    const testName = 'Cálculo de Valor Faturado';
    
    try {
      // Teste: 2 horas a R$ 60/hora = R$ 120
      const result = FinancialCalculator.calculateTaskCost(120, 60);
      if (result.billableAmount !== 120) {
        return { name: testName, passed: false, error: `Esperado R$ 120, recebido R$ ${result.billableAmount}` };
      }

      // Teste: Taxa diferente (R$ 70/hora)
      const result2 = FinancialCalculator.calculateTaskCost(60, 70);
      if (result2.billableAmount !== 70) {
        return { name: testName, passed: false, error: `Esperado R$ 70, recebido R$ ${result2.billableAmount}` };
      }

      console.log(`✅ ${testName}: Passou`);
      return { name: testName, passed: true };
    } catch (error) {
      return { name: testName, passed: false, error: error.message };
    }
  }

  /**
   * Testa criação de tarefa
   * @private
   */
  static _testTaskCreation() {
    const testName = 'Criação de Tarefa';
    
    try {
      const task = Task.create('Teste', 'Projeto Teste', 'Descrição teste');
      
      if (!task.id || !task.id.startsWith('task_')) {
        return { name: testName, passed: false, error: 'ID inválido' };
      }

      if (task.title !== 'Teste') {
        return { name: testName, passed: false, error: 'Título incorreto' };
      }

      if (task.project !== 'Projeto Teste') {
        return { name: testName, passed: false, error: 'Projeto incorreto' };
      }

      if (task.status !== Task.STATUS_TODO) {
        return { name: testName, passed: false, error: 'Status padrão incorreto' };
      }

      console.log(`✅ ${testName}: Passou`);
      return { name: testName, passed: true };
    } catch (error) {
      return { name: testName, passed: false, error: error.message };
    }
  }

  /**
   * Testa criação de apontamento
   * @private
   */
  static _testWorkLogCreation() {
    const testName = 'Criação de Apontamento';
    
    try {
      const startTime = new Date('2024-01-01T09:00:00.000Z');
      const endTime = new Date('2024-01-01T11:30:00.000Z');
      
      const workLog = WorkLog.create('task_123', startTime.toISOString(), endTime.toISOString(), 60, 30);
      
      if (workLog.durationMinutes !== 150) {
        return { name: testName, passed: false, error: `Duração incorreta: esperado 150min, recebido ${workLog.durationMinutes}min` };
      }

      // 150 minutos = 2.5 horas * R$ 60 = R$ 150
      if (workLog.billableAmount !== 150) {
        return { name: testName, passed: false, error: `Valor incorreto: esperado R$ 150, recebido R$ ${workLog.billableAmount}` };
      }

      console.log(`✅ ${testName}: Passou`);
      return { name: testName, passed: true };
    } catch (error) {
      return { name: testName, passed: false, error: error.message };
    }
  }

  /**
   * Testa cálculo de totais
   * @private
   */
  static _testTotalCalculation() {
    const testName = 'Cálculo de Totais';
    
    try {
      // Cria apontamentos de teste
      const workLogs = [
        { durationMinutes: 10, billableAmount: 30 },  // 10min -> 30min mínimo
        { durationMinutes: 60, billableAmount: 60 },  // 1h
        { durationMinutes: 90, billableAmount: 90 }  // 1.5h
      ];

      const totals = FinancialCalculator.calculateTotalBillable(workLogs);
      
      if (totals.totalDurationMinutes !== 160) {
        return { name: testName, passed: false, error: `Duração total incorreta: esperado 160min, recebido ${totals.totalDurationMinutes}min` };
      }

      if (totals.totalBillableAmount !== 180) {
        return { name: testName, passed: false, error: `Valor total incorreto: esperado R$ 180, recebido R$ ${totals.totalBillableAmount}` };
      }

      console.log(`✅ ${testName}: Passou`);
      return { name: testName, passed: true };
    } catch (error) {
      return { name: testName, passed: false, error: error.message };
    }
  }
}

// Export para uso em módulos ES6
export { ValidationTests };
