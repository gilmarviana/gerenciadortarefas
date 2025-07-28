# TaskManager - Sistema Avançado de Gerenciamento de Tarefas

Um sistema completo de gerenciamento de projetos, clientes e tarefas desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

### Dashboard
- Visão geral de projetos, clientes e tarefas
- Estatísticas em tempo real
- Gráficos de progresso
- Atividade recente

### Gerenciamento de Tarefas
- Quadro Kanban com drag and drop
- Filtros por status, prioridade, tipo e projeto
- Timer integrado para controle de tempo
- Cards com informações detalhadas
- Visualização em lista e Kanban

### Projetos
- Lista de projetos com progresso
- Estatísticas por projeto
- Equipes e membros
- Status e datas de início/fim

### Clientes
- Cadastro completo de clientes
- Histórico de projetos
- Controle de receita
- Status ativo/inativo

### Relatórios
- Exportação em XLS e CSV
- Filtros avançados
- Gráficos de distribuição
- Relatórios detalhados

### Fluxogramas
- Editor visual de fluxogramas
- Import/export de arquivos JSON
- Salvamento automático
- Ferramentas de edição

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e banco de dados
- **@dnd-kit** - Drag and drop
- **ReactFlow** - Editor de fluxogramas
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd task-manager
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse http://localhost:3000

## 🗄️ Configuração do Supabase

### 1. Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie uma nova conta ou faça login
- Crie um novo projeto

### 2. Configure as tabelas

Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de status de tarefas
CREATE TABLE task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Tabela de tarefas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES task_statuses(id),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  type TEXT CHECK (type IN ('feature', 'bug', 'improvement', 'task')) DEFAULT 'task',
  assigned_to UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id),
  start_date DATE,
  due_date DATE,
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas de tempo
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fluxogramas
CREATE TABLE flowcharts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Configure as políticas de segurança (RLS)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowcharts ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Users can view all data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Projects are viewable by all" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects can be created by authenticated users" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Repita para outras tabelas conforme necessário
```

## 🎨 Estrutura do Projeto

```
src/
├── app/                    # Páginas da aplicação
│   ├── page.tsx           # Dashboard
│   ├── tasks/page.tsx     # Página de tarefas
│   ├── projects/page.tsx  # Página de projetos
│   ├── clients/page.tsx   # Página de clientes
│   ├── reports/page.tsx   # Página de relatórios
│   └── flowcharts/page.tsx # Página de fluxogramas
├── components/            # Componentes reutilizáveis
│   ├── Layout.tsx        # Layout principal
│   ├── KanbanBoard.tsx   # Quadro Kanban
│   └── TaskTimer.tsx     # Timer de tarefas
└── lib/                  # Utilitários e configurações
    └── supabase.ts       # Configuração do Supabase
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Notificações em tempo real
- [ ] Integração com calendário
- [ ] Upload de arquivos
- [ ] Chat interno
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato:
- Email: suporte@taskmanager.com
- GitHub Issues: [Criar Issue](https://github.com/seu-usuario/task-manager/issues)

---

Desenvolvido com ❤️ usando Next.js, TypeScript e Tailwind CSS
