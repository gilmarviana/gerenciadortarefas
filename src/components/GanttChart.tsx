'use client';

import { useState, useEffect } from 'react';
import { Task, GanttTask } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttChartProps {
  projectId: string;
}

export default function GanttChart({ projectId }: GanttChartProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [viewStart, setViewStart] = useState(startOfWeek(new Date()));
  const [viewEnd, setViewEnd] = useState(endOfWeek(addDays(new Date(), 30)));
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  useEffect(() => {
    if (tasks.length > 0) {
      convertToGanttTasks();
    }
  }, [tasks]);

  const loadTasks = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users(full_name, email)
      `)
      .eq('project_id', projectId)
      .not('start_date', 'is', null)
      .not('due_date', 'is', null)
      .order('start_date');

    if (data) {
      setTasks(data);
    }

    setLoading(false);
  };

  const convertToGanttTasks = () => {
    const ganttData: GanttTask[] = tasks.map(task => {
      const start = new Date(task.start_date!);
      const end = new Date(task.due_date!);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate progress based on status
      let progress = 0;
      switch (task.status) {
        case 'done':
          progress = 100;
          break;
        case 'in_progress':
          progress = 50;
          break;
        case 'review':
          progress = 80;
          break;
        default:
          progress = 0;
      }

      return {
        id: task.id,
        name: task.title,
        start,
        end,
        progress,
        type: 'task',
        assignee: task.assigned_user?.full_name || task.assigned_user?.email,
      };
    });

    setGanttTasks(ganttData);

    // Adjust view dates based on tasks
    if (ganttData.length > 0) {
      const earliestStart = new Date(Math.min(...ganttData.map(t => t.start.getTime())));
      const latestEnd = new Date(Math.max(...ganttData.map(t => t.end.getTime())));
      
      setViewStart(startOfWeek(earliestStart));
      setViewEnd(endOfWeek(latestEnd));
    }
  };

  const getDays = () => {
    return eachDayOfInterval({ start: viewStart, end: viewEnd });
  };

  const getTaskPosition = (task: GanttTask) => {
    const totalDays = Math.ceil((viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    const startOffset = Math.ceil((task.start.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getPriorityColor = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return '#3b82f6';
    
    switch (task.priority) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'urgent':
        return '#dc2626';
      default:
        return '#3b82f6';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (ganttTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa com datas encontrada</h3>
        <p className="text-gray-600">As tarefas precisam ter data de início e fim para aparecer no Gantt.</p>
      </div>
    );
  }

  const days = getDays();

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="flex bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="w-64 p-3 border-r border-gray-200 bg-white">
            <h3 className="font-medium text-gray-900">Tarefa</h3>
          </div>
          <div className="flex-1 flex">
            {days.map((day, index) => (
              <div
                key={index}
                className="flex-1 p-2 text-center border-r border-gray-200 min-w-[40px]"
              >
                <div className="text-xs text-gray-600">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-sm font-medium">
                  {format(day, 'dd/MM')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="relative">
          {ganttTasks.map((task, index) => (
            <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
              <div className="w-64 p-3 border-r border-gray-200">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {task.name}
                </div>
                {task.assignee && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {task.assignee}
                  </div>
                )}
              </div>
              <div className="flex-1 relative p-2" style={{ minHeight: '60px' }}>
                <div
                  className="absolute top-3 h-6 rounded flex items-center px-2 text-white text-xs font-medium shadow-sm"
                  style={{
                    backgroundColor: getPriorityColor(task.id),
                    ...getTaskPosition(task),
                  }}
                >
                  <div className="truncate">{task.progress}%</div>
                  <div
                    className="absolute top-0 left-0 h-full bg-black bg-opacity-20 rounded"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Date Line */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none">
          <div
            style={{
              left: `${((new Date().getTime() - viewStart.getTime()) / (viewEnd.getTime() - viewStart.getTime())) * 100}%`,
              marginLeft: '256px',
            }}
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legenda de Prioridades</h4>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-green-500 mr-2"></div>
            Baixa
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-yellow-500 mr-2"></div>
            Média
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-red-500 mr-2"></div>
            Alta
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-red-600 mr-2"></div>
            Urgente
          </div>
        </div>
      </div>
    </div>
  );
}