# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dev Freelancer** is a Progressive Web App (PWA) for freelance developer task management and time tracking. It is a vanilla JavaScript SPA with zero runtime dependencies — no frameworks, no build tools, no npm packages.

- **Tech stack:** HTML5, CSS3, JavaScript (ES6 Modules)
- **Storage:** Browser localStorage (via Repository Pattern)
- **Hosting:** GitHub Pages (static files only)
- **Language context:** Domain terms and some docs are in Portuguese (pt-BR)

## Running Locally

No build step required. Serve the root directory with any static server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Via XAMPP
# Place in htdocs/, access at http://localhost/meireles-dev-pro/
```

## Testing

Validation tests run automatically in the browser console on localhost. The test file is `src/tests/ValidationTests.js` — it executes on page load and logs results to the console.

## Architecture (Clean Architecture / DDD)

The codebase enforces strict layer separation under `src/`:

1. **Domain** (`src/domain/`) — Pure business logic. Entities, repository interfaces, constants, and `FinancialCalculator`. **No DOM, no localStorage, no external dependencies.**
2. **Application** (`src/application/use-cases/`) — Use cases that orchestrate domain logic and repositories. Depends only on Domain.
3. **Infrastructure** (`src/infrastructure/repositories/`) — localStorage implementations of domain repository interfaces. **Only place where localStorage is accessed directly.**
4. **Presentation** (`src/presentation/`) — Views, modals, App controller, Toast notifications, CSS. Calls use cases, never repositories directly.

**Dependency rule:** Domain ← Application ← Infrastructure/Presentation. Inner layers must never import from outer layers.

## Entry Point & Initialization

`index.html` loads `src/main.js` as an ES module. `main.js` wires everything together:
- Instantiates repositories (singletons)
- Creates use cases with dependency injection
- On DOMContentLoaded, initializes `App` (presentation/App.js) with all use cases
- Registers the Service Worker (`sw.js`)

## Key Business Rules

- **Billing:** Configurable hourly rate (default R$ 60/hour)
- **30-minute minimum rule:** Any task under 30 minutes is billed as 30 minutes
- **Task statuses:** TODO → DOING → DONE → BILLED
- **Calculations belong in Domain/Application layers**, not in Views

## localStorage Keys

```
devtracker_tasks       // Array of Task objects
devtracker_worklogs    // Array of WorkLog objects
devtracker_settings    // Settings object (hourly rate, min billable)
```

## Coding Conventions

- **Clean Architecture is enforced** — if existing code violates layer boundaries, refactor before adding features
- Use JSDoc for type hints (`@param`, `@returns`)
- Descriptive variable names (`taskRepository`, not `repo`)
- `export default` for classes, named `export` for utilities
- Entities use static factory methods: `Task.create()`, `WorkLog.create()` for new instances, `.restore()` for hydration from storage
- Use cases return `{success, data, error}` response objects
- CSS uses variables from `src/presentation/styles/variables.css`
- Use `Toast` for user notifications — never use native `alert()`
- Cross-component communication via `window.dispatchEvent(new CustomEvent(...))`
- **Never install npm runtime dependencies** — the app must remain zero-dep for GitHub Pages
