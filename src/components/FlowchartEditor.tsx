'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Flowchart } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import { 
  PlayIcon, 
  StopIcon, 
  DocumentIcon, 
  XMarkIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

interface FlowchartEditorProps {
  flowchart: Flowchart;
  onSave: (flowchart: Flowchart) => void;
}

const nodeTypes = {
  start: 'input',
  process: 'default',
  decision: 'default',
  end: 'output',
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Início' },
    position: { x: 250, y: 25 },
    style: {
      background: '#10b981',
      color: 'white',
      border: '1px solid #059669',
      borderRadius: '8px',
    },
  },
];

const initialEdges: Edge[] = [];

export default function FlowchartEditor({ flowchart, onSave }: FlowchartEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(flowchart.nodes?.length ? flowchart.nodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowchart.edges?.length ? flowchart.edges : initialEdges);
  const [saving, setSaving] = useState(false);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState<'start' | 'process' | 'decision' | 'end'>('process');
  const [showAddNode, setShowAddNode] = useState(false);
  const supabase = createSupabaseClient();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    if (!nodeLabel.trim()) return;

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeTypes[nodeType],
      data: { label: nodeLabel },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      style: {
        background: getNodeColor(nodeType),
        color: 'white',
        border: `1px solid ${getNodeBorderColor(nodeType)}`,
        borderRadius: '8px',
        padding: '10px',
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeLabel('');
    setShowAddNode(false);
  }, [nodeLabel, nodeType, setNodes]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return '#10b981';
      case 'process': return '#3b82f6';
      case 'decision': return '#f59e0b';
      case 'end': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getNodeBorderColor = (type: string) => {
    switch (type) {
      case 'start': return '#059669';
      case 'process': return '#2563eb';
      case 'decision': return '#d97706';
      case 'end': return '#dc2626';
      default: return '#4b5563';
    }
  };

  const saveFlowchart = async () => {
    setSaving(true);
    
    try {
      // Convert ReactFlow types to our custom types
      const customNodes = nodes.map(node => ({
        id: node.id,
        type: 'process' as const,
        label: node.data?.label || '',
        position: node.position,
        data: node.data || {}
      }));

      const customEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined
      }));

      const { error } = await supabase
        .from('flowcharts')
        .update({
          nodes: customNodes,
          edges: customEdges,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flowchart.id);

      if (!error) {
        onSave({
          ...flowchart,
          nodes: customNodes,
          edges: customEdges,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar fluxograma:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      const nodeIdsToDelete = selectedNodes.map(node => node.id);
      
      setNodes(nds => nds.filter(node => !nodeIdsToDelete.includes(node.id)));
      setEdges(eds => eds.filter(edge => 
        !selectedEdges.some(selectedEdge => selectedEdge.id === edge.id) &&
        !nodeIdsToDelete.includes(edge.source) &&
        !nodeIdsToDelete.includes(edge.target)
      ));
    }
  }, [nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes]);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddNode(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Adicionar Nó
            </button>

            <select
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="start">Início</option>
              <option value="process">Processo</option>
              <option value="decision">Decisão</option>
              <option value="end">Fim</option>
            </select>

            <button
              onClick={deleteSelectedNodes}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Excluir Selecionados
            </button>
          </div>

          <button
            onClick={saveFlowchart}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <BookmarkIcon className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Nó</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo do Nó
                </label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="start">Início</option>
                  <option value="process">Processo</option>
                  <option value="decision">Decisão</option>
                  <option value="end">Fim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto do Nó
                </label>
                <input
                  type="text"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  placeholder="Digite o texto do nó..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && addNode()}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addNode}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowAddNode(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ReactFlow Editor */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Instructions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-sm text-gray-600">
          <p><strong>Instruções:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Arraste os nós para reposicioná-los</li>
            <li>Clique e arraste de um nó para outro para criar conexões</li>
            <li>Use Delete ou Backspace para excluir nós/conexões selecionados</li>
            <li>Use os controles no canto inferior direito para navegar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}