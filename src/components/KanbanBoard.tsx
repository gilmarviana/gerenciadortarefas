'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskColumn } from '@/types';
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

// Componente TaskCard com dnd-kit
function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg border-l-4 ${getPriorityColor(task.priority)} p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
        <button className="text-gray-400 hover:text-gray-600">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-3">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
          {task.type}
        </span>
        {task.dueDate && (
          <span className="text-xs text-gray-500">
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
}

// Componente principal do KanbanBoard
export default function KanbanBoard() {
  const [columns, setColumns] = useState<TaskColumn[]>([
    {
      id: 'todo',
      title: 'A Fazer',
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
      title: 'Em Andamento',
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
      title: 'Em Revisão',
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
      title: 'Concluído',
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find which column contains the active item
    const activeColumn = columns.find(col => 
      col.tasks.some(task => task.id === activeId)
    );
    
    // Find which column contains the over item
    const overColumn = columns.find(col => 
      col.tasks.some(task => task.id === overId) || col.id === overId
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      // Moving between columns
      setColumns(prev => {
        const newColumns = [...prev];
        const activeColumnIndex = newColumns.findIndex(col => col.id === activeColumn.id);
        const overColumnIndex = newColumns.findIndex(col => col.id === overColumn.id);
        
        const activeTask = newColumns[activeColumnIndex].tasks.find(task => task.id === activeId);
        if (!activeTask) return prev;

        // Remove from active column
        newColumns[activeColumnIndex].tasks = newColumns[activeColumnIndex].tasks.filter(
          task => task.id !== activeId
        );

        // Add to over column
        newColumns[overColumnIndex].tasks.push({
          ...activeTask,
          status: overColumn.id as any
        });

        return newColumns;
      });
    } else {
      // Moving within the same column
      setColumns(prev => {
        const newColumns = [...prev];
        const columnIndex = newColumns.findIndex(col => col.id === activeColumn.id);
        const oldIndex = newColumns[columnIndex].tasks.findIndex(task => task.id === activeId);
        const newIndex = newColumns[columnIndex].tasks.findIndex(task => task.id === overId);

        newColumns[columnIndex].tasks = arrayMove(
          newColumns[columnIndex].tasks,
          oldIndex,
          newIndex
        );

        return newColumns;
      });
    }
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quadro Kanban</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Tarefa
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">{column.title}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
              
              <SortableContext 
                items={column.tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {column.tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>

              <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Adicionar Tarefa
              </button>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}