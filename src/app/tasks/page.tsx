'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import KanbanBoard from '@/components/KanbanBoard';
import GanttChart from '@/components/GanttChart';
import { ViewColumnsIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban');
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
        <p className="text-gray-600 mb-4">Crie um projeto primeiro para gerenciar suas tarefas.</p>
        <a
          href="/projects"
          className="btn-primary"
        >
          Criar Projeto
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600">Gerencie suas tarefas em quadros Kanban ou Gantt</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} {project.client && `- ${project.client.name}`}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-3 py-2 rounded-l-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ViewColumnsIcon className="w-4 h-4 mr-2" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center px-3 py-2 rounded-r-lg transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bars3BottomLeftIcon className="w-4 h-4 mr-2" />
              Gantt
            </button>
          </div>
        </div>
      </div>

      {/* Task Views */}
      <div className="card p-0 h-[calc(100vh-280px)]">
        {viewMode === 'kanban' ? (
          <div className="p-4 h-full">
            <KanbanBoard projectId={selectedProject} />
          </div>
        ) : (
          <div className="p-4 h-full">
            <GanttChart projectId={selectedProject} />
          </div>
        )}
      </div>
    </div>
  );
}