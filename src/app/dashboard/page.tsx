'use client';

import { useState, useEffect } from 'react';
import { DashboardStats, Project, Task } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import { 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  FolderIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load statistics
    const [
      { count: totalTasks },
      { count: completedTasks },
      { count: inProgressTasks },
      { count: totalProjects },
      { count: activeProjects },
      { count: totalClients },
    ] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'done'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'in_progress'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    // Calculate overdue tasks
    const { count: overdueTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lt('due_date', new Date().toISOString())
      .neq('status', 'done');

    // Calculate total time tracked
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('duration')
      .eq('user_id', user.id)
      .not('duration', 'is', null);

    const totalTimeTracked = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;

    setStats({
      total_tasks: totalTasks || 0,
      completed_tasks: completedTasks || 0,
      in_progress_tasks: inProgressTasks || 0,
      overdue_tasks: overdueTasks || 0,
      total_projects: totalProjects || 0,
      active_projects: activeProjects || 0,
      total_clients: totalClients || 0,
      total_time_tracked: Math.floor(totalTimeTracked / 3600), // Convert to hours
    });

    // Load recent projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (projectsData) {
      setRecentProjects(projectsData);
    }

    // Load recent tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        assigned_user:users(full_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (tasksData) {
      setRecentTasks(tasksData);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const taskStatusData = [
    { name: 'Concluídas', value: stats.completed_tasks, color: '#10b981' },
    { name: 'Em Andamento', value: stats.in_progress_tasks, color: '#3b82f6' },
    { name: 'Atrasadas', value: stats.overdue_tasks, color: '#ef4444' },
    { name: 'Outras', value: stats.total_tasks - stats.completed_tasks - stats.in_progress_tasks - stats.overdue_tasks, color: '#6b7280' },
  ];

  const projectData = [
    { name: 'Jan', projetos: 4 },
    { name: 'Fev', projetos: 3 },
    { name: 'Mar', projetos: 6 },
    { name: 'Abr', projetos: 8 },
    { name: 'Mai', projetos: 5 },
    { name: 'Jun', projetos: 7 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos seus projetos e tarefas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_tasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed_tasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">{stats.in_progress_tasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Atrasadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue_tasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projetos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active_projects}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Horas Trabalhadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_time_tracked}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Tarefas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Projetos por Mês</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="projetos" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Projetos Recentes</h3>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.client?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tarefas Recentes</h3>
          <div className="space-y-3">
            {recentTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.project?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}