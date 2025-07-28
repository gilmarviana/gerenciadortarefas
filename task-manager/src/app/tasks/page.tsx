'use client'

import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List
} from 'lucide-react'
import KanbanBoard from '@/components/KanbanBoard'

export default function TasksPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const projects = [
    { id: 'all', name: 'Todos os Projetos' },
    { id: '1', name: 'Website E-commerce' },
    { id: '2', name: 'App Mobile' },
    { id: '3', name: 'Sistema ERP' }
  ]

  const statuses = [
    { id: 'all', name: 'Todos os Status' },
    { id: 'todo', name: 'A Fazer' },
    { id: 'in-progress', name: 'Em Progresso' },
    { id: 'review', name: 'Em Revisão' },
    { id: 'done', name: 'Concluído' }
  ]

  const priorities = [
    { id: 'all', name: 'Todas as Prioridades' },
    { id: 'urgent', name: 'Urgente' },
    { id: 'high', name: 'Alta' },
    { id: 'medium', name: 'Média' },
    { id: 'low', name: 'Baixa' }
  ]

  const types = [
    { id: 'all', name: 'Todos os Tipos' },
    { id: 'feature', name: 'Feature' },
    { id: 'bug', name: 'Bug' },
    { id: 'improvement', name: 'Melhoria' },
    { id: 'task', name: 'Tarefa' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600">Gerencie suas tarefas e projetos</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded ${view === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">24</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <div className="text-sm text-gray-600">Em Progresso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">4</div>
            <div className="text-sm text-gray-600">Atrasadas</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="bg-white rounded-lg shadow h-[calc(100vh-300px)]">
          <KanbanBoard projectId={selectedProject !== 'all' ? selectedProject : undefined} />
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Tarefas</h3>
            <div className="text-center text-gray-500 py-8">
              <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Visualização em lista será implementada em breve</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}