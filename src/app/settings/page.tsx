'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';
import { 
  UserIcon, 
  LockClosedIcon, 
  BellIcon, 
  CogIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const supabase = createSupabaseClient();

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    task_reminders: true,
    project_updates: true,
    weekly_reports: false,
  });

  const [themeSettings, setThemeSettings] = useState({
    dark_mode: false,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load user profile data
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUser(profile);
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        avatar_url: profile.avatar_url || '',
      });
    }

    setLoading(false);
  };

  const updateProfile = async () => {
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      setUser(prev => prev ? { ...prev, ...profileData } : null);
    }

    setSaving(false);
  };

  const updateNotifications = async () => {
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        notifications: notificationSettings,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);
  };

  const updateTheme = async () => {
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: themeSettings,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserIcon },
    { id: 'notifications', name: 'Notificações', icon: BellIcon },
    { id: 'theme', name: 'Aparência', icon: CogIcon },
    { id: 'security', name: 'Segurança', icon: LockClosedIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="flex space-x-8">
        {/* Sidebar */}
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Informações do Perfil</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <button className="btn-secondary">
                      Alterar Foto
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Recomendado: 400x400px, máximo 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={updateProfile}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Preferências de Notificação</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                    <p className="text-sm text-gray-500">Receba atualizações importantes por email</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Lembretes de Tarefas</h4>
                    <p className="text-sm text-gray-500">Receba lembretes antes do prazo das tarefas</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, task_reminders: !prev.task_reminders }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.task_reminders ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.task_reminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Atualizações de Projetos</h4>
                    <p className="text-sm text-gray-500">Seja notificado sobre mudanças nos projetos</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, project_updates: !prev.project_updates }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.project_updates ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.project_updates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Relatórios Semanais</h4>
                    <p className="text-sm text-gray-500">Receba um resumo semanal das suas atividades</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, weekly_reports: !prev.weekly_reports }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.weekly_reports ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.weekly_reports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={updateNotifications}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Salvando...' : 'Salvar Preferências'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Aparência e Idioma</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tema
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setThemeSettings(prev => ({ ...prev, dark_mode: false }))}
                      className={`p-4 border-2 rounded-lg flex items-center ${
                        !themeSettings.dark_mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-8 h-8 bg-white border border-gray-300 rounded mr-3"></div>
                      <span className="font-medium">Claro</span>
                    </button>
                    <button
                      onClick={() => setThemeSettings(prev => ({ ...prev, dark_mode: true }))}
                      className={`p-4 border-2 rounded-lg flex items-center ${
                        themeSettings.dark_mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded mr-3"></div>
                      <span className="font-medium">Escuro</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma
                  </label>
                  <select
                    value={themeSettings.language}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="select"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuso Horário
                  </label>
                  <select
                    value={themeSettings.timezone}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="select"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={updateTheme}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Segurança da Conta</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Alterar Senha</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                    <button className="btn-primary">
                      Alterar Senha
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Autenticação de Dois Fatores</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione uma camada extra de segurança à sua conta habilitando a autenticação de dois fatores.
                  </p>
                  <button className="btn-secondary">
                    Configurar 2FA
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sessões Ativas</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Veja onde sua conta está sendo usada e encerre sessões que você não reconhece.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Navegador Atual</p>
                        <p className="text-sm text-gray-600">Windows • Chrome • São Paulo, Brasil</p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Ativo agora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 