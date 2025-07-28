'use client';

import { useState, useEffect } from 'react';
import { Flowchart, Project } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import FlowchartEditor from '@/components/FlowchartEditor';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function FlowchartsPage() {
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFlowchart, setSelectedFlowchart] = useState<Flowchart | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load flowcharts
    const { data: flowchartsData } = await supabase
      .from('flowcharts')
      .select(`
        *,
        project:projects(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (flowchartsData) {
      setFlowcharts(flowchartsData);
    }

    // Load projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);

    if (projectsData) {
      setProjects(projectsData);
    }

    setLoading(false);
  };

  const createFlowchart = async () => {
    const name = prompt('Nome do fluxograma:');
    if (!name) return;

    const description = prompt('Descrição (opcional):');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('flowcharts')
      .insert({
        name,
        description,
        user_id: user.id,
        nodes: [],
        edges: [],
      })
      .select()
      .single();

    if (!error && data) {
      setFlowcharts(prev => [data, ...prev]);
      setSelectedFlowchart(data);
      setShowEditor(true);
    }
  };

  const editFlowchart = (flowchart: Flowchart) => {
    setSelectedFlowchart(flowchart);
    setShowEditor(true);
  };

  const deleteFlowchart = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fluxograma?')) {
      return;
    }

    const { error } = await supabase
      .from('flowcharts')
      .delete()
      .eq('id', id);

    if (!error) {
      setFlowcharts(prev => prev.filter(f => f.id !== id));
      if (selectedFlowchart?.id === id) {
        setSelectedFlowchart(null);
        setShowEditor(false);
      }
    }
  };

  const onFlowchartSave = (updatedFlowchart: Flowchart) => {
    setFlowcharts(prev => 
      prev.map(f => f.id === updatedFlowchart.id ? updatedFlowchart : f)
    );
    setSelectedFlowchart(updatedFlowchart);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (showEditor && selectedFlowchart) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedFlowchart.name}</h1>
            {selectedFlowchart.description && (
              <p className="text-gray-600">{selectedFlowchart.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowEditor(false)}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>
        
        <FlowchartEditor
          flowchart={selectedFlowchart}
          onSave={onFlowchartSave}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fluxogramas</h1>
          <p className="text-gray-600">Crie e gerencie fluxogramas personalizados</p>
        </div>

        <button
          onClick={createFlowchart}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Novo Fluxograma
        </button>
      </div>

      {flowcharts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fluxograma encontrado</h3>
          <p className="text-gray-600 mb-4">Crie seu primeiro fluxograma para organizar processos e workflows.</p>
          <button onClick={createFlowchart} className="btn-primary">
            Criar Fluxograma
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flowcharts.map((flowchart) => (
            <div key={flowchart.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {flowchart.name}
                  </h3>
                  {flowchart.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {flowchart.description}
                    </p>
                  )}
                  {flowchart.project && (
                    <p className="text-xs text-gray-500">
                      Projeto: {flowchart.project.name}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => editFlowchart(flowchart)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFlowchart(flowchart.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Nós:</span>
                  <span>{flowchart.nodes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conexões:</span>
                  <span>{flowchart.edges?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Criado:</span>
                  <span>{new Date(flowchart.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <button
                onClick={() => editFlowchart(flowchart)}
                className="w-full mt-4 btn-primary"
              >
                Abrir Editor
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}