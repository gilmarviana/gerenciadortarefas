'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, MoreVertical, User, Calendar } from 'lucide-react'
import { Task } from '@/lib/supabase'
import TaskTimer from './TaskTimer'

interface KanbanColumn {
  id: string
  title: string
  color: string
  tasks: Task[]
}

interface KanbanBoardProps {
  projectId?: string
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'todo',
      title: 'A Fazer',
      color: 'bg-gray-100',
      tasks: [
        {
          id: '1',
          title: 'Implementar login',
          description: 'Criar sistema de autenticação',
          status_id: 'todo',
          priority: 'high',
          type: 'feature',
          project_id: '1',
          order: 0,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          title: 'Corrigir bug no menu',
          description: 'Menu não está responsivo',
          status_id: 'todo',
          priority: 'medium',
          type: 'bug',
          project_id: '1',
          order: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'Em Progresso',
      color: 'bg-blue-100',
      tasks: [
        {
          id: '3',
          title: 'Design do dashboard',
          description: 'Criar layout do dashboard',
          status_id: 'in-progress',
          priority: 'high',
          type: 'feature',
          project_id: '1',
          order: 0,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
    },
    {
      id: 'review',
      title: 'Em Revisão',
      color: 'bg-yellow-100',
      tasks: []
    },
    {
      id: 'done',
      title: 'Concluído',
      color: 'bg-green-100',
      tasks: [
        {
          id: '4',
          title: 'Setup do projeto',
          description: 'Configurar Next.js e Tailwind',
          status_id: 'done',
          priority: 'low',
          type: 'task',
          project_id: '1',
          order: 0,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
    }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event)
  }

  const handleDragOver = (event: DragOverEvent) => {
    console.log('Drag over:', event)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      setColumns(columns => {
        const oldIndex = columns.findIndex(col => 
          col.tasks.some(task => task.id === active.id)
        )
        const newIndex = columns.findIndex(col => 
          col.tasks.some(task => task.id === over.id) || col.id === over.id
        )

        if (oldIndex !== -1 && newIndex !== -1) {
          const oldColumn = columns[oldIndex]
          const newColumn = columns[newIndex]
          
          const taskIndex = oldColumn.tasks.findIndex(task => task.id === active.id)
          const task = oldColumn.tasks[taskIndex]

          const newColumns = [...columns]
          
          // Remove from old column
          newColumns[oldIndex] = {
            ...oldColumn,
            tasks: oldColumn.tasks.filter(t => t.id !== active.id)
          }

          // Add to new column
          if (newColumn.tasks.some(t => t.id === over.id)) {
            // Insert at specific position
            const overTaskIndex = newColumn.tasks.findIndex(t => t.id === over.id)
            const newTasks = [...newColumn.tasks]
            newTasks.splice(overTaskIndex, 0, { ...task, status_id: newColumn.id })
            newColumns[newIndex] = {
              ...newColumn,
              tasks: newTasks
            }
          } else {
            // Add to end of column
            newColumns[newIndex] = {
              ...newColumn,
              tasks: [...newColumn.tasks, { ...task, status_id: newColumn.id }]
            }
          }

          return newColumns
        }

        return columns
      })
    }
  }

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto p-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className={`${column.color} rounded-lg p-4 h-full`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{column.tasks.length}</span>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <SortableContext
                  items={column.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  )
}

interface SortableTaskProps {
  task: Task
}

function SortableTask({ task }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-500'
      case 'bug': return 'bg-red-500'
      case 'improvement': return 'bg-green-500'
      case 'task': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
          <div className={`w-2 h-2 rounded-full ${getTypeColor(task.type)}`}></div>
        </div>

        <div className="flex items-center space-x-2">
          <TaskTimer taskId={task.id} />
          <button className="p-1 hover:bg-gray-100 rounded">
            <User className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {task.start_date && (
        <div className="flex items-center mt-3 text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(task.start_date).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  )
}