import GanttChart from '@/components/GanttChart';

export default function GanttView() {
  // Exemplo: projectId vazio para mostrar todos ou um valor fixo
  return (
    <div className="h-full w-full">
      <GanttChart projectId="" />
    </div>
  );
}
