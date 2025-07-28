'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskColumn } from '@/types';
import TaskCard from './TaskCard';
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { createSupabaseClient } from '@/lib/supabase';

interface KanbanBoardProps {
  projectId: string;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanBoard({ projectId, onTaskClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    
    // Load columns
    const { data: columnsData } = await supabase
      .from('task_columns')
      .select('*')
      .eq('project_id', projectId)
      .order('position');

    if (columnsData) {
      setColumns(columnsData);
    }

    // Load tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select(`
        *,
        category:task_categories(*),
        assigned_user:users(*)
      `)
      .eq('project_id', projectId)
      .order('position');

    if (tasksData) {
      const tasksByColumn: { [key: string]: Task[] } = {};
      
      tasksData.forEach((task) => {
        if (!tasksByColumn[task.column_id]) {
          tasksByColumn[task.column_id] = [];
        }
        tasksByColumn[task.column_id].push(task);
      });

      setTasks(tasksByColumn);
    }

    setLoading(false);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;
    const taskId = draggableId;

    // Update local state immediately for better UX
    const newTasks = { ...tasks };
    const sourceColumn = [...(newTasks[sourceColumnId] || [])];
    const destColumn = sourceColumnId === destColumnId 
      ? sourceColumn 
      : [...(newTasks[destColumnId] || [])];

    // Remove task from source
    const [movedTask] = sourceColumn.splice(source.index, 1);

    // Add task to destination
    destColumn.splice(destination.index, 0, movedTask);

    // Update state
    newTasks[sourceColumnId] = sourceColumn;
    newTasks[destColumnId] = destColumn;
    setTasks(newTasks);

    // Update task in database
    const { error } = await supabase
      .from('tasks')
      .update({
        column_id: destColumnId,
        position: destination.index,
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      // Revert on error
      loadData();
    } else {
      // Update positions for all tasks in affected columns
      await updateTaskPositions(sourceColumnId, sourceColumn);
      if (sourceColumnId !== destColumnId) {
        await updateTaskPositions(destColumnId, destColumn);
      }
    }
  };

  const updateTaskPositions = async (columnId: string, columnTasks: Task[]) => {
    const updates = columnTasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));

    for (const update of updates) {
      await supabase
        .from('tasks')
        .update({ position: update.position })
        .eq('id', update.id);
    }
  };

  const addColumn = async () => {
    const name = prompt('Nome da coluna:');
    if (!name) return;

    const { error } = await supabase
      .from('task_columns')
      .insert({
        name,
        project_id: projectId,
        position: columns.length,
        color: '#3b82f6',
      });

    if (!error) {
      loadData();
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coluna? Todas as tarefas serão movidas para a primeira coluna.')) {
      return;
    }

    // Move tasks to first column
    if (tasks[columnId]?.length > 0) {
      const firstColumn = columns[0];
      if (firstColumn) {
        await supabase
          .from('tasks')
          .update({ column_id: firstColumn.id })
          .eq('column_id', columnId);
      }
    }

    const { error } = await supabase
      .from('task_columns')
      .delete()
      .eq('id', columnId);

    if (!error) {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 h-full pb-4" style={{ minWidth: 'max-content' }}>
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium text-gray-900">{column.name}</h3>
                    <span className="ml-2 text-sm text-gray-500">
                      {tasks[column.id]?.length || 0}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => deleteColumn(column.id)}
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      } transition-colors duration-200`}
                    >
                      {(tasks[column.id] || []).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onTaskClick?.(task)}
                            >
                              <TaskCard
                                task={task}
                                isDragging={snapshot.isDragging}
                                onUpdate={loadData}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <div className="flex-shrink-0 w-80">
            <button
              onClick={addColumn}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <PlusIcon className="w-6 h-6 mr-2" />
              Adicionar Coluna
            </button>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}