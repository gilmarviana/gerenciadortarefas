'use client';

import { useState, useCallback, useRef } from 'react';
import { Flowchart, FlowchartNode, FlowchartEdge } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import { 
  PlusIcon, 
  PlayIcon, 
  StopIcon, 
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface FlowchartEditorProps {
  flowchart: Flowchart;
  onSave: (flowchart: Flowchart) => void;
}

export default function FlowchartEditor({ flowchart, onSave }: FlowchartEditorProps) {
  const [nodes, setNodes] = useState<FlowchartNode[]>(flowchart.nodes || []);
  const [edges, setEdges] = useState<FlowchartEdge[]>(flowchart.edges || []);
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<FlowchartEdge | null>(null);
  const [draggedNode, setDraggedNode] = useState<FlowchartNode | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);
  const supabase = createSupabaseClient();

  const nodeTypes = [
    { type: 'start', label: 'Início', icon: PlayIcon, color: '#10b981' },
    { type: 'process', label: 'Processo', icon: Cog6ToothIcon, color: '#3b82f6' },
    { type: 'decision', label: 'Decisão', icon: QuestionMarkCircleIcon, color: '#f59e0b' },
    { type: 'end', label: 'Fim', icon: StopIcon, color: '#ef4444' },
  ];

  const addNode = (type: string) => {
    const newNode: FlowchartNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      label: `Novo ${type}`,
      position: { x: 200, y: 200 },
      data: {},
    };
    setNodes(prev => [...prev, newNode]);
  };

  const updateNode = (nodeId: string, updates: Partial<FlowchartNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
  };

  const startConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const endConnection = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const newEdge: FlowchartEdge = {
        id: `edge-${Date.now()}`,
        source: connectingFrom,
        target: nodeId,
      };
      setEdges(prev => [...prev, newEdge]);
    }
    setConnectingFrom(null);
  };

  const deleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
    setSelectedEdge(null);
  };

  const handleNodeDrag = useCallback((e: React.MouseEvent, node: FlowchartNode) => {
    e.preventDefault();
    setDraggedNode(node);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      
      updateNode(node.id, {
        position: { x: Math.max(0, x - 50), y: Math.max(0, y - 25) }
      });
    };
    
    const handleMouseUp = () => {
      setDraggedNode(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.color || '#6b7280';
  };

  const getPathBetweenNodes = (sourceId: string, targetId: string) => {
    const source = nodes.find(n => n.id === sourceId);
    const target = nodes.find(n => n.id === targetId);
    
    if (!source || !target) return '';
    
    const sx = source.position.x + 50;
    const sy = source.position.y + 25;
    const tx = target.position.x + 50;
    const ty = target.position.y + 25;
    
    // Create a curved path
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const offsetX = Math.abs(tx - sx) * 0.3;
    
    return `M ${sx} ${sy} Q ${midX + offsetX} ${midY} ${tx} ${ty}`;
  };

  const saveFlowchart = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from('flowcharts')
      .update({
        nodes,
        edges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', flowchart.id);
    
    if (!error) {
      onSave({ ...flowchart, nodes, edges });
    }
    
    setSaving(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Editor de Fluxograma</h3>
            
            <div className="flex space-x-2">
              {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type)}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    style={{ borderColor: nodeType.color }}
                  >
                    <Icon className="w-4 h-4 mr-2" style={{ color: nodeType.color }} />
                    {nodeType.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={saveFlowchart}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        <svg
          ref={canvasRef}
          className="w-full h-full"
          viewBox="0 0 1200 800"
          style={{ minHeight: '600px' }}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Edges */}
          {edges.map((edge) => (
            <g key={edge.id}>
              <path
                d={getPathBetweenNodes(edge.source, edge.target)}
                stroke="#6b7280"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="cursor-pointer hover:stroke-blue-500"
                onClick={() => setSelectedEdge(edge)}
              />
              {edge.label && (
                <text
                  x={(nodes.find(n => n.id === edge.source)?.position.x || 0) + 
                     (nodes.find(n => n.id === edge.target)?.position.x || 0)} / 2 + 50}
                  y={(nodes.find(n => n.id === edge.source)?.position.y || 0) + 
                     (nodes.find(n => n.id === edge.target)?.position.y || 0)} / 2 + 25}
                  className="text-xs fill-gray-600"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          ))}
          
          {/* Temporary connection line */}
          {connectingFrom && (
            <line
              x1={(nodes.find(n => n.id === connectingFrom)?.position.x || 0) + 50}
              y1={(nodes.find(n => n.id === connectingFrom)?.position.y || 0) + 25}
              x2={(nodes.find(n => n.id === connectingFrom)?.position.x || 0) + 50}
              y2={(nodes.find(n => n.id === connectingFrom)?.position.y || 0) + 25}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
          
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
        </svg>
        
        {/* Nodes */}
        {nodes.map((node) => {
          const nodeColor = getNodeColor(node.type);
          const isSelected = selectedNode?.id === node.id;
          
          return (
            <div
              key={node.id}
              className={`absolute cursor-move select-none ${
                isSelected ? 'z-20' : 'z-10'
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                transform: draggedNode?.id === node.id ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseDown={(e) => handleNodeDrag(e, node)}
              onClick={() => setSelectedNode(node)}
            >
              <div
                className={`w-24 h-12 rounded-lg border-2 flex items-center justify-center text-white text-xs font-medium shadow-lg transition-all duration-200 ${
                  isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-300'
                }`}
                style={{ backgroundColor: nodeColor }}
              >
                {node.label}
              </div>
              
              {/* Connection points */}
              <div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded-full border-2 border-white cursor-pointer hover:bg-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  if (connectingFrom) {
                    endConnection(node.id);
                  } else {
                    startConnection(node.id);
                  }
                }}
              />
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded-full border-2 border-white cursor-pointer hover:bg-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  if (connectingFrom) {
                    endConnection(node.id);
                  } else {
                    startConnection(node.id);
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Properties Panel */}
      {(selectedNode || selectedEdge) && (
        <div className="bg-white border-t border-gray-200 p-4">
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Propriedades do Nó</h4>
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rótulo
                  </label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={selectedNode.type}
                    onChange={(e) => updateNode(selectedNode.id, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {nodeTypes.map((type) => (
                      <option key={type.type} value={type.type}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : selectedEdge ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Propriedades da Conexão</h4>
                <button
                  onClick={() => deleteEdge(selectedEdge.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rótulo (opcional)
                </label>
                <input
                  type="text"
                  value={selectedEdge.label || ''}
                  onChange={(e) => {
                    setEdges(prev => prev.map(edge => 
                      edge.id === selectedEdge.id 
                        ? { ...edge, label: e.target.value }
                        : edge
                    ));
                    setSelectedEdge({ ...selectedEdge, label: e.target.value });
                  }}
                  placeholder="Ex: Sim, Não, Próximo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}