


import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDraggable } from '@dnd-kit/core';
import { PlayIcon, PauseIcon, FlagIcon, CalendarDaysIcon, UserIcon, Cog6ToothIcon, EllipsisHorizontalIcon, ArrowUpIcon, ArrowPathIcon, DocumentDuplicateIcon, ChatBubbleLeftRightIcon, ShareIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/solid';

type Subtask = {
  id: string;
  title: string;
  done?: boolean;
};
type Task = {
  id: string;
  content: string;
  tag?: string;
  tagColor?: string;
  assignee?: string;
  totalTime?: number;
  dueDate?: string;
  flag?: boolean;
  progress?: number;
  type?: string;
  description?: string;
  urgent?: boolean;
  subtasks?: Subtask[];
};
type Column = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  tasks: Task[];
  status?: 'aberto' | 'concluido';
  count?: number;
  time?: string;
  points?: number;
};

const initialColumns: Column[] = [
  {
    id: 'todo',
    name: 'Inbox',
    icon: <UserIcon className="w-4 h-4 text-gray-400" />,
    status: 'aberto',
    tasks: [
      { id: '1', content: 'Task Example 01', tag: 'CA', tagColor: 'bg-red-200', assignee: 'R', totalTime: 0, dueDate: '', flag: true, progress: 0, type: 'Bug', description: 'Corrigir erro de login', urgent: true, subtasks: [
        { id: '1-1', title: 'Reproduzir bug', done: true },
        { id: '1-2', title: 'Corrigir código', done: false },
        { id: '1-3', title: 'Testar solução', done: false },
      ] },
      { id: '2', content: 'Task Example 02', tag: 'NZ', tagColor: 'bg-blue-200', assignee: 'A', totalTime: 19800, dueDate: '25 Nov', flag: false, progress: 80, type: 'Feature', description: 'Adicionar exportação CSV', urgent: false, subtasks: [
        { id: '2-1', title: 'Criar endpoint', done: true },
        { id: '2-2', title: 'Implementar botão', done: false },
      ] },
      { id: '3', content: 'Task example 03', tag: 'CA', tagColor: 'bg-red-200', assignee: 'NZ', totalTime: 18000, dueDate: '', flag: false, progress: 100, type: 'Bug', description: 'Ajustar layout mobile', urgent: false, subtasks: [] },
      { id: '4', content: 'Task example 04', tag: 'NZ', tagColor: 'bg-blue-200', assignee: 'A', totalTime: 23400, dueDate: '25 Nov', flag: true, progress: 20, type: 'Task', description: 'Revisar documentação', urgent: true, subtasks: [
        { id: '4-1', title: 'Ler documentação', done: false },
        { id: '4-2', title: 'Sugerir melhorias', done: false },
      ] },
      { id: '5', content: 'Task example 05', tag: 'CA', tagColor: 'bg-red-200', assignee: 'NZ', totalTime: 0, dueDate: '', flag: false, progress: 0, type: 'Task', description: 'Atualizar dependências', urgent: false, subtasks: [] },
    ],
  },
  {
    id: 'inprogress',
    name: 'In progress',
    icon: <UserIcon className="w-4 h-4 text-gray-400" />,
    status: 'aberto',
    tasks: [
      { id: '6', content: 'Task Example 03', tag: 'CA', tagColor: 'bg-red-200', assignee: 'CA', totalTime: 2340, dueDate: '', flag: false, progress: 29, type: 'Bug', description: 'Corrigir tooltip', urgent: false, subtasks: [] },
      { id: '7', content: 'Task Example 04', tag: 'NZ', tagColor: 'bg-blue-200', assignee: 'NZ', totalTime: 0, dueDate: '25 Nov', flag: true, progress: 0, type: 'Task', description: 'Testar integração', urgent: true, subtasks: [
        { id: '7-1', title: 'Criar testes', done: false },
        { id: '7-2', title: 'Executar testes', done: false },
      ] },
    ],
  },
  {
    id: 'review',
    name: 'In approval',
    icon: <UserIcon className="w-4 h-4 text-gray-400" />,
    status: 'aberto',
    tasks: [
      { id: '8', content: 'Task Example 05', tag: 'AG', tagColor: 'bg-orange-200', assignee: 'AG', totalTime: 18600, dueDate: '18 Nov', flag: false, progress: 90, type: 'Feature', description: 'Nova tela de relatórios', urgent: false, subtasks: [] },
      { id: '9', content: 'Task Example 06', tag: 'NZ', tagColor: 'bg-blue-200', assignee: 'NZ', totalTime: 6000, dueDate: '', flag: false, progress: 40, type: 'Task', description: 'Aprovar orçamento', urgent: false, subtasks: [] },
    ],
  },
  {
    id: 'done',
    name: 'Concluído',
    icon: <UserIcon className="w-4 h-4 text-gray-400" />,
    status: 'concluido',
    tasks: [
      { id: '10', content: 'Calendar - Client', tag: 'NZ', tagColor: 'bg-blue-200', assignee: 'NZ', totalTime: 10800, dueDate: '', flag: false, progress: 100, type: 'Task', description: 'Reunião com cliente', urgent: false, subtasks: [] },
    ],
  },
];

