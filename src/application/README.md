# Application Layer - Dev Freelancer

Esta camada contém os casos de uso (use cases) da aplicação, que orquestram as operações de negócio usando as entidades do domínio e os repositórios.

## 📦 Estrutura

```
src/application/
├── use-cases/
│   ├── CreateTask.js              # Criar nova tarefa
│   ├── GetTaskSummary.js          # Obter resumo da tarefa (tempo e faturamento)
│   ├── AddWorkLog.js              # Adicionar apontamento de tempo
│   ├── UpdateTask.js              # Atualizar tarefa
│   ├── DeleteTask.js              # Excluir tarefa
│   ├── UpdateWorkLog.js           # Atualizar apontamento de tempo
│   ├── DeleteWorkLog.js           # Excluir apontamento de tempo
│   ├── UpdateSettings.js          # Atualizar configurações
│   ├── GenerateTimesheetReport.js # Gerar timesheet mensal
│   └── data/
│       ├── ExportData.js          # Exportar backup de dados
│       └── ImportData.js          # Importar backup de dados
├── index.js                       # Exportações centralizadas
└── README.md                      # Este arquivo
```

## 🎯 Casos de Uso

### CreateTask

Cria uma nova tarefa no sistema.

**Dependências:**
- `TaskRepository`

**Entrada:**
```javascript
{
  title: string,          // Título da tarefa (obrigatório)
  project: string,        // Projeto/Módulo (obrigatório)
  description?: string,   // Descrição opcional
  status?: string         // Status inicial (padrão: 'TODO')
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: Task,           // Tarefa criada
  error?: string          // Mensagem de erro
}
```

**Exemplo:**
```javascript
const createTask = new CreateTask(taskRepository);
const result = await createTask.execute({
  title: 'Implementar autenticação',
  project: 'E-commerce',
  description: 'Sistema de login e registro'
});
```

---

### GetTaskSummary

Retorna o resumo completo de uma tarefa (tempo trabalhado e faturamento).

**Dependências:**
- `TaskRepository`
- `WorkLogRepository`
- `SettingsRepository`

**Entrada:**
```javascript
{
  taskId: string  // ID da tarefa (obrigatório)
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: {
    task: Task,
    workLogs: WorkLog[],
    totals: {
      totalDurationMinutes: number,      // Tempo total trabalhado (minutos)
      totalBillableMinutes: number,      // Tempo total faturado (minutos)
      totalBillableHours: number,        // Tempo total faturado (horas)
      totalBillableAmount: number,       // Valor total faturado (R$)
      workLogsCount: number              // Quantidade de apontamentos
    },
    settings: {
      hourlyRate: number                 // Taxa horária configurada
    }
  },
  error?: string
}
```

**Exemplo:**
```javascript
const getTaskSummary = new GetTaskSummary(
  taskRepository,
  workLogRepository,
  settingsRepository
);

const result = await getTaskSummary.execute({
  taskId: 'task_123'
});

if (result.success) {
  const summary = result.data;
  console.log('Tempo Trabalhado:', summary.totals.totalDurationMinutes, 'min');
  console.log('Tempo Faturado:', summary.totals.totalBillableHours, 'h');
  console.log('Valor Faturado:', summary.totals.totalBillableAmount);
}
```

---

### AddWorkLog

Adiciona um apontamento de tempo a uma tarefa.

**Características especiais:**
- Calcula automaticamente a duração em minutos
- Aplica regra de mínimo faturado (30 minutos por padrão)
- Calcula valor faturado baseado na taxa horária configurada

**Dependências:**
- `WorkLogRepository`
- `TaskRepository`
- `SettingsRepository`

**Entrada:**
```javascript
{
  taskId: string,        // ID da tarefa (obrigatório)
  startTime: string,     // Data/hora de início (ISO string, obrigatório)
  endTime: string,       // Data/hora de fim (ISO string, obrigatório)
  description?: string   // Descrição opcional
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: WorkLog,        // Apontamento criado
  error?: string          // Mensagem de erro
}
```

**Exemplo:**
```javascript
const addWorkLog = new AddWorkLog(
  workLogRepository,
  taskRepository,
  settingsRepository
);

await addWorkLog.execute({
  taskId: 'task_123',
  startTime: '2024-01-01T09:00:00.000Z',
  endTime: '2024-01-01T11:30:00.000Z',
  description: 'Desenvolvimento da tela de login'
});
```

---

### UpdateTask

Atualiza os dados de uma tarefa existente.

**Dependências:**
- `TaskRepository`

**Entrada:**
```javascript
{
  taskId: string,        // ID da tarefa (obrigatório)
  title?: string,        // Novo título
  description?: string,  // Nova descrição
  project?: string,      // Novo projeto/módulo
  status?: string        // Novo status
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: Task,           // Tarefa atualizada
  error?: string          // Mensagem de erro
}
```

**Exemplo:**
```javascript
const updateTask = new UpdateTask(taskRepository);

await updateTask.execute({
  taskId: 'task_123',
  title: 'Implementar autenticação OAuth',
  status: 'DOING'
});
```

---

### DeleteTask

Remove uma tarefa e todos os seus apontamentos associados.

**Dependências:**
- `TaskRepository`
- `WorkLogRepository`

**Entrada:**
```javascript
{
  taskId: string  // ID da tarefa (obrigatório)
}
```

