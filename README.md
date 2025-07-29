# GDO

Sistema avançado de gerenciamento de tarefas e projetos desenvolvido com React, Next.js, Supabase e Tailwind CSS.

## 🚀 Funcionalidades

### Dashboard Completo
- **Estatísticas em tempo real** - Total de tarefas, projetos ativos, horas trabalhadas
- **Gráficos interativos** - Visualização de dados com charts responsivos
- **Visão geral** - Projetos e tarefas recentes

### Gerenciamento de Projetos
- **CRUD completo** de projetos
- **Associação com clientes**
- **Status personalizáveis** (planejamento, ativo, em espera, concluído, cancelado)
- **Controle de orçamento e datas**

### Gestão de Clientes
- **Cadastro de clientes** com informações completas
- **Histórico de projetos** por cliente
- **Informações de contato** organizadas

### Sistema de Tarefas Avançado
- **Quadro Kanban** com drag & drop
- **Visualização Gantt** para cronogramas
- **Colunas personalizáveis** - Crie, edite e remova colunas conforme necessário
- **Categorias flexíveis** - Sistema de categorização customizável
- **Timer integrado** - Cronômetro para rastreamento de tempo em cada tarefa
- **Prioridades e tipos** - Sistema completo de classificação
- **Subtarefas** - Hierarquia de tarefas
- **Assignação de usuários** - Atribuição de responsáveis

### Relatórios e Exportação
- **Filtros avançados** por status, prioridade, tipo, data, projeto
- **Exportação em Excel e CSV** com dados filtrados
- **Estatísticas detalhadas** de produtividade
- **Histórico de tempo trabalhado**

### Fluxogramas Personalizados
- **Editor visual** de fluxogramas
- **Tipos de nós** - Início, processo, decisão, fim
- **Conexões interativas** - Drag & drop para criar fluxos
- **Salvamento automático** - Persistência em tempo real

### Funcionalidades Técnicas
- **Autenticação completa** - Login/cadastro com Supabase Auth
- **Interface responsiva** - Totalmente adaptável para mobile e desktop
- **Tema moderno** - UI/UX profissional com Tailwind CSS
- **Tempo real** - Atualizações automáticas via Supabase
- **Segurança** - Row Level Security (RLS) implementado

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Drag & Drop**: react-beautiful-dnd, @dnd-kit
- **Gráficos**: Recharts
- **Exportação**: xlsx, papaparse
- **Datas**: date-fns
- **Animações**: Framer Motion

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn ou pnpm
- Conta no Supabase

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd advanced-task-manager
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure o Supabase

#### Crie um projeto no Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Configure seu projeto

#### Execute o script SQL:
1. No painel do Supabase, vá para "SQL Editor"
2. Copie todo o conteúdo do arquivo `src/lib/database.sql`
3. Execute o script para criar todas as tabelas e configurações

### 4. Configure as variáveis de ambiente
```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 5. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Páginas do dashboard
│   ├── tasks/            # Gerenciamento de tarefas
│   ├── projects/         # Gerenciamento de projetos
│   ├── clients/          # Gerenciamento de clientes
│   ├── reports/          # Relatórios e exportação
│   └── flowcharts/       # Editor de fluxogramas
├── components/            # Componentes reutilizáveis
│   ├── KanbanBoard.tsx   # Quadro Kanban
│   ├── GanttChart.tsx    # Visualização Gantt
│   ├── TaskCard.tsx      # Card de tarefa com timer
│   ├── FlowchartEditor.tsx # Editor de fluxogramas
│   └── Sidebar.tsx       # Navegação lateral
├── hooks/                # Custom hooks
│   └── useAuth.ts        # Hook de autenticação
├── lib/                  # Configurações e utilitários
│   ├── supabase.ts       # Cliente Supabase
│   └── database.sql      # Schema do banco
└── types/                # Definições TypeScript
    └── index.ts          # Tipos da aplicação
```

## 🎯 Como Usar

### 1. Primeiro Acesso
- Crie uma conta ou faça login
- Complete seu perfil

### 2. Configure seus Clientes
- Vá para "Clientes" e adicione seus clientes
- Inclua informações de contato completas

### 3. Crie Projetos
- Acesse "Projetos" e crie seus primeiros projetos
- Associe aos clientes cadastrados
- Configure datas e orçamentos

### 4. Gerencie Tarefas
- No menu "Tarefas", selecione um projeto
- Use o modo Kanban para gerenciamento visual
- Alterne para Gantt para visualizar cronogramas
- Use o timer integrado para rastrear tempo

### 5. Personalize o Workflow
- Crie colunas personalizadas no Kanban
- Configure categorias de tarefas
- Ajuste prioridades e tipos conforme sua necessidade

### 6. Analise Resultados
- Acesse "Relatórios" para análises detalhadas
- Use filtros para segmentar dados
- Exporte relatórios em Excel ou CSV

### 7. Crie Fluxogramas
- Use o editor de "Fluxogramas" para documentar processos
- Arraste e conecte nós para criar workflows visuais

## 🔧 Personalização

### Adicionar Novas Colunas Kanban
1. No quadro Kanban, clique em "Adicionar Coluna"
2. As colunas são específicas por projeto
3. Reorganize tarefas entre colunas com drag & drop

### Criar Categorias Personalizadas
1. Edite a tabela `task_categories` no Supabase
2. Adicione novas categorias com cores personalizadas
3. As categorias aparecerão automaticamente na interface

### Configurar Notificações
- Configure webhooks no Supabase para notificações
- Implemente integrações com Slack, email, etc.

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy do projeto
vercel

# Configure as variáveis de ambiente no dashboard da Vercel
```

### Outras Plataformas
- Netlify
- Railway
- Render
- AWS Amplify

Lembre-se de configurar as variáveis de ambiente em qualquer plataforma escolhida.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas sobre o projeto, abra uma issue no GitHub ou entre em contato.

---

**GDO** - Sistema completo de gerenciamento de projetos e tarefas com tecnologias modernas.