'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFilter, Project, User } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import { DocumentArrowDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<TaskFilter>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const loadData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load tasks with related data
    const { data: tasksData } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        category:task_categories(name, color),
        assigned_user:users(full_name, email)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksData) {
      setTasks(tasksData);
    }

    // Load projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);

    if (projectsData) {
      setProjects(projectsData);
    }

    // Load users (for assignment filter)
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    if (usersData) {
      setUsers(usersData);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.status?.length) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }

    if (filters.priority?.length) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.type?.length) {
      filtered = filtered.filter(task => filters.type!.includes(task.type));
    }

    if (filters.assigned_to?.length) {
      filtered = filtered.filter(task => 
        task.assigned_to && filters.assigned_to!.includes(task.assigned_to)
      );
    }

    if (filters.project_id) {
      filtered = filtered.filter(task => task.project_id === filters.project_id);
    }

    if (filters.start_date) {
      filtered = filtered.filter(task => 
        task.start_date && task.start_date >= filters.start_date!
      );
    }

    if (filters.end_date) {
      filtered = filtered.filter(task => 
        task.due_date && task.due_date <= filters.end_date!
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      );
    }

    setFilteredTasks(filtered);
  };

  const exportToExcel = () => {
    const exportData = filteredTasks.map(task => ({
      'ID': task.id,
      'Título': task.title,
      'Descrição': task.description || '',
      'Projeto': task.project?.name || '',
      'Status': task.status,
      'Prioridade': task.priority,
      'Tipo': task.type,
      'Responsável': task.assigned_user?.full_name || task.assigned_user?.email || '',
      'Categoria': task.category?.name || '',
      'Data Início': task.start_date ? format(new Date(task.start_date), 'dd/MM/yyyy') : '',
      'Data Fim': task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : '',
      'Horas Estimadas': task.estimated_hours || 0,
      'Horas Trabalhadas': task.actual_hours || 0,
      'Criado em': format(new Date(task.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tarefas');
    XLSX.writeFile(wb, `relatorio-tarefas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredTasks.map(task => ({
      id: task.id,
      titulo: task.title,
      descricao: task.description || '',
      projeto: task.project?.name || '',
      status: task.status,
      prioridade: task.priority,
      tipo: task.type,
      responsavel: task.assigned_user?.full_name || task.assigned_user?.email || '',
      categoria: task.category?.name || '',
      data_inicio: task.start_date ? format(new Date(task.start_date), 'dd/MM/yyyy') : '',
      data_fim: task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : '',
      horas_estimadas: task.estimated_hours || 0,
      horas_trabalhadas: task.actual_hours || 0,
      criado_em: format(new Date(task.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-tarefas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const updateFilter = (key: keyof TaskFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Analise e exporte dados das suas tarefas</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtros
          </button>

          <div className="flex space-x-2">
            <button
              onClick={exportToExcel}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                multiple
                value={filters.status || []}
                onChange={(e) => updateFilter('status', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                multiple
                value={filters.priority || []}
                onChange={(e) => updateFilter('priority', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projeto
              </label>
              <select
                value={filters.project_id || ''}
                onChange={(e) => updateFilter('project_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos os projetos</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value || undefined)}
                placeholder="Título ou descrição..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início (De)
              </label>
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => updateFilter('start_date', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim (Até)
              </label>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => updateFilter('end_date', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Limpar Filtros
            </button>
            <div className="text-sm text-gray-600">
              {filteredTasks.length} de {tasks.length} tarefas
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total de Tarefas</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredTasks.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Concluídas</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredTasks.filter(t => t.status === 'done').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Em Andamento</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filteredTasks.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Horas Trabalhadas</h3>
          <p className="text-2xl font-bold text-purple-600">
            {filteredTasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0)}h
          </p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarefa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Fim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.project?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.assigned_user?.full_name || task.assigned_user?.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {task.actual_hours || 0}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}