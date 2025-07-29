'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const supabase = createSupabaseClient();
  // Fecha menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

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
            <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50" ref={menuOpenId === task.id ? menuRef : undefined}>
              <div className="w-64 p-3 border-r border-gray-200 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  {/* Play button */}
                  <div
                    className="flex items-center justify-center mr-2 select-none"
                    style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer' }}
                    tabIndex={-1}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); /* ação do play aqui */ }}
                  >
                    {/* Heroicons Play Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653v12.694c0 1.07 1.14 1.735 2.084 1.2l10.385-6.347a1.25 1.25 0 000-2.4L7.334 4.453C6.39 3.918 5.25 4.583 5.25 5.653z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{task.name}</div>
                  </div>
                  {/* Menu button (três pontinhos) */}
                  <div
                    className="relative flex items-center justify-center ml-2 select-none"
                    style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer' }}
                    tabIndex={-1}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === task.id ? null : task.id); }}
                  >
                    {/* Heroicons Ellipsis Vertical */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                    {/* Menu dropdown */}
                    {menuOpenId === task.id && (
                      <div className="absolute right-0 top-8 z-30 w-40 bg-white border border-gray-200 rounded shadow-lg py-1">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Editar</button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mover</button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Duplicar</button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Excluir</button>
                      </div>
                    )}
                  </div>
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