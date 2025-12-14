# Dev Freelancer

Sistema web (SPA) para gestão de tarefas e apontamento de horas para desenvolvedores freelancers.

## 📋 Sobre o Sistema

O **Dev Freelancer** foi desenvolvido para auxiliar desenvolvedores freelancers no controle de tarefas e faturamento por horas trabalhadas, aplicando regras de negócio como tempo mínimo faturado.

## 🏗️ Arquitetura

O sistema segue os princípios da **Clean Architecture** com as seguintes camadas:

- **Domain**: Entidades e interfaces de repositórios
- **Application**: Casos de uso (use cases)
- **Infrastructure**: Implementação de repositórios usando localStorage
- **Presentation**: Controllers e Views (UI)

## ✨ Funcionalidades

### Tarefas
- Cadastro, edição e remoção de tarefas
- Status: TODO, DOING, DONE, BILLED
- Vinculação a projetos/módulos

### Apontamento de Tempo
- Registro de tempo trabalhado (início e fim)
- Cálculo automático de duração
- Aplicação de regra de mínimo faturado (30 minutos padrão)
- Cálculo automático de valor faturado baseado na taxa por hora

### Configurações
- Valor por hora configurável (padrão: R$ 60,00)
- Tempo mínimo faturado configurável (padrão: 30 minutos)
- Backup e restauração de dados

### Dashboard
- KPIs: Faturamento do mês, Horas trabalhadas, Tarefas pendentes
- Lista de tarefas recentes com valor acumulado
- Visualização rápida do status e progresso

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador moderno que suporte ES6 Modules
   - **Importante:** Use um servidor HTTP local (não abra o arquivo diretamente)
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server -p 8000`
   - PHP/XAMPP: Coloque em `htdocs` e acesse via `http://localhost`
2. Os dados são armazenados localmente no navegador (localStorage)
3. Navegue pelas seções usando o menu inferior (Dashboard, Configurações)
4. Crie tarefas e registre apontamentos de tempo
5. Configure o valor por hora e tempo mínimo faturado nas Configurações

## 📱 Instalação como App (PWA)

A aplicação pode ser instalada no seu dispositivo móvel como um app nativo!

### Para Instalar:

**Android (Chrome):**
1. Acesse a aplicação no Chrome
2. Toque no menu (3 pontos) > **"Adicionar à tela inicial"** ou **"Instalar app"**
3. Confirme a instalação

**iOS (Safari):**
1. Acesse a aplicação no Safari
2. Toque no botão de compartilhar > **"Adicionar à Tela de Início"**
3. Confirme

**Nota:** Antes de instalar, você precisa criar os ícones. Veja `COMO-CRIAR-ICONES.md` para instruções completas.

## 📦 Estrutura de Arquivos

```
src/
├── domain/              # Entidades e interfaces de repositórios
│   ├── entities/       # Task, WorkLog, Settings
│   ├── repositories/    # Interfaces
│   └── utils/          # FinancialCalculator
├── application/         # Casos de uso
│   └── use-cases/       # CreateTask, AddWorkLog, etc.
├── infrastructure/      # Implementação com localStorage
│   └── repositories/    # LocalStorageTaskRepository, etc.
├── presentation/        # UI e Views
│   ├── styles/          # CSS modular (variables, base, components)
│   ├── views/           # DashboardView, TaskDetailView, SettingsView
│   └── components/      # Modais e componentes
└── main.js             # Ponto de entrada principal
```

## 🎯 Regras de Negócio

1. **Faturamento por Hora**: Todo trabalho é cobrado por hora trabalhada
2. **Regra de Mínimo**: Se uma tarefa durar menos de 30 minutos (configurável), cobra-se o valor de 30 minutos
   - Exemplo: 10 min trabalhados = Cobrar 0.5h (R$ 30,00 com taxa padrão)
   - Exemplo: 1h trabalhada = Cobrar 1.0h (R$ 60,00 com taxa padrão)
3. **Configurabilidade**: Valor por hora e tempo mínimo são editáveis nas configurações

## 💾 Armazenamento

Todos os dados são armazenados no `localStorage` do navegador, usando as seguintes chaves:

- `devtracker_tasks` - Tarefas
- `devtracker_worklogs` - Apontamentos de tempo
- `devtracker_settings` - Configurações (taxa horária e tempo mínimo faturável)

## 🌐 Hospedagem no GitHub Pages

O sistema foi projetado para ser hospedado no GitHub Pages, funcionando apenas com HTML, CSS e JavaScript puro, sem necessidade de servidor backend.

### 📋 Passo a Passo para Deploy

1. **Crie um repositório no GitHub**
   - Vá para [github.com/new](https://github.com/new)
   - Nome do repositório: `dev-freelancer` (ou outro nome de sua preferência)
   - Escolha se será público ou privado

2. **Faça upload dos arquivos**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Dev Freelancer"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/dev-freelancer.git
   git push -u origin main
   ```

3. **Ative o GitHub Pages**
   - Vá em **Settings** do repositório
   - Role até a seção **Pages**
   - Em **Source**, selecione **Deploy from a branch**
   - Escolha a branch **main**
   - Escolha a pasta **/ (root)**
   - Clique em **Save**

4. **Acesse seu site**
   - Aguarde alguns minutos para o GitHub processar
   - Seu site estará disponível em:
     `https://SEU-USUARIO.github.io/dev-freelancer/`

## 📚 Documentação Completa

Para uma visão detalhada do projeto, consulte:

- **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy no GitHub Pages
- **[COMO-CRIAR-ICONES.md](./COMO-CRIAR-ICONES.md)** - Instruções para criar ícones do PWA

## 📊 Status do Projeto

O projeto está **100% migrado** para o novo domínio de Gestão de Tarefas de Desenvolvimento:

- ✅ **Domain Layer** - Completo (Task, WorkLog, Settings, FinancialCalculator)
- ✅ **Application Layer** - Completo (todos os use cases implementados)
- ✅ **Infrastructure Layer** - Completo (repositórios atualizados com novas chaves)
- ✅ **Presentation Layer** - Completo (views e modais implementados)

### Funcionalidades Implementadas

- ✅ Criação, edição e exclusão de tarefas
- ✅ Registro de apontamentos de tempo com cálculo automático
- ✅ Edição de apontamentos de tempo
- ✅ Dashboard com KPIs e lista de tarefas
- ✅ Visualização detalhada de tarefas com resumo financeiro
- ✅ Geração de timesheet mensal para impressão/PDF
- ✅ Configurações (taxa horária e tempo mínimo faturável)
- ✅ Backup e restore de dados
- ✅ Modais completos para todas as operações

## 📝 Licença

Este projeto é de uso pessoal.
