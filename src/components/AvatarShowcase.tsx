'use client';

import UserAvatar, { SystemLogo, ProfileDropdown } from './UserAvatar';

// Componente para demonstrar todas as variações de avatar
export default function AvatarShowcase() {
  // Mock user data para demonstração
  const mockUser = {
    id: '1',
    email: 'usuario@exemplo.com',
    user_metadata: {
      full_name: 'João Silva',
      avatar_url: undefined // Pode ser uma URL real para testar imagem
    }
  };

  const mockUserWithAvatar = {
    ...mockUser,
    user_metadata: {
      ...mockUser.user_metadata,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Showcase de Avatares e Logos</h1>
        
        {/* Sistema Logo */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo do Sistema</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <SystemLogo size="sm" />
              <p className="text-sm text-gray-600 mt-2">Pequeno (sm)</p>
            </div>
            <div className="text-center">
              <SystemLogo size="md" />
              <p className="text-sm text-gray-600 mt-2">Médio (md)</p>
            </div>
            <div className="text-center">
              <SystemLogo size="lg" />
              <p className="text-sm text-gray-600 mt-2">Grande (lg)</p>
            </div>
            <div className="text-center">
              <SystemLogo size="xl" />
              <p className="text-sm text-gray-600 mt-2">Extra Grande (xl)</p>
            </div>
          </div>
        </section>

        {/* Avatar com Iniciais */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Avatar com Iniciais</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <UserAvatar user={mockUser as any} size="sm" />
              <p className="text-sm text-gray-600 mt-2">Pequeno (sm)</p>
            </div>
            <div className="text-center">
              <UserAvatar user={mockUser as any} size="md" />
              <p className="text-sm text-gray-600 mt-2">Médio (md)</p>
            </div>
            <div className="text-center">
              <UserAvatar user={mockUser as any} size="lg" />
              <p className="text-sm text-gray-600 mt-2">Grande (lg)</p>
            </div>
            <div className="text-center">
              <UserAvatar user={mockUser as any} size="xl" />
              <p className="text-sm text-gray-600 mt-2">Extra Grande (xl)</p>
            </div>
          </div>
        </section>

        {/* Avatar com Imagem */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Avatar com Imagem</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <UserAvatar user={mockUserWithAvatar as any} size="sm" />
              <p className="text-sm text-gray-600 mt-2">Pequeno (sm)</p>
            </div>
            <div className="text-center">
              <UserAvatar user={mockUserWithAvatar as any} size="md" />
              <p className="text-sm text-gray-600 mt-2">Médio (md)</p>
            </div>
            <div className="text-center">
              <UserAvatar user={mockUserWithAvatar as any} size="lg" />
              <p className="text-sm text-gray-600 mt-2">Grande (lg)</p>
            </div>
            <div className="text-center">
              <UserAvatar user={mockUserWithAvatar as any} size="xl" />
              <p className="text-sm text-gray-600 mt-2">Extra Grande (xl)</p>
            </div>
          </div>
        </section>

        {/* Avatar com Upload */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Avatar com Upload</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <UserAvatar 
                user={mockUser as any} 
                size="lg" 
                showUpload={true}
                onImageUpload={(file) => console.log('Upload:', file)}
              />
              <p className="text-sm text-gray-600 mt-2">Com botão de upload</p>
            </div>
          </div>
        </section>

        {/* Diferentes usuários para mostrar cores */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cores Automáticas por Usuário</h2>
          <div className="flex items-center space-x-4">
            {[
              { name: 'Ana Costa', email: 'ana@exemplo.com' },
              { name: 'Bruno Silva', email: 'bruno@exemplo.com' },
              { name: 'Carla Santos', email: 'carla@exemplo.com' },
              { name: 'Daniel Oliveira', email: 'daniel@exemplo.com' },
              { name: 'Eduarda Lima', email: 'eduarda@exemplo.com' },
            ].map((user, index) => (
              <div key={index} className="text-center">
                <UserAvatar 
                  user={{
                    id: String(index),
                    email: user.email,
                    user_metadata: { full_name: user.name }
                  } as any}
                  size="md"
                />
                <p className="text-xs text-gray-600 mt-2">{user.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Profile Dropdown */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dropdown de Perfil</h2>
          <div className="flex justify-start">
            <ProfileDropdown 
              user={mockUser as any} 
              onSignOut={() => console.log('Usuário deslogado')}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Clique no avatar para ver o menu</p>
        </section>

        {/* Instruções de Uso */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Como Usar</h2>
          <div className="text-blue-800 space-y-2">
            <p><strong>UserAvatar:</strong> Componente principal para exibir avatar do usuário</p>
            <p><strong>SystemLogo:</strong> Logo do sistema para branding</p>
            <p><strong>ProfileDropdown:</strong> Menu dropdown com informações do usuário</p>
            <br />
            <p><strong>Tamanhos disponíveis:</strong> sm, md, lg, xl</p>
            <p><strong>Cores automáticas:</strong> Geradas baseadas no nome/email do usuário</p>
            <p><strong>Fallback:</strong> Mostra iniciais quando não há imagem de perfil</p>
          </div>
        </section>
      </div>
    </div>
  );
}