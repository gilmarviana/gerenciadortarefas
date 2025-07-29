import React from 'react';

export default function KanbanBoard() {
  return (
    <div className="h-full flex items-center justify-center text-gray-500">
      Kanban desativado ou removido.
    </div>
  );
}

import { PlusIcon } from '@heroicons/react/24/solid';

type Task = { 
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

type TaskColumn = {
  id: string;
  name: string;
  tasks: Task[];
};

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow text-gray-800">
      <div className="font-semibold">{task.title}</div>
      <div className="text-xs text-gray-500 mb-1">{task.description}</div>
      <div className="flex gap-2 text-xs mt-2">
        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{task.priority}</span>
        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{task.type}</span>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">Vencimento: {task.due_date}</div>
    </div>
  );
}

export default function KanbanBoard() { 
  const [columns] = React.useState<TaskColumn[]>([
    {
      id: 'todo',
      name: 'A Fazer',
      tasks: [
        {
          id: '1',
          title: 'Implementar autenticação',
          description: 'Criar sistema de login e registro de usuários',
          status: 'todo',
          priority: 'high',
          type: 'feature',
          due_date: '2024-02-15',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Corrigir bug no dashboard',
          description: 'Gráficos não estão carregando corretamente',
          status: 'todo',
          priority: 'urgent',
    </div>
  );
}
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'done',
      name: 'Concluído',
      tasks: [
        {
          id: '5',
          title: 'Setup inicial do projeto',
          description: 'Configurar estrutura básica e dependências',
          status: 'done',
          priority: 'high',
          type: 'feature',
          due_date: '2024-02-05',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  ]);

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quadro Kanban</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Tarefa
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">{column.name}</h2>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {column.tasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Adicionar Tarefa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
        {COLUMN_NAMES.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.column === col.id)}
            moveTask={moveTask}
          />
        ))}
      </div>
    </DndProvider>
  );
}
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

type TaskColumn = {
  id: string;
  name: string;
  tasks: Task[];
};

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow text-gray-800">
      <div className="font-semibold">{task.title}</div>
      <div className="text-xs text-gray-500 mb-1">{task.description}</div>
      <div className="flex gap-2 text-xs mt-2">
        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{task.priority}</span>
        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{task.type}</span>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">Vencimento: {task.due_date}</div>
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = React.useState<TaskColumn[]>([
    {
      id: 'todo',
      name: 'A Fazer',
      tasks: [
        {
          id: '1',
          title: 'Implementar autenticação',
          description: 'Criar sistema de login e registro de usuários',
          status: 'todo',
          priority: 'high',
          type: 'feature',
          due_date: '2024-02-15',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Corrigir bug no dashboard',
          description: 'Gráficos não estão carregando corretamente',
          status: 'todo',
          priority: 'urgent',
          type: 'bug',
          due_date: '2024-02-10',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'in-progress',
      name: 'Em Andamento',
      tasks: [
        {
          id: '3',
          title: 'Desenvolver API de relatórios',
          description: 'Criar endpoints para geração de relatórios',
          status: 'in-progress',
          priority: 'medium',
          type: 'feature',
          due_date: '2024-02-20',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'review',
      name: 'Em Revisão',
      tasks: [
        {
          id: '4',
          title: 'Otimizar performance',
          description: 'Melhorar tempo de carregamento das páginas',
          status: 'review',
          priority: 'medium',
          type: 'improvement',
          due_date: '2024-02-18',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'done',
      name: 'Concluído',
      tasks: [
        {
          id: '5',
          title: 'Setup inicial do projeto',
          description: 'Configurar estrutura básica e dependências',
          status: 'done',
          priority: 'high',
          type: 'feature',
          due_date: '2024-02-05',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  ]);

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quadro Kanban</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Tarefa
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">{column.name}</h2>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {column.tasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Adicionar Tarefa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'review',
      name: 'Em Revisão',
      tasks: [
        {
          id: '4',
          title: 'Otimizar performance',
          description: 'Melhorar tempo de carregamento das páginas',
          status: 'review',
          priority: 'medium',
          type: 'improvement',
          due_date: '2024-02-18',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'done',
      name: 'Concluído',
      tasks: [
        {
          id: '5',
          title: 'Setup inicial do projeto',
          description: 'Configurar estrutura básica e dependências',
          status: 'done',
          priority: 'high',
          type: 'feature',
          due_date: '2024-02-05',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  ]);


  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quadro Kanban</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Tarefa
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">{column.name}</h2>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {column.tasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Adicionar Tarefa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}