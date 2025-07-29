import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const COLUMN_NAMES = [
  { id: 'todo', name: 'To Do' },
  { id: 'inprogress', name: 'In Progress' },
  { id: 'review', name: 'In Review' },
  { id: 'done', name: 'Done' },
];

const initialTasks = [
  { id: '1', content: 'Optimize experience for mobile web', column: 'todo' },
  { id: '2', content: 'Onboard workout options (OVO)', column: 'todo' },
  { id: '3', content: 'Multi-dest search UI mobile/web', column: 'todo' },
  { id: '4', content: 'Fast trip search', column: 'inprogress' },
  { id: '5', content: 'Affiliate links integration - frontend', column: 'inprogress' },
  { id: '6', content: 'Revise and streamline booking flow', column: 'review' },
  { id: '7', content: 'Travel suggestion experiments', column: 'review' },
  { id: '8', content: 'High voltage: Software bug fix', column: 'done' },
  { id: '9', content: 'Web-store purchasing performance issue fix', column: 'done' },
];

function TaskCard({ task }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type TaskType = {
  id: string;
  content: string;
  column: string;
};

const COLUMN_NAMES = [
  { id: 'todo', name: 'To Do' },
  { id: 'inprogress', name: 'In Progress' },
  { id: 'review', name: 'In Review' },
  { id: 'done', name: 'Done' },
];

const initialTasks: TaskType[] = [
  { id: '1', content: 'Optimize experience for mobile web', column: 'todo' },
  { id: '2', content: 'Onboard workout options (OVO)', column: 'todo' },
  { id: '3', content: 'Multi-dest search UI mobile/web', column: 'todo' },
  { id: '4', content: 'Fast trip search', column: 'inprogress' },
  { id: '5', content: 'Affiliate links integration - frontend', column: 'inprogress' },
  { id: '6', content: 'Revise and streamline booking flow', column: 'review' },
  { id: '7', content: 'Travel suggestion experiments', column: 'review' },
  { id: '8', content: 'High voltage: Software bug fix', column: 'done' },
  { id: '9', content: 'Web-store purchasing performance issue fix', column: 'done' },
];

interface DragItem {
  id: string;
}

function TaskCard({ task }: { task: TaskType }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        background: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        padding: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        cursor: 'grab',
      }}
    >
      {task.content}
    </div>
  );
}

function KanbanColumn({ column, tasks, moveTask }: { column: { id: string; name: string }, tasks: TaskType[], moveTask: (id: string, col: string) => void }) {
  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item: DragItem) => moveTask(item.id, column.id),
  });
  return (
    <div
      ref={drop}
      style={{
        background: '#f3f4f6',
        borderRadius: 8,
        minWidth: 250,
        minHeight: 400,
        padding: 12,
        margin: '0 12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>{column.name}</div>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);

  const moveTask = (taskId: string, newColumn: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, column: newColumn } : task
      )
    );
  };

  return (
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
  const [columns, setColumns] = useState<TaskColumn[]>([
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
          dueDate: '2024-02-15',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Corrigir bug no dashboard',
          description: 'Gráficos não estão carregando corretamente',
          status: 'todo',
          priority: 'urgent',
          type: 'bug',
          dueDate: '2024-02-10',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
          dueDate: '2024-02-20',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
          dueDate: '2024-02-18',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
          dueDate: '2024-02-05',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  ]);
  const [columns, setColumns] = useState([
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