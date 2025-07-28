'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { createSupabaseClient, skipUserTableValidation } from '@/lib/supabase';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    hasEmail: '',
    hasPhone: '',
    hasCompany: '',
  });
  const supabase = createSupabaseClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    description: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, filters]);

  const loadClients = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setClients(data);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...clients];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.company?.toLowerCase().includes(search) ||
        client.description?.toLowerCase().includes(search)
      );
    }

    if (filters.hasEmail === 'true') {
      filtered = filtered.filter(client => client.email && client.email.trim() !== '');
    } else if (filters.hasEmail === 'false') {
      filtered = filtered.filter(client => !client.email || client.email.trim() === '');
    }

    if (filters.hasPhone === 'true') {
      filtered = filtered.filter(client => client.phone && client.phone.trim() !== '');
    } else if (filters.hasPhone === 'false') {
      filtered = filtered.filter(client => !client.phone || client.phone.trim() === '');
    }

    if (filters.hasCompany === 'true') {
      filtered = filtered.filter(client => client.company && client.company.trim() !== '');
    } else if (filters.hasCompany === 'false') {
      filtered = filtered.filter(client => !client.company || client.company.trim() === '');
    }

    setFilteredClients(filtered);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      hasEmail: '',
      hasPhone: '',
      hasCompany: '',
    });
  };

  const exportToExcel = () => {
    const exportData = filteredClients.map(client => ({
      'ID': client.id,
      'Nome': client.name,
      'Email': client.email || '',
      'Telefone': client.phone || '',
      'Empresa': client.company || '',
      'Descrição': client.description || '',
      'Criado em': format(new Date(client.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, `clientes-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const getClientStats = () => {
    const total = filteredClients.length;
    const withEmail = filteredClients.filter(c => c.email && c.email.trim() !== '').length;
    const withPhone = filteredClients.filter(c => c.phone && c.phone.trim() !== '').length;
    const withCompany = filteredClients.filter(c => c.company && c.company.trim() !== '').length;

    return { total, withEmail, withPhone, withCompany };
  };

  const stats = getClientStats();

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

      // Validação básica
      if (!formData.name.trim()) {
        alert('Nome é obrigatório!');
        return;
      }

      // Validação de email se preenchido
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        alert('Por favor, insira um email válido!');
        return;
      }

      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        company: formData.company.trim() || null,
        description: formData.description.trim() || null,
        user_id: user.id,
      };

      console.log('Dados do cliente:', clientData);

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id);

        if (error) {
          console.error('Erro ao atualizar cliente:', error);
          alert(`Erro ao atualizar cliente: ${error.message}`);
          return;
        }

        alert('Cliente atualizado com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select();

        if (error) {
          console.error('Erro ao criar cliente:', error);
          alert(`Erro ao criar cliente: ${error.message}`);
          return;
        }

        console.log('Cliente criado:', data);
        alert('Cliente criado com sucesso!');
      }

      loadClients();
      resetForm();
    } catch (error) {
      console.error('Erro geral:', error);
      alert('Erro inesperado. Verifique o console para mais detalhes.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (!error) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const editClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      description: client.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      description: '',
    });
    setEditingClient(null);
    setShowForm(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e contatos</p>
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
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Nome, email, empresa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Com Email
              </label>
              <select
                value={filters.hasEmail}
                onChange={(e) => updateFilter('hasEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Com email</option>
                <option value="false">Sem email</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Com Telefone
              </label>
              <select
                value={filters.hasPhone}
                onChange={(e) => updateFilter('hasPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Com telefone</option>
                <option value="false">Sem telefone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Com Empresa
              </label>
              <select
                value={filters.hasCompany}
                onChange={(e) => updateFilter('hasCompany', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Com empresa</option>
                <option value="false">Sem empresa</option>
              </select>
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
              {filteredClients.length} de {clients.length} clientes
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Com Email</p>
              <p className="text-2xl font-bold text-gray-900">{stats.withEmail}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PhoneIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Com Telefone</p>
              <p className="text-2xl font-bold text-gray-900">{stats.withPhone}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Com Empresa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.withCompany}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        {client.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {client.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                            {client.email}
                          </a>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                            {client.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {client.company && (
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
                        {client.company}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(client.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => editClient(client)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteClient(client.id)}
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

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
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
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
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
                  placeholder="Informações adicionais sobre o cliente..."
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
                      {editingClient ? 'Atualizando...' : 'Criando...'}
                    </div>
                  ) : (
                    editingClient ? 'Atualizar' : 'Criar'
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