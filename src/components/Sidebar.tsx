'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  FolderIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { SystemLogo, ProfileDropdown } from './UserAvatar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projetos', href: '/projects', icon: FolderIcon },
  { name: 'Clientes', href: '/clients', icon: UserGroupIcon },
  { name: 'Tarefas', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
  { name: 'Fluxogramas', href: '/flowcharts', icon: PuzzlePieceIcon },
  { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <SystemLogo size="sm" />
          <h1 className="text-xl font-bold text-primary-600">GDO</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <ProfileDropdown user={user} onSignOut={handleSignOut} />
      </div>
    </div>
  );
}