
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardHome from "./components/DashboardHome";
import TasksView from "./components/TasksView";
import ProjectsView from "./components/ProjectsView";
import ClientsView from "./components/ClientsView";
import ReportsView from "./components/ReportsView";
import FlowchartsView from "./components/FlowchartsView";
import SettingsView from "./components/SettingsView";
import KanbanView from "./components/KanbanView";
import GanttView from "./components/GanttView";
import { 
  HomeIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  DocumentIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavigationItem = {
  id: string;
  name: string;
  icon: any;
  component: React.ComponentType;
};

const navigation: NavigationItem[] = [
  { id: 'home', name: 'Dashboard', icon: HomeIcon, component: DashboardHome },
  { id: 'tasks', name: 'Tarefas', icon: ClipboardDocumentListIcon, component: TasksView },
  { id: 'kanban', name: 'Kanban', icon: Squares2X2Icon, component: KanbanView },
  { id: 'gantt', name: 'Gantt', icon: CalendarDaysIcon, component: GanttView },
  { id: 'projects', name: 'Projetos', icon: FolderIcon, component: ProjectsView },
  { id: 'clients', name: 'Clientes', icon: UserGroupIcon, component: ClientsView },
  { id: 'reports', name: 'Relatórios', icon: ChartBarIcon, component: ReportsView },
  { id: 'flowcharts', name: 'Fluxogramas', icon: DocumentIcon, component: FlowchartsView },
  { id: 'settings', name: 'Configurações', icon: Cog6ToothIcon, component: SettingsView },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // desktop sidebar state

  useEffect(() => {
    // Se houver um hash na URL, use-o para definir a view inicial
    const hash = window.location.hash.replace('#', '');
    if (hash && navigation.some(item => item.id === hash)) {
      setCurrentView(hash);
    }
  }, []);

  const handleNavigation = (viewId: string) => {
    setCurrentView(viewId);
    setSidebarOpen(false);
    // Atualizar URL sem recarregar a página
    window.history.replaceState(null, '', `/dashboard#${viewId}`);
  };

  const currentComponent = navigation.find(item => item.id === currentView)?.component || DashboardHome;
  const CurrentView = currentComponent;

  // Função para obter nome do usuário
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email || 'Usuário';
  };

  // Função para obter inicial do usuário
  const getUserInitial = () => {
    if (!user) return 'U';
    const name = user.user_metadata?.full_name || user.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar desktop com expand/collapse */}
      <aside className={`hidden lg:flex flex-col ${sidebarExpanded ? 'w-64' : 'w-16'} fixed inset-y-0 bg-white border-r border-gray-200 shadow-sm z-20 transition-all duration-300`}> 
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              {sidebarExpanded && (
                <span className="ml-3 text-xl font-bold text-gray-900">GDO</span>
              )}
            </div>
            <button
              onClick={() => setSidebarExpanded((prev) => !prev)}
              className="ml-2 flex items-center justify-center h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title={sidebarExpanded ? 'Encolher sidebar' : 'Expandir sidebar'}
            >
              {sidebarExpanded ? (
                <ChevronLeftIcon className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-blue-600" />
              )}
            </button>
          </div>
          <div className="flex-1 flex flex-col py-6 gap-2 items-center">
            {/* Menos espaçamento entre itens do menu */}
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`group flex items-center ${sidebarExpanded ? 'w-full px-3 py-1.5' : 'w-10 h-10 justify-center'} rounded-lg mb-1 transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
                  title={item.name}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  {sidebarExpanded && <span className="ml-2 text-base font-medium">{item.name}</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex flex-col items-center pb-6 border-t border-gray-200">
            <div className="flex items-center w-full px-4 py-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">{getUserInitial()}</span>
              </div>
              {sidebarExpanded && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <button
                    onClick={logout}
                    className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeftOnRectangleIcon className="w-3 h-3 mr-1" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col" style={{ marginLeft: sidebarExpanded ? 256 : 64 }}>
        {/* Sidebar mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 mb-8">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <span className="ml-3 text-xl font-bold text-gray-900">GDO</span>
                </div>
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`group flex items-center w-full px-2 py-2 text-base font-medium rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        {item.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center w-full">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">{getUserInitial()}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <button
                      onClick={logout}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeftOnRectangleIcon className="w-3 h-3 mr-1" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Conteúdo principal centralizado e espaçado */}
        <div className="flex flex-col flex-1">
          {/* Header mobile */}
          <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
            <button
              onClick={() => setSidebarOpen(true)}
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          {/* Área de conteúdo */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-8 px-4 sm:px-8 lg:px-12 w-full">
              <div className="bg-white rounded-xl shadow-lg p-8 min-h-[60vh] w-full">
                <CurrentView />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}