'use client';

import { useState, useEffect } from 'react';
import { Project, Client } from '@/types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { createSupabaseClient, skipUserTableValidation } from '@/lib/supabase';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    client_id: '',
    search: '',
    start_date: '',
    end_date: '',
  });
  const supabase = createSupabaseClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'planning' as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
    start_date: '',
    end_date: '',
    budget: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const loadData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (projectsData) {
      setProjects(projectsData);
    }

    // Load clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);

    if (clientsData) {
      setClients(clientsData);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.client_id) {
      filtered = filtered.filter(project => project.client_id === filters.client_id);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(search) ||
        project.description?.toLowerCase().includes(search) ||
        project.client?.name.toLowerCase().includes(search)
      );
    }

    if (filters.start_date) {
      filtered = filtered.filter(project => 
        project.start_date && project.start_date >= filters.start_date
      );
    }

    if (filters.end_date) {
      filtered = filtered.filter(project => 
        project.end_date && project.end_date <= filters.end_date
      );
    }

    setFilteredProjects(filtered);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      client_id: '',
      search: '',
      start_date: '',
      end_date: '',
    });
  };

  const exportToExcel = () => {
    const exportData = filteredProjects.map(project => ({
      'ID': project.id,
      'Nome': project.name,
      'Descrição': project.description || '',
      'Cliente': project.client?.name || '',
      'Status': getStatusLabel(project.status),
      'Data Início': project.start_date ? format(new Date(project.start_date), 'dd/MM/yyyy') : '',
      'Data Fim': project.end_date ? format(new Date(project.end_date), 'dd/MM/yyyy') : '',
      'Orçamento': project.budget ? `R$ ${project.budget.toLocaleString('pt-BR')}` : '',
      'Criado em': format(new Date(project.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projetos');
    XLSX.writeFile(wb, `projetos-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const getProjectStats = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.status === 'active').length;
    const completed = filteredProjects.filter(p => p.status === 'completed').length;
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

    return { total, active, completed, totalBudget };
  };

  const stats = getProjectStats();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Usuário não encontrado. Faça login novamente.');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Usuário autenticado:', user);

      // Verificar se usuário está autenticado
      const userValid = skipUserTableValidation(user);
      if (!userValid) {
        alert('Erro ao verificar usuário. Tente novamente.');
        return;
      }

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        client_id: formData.client_id || null,
        status: formData.status,
        user_id: user.id,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      console.log('Dados do projeto:', projectData);

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) {
          console.error('Erro ao atualizar projeto:', error);
          alert(`Erro ao atualizar projeto: ${error.message}`);
          return;
        }

        alert('Projeto atualizado com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select();

        if (error) {
          console.error('Erro ao criar projeto:', error);
          alert(`Erro ao criar projeto: ${error.message}`);
          return;
        }

        console.log('Projeto criado:', data);
        alert('Projeto criado com sucesso!');
      }

      loadData();
      resetForm();
    } catch (error) {
      console.error('Erro geral:', error);
      alert('Erro inesperado. Verifique o console para mais detalhes.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      client_id: project.client_id || '',
      status: project.status,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget?.toString() || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client_id: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      budget: '',
    });
    setEditingProject(null);
    setShowForm(false);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planejamento';
      case 'active': return 'Ativo';
      case 'on_hold': return 'Em Espera';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600">Gerencie seus projetos e organize o trabalho</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtros
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Exportar
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="planning">Planejamento</option>
                <option value="active">Ativo</option>
                <option value="on_hold">Em Espera</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                value={filters.client_id}
                onChange={(e) => updateFilter('client_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os clientes</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Nome, descrição..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início (De)
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => updateFilter('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim (Até)
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => updateFilter('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {filteredProjects.length} de {projects.length} projetos
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Projetos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projetos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalBudget.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {project.client?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      {project.start_date && (
                        <div>Início: {format(new Date(project.start_date), 'dd/MM/yyyy')}</div>
                      )}
                      {project.end_date && (
                        <div>Fim: {format(new Date(project.end_date), 'dd/MM/yyyy')}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {project.budget ? `R$ ${project.budget.toLocaleString('pt-BR')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => editProject(project)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planejamento</option>
                  <option value="active">Ativo</option>
                  <option value="on_hold">Em Espera</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingProject ? 'Atualizando...' : 'Criando...'}
                    </div>
                  ) : (
                    editingProject ? 'Atualizar' : 'Criar'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}