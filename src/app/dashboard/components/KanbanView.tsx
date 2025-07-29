


import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDraggable } from '@dnd-kit/core';

type Task = { id: string; content: string; tag?: string; tagColor?: string; assignee?: string };
type Column = { id: string; name: string; tasks: Task[] };

const initialColumns: Column[] = [
  {
    id: 'todo',
    name: 'To Do',
    tasks: [
      { id: '1', content: 'Optimize experience for mobile web', tag: 'BILLING', tagColor: 'bg-blue-200', assignee: 'AB' },
      { id: '2', content: 'Onboard workout options (OVO)', tag: 'ACCOUNTS', tagColor: 'bg-green-200', assignee: 'CD' },
      { id: '3', content: 'Multi-dest search UI mobile/web', tag: 'ACCOUNTS', tagColor: 'bg-green-200', assignee: 'EF' },
      { id: '6', content: 'Account settings defaults', tag: 'ACCOUNTS', tagColor: 'bg-green-200', assignee: 'GH' },
    ],
  },
  {
    id: 'inprogress',
    name: 'In Progress',
    tasks: [
      { id: '4', content: 'Fast trip search', tag: 'ACCOUNTS', tagColor: 'bg-green-200', assignee: 'IJ' },
      { id: '5', content: 'Affiliate links integration - frontend', tag: 'BILLING', tagColor: 'bg-blue-200', assignee: 'KL' },
    ],
  },
  {
    id: 'review',
    name: 'In Review',
    tasks: [
      { id: '7', content: 'Revise and streamline booking flow', tag: 'ACCOUNTS', tagColor: 'bg-green-200', assignee: 'MN' },
      { id: '8', content: 'Travel suggestion experiments', tag: 'ACCOUNTS', tagColor: 'bg-green-200', assignee: 'OP' },
    ],
  },
  {
    id: 'done',
    name: 'Done',
    tasks: [
      { id: '9', content: 'High outage: Software bug fix', tag: 'BILLING', tagColor: 'bg-blue-200', assignee: 'QR' },
      { id: '10', content: 'Web-store purchasing performance issue fix', tag: 'FORMS', tagColor: 'bg-yellow-200', assignee: 'ST' },
    ],
  },
];

interface KanbanColumnProps {
  column: Column;
  activeId: string | null;
  onColumnDrop: (columnId: string) => void;
}

function KanbanColumn({ column, activeId, onColumnDrop }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={`bg-white border border-gray-200 rounded-xl shadow-md p-4 min-w-[290px] flex flex-col max-h-[75vh] transition-all duration-200 ${isOver ? 'ring-2 ring-blue-400' : ''}`}
      onDragOver={() => onColumnDrop(column.id)}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800 text-lg tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: isOver ? '#3b82f6' : '#d1d5db' }}></span>
          {column.name}
        </h2>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold">
          {column.tasks.length}
        </span>
      </div>
      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto pb-2">
          {column.tasks.map((task: Task) => (
            <KanbanTask key={task.id} task={task} columnId={column.id} isDragging={activeId === task.id} />
          ))}
        </div>
      </SortableContext>
      <button className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2">
        + Add Task
      </button>
    </div>
  );
}

interface KanbanTaskProps {
  task: Task;
  columnId: string;
  isDragging: boolean;
}

function KanbanTask({ task, columnId, isDragging }: KanbanTaskProps) {
  const { attributes, listeners, setNodeRef, isDragging: isDrag } = useDraggable({
    id: task.id,
    data: { columnId },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-lg shadow border border-gray-200 p-3 text-gray-800 cursor-grab bg-white hover:bg-blue-50 transition-all duration-150 flex flex-col gap-2 ${isDragging ? 'ring-2 ring-blue-400' : ''}`}
      style={{ opacity: isDrag ? 0.5 : 1 }}
    >
      <div className="flex items-center gap-2">
        {task.tag && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${task.tagColor || 'bg-gray-200'} text-gray-700`}>{task.tag}</span>
        )}
        <span className="text-xs text-gray-400 ml-auto">{task.id}</span>
      </div>
      <div className="font-medium text-sm leading-tight">{task.content}</div>
      {task.assignee && (
        <div className="flex items-center gap-2 mt-1">
          <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 border border-white shadow-sm">{task.assignee}</span>
        </div>
      )}
    </div>
  );
}

export default function KanbanView() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columnOver, setColumnOver] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

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

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quadro Kanban</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-w-[900px]">
          {columns.map((col) => (
            <KanbanColumn key={col.id} column={col} activeId={activeId} onColumnDrop={handleColumnDrop} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

