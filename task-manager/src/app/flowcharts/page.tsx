'use client'

import { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Save, Download, Trash2, Settings } from 'lucide-react'

interface Flowchart {
  id: string
  name: string
  description?: string
  data: Record<string, unknown>
  project_id: string
  created_at: string
  updated_at: string
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Início' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Processo' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'Fim' },
    position: { x: 250, y: 225 },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

export default function FlowchartsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedFlowchart, setSelectedFlowchart] = useState<string | null>(null)
  const [flowchartName, setFlowchartName] = useState('Novo Fluxograma')
  const [showSaveModal, setShowSaveModal] = useState(false)

  const flowcharts: Flowchart[] = [
    {
      id: '1',
      name: 'Fluxo de Desenvolvimento',
      description: 'Processo de desenvolvimento de features',
      data: { nodes: initialNodes, edges: initialEdges },
      project_id: '1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      name: 'Fluxo de Bug Fix',
      description: 'Processo de correção de bugs',
      data: { nodes: [], edges: [] },
      project_id: '1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ]

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const onSave = () => {
    const flowchartData = {
      nodes,
      edges,
    }
    console.log('Salvando fluxograma:', flowchartData)
    setShowSaveModal(false)
  }

  const onLoad = (flowchart: Flowchart) => {
    setNodes((flowchart.data as { nodes: Node[]; edges: Edge[] }).nodes || [])
    setEdges((flowchart.data as { nodes: Node[]; edges: Edge[] }).edges || [])
    setSelectedFlowchart(flowchart.id)
    setFlowchartName(flowchart.name)
  }

  const onExport = () => {
    const data = {
      nodes,
      edges,
      name: flowchartName,
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${flowchartName}.json`
    link.click()
  }

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setNodes(data.nodes || [])
          setEdges(data.edges || [])
          setFlowchartName(data.name || 'Fluxograma Importado')
        } catch (error) {
          console.error('Erro ao importar arquivo:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxogramas</h1>
          <p className="text-gray-600">Crie e gerencie fluxogramas personalizados</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </button>
          <button
            onClick={onExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fluxogramas</h2>
            
            {/* Import */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importar Fluxograma
              </label>
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Flowcharts List */}
            <div className="space-y-2">
              {flowcharts.map((flowchart) => (
                <div
                  key={flowchart.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFlowchart === flowchart.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => onLoad(flowchart)}
                >
                  <h3 className="font-medium text-gray-900">{flowchart.name}</h3>
                  {flowchart.description && (
                    <p className="text-sm text-gray-600 mt-1">{flowchart.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Atualizado em {new Date(flowchart.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>

            {/* Tools */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Ferramentas</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 text-sm">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Novo Fluxograma
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 text-sm">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Configurações
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-100 text-sm text-red-600">
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flowchart Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)]">
            <div className="p-4 border-b">
              <input
                type="text"
                value={flowchartName}
                onChange={(e) => setFlowchartName(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none"
                placeholder="Nome do fluxograma"
              />
            </div>
            <div className="h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
              >
                <Controls />
                <Background />
                <MiniMap />
              </ReactFlow>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salvar Fluxograma</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Fluxograma
                </label>
                <input
                  type="text"
                  value={flowchartName}
                  onChange={(e) => setFlowchartName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva o fluxograma..."
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={onSave}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}