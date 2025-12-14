# Infrastructure Layer - Dev Freelancer

Esta camada contém as implementações concretas dos repositórios usando `localStorage` do navegador.

## 📦 Estrutura

```
src/infrastructure/
├── repositories/
│   ├── LocalStorageSettingsRepository.js    # Implementação de SettingsRepository
│   ├── LocalStorageTaskRepository.js         # Implementação de TaskRepository
│   ├── LocalStorageWorkLogRepository.js      # Implementação de WorkLogRepository
│   ├── LocalStorageEventRepository.js       # Implementação antiga (compatibilidade)
│   └── LocalStorageTransactionRepository.js  # Implementação antiga (compatibilidade)
├── index.js                                  # Exportações centralizadas
└── README.md                                 # Este arquivo
```

## 🔌 Repositórios Implementados

### LocalStorageSettingsRepository

Implementa `SettingsRepository` usando `localStorage`.

**Chave de armazenamento**: `devtracker_settings`

**Métodos:**
- `save(settings)` - Salva configurações no localStorage
- `find()` - Busca configurações (retorna `null` se não existir)
- `exists()` - Verifica se existem configurações salvas

**Características:**
- Usa `Settings.restore()` para converter JSON de volta para instância
- Retorna `null` se não houver dados (não cria padrão automaticamente)

### LocalStorageTaskRepository

Implementa `TaskRepository` usando `localStorage`.

**Chave de armazenamento**: `devtracker_tasks`

**Métodos principais:**
- `save(task)` - Salva tarefa
- `findById(id)` - Busca por ID
- `findAll(options)` - Lista com filtros e ordenação
  - `options.status` - Filtrar por status (TODO, DOING, DONE, BILLED)
  - `options.project` - Filtrar por projeto/módulo
  - `options.orderBy` - Ordenar por ('createdAt', 'title', 'project')
  - `options.order` - Direção ('asc', 'desc')
- `delete(id)` - Remove tarefa
- `exists(id)` - Verifica existência

**Características:**
- Usa `Task.restore()` para converter JSON de volta para instância
- Suporta ordenação por `createdAt`, `title` ou `project`
- Suporta filtro por `status` e `project`
- Tratamento de dados corrompidos com backup automático

### LocalStorageWorkLogRepository

Implementa `WorkLogRepository` usando `localStorage`.

**Chave de armazenamento**: `devtracker_worklogs`

**Métodos principais:**
- `save(workLog)` - Salva apontamento de tempo
- `findById(id)` - Busca por ID
- `findByTaskId(taskId)` - Lista apontamentos de uma tarefa
- `findAll(options)` - Lista com filtros
  - `options.taskId` - Filtrar por tarefa
  - `options.startDate` - Filtrar por data inicial (ISO string)
  - `options.endDate` - Filtrar por data final (ISO string)
- `delete(id)` - Remove apontamento
- `deleteByTaskId(taskId)` - Remove todos os apontamentos de uma tarefa

**Métodos de cálculo:**
- `calculateTotalBillable(taskId)` - Total faturado de uma tarefa
- `calculateTotalDurationMinutes(taskId)` - Total de minutos trabalhados

**Características:**
- Usa `WorkLog.restore()` para converter JSON de volta para instância
- Filtra apontamentos por `taskId` e intervalo de datas quando solicitado
- Todos os cálculos são feitos localmente (não depende de outros repositórios)
- Tratamento de dados corrompidos com backup automático

### Repositórios Antigos (Compatibilidade)

Os seguintes repositórios ainda existem para compatibilidade durante a migração:

- **LocalStorageEventRepository** - Chave: `gi_financas_events`
- **LocalStorageTransactionRepository** - Chave: `gi_financas_transactions`

Estes repositórios não são mais utilizados pelo sistema principal, mas são mantidos para permitir migração de dados antigos se necessário.

## 💾 Estrutura de Dados no localStorage

### Settings
```json
{
  "hourlyRate": 60.00,
  "minBillableMinutes": 30,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Tasks
```json
[
  {
    "id": "task_123",
    "title": "Implementar autenticação",
    "description": "Sistema de login e registro",
    "project": "E-commerce",
    "status": "DOING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "finishedAt": null,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### WorkLogs
```json
[
  {
    "id": "worklog_123",
    "taskId": "task_123",
    "startTime": "2024-01-01T09:00:00.000Z",
    "endTime": "2024-01-01T11:30:00.000Z",
    "durationMinutes": 150,
    "billableAmount": 150.00,
    "description": "Desenvolvimento da tela de login",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🔧 Uso

### Inicialização

```javascript
// Criar repositórios
const workLogRepository = new LocalStorageWorkLogRepository();
const taskRepository = new LocalStorageTaskRepository();
const settingsRepository = new LocalStorageSettingsRepository();

// Usar nos use cases
const createTask = new CreateTask(taskRepository);
const addWorkLog = new AddWorkLog(workLogRepository, taskRepository, settingsRepository);
```

### Exemplo: Salvar e Buscar

```javascript
// Salvar tarefa
const task = Task.create('Implementar API', 'Projeto X', 'Criar endpoints REST');
await taskRepository.save(task);

// Buscar tarefa
const found = await taskRepository.findById(task.id);

// Listar tarefas ordenadas por data de criação
const tasks = await taskRepository.findAll({
  orderBy: 'createdAt',
  order: 'desc'
});

// Filtrar tarefas por status
const pendingTasks = await taskRepository.findAll({
  status: 'TODO',
  orderBy: 'createdAt',
  order: 'desc'
});
```

### Exemplo: Apontamentos de Tempo

```javascript
// Buscar apontamentos de uma tarefa
const workLogs = await workLogRepository.findByTaskId(taskId);

// Calcular total faturado de uma tarefa
const totalBillable = await workLogRepository.calculateTotalBillable(taskId);

// Buscar apontamentos por período
const monthlyWorkLogs = await workLogRepository.findAll({
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-31T23:59:59.999Z'
});
```

## ⚠️ Observações Importantes

1. **Independência**: Os repositórios `TaskRepository` e `WorkLogRepository` são independentes entre si. Não há dependências circulares.

2. **Conversão de Instâncias**: Todos os repositórios usam os métodos `restore()` das entidades para converter JSON de volta para instâncias com métodos.

3. **Tratamento de Erros**: Todos os métodos têm tratamento de erro e retornam valores seguros (arrays vazios, null, 0) em caso de falha.

4. **Recuperação de Dados Corrompidos**: Se os dados no `localStorage` estiverem corrompidos, os repositórios criam automaticamente um backup antes de limpar os dados.

5. **Performance**: Para grandes volumes de dados, considere implementar índices ou usar IndexedDB no futuro.

6. **Compatibilidade**: Usa `window.localStorage` diretamente, garantindo compatibilidade com navegadores modernos.

7. **Migração**: Os repositórios antigos (`EventRepository`, `TransactionRepository`) ainda existem para permitir migração de dados se necessário, mas não são mais utilizados pelo sistema principal.

## 🚀 Próximos Passos

- [ ] Adicionar suporte a migração de dados
- [ ] Implementar backup/restore de dados
- [ ] Adicionar validação de integridade dos dados
- [ ] Considerar migração para IndexedDB para grandes volumes

