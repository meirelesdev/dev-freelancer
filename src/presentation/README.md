# Presentation Layer - Dev Freelancer

Esta camada contém toda a interface gráfica do sistema, seguindo design mobile-first.

## 📦 Estrutura

```
src/presentation/
├── styles/
│   ├── variables.css      # Variáveis CSS (cores, espaçamentos, etc)
│   ├── base.css           # Reset e estilos globais
│   ├── components.css     # Componentes reutilizáveis
│   └── main.css           # Arquivo principal que importa todos
├── views/
│   ├── DashboardView.js    # View do dashboard principal
│   ├── TaskDetailView.js   # View de detalhe da tarefa
│   ├── TimesheetView.js    # View para gerar timesheet mensal
│   ├── ReportView.js       # View para renderizar relatórios em PDF
│   └── SettingsView.js     # View de configurações
├── components/
│   └── modals/
│       └── TimeLogModal.js  # Modal para registrar tempo trabalhado
├── utils/
│   ├── Formatters.js        # Utilitários de formatação
│   └── Toast.js             # Sistema de notificações
└── App.js                   # Classe principal que gerencia navegação
```

## 🎨 Design System

### Cores

O sistema usa variáveis CSS para facilitar customização (tema Dev/Tech):

- **Primária**: `#2563EB` (azul royal)
- **Background**: `#0F172A` (azul escuro/slate)
- **Surface**: `#1E293B` (slate médio)
- **Status**: Success, Warning, Danger, Info
- **Neutras**: Text, Border

### Espaçamentos

Sistema de espaçamento consistente baseado em múltiplos de 4px:
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px

### Componentes

- **Cards**: Containers com sombra e bordas arredondadas
- **Botões**: Estilos primário, secundário, success, warning
- **Formulários**: Inputs e labels estilizados
- **Modais**: Overlays para formulários
- **Badges**: Indicadores de status
- **Listas**: Eventos e despesas

## 📱 Views

### DashboardView

Exibe:
- KPIs: Faturamento do Mês, Horas Trabalhadas, Tarefas Pendentes
- Lista de tarefas recentes com status, projeto e valor acumulado
- Botão FAB para criar nova tarefa
- Navegação para detalhe da tarefa ao clicar

### TaskDetailView

Exibe:
- Informações da tarefa (título, projeto, descrição, status)
- Cards de resumo: Tempo Trabalhado, Tempo Faturado, Valor Faturado
- Botão "Registrar Tempo" para adicionar apontamentos
- Lista de apontamentos de tempo com início, fim, duração e valor
- Botões para editar/excluir tarefa e apontamentos

### TimesheetView

Exibe:
- Interface para selecionar mês/ano
- Botão para gerar timesheet mensal
- Abre relatório em nova janela para impressão/PDF

### ReportView

Renderiza:
- Timesheet de Desenvolvimento com colunas: Data, Tarefa, Módulo, Duração Real, Duração Faturada, Valor
- Resumo com totais e taxa horária
- Formatação otimizada para impressão/PDF

### SettingsView

Exibe:
- Formulário para alterar valor hora (R$)
- Formulário para alterar tempo mínimo faturável (minutos)
- Funcionalidades de backup/restore de dados

## 🚀 Navegação

A navegação funciona por bottom navigation bar:
- **🏠 Início**: Dashboard principal
- **⏱️ Timesheet**: Geração de timesheet mensal
- **⚙️ Ajustes**: Configurações do sistema
- **➕ FAB**: Botão flutuante para criar nova tarefa

Navegação para detalhe da tarefa acontece via evento customizado:
```javascript
window.dispatchEvent(new CustomEvent('navigate', { 
  detail: { view: 'task-detail', taskId: '...' } 
}));
```

## 📐 Layout Mobile-First

O design é mobile-first, com breakpoints:
- **Mobile**: < 768px (padrão)
- **Tablet**: ≥ 768px
- **Desktop**: ≥ 1024px

## 🎯 Funcionalidades Principais

### Criar Tarefa

Modal com:
- Campo Projeto/Cliente (obrigatório)
- Campo Título da Tarefa (obrigatório)
- Campo Descrição (opcional)
- Status padrão: TODO
- Data padrão: Hoje

### Registrar Tempo

Modal com:
- Campo Início (datetime-local)
- Campo Fim (datetime-local)
- Campo Descrição (opcional)
- Prévia em tempo real: tempo trabalhado → tempo faturado → valor
- Aplica regra de mínimo de 30 minutos automaticamente

### Gerar Timesheet

Interface com:
- Seleção de mês e ano
- Geração de relatório em nova janela
- Formatação otimizada para impressão/PDF
- Colunas: Data, Tarefa, Módulo, Duração Real, Duração Faturada, Valor

### Backup e Restore

Funcionalidades em SettingsView:
- Exportar todos os dados para arquivo JSON
- Importar dados de backup
- Validação de estrutura de dados

## 🔧 Integração

As views recebem dependências via construtor:
- Repositórios (TaskRepository, WorkLogRepository, SettingsRepository)
- Use Cases (CreateTask, GetTaskSummary, AddWorkLog, UpdateTask, DeleteTask, UpdateWorkLog, DeleteWorkLog, UpdateSettings, GenerateTimesheetReport, ExportData, ImportData)

A classe `App` gerencia a inicialização e navegação entre views.

