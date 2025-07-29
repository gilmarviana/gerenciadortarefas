import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Tipos simples para o modelo
interface Card {
  id: string;
  content: string;
}
interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const ItemTypes = {
  CARD: 'card',
};

function KanbanCard({ card, index, moveCard, columnId }: {
  card: Card;
  index: number;
  moveCard: (fromCol: string, toCol: string, fromIdx: number, toIdx: number) => void;
  columnId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: any) {
      if (item.columnId === columnId && item.index !== index) {
        moveCard(item.columnId, columnId, item.index, index);
        item.index = index;
      }
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id: card.id, index, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="bg-white rounded shadow p-3 mb-2 cursor-grab border border-gray-200 hover:border-blue-400"
    >
      {card.content}
    </div>
  );
}

function KanbanColumn({ column, moveCard, moveCardToColumn }: {
  column: Column;
  moveCard: (fromCol: string, toCol: string, fromIdx: number, toIdx: number) => void;
  moveCardToColumn: (fromCol: string, toCol: string, card: Card) => void;
}) {
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop(item: any) {
      if (item.columnId !== column.id) {
        moveCardToColumn(item.columnId, column.id, { id: item.id, content: item.content });
        item.columnId = column.id;
        item.index = column.cards.length;
      }
    },
  });
  return (
    <div
      ref={drop as any}
      className="flex flex-col bg-gray-100 rounded-lg p-4 min-h-[300px] w-full border-2 border-transparent"
    >
      <h2 className="font-bold text-gray-700 mb-4 text-center">{column.title}</h2>
      {column.cards.map((card, idx) => (
        <KanbanCard
          key={card.id}
          card={card}
          index={idx}
          moveCard={moveCard}
          columnId={column.id}
        />
      ))}
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'A Fazer',
      cards: [
        { id: '1', content: 'Estudar React' },
        { id: '2', content: 'Ler documentação do react-dnd' },
      ],
    },
    {
      id: 'doing',
      title: 'Em Progresso',
      cards: [
        { id: '3', content: 'Implementar Kanban' },
      ],
    },
    {
      id: 'done',
      title: 'Concluído',
      cards: [
        { id: '4', content: 'Configurar projeto' },
      ],
    },
  ]);

  // Move card dentro da mesma coluna
  function moveCard(fromCol: string, toCol: string, fromIdx: number, toIdx: number) {
    setColumns(prev => {
      const newColumns = prev.map(col => ({ ...col, cards: [...col.cards] }));
      const fromColumn = newColumns.find(col => col.id === fromCol)!;
      const [moved] = fromColumn.cards.splice(fromIdx, 1);
      if (fromCol === toCol) {
        fromColumn.cards.splice(toIdx, 0, moved);
      } else {
        const toColumn = newColumns.find(col => col.id === toCol)!;
        toColumn.cards.splice(toIdx, 0, moved);
      }
      return newColumns;
    });
  }

  // Move card para outra coluna (drop na área vazia)
  function moveCardToColumn(fromCol: string, toCol: string, card: Card) {
    setColumns(prev => {
      const newColumns = prev.map(col => ({ ...col, cards: [...col.cards] }));
      const fromColumn = newColumns.find(col => col.id === fromCol)!;
      const toColumn = newColumns.find(col => col.id === toCol)!;
      const idx = fromColumn.cards.findIndex(c => c.id === card.id);
      if (idx !== -1) {
        const [moved] = fromColumn.cards.splice(idx, 1);
        toColumn.cards.push(moved);
      }
      return newColumns;
    });
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Kanban (react-dnd)</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              moveCard={moveCard}
              moveCardToColumn={moveCardToColumn}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}