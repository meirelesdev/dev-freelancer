/**
 * Domain Layer - Dev Freelancer
 * 
 * Este módulo exporta todas as entidades e interfaces de repositórios do domínio
 */

// Entidades - Novo Domínio
export { Settings } from './entities/Settings.js';
export { Task } from './entities/Task.js';
export { WorkLog } from './entities/WorkLog.js';

// Repositórios (interfaces) - Novo Domínio
export { TaskRepository } from './repositories/TaskRepository.js';
export { WorkLogRepository } from './repositories/WorkLogRepository.js';
export { SettingsRepository } from './repositories/SettingsRepository.js';

// Entidades e Repositórios Antigos (mantidos para compatibilidade)
export { Event } from './entities/Event.js';
export { Transaction } from './entities/Transaction.js';
export { EventRepository } from './repositories/EventRepository.js';
export { TransactionRepository } from './repositories/TransactionRepository.js';

