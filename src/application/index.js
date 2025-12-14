/**
 * Application Layer - Dev Freelancer
 * 
 * Este módulo exporta todos os casos de uso da camada de aplicação
 */

// Use Cases - Novo Domínio
export { CreateTask } from './use-cases/CreateTask.js';
export { GetTaskSummary } from './use-cases/GetTaskSummary.js';
export { AddWorkLog } from './use-cases/AddWorkLog.js';
export { UpdateTask } from './use-cases/UpdateTask.js';
export { DeleteTask } from './use-cases/DeleteTask.js';
export { UpdateWorkLog } from './use-cases/UpdateWorkLog.js';
export { DeleteWorkLog } from './use-cases/DeleteWorkLog.js';
export { UpdateSettings } from './use-cases/UpdateSettings.js';
export { GenerateTimesheetReport } from './use-cases/GenerateTimesheetReport.js';

// Use Cases - Antigos (mantidos para compatibilidade durante migração)
export { CreateEvent } from './use-cases/CreateEvent.js';
export { AddTransaction } from './use-cases/AddTransaction.js';
export { DeleteTransaction } from './use-cases/DeleteTransaction.js';
export { GetEventSummary } from './use-cases/GetEventSummary.js';
export { GenerateEventReport } from './use-cases/GenerateEventReport.js';
export { UpdateEventStatus } from './use-cases/UpdateEventStatus.js';
export { UpdateEvent } from './use-cases/UpdateEvent.js';
export { UpdateTransaction } from './use-cases/UpdateTransaction.js';
export { DeleteEvent } from './use-cases/DeleteEvent.js';