interface KanbanColumnProps {
  column: Column;
  activeId: string | null;
  onColumnDrop: (columnId: string) => void;
  readOnly?: boolean;
}

import { useRef as useReactRef, useState as useReactState, useEffect as useReactEffect } from 'react';

function KanbanColumn({ column, activeId, onColumnDrop, readOnly }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [menuOpen, setMenuOpen] = useReactState(false);
  const menuRef = useReactRef<HTMLDivElement | null>(null);

  useReactEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Calcula dinamicamente o total de horas e quantidade de cards
  const totalSeconds = column.tasks.reduce((acc, t) => acc + (t.totalTime || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedTime = totalHours > 0 ? `${totalHours}h${totalMinutes > 0 ? ' ' + totalMinutes + 'm' : ''}` : `${totalMinutes}m`;
  const cardCount = column.tasks.length;

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#f7f9fb] border border-gray-200 rounded-2xl shadow p-0 min-w-[320px] flex flex-col max-h-[80vh] transition-all duration-200 ${isOver ? 'ring-2 ring-blue-400' : ''}`}
      onDragOver={() => onColumnDrop(column.id)}
    >
      {/* Header da coluna */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {column.icon}
          <span className="font-semibold text-gray-700 text-base">{column.name}</span>
          <span className="ml-2 text-xs text-gray-400 font-medium">{cardCount}</span>
        </div>
        <div className="flex items-center gap-2 relative">
          <span className="text-xs text-gray-400">{formattedTime}</span>
          <span className="text-xs text-gray-400">{cardCount} cards</span>
          <div
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition cursor-pointer select-none"
            onClick={e => { e.stopPropagation(); e.preventDefault(); setMenuOpen((v) => !v); }}
            onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
            tabIndex={0}
            role="button"
            aria-label="Mais opções da coluna"
            style={{ userSelect: 'none' }}
          >
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-300 hover:text-gray-500 pointer-events-none" title="Mais opções da coluna" />
          </div>
          {menuOpen && (
            <div ref={menuRef} className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
              <ul className="py-2 text-sm text-gray-700">
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><ArrowPathIcon className="w-4 h-4 mr-2 text-gray-500" />Editar</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 text-gray-500" />Editar</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><TrashIcon className="w-4 h-4 mr-2 text-red-500" />Excluir coluna</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Lista de cards */}
      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
          {column.tasks.map((task: Task) => (
            <KanbanTask key={task.id} task={task} columnId={column.id} isDragging={activeId === task.id} />
          ))}
        </div>
      </SortableContext>
      {/* Rodapé da coluna */}
      {!readOnly && (
        <button className="w-full py-2 border-t border-gray-100 text-blue-600 hover:bg-blue-50 font-semibold text-sm flex items-center justify-center gap-2">
          + Add task
        </button>
      )}
    </div>
  );
}

interface KanbanTaskProps {
  task: Task;
  columnId: string;
  isDragging: boolean;
  readOnly?: boolean;
}

import { useRef } from 'react';


function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ...existing code...

function KanbanTask({ task, columnId, isDragging, readOnly }: KanbanTaskProps) {
  const { attributes, listeners, setNodeRef, isDragging: isDrag } = useDraggable({
    id: task.id,
    data: { columnId },
  });
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(task.totalTime || 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [menuOpen, setMenuOpen] = useReactState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useReactEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (running) {
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="relative">
      {/* Topo do card: play centralizado e menu no topo direito */}
      <div className="absolute -top-3 left-0 w-full z-20 pointer-events-none">
        <div className="flex justify-center items-center w-full">
          <button
            type="button"
            onClick={handlePlayPause}
            className={`rounded-full p-1 border ${running ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'} hover:bg-blue-100 transition shadow pointer-events-auto`}
            title={running ? 'Pausar' : 'Iniciar'}
            style={{ cursor: readOnly ? 'not-allowed' : 'pointer' }}
            disabled={readOnly}
          >
            {running ? (
              <PauseIcon className="w-4 h-4 text-red-500" />
            ) : (
              <PlayIcon className="w-4 h-4 text-green-500" />
            )}
          </button>
        </div>
        <div className="absolute right-2 top-0 pointer-events-auto">
          {!readOnly && (
            <div
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition cursor-pointer select-none"
              onClick={e => { e.stopPropagation(); e.preventDefault(); setMenuOpen((v) => !v); }}
              onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
              tabIndex={0}
              role="button"
              aria-label="Mais opções do card"
              style={{ userSelect: 'none' }}
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-300 hover:text-gray-500 pointer-events-none" title="Configurações do card" />
            </div>
          )}
          {menuOpen && !readOnly && (
            <div ref={menuRef} className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
              <ul className="py-2 text-sm text-gray-700">
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><ArrowUpIcon className="w-4 h-4 mr-2 text-gray-500" />Enviar para topo</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-500" />Clonar</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><ShareIcon className="w-4 h-4 mr-2 text-gray-500" />Compartilhar</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><ArrowPathIcon className="w-4 h-4 mr-2 text-gray-500" />Converter em subtarefa</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-gray-50"><CheckIcon className="w-4 h-4 mr-2 text-gray-500" />Entregar tarefa</button></li>
                <li><button className="flex items-center w-full px-4 py-2 hover:bg-red-50 text-red-600"><TrashIcon className="w-4 h-4 mr-2 text-red-500" />Apagar</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`rounded-xl border border-gray-200 bg-white shadow-sm p-3 cursor-grab hover:bg-blue-50 transition-all duration-150 flex flex-col gap-2 ${isDragging ? 'ring-2 ring-blue-400' : ''}`}
        style={{ opacity: isDrag ? 0.5 : 1, marginTop: '20px' }}
      >
        {/* Header do card */}
        <div className="flex items-center gap-2 mb-1">
          {/* Tipo da tarefa (vermelho) */}
          {task.type && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-200 text-red-700 border border-red-300 uppercase">{task.type}</span>
          )}
          {/* Urgência (bandeira vermelha) */}
          {task.urgent && <FlagIcon className="w-4 h-4 text-red-500 ml-1" title="Urgente" />}
        <span className="ml-auto flex items-center gap-1 relative">
          <span className="text-xs text-gray-400">#{task.id}</span>
        </span>
        </div>
        {/* Título */}
        <div className="font-semibold text-gray-800 text-sm leading-tight mb-1">{task.content}</div>
        {/* Descrição/resumo */}
        {task.description && (
          <div className="text-xs text-gray-500 mb-1 line-clamp-2">{task.description}</div>
        )}
        {/* Subtarefas */}
        {task.subtasks && task.subtasks.length > 0 && (
          <ul className="mb-1 mt-1 space-y-1">
            {task.subtasks.map((sub) => (
              <li key={sub.id} className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={sub.done} readOnly className="accent-blue-500" disabled={readOnly} />
                <span className={sub.done ? 'line-through text-gray-400' : ''}>{sub.title}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Barra de progresso */}
        {typeof task.progress === 'number' && (
          <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${task.progress}%` }}></div>
          </div>
        )}
        {/* Footer do card */}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            {formatTime(elapsed)}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1 ml-2"><CalendarDaysIcon className="w-4 h-4 text-gray-400" />{task.dueDate}</span>
          )}
          {/* Destinatário */}
          {task.assignee && (
            <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 border border-white shadow-sm ml-auto">{task.assignee}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanView() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columnOver, setColumnOver] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 1,
        tolerance: 5,
      },
    })
  );

  const findTask = (id: string) => {
    for (const col of columns) {
      const idx = col.tasks.findIndex((t) => t.id === id);
      if (idx !== -1) return { colId: col.id, idx };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    // Detecta se está sobre uma coluna
    if (event.over && initialColumns.some(col => col.id === event.over.id)) {
      setColumnOver(event.over.id);
    } else {
      setColumnOver(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setColumnOver(null);
    if (!over || active.id === over.id) return;
    const from = findTask(active.id as string);
    if (!from) return;
    // Se soltou sobre uma coluna vazia, move para o final dela
    let to = findTask(over.id as string);
    let toColId = to ? to.colId : over.id as string;
    let toIdx = to ? to.idx : columns.find((c) => c.id === toColId)?.tasks.length || 0;
    if (from.colId === toColId) {
      // Mesma coluna: reorder
      const colIdx = columns.findIndex((c) => c.id === from.colId);
      const newTasks = arrayMove(columns[colIdx].tasks, from.idx, toIdx);
      setColumns(columns.map((c, i) => i === colIdx ? { ...c, tasks: newTasks } : c));
    } else {
      // Move entre colunas
      const fromColIdx = columns.findIndex((c) => c.id === from.colId);
      const toColIdx = columns.findIndex((c) => c.id === toColId);
      const task = columns[fromColIdx].tasks[from.idx];
      const newFromTasks = [...columns[fromColIdx].tasks];
      newFromTasks.splice(from.idx, 1);
      const newToTasks = [...columns[toColIdx].tasks];
      newToTasks.splice(toIdx, 0, task);
      setColumns(columns.map((c, i) => {
        if (i === fromColIdx) return { ...c, tasks: newFromTasks };
        if (i === toColIdx) return { ...c, tasks: newToTasks };
        return c;
      }));
    }
  };

  // Para destacar coluna ao arrastar
  const handleColumnDrop = (columnId: string) => {
    setColumnOver(columnId);
  };

  // Adiciona novo grupo
  const handleAddGroup = () => {
    const name = prompt('Nome do novo grupo:');
    if (!name) return;
    setColumns(cols => ([
      ...cols,
      {
        id: `col-${Date.now()}`,
        name,
        icon: <UserIcon className="w-4 h-4 text-gray-400" />,
        status: 'aberto',
        tasks: [],
      },
    ]));
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quadro Kanban</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        onClick={handleAddGroup}
      >
        + Novo grupo
      </button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-w-[900px]">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              activeId={activeId}
              onColumnDrop={handleColumnDrop}
              readOnly={col.status === 'concluido'}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

