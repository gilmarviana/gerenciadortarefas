'use client'

import { useState, useEffect } from 'react'
import { 
  FolderOpen, 
  Users, 
  CheckSquare, 
  Clock, 
  Plus
} from 'lucide-react'

interface DashboardStats {
  totalProjects: number
  totalClients: number
  totalTasks: number
  activeTasks: number
  completedTasks: number
  overdueTasks: number
  totalHours: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalClients: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalHours: 0
  })



  useEffect(() => {
    // Simular dados do dashboard
    setStats({
      totalProjects: 12,
      totalClients: 8,
      totalTasks: 156,
      activeTasks: 89,
      completedTasks: 67,
      overdueTasks: 5,
      totalHours: 1247
    })
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, change }: {
    title: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    color: string
    change?: number
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos seus projetos e tarefas</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Projetos Ativos"
          value={stats.totalProjects}
          icon={FolderOpen}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Clientes"
          value={stats.totalClients}
          icon={Users}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Tarefas Ativas"
          value={stats.activeTasks}
          icon={CheckSquare}
          color="bg-yellow-500"
          change={-5}
        />
        <StatCard
          title="Horas Trabalhadas"
          value={`${stats.totalHours}h`}
          icon={Clock}
          color="bg-purple-500"
          change={15}
        />
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso das Tarefas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completadas</span>
                <span>{stats.completedTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Em Andamento</span>
                <span>{stats.activeTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.activeTasks / stats.totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Atrasadas</span>
                <span>{stats.overdueTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.overdueTasks / stats.totalTasks) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tarefa &quot;Login&quot; completada</p>
                <p className="text-xs text-gray-500">há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nova tarefa criada</p>
                <p className="text-xs text-gray-500">há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tempo registrado</p>
                <p className="text-xs text-gray-500">há 6 horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Criar Nova Tarefa</p>
                  <p className="text-xs text-gray-500">Adicionar tarefa ao projeto</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Adicionar Cliente</p>
                  <p className="text-xs text-gray-500">Cadastrar novo cliente</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Novo Projeto</p>
                  <p className="text-xs text-gray-500">Criar projeto do zero</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso Semanal</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
                         {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t h-32 flex items-end">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Tarefas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Features</span>
              </div>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Bugs</span>
              </div>
              <span className="text-sm font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Melhorias</span>
              </div>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Tarefas</span>
              </div>
              <span className="text-sm font-medium">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