**Saída:**
```javascript
{
  success: boolean,
  message?: string,  // Mensagem de sucesso
  error?: string      // Mensagem de erro
}
```

**Exemplo:**
```javascript
const deleteTask = new DeleteTask(taskRepository, workLogRepository);

await deleteTask.execute({
  taskId: 'task_123'
});
```

---

### UpdateWorkLog

Atualiza um apontamento de tempo existente.

**Dependências:**
- `WorkLogRepository`
- `TaskRepository`
- `SettingsRepository`

**Entrada:**
```javascript
{
  workLogId: string,    // ID do apontamento (obrigatório)
  startTime?: string,   // Nova data/hora de início
  endTime?: string,     // Nova data/hora de fim
  description?: string  // Nova descrição
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: WorkLog,       // Apontamento atualizado
  error?: string         // Mensagem de erro
}
```

---

### DeleteWorkLog

Remove um apontamento de tempo.

**Dependências:**
- `WorkLogRepository`
- `TaskRepository`

**Entrada:**
```javascript
{
  workLogId: string  // ID do apontamento (obrigatório)
}
```

**Saída:**
```javascript
{
  success: boolean,
  message?: string,  // Mensagem de sucesso
  error?: string      // Mensagem de erro
}
```

---

### UpdateSettings

Atualiza as configurações globais do sistema.

**Dependências:**
- `SettingsRepository`

**Entrada:**
```javascript
{
  hourlyRate?: number,           // Nova taxa horária (R$)
  minBillableMinutes?: number   // Novo tempo mínimo faturado (minutos)
}
// Pelo menos um campo deve ser informado
```

**Saída:**
```javascript
{
  success: boolean,
  data?: Settings,     // Configurações atualizadas
  error?: string       // Mensagem de erro
}
```

**Exemplo:**
```javascript
const updateSettings = new UpdateSettings(settingsRepository);

await updateSettings.execute({
  hourlyRate: 70.00,
  minBillableMinutes: 30
});
```

---

### GenerateTimesheetReport

Gera um relatório mensal de timesheet (apontamentos de tempo).

**Dependências:**
- `TaskRepository`
- `WorkLogRepository`
- `SettingsRepository`

**Entrada:**
```javascript
month: number,  // Mês (1-12)
year: number    // Ano (ex: 2024)
```

**Saída:**
```javascript
{
  success: boolean,
  data?: {
    header: {
      period: string,  // Período formatado (ex: "Janeiro de 2024")
      month: number,
      year: number
    },
    entries: Array<{
      date: string,
      taskTitle: string,
      project: string,
      durationMinutes: number,
      billableMinutes: number,
      billableHours: number,
      billableAmount: number
    }>,
    totals: {
      totalDurationMinutes: number,
      totalBillableMinutes: number,
      totalBillableHours: number,
      totalBillableAmount: number,
      entriesCount: number
    },
    settings: {
      hourlyRate: number
    }
  },
  error?: string
}
```

**Exemplo:**
```javascript
const generateTimesheetReport = new GenerateTimesheetReport(
  taskRepository,
  workLogRepository,
  settingsRepository
);

const result = await generateTimesheetReport.execute(1, 2024); // Janeiro de 2024
```

---

### ExportData

Exporta todos os dados do sistema para um arquivo JSON de backup.

**Dependências:**
- `TaskRepository`
- `WorkLogRepository`
- `SettingsRepository`

**Saída:**
```javascript
{
  version: string,
  exportDate: string,
  tasks: Array,
  workLogs: Array,
  settings: Object
}
```

---

### ImportData

Importa dados de um arquivo JSON de backup.

**Dependências:**
- `TaskRepository`
- `WorkLogRepository`
- `SettingsRepository`

**Entrada:**
```javascript
backupData: string | Object  // JSON string ou objeto com dados do backup
```

**Saída:**
```javascript
{
  tasksCount: number,
  workLogsCount: number,
  exportDate: string
}
```

## 🔄 Fluxo de Dados

```
Presentation Layer (UI)
    ↓
Application Layer (Use Cases) ← Este módulo
    ↓
Domain Layer (Entities & Interfaces)
    ↓
Infrastructure Layer (Repositories Implementation)
```

## ✅ Princípios Aplicados

1. **Single Responsibility**: Cada use case tem uma responsabilidade específica
2. **Dependency Inversion**: Use cases dependem apenas de interfaces, não de implementações
3. **Validação de Entrada**: Todos os use cases validam seus dados de entrada
4. **Tratamento de Erros**: Retornos padronizados com `success` e `error`
5. **Cálculo Automático**: Lógica de negócio encapsulada (ex: cálculo de tempo faturado com mínimo)

## 📝 Regras de Negócio Implementadas

### Tempo Mínimo Faturável

- Por padrão, tarefas com menos de 30 minutos são faturadas como 30 minutos (0.5h)
- Valor configurável em Settings (`minBillableMinutes`)
- Aplicado automaticamente em `AddWorkLog` e `UpdateWorkLog`

### Cálculo de Faturamento

- Valor faturado = (tempo faturado em horas) × (taxa horária)
- Tempo faturado considera o mínimo de 30 minutos
- Taxa horária configurável em Settings (`hourlyRate`)

### Proteção de Dados

- Tarefas com status `BILLED` não podem ser editadas ou excluídas
- Apontamentos de tarefas faturadas não podem ser editados ou excluídos
- Validações garantem integridade dos dados
