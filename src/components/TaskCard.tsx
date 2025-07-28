'use client';

import { useState, useEffect } from 'react';
import { Task, TimeEntry } from '@/types';
import { PlayIcon, PauseIcon, ClockIcon } from '@heroicons/react/24/outline';
import { createSupabaseClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onUpdate?: () => void;
}

export default function TaskCard({ task, isDragging, onUpdate }: TaskCardProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Check if there's an active time entry for this task
    const checkActiveTimer = async () => {
      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', task.id)
        .is('end_time', null)
        .single();

      if (data) {
        setCurrentTimeEntry(data);
        setIsTimerRunning(true);
        const startTime = new Date(data.start_time).getTime();
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    };

    checkActiveTimer();
  }, [task.id, supabase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && currentTimeEntry) {
      interval = setInterval(() => {
        const startTime = new Date(currentTimeEntry.start_time).getTime();
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, currentTimeEntry]);

  const startTimer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        task_id: task.id,
        user_id: user.id,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentTimeEntry(data);
      setIsTimerRunning(true);
      setElapsedTime(0);
    }
  };

  const stopTimer = async () => {
    if (!currentTimeEntry) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(currentTimeEntry.start_time).getTime()) / 1000);

    const { error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration,
      })
      .eq('id', currentTimeEntry.id);

    if (!error) {
      setIsTimerRunning(false);
      setCurrentTimeEntry(null);
      setElapsedTime(0);
      onUpdate?.();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-blue-100 text-blue-800';
      case 'improvement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`task-card ${isDragging ? 'opacity-50 rotate-3' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900 leading-tight">{task.title}</h3>
        <button
          onClick={isTimerRunning ? stopTimer : startTimer}
          className={`p-1 rounded-full transition-colors ${
            isTimerRunning 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-green-600 hover:bg-green-50'
          }`}
        >
          {isTimerRunning ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(task.type)}`}>
          {task.type}
        </span>
        {task.category && (
          <span 
            className="px-2 py-1 text-xs rounded-full text-white"
            style={{ backgroundColor: task.category.color }}
          >
            {task.category.name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" />
          {isTimerRunning ? (
            <span className="text-green-600 font-medium">{formatTime(elapsedTime)}</span>
          ) : (
            <span>{task.actual_hours || 0}h</span>
          )}
        </div>
        
        {task.start_date && (
          <span>
            {format(new Date(task.start_date), 'dd/MM', { locale: ptBR })}
          </span>
        )}
      </div>

      {task.assigned_user && (
        <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-600">
            {task.assigned_user.full_name?.charAt(0) || task.assigned_user.email.charAt(0)}
          </div>
          <span className="ml-2 text-xs text-gray-600">
            {task.assigned_user.full_name || task.assigned_user.email}
          </span>
        </div>
      )}
    </div>
  );
}