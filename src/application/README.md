# Application Layer - Dev Freelancer

Esta camada contém os casos de uso (use cases) da aplicação, que orquestram as operações de negócio usando as entidades do domínio e os repositórios.

## 📦 Estrutura

```
src/application/
├── use-cases/
│   ├── CreateEvent.js          # Criar novo evento
│   ├── AddTransaction.js        # Adicionar transação (com cálculo automático)
│   ├── GetEventSummary.js      # Obter resumo financeiro do evento
│   └── UpdateSettings.js        # Atualizar configurações
├── index.js                    # Exportações centralizadas
└── README.md                   # Este arquivo
```

## 🎯 Casos de Uso

### CreateEvent

Cria um novo evento no sistema.

**Dependências:**
- `EventRepository`

**Entrada:**
```javascript
{
  name: string,           // Nome do evento (obrigatório)
  date: string,           // Data do evento (obrigatório)
  description?: string,   // Descrição opcional
  status?: string         // Status inicial (padrão: 'PLANNED')
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: Event,           // Evento criado
  error?: string          // Mensagem de erro
}
```

**Exemplo:**
```javascript
const createEvent = new CreateEvent(eventRepository);
const result = await createEvent.execute({
  name: 'Workshop de Culinária',
  date: '2024-12-15',
  description: 'Workshop sobre técnicas avançadas'
});
```

---

### AddTransaction

Adiciona uma transação (gasto ou ganho) a um evento.

**Características especiais:**
- Para transações de **KM** (`category: 'km'`), calcula automaticamente o valor usando `distance * rateKm` das configurações
- Busca automaticamente as configurações atuais (Settings) quando necessário

**Dependências:**
- `TransactionRepository`
- `EventRepository`
- `SettingsRepository`

**Entrada para EXPENSE:**
```javascript
{
  eventId: string,        // ID do evento (obrigatório)
  type: 'EXPENSE',        // Tipo da transação
  description: string,    // Descrição (obrigatório)
  amount: number,         // Valor monetário (obrigatório)
  hasReceipt?: boolean   // Se tem nota fiscal (padrão: false)
}
```

**Entrada para INCOME (Diária/Hora Extra):**
```javascript
{
  eventId: string,           // ID do evento (obrigatório)
  type: 'INCOME',            // Tipo da transação
  description: string,       // Descrição (obrigatório)
  amount: number,            // Valor monetário (obrigatório)
  isReimbursement?: boolean, // Se é reembolso (padrão: false)
  category?: 'diaria' | 'hora_extra'  // Categoria opcional
}
```

**Entrada para INCOME (KM):**
```javascript
{
  eventId: string,           // ID do evento (obrigatório)
  type: 'INCOME',            // Tipo da transação
  description: string,       // Descrição (obrigatório)
  category: 'km',            // Categoria
  distance: number,          // Distância em KM (obrigatório)
  isReimbursement?: boolean  // Se é reembolso (padrão: true)
  // amount é calculado automaticamente: distance * rateKm
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: Transaction,    // Transação criada
  error?: string          // Mensagem de erro
}
```

**Exemplos:**

```javascript
const addTransaction = new AddTransaction(
  transactionRepository,
  eventRepository,
  settingsRepository
);

// Adicionar despesa
await addTransaction.execute({
  eventId: 'event_123',
  type: 'EXPENSE',
  description: 'Compra de ingredientes',
  amount: 500.00,
  hasReceipt: false
});

// Adicionar KM rodado (cálculo automático)
await addTransaction.execute({
  eventId: 'event_123',
  type: 'INCOME',
  description: 'Deslocamento até o evento',
  category: 'km',
  distance: 150,
  isReimbursement: true
});

// Adicionar honorário (diária)
await addTransaction.execute({
  eventId: 'event_123',
  type: 'INCOME',
  description: 'Diária do evento',
  amount: 1000.00,
  isReimbursement: false,
  category: 'diaria'
});
```

---

### GetEventSummary

Retorna o resumo financeiro completo de um evento.

**Dependências:**
- `EventRepository`
- `TransactionRepository`
- `SettingsRepository`

**Entrada:**
```javascript
{
  eventId: string  // ID do evento (obrigatório)
}
```

**Saída:**
```javascript
{
  success: boolean,
  data?: {
    event: {
      id: string,
      name: string,
      date: string,
      status: string
    },
    totals: {
      totalSpent: number,              // Total Gasto (Saída do bolso)
      totalToReceive: number,          // Total a Receber (Gastos + Honorários)
      netProfit: number,               // Lucro Líquido Previsto (Apenas honorários)
      totalReimbursements: number,     // Total de reembolsos
      totalFees: number,               // Total de honorários
      netBalance: number               // Saldo líquido (receitas - despesas)
    },
    breakdown: {
      expenses: Array,                 // Lista de despesas
      income: Array,                   // Lista de receitas
      reimbursements: Array,           // Lista de reembolsos
      fees: Array                      // Lista de honorários
    },
    receiptStatus: {
      withReceipt: number,            // Quantidade com nota fiscal
      withoutReceipt: number           // Quantidade sem nota fiscal
    },
    expectedReceiptDate: string,      // Data Prevista de Recebimento
    transactionCount: {
      total: number,
      expenses: number,
      income: number
    }
  },
  error?: string
}
```

**Exemplo:**
```javascript
const getEventSummary = new GetEventSummary(
  eventRepository,
  transactionRepository,
  settingsRepository
);

const result = await getEventSummary.execute({
  eventId: 'event_123'
});

if (result.success) {
  const summary = result.data;
  console.log('Total Gasto:', summary.totals.totalSpent);
  console.log('Total a Receber:', summary.totals.totalToReceive);
  console.log('Lucro Líquido:', summary.totals.netProfit);
  console.log('Data Prevista:', summary.expectedReceiptDate);
}
```

---

### UpdateSettings

Atualiza os valores padrão do sistema (taxas e dias de reembolso).

**Dependências:**
- `SettingsRepository`

**Entrada:**
```javascript
{
  rateKm?: number,                    // Nova taxa por KM
  defaultReimbursementDays?: number,  // Novos dias padrão para reembolso
  maxHotelRate?: number,              // Novo teto de hospedagem
  standardDailyRate?: number,         // Nova diária técnica padrão
  overtimeRate?: number               // Nova taxa de hora extra
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

// Atualizar apenas a taxa de KM
await updateSettings.execute({
  rateKm: 1.00
});

// Atualizar múltiplos campos
await updateSettings.execute({
  rateKm: 1.00,
  overtimeRate: 80.00,
  defaultReimbursementDays: 30
});
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
5. **Cálculo Automático**: Lógica de negócio encapsulada (ex: cálculo de KM/Tempo)

