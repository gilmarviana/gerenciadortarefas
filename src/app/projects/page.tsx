'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
  client: string
  start_date: string
  end_date?: string
  progress: number
  total_tasks: number
  completed_tasks: number
  team_members: string[]
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const projects: Project[] = [
    {
      id: '1',
      name: 'Website E-commerce',
      description: 'Desenvolvimento de plataforma de e-commerce completa',
      status: 'active',
      client: 'TechStore Ltda',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      progress: 65,
      total_tasks: 24,
      completed_tasks: 16,
      team_members: ['João Silva', 'Maria Santos', 'Pedro Costa']
    },
    {
      id: '2',
      name: 'App Mobile',
      description: 'Aplicativo móvel para delivery de comida',
      status: 'active',
      client: 'FoodApp',
      start_date: '2024-02-01',
      end_date: '2024-08-31',
      progress: 35,
      total_tasks: 18,
      completed_tasks: 6,
      team_members: ['Ana Oliveira', 'Carlos Lima']
    },
    {
      id: '3',
      name: 'Sistema ERP',
      description: 'Sistema de gestão empresarial',
      status: 'completed',
      client: 'CorpTech',
      start_date: '2023-08-01',
      end_date: '2024-01-31',
      progress: 100,
      total_tasks: 32,
      completed_tasks: 32,
      team_members: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'completed': return 'Concluído'
      case 'archived': return 'Arquivado'
      default: return 'Desconhecido'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600">Gerencie seus projetos e equipes</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    <span className="text-xs text-gray-500">{project.client}</span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{project.completed_tasks}</div>
                  <div className="text-xs text-gray-600">Tarefas Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{project.total_tasks}</div>
                  <div className="text-xs text-gray-600">Total de Tarefas</div>
                </div>
              </div>

              {/* Team */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Equipe</span>
                  <span className="text-xs text-gray-500">{project.team_members.length} membros</span>
                </div>
                <div className="flex -space-x-2">
                  {project.team_members.slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    >
                      {member.split(' ').map(n => n[0]).join('')}
                    </div>
                  ))}
                  {project.team_members.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                      +{project.team_members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Início: {new Date(project.start_date).toLocaleDateString('pt-BR')}</span>
                </div>
                {project.end_date && (
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Fim: {new Date(project.end_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou criar um novo projeto.</p>
        </div>
      )}
    </div>
  )
}