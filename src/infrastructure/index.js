/**
 * Infrastructure Layer - Dev Freelancer
 * 
 * Este módulo exporta todas as implementações de repositórios
 */

// Repositórios (implementações com localStorage)
export { LocalStorageSettingsRepository } from './repositories/LocalStorageSettingsRepository.js';
export { LocalStorageTaskRepository } from './repositories/LocalStorageTaskRepository.js';
export { LocalStorageWorkLogRepository } from './repositories/LocalStorageWorkLogRepository.js';

// Repositórios antigos (mantidos para compatibilidade durante migração)
export { LocalStorageEventRepository } from './repositories/LocalStorageEventRepository.js';
export { LocalStorageTransactionRepository } from './repositories/LocalStorageTransactionRepository.js';

