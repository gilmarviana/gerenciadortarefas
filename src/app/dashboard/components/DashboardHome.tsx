'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Carregar estatísticas básicas
    const [tasksResponse, projectsResponse, clientsResponse] = await Promise.all([
      supabase.from('tasks').select('status, priority, created_at').eq('user_id', user.id),
      supabase.from('projects').select('status, created_at').eq('user_id', user.id),
      supabase.from('clients').select('id').eq('user_id', user.id),
    ]);

    const tasks = tasksResponse.data || [];
    const projects = projectsResponse.data || [];
    const clients = clientsResponse.data || [];

    const dashboardStats: DashboardStats = {
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'done').length,
      in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
      overdue_tasks: 0, // Calcular baseado na data
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status === 'active').length,
      total_clients: clients.length,
      total_time_tracked: 0, // Calcular se houver time entries
    };

    setStats(dashboardStats);
    setLoading(false);
  };

  const tasksByStatusData = [
    { name: 'A Fazer', value: stats?.total_tasks ? stats.total_tasks - stats.completed_tasks - stats.in_progress_tasks : 0, color: '#6b7280' },
    { name: 'Em Andamento', value: stats?.in_progress_tasks || 0, color: '#3b82f6' },
    { name: 'Concluídas', value: stats?.completed_tasks || 0, color: '#10b981' },
  ];

  const productivityData = [
    { name: 'Seg', tasks: 5, hours: 8 },
    { name: 'Ter', tasks: 8, hours: 7 },
    { name: 'Qua', tasks: 6, hours: 6 },
    { name: 'Qui', tasks: 10, hours: 8 },
    { name: 'Sex', tasks: 7, hours: 5 },
    { name: 'Sáb', tasks: 3, hours: 2 },
    { name: 'Dom', tasks: 1, hours: 1 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu progresso e atividades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentDuplicateIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_tasks || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+12% este mês</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completed_tasks || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+8% esta semana</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projetos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.active_projects || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600 ml-1">-2% este mês</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Horas Trabalhadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_time_tracked || 0}h</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+5% esta semana</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tarefas por Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tarefas por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tasksByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            {tasksByStatusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Produtividade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Produtividade Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" name="Tarefas" />
                <Bar dataKey="hours" fill="#10b981" name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <DocumentDuplicateIcon className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Tarefa "Implementar dashboard" foi concluída</p>
              <p className="text-xs text-gray-500">há 2 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Novo cliente "Empresa XYZ" foi adicionado</p>
              <p className="text-xs text-gray-500">há 4 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Projeto "Sistema de Vendas" foi iniciado</p>
              <p className="text-xs text-gray-500">ontem</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentDuplicateIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Nova Tarefa</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Novo Projeto</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserGroupIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Novo Cliente</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClockIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Ver Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
} 