import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, Image, Users, CreditCard, Trophy, Target, Heart, LogOut, Bot, Home, Settings, BarChart3, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured, mockData } from '../../lib/supabase';
import { ChatInterface } from '../chat/ChatInterface';
import { FacebookConnection } from '../social/FacebookConnection';

interface CleanupProgress {
  messages: { total: number; cleaned: number };
  photos: { total: number; cleaned: number };
  social: { total: number; cleaned: number };
  financial: { total: number; cleaned: number };
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  achieved_at: string | null;
  achieved: boolean | null;
}

interface CleanupStats {
  total_cleanups: number | null;
  total_items_removed: number | null;
  networks_cleaned: string[] | null;
  time_saved_minutes: number | null;
  recovery_score: number | null;
  last_cleanup_date: string | null;
}

type ActiveView = 'dashboard' | 'social' | 'photos' | 'messages' | 'financial' | 'progress' | 'chat' | 'settings';

export const MainDashboard: React.FC = () => {
  const { user, signOut, isDemo } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [daysSinceBreakup, setDaysSinceBreakup] = useState(0);
  const [cleanupProgress, setCleanupProgress] = useState<CleanupProgress>({
    messages: { total: 127, cleaned: 45 },
    photos: { total: 89, cleaned: 23 },
    social: { total: 43, cleaned: 12 },
    financial: { total: 12, cleaned: 8 }
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cleanupStats, setCleanupStats] = useState<CleanupStats | null>(null);
  const [facebookConnected, setFacebookConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadMilestones();
      loadCleanupStats();
      setRandomMotivationalMessage();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      if (isDemo || !isSupabaseConfigured) {
        // Use mock data in demo mode
        setUserProfile(mockData.profile);
        
        if (mockData.cleanupSession.relationship_end_date) {
          const days = Math.floor(
            (new Date().getTime() - new Date(mockData.cleanupSession.relationship_end_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          setDaysSinceBreakup(Math.max(0, days));
        }

        const itemsFound = mockData.cleanupSession.items_found || 0;
        const itemsProcessed = mockData.cleanupSession.items_processed || 0;

        setCleanupProgress({
          messages: { 
            total: Math.floor(itemsFound * 0.4), 
            cleaned: Math.floor(itemsProcessed * 0.4) 
          },
          photos: { 
            total: Math.floor(itemsFound * 0.3), 
            cleaned: Math.floor(itemsProcessed * 0.3) 
          },
          social: { 
            total: Math.floor(itemsFound * 0.2), 
            cleaned: Math.floor(itemsProcessed * 0.2) 
          },
          financial: { 
            total: Math.floor(itemsFound * 0.1), 
            cleaned: Math.floor(itemsProcessed * 0.1) 
          }
        });
        return;
      }

      // Load user profile
      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setUserProfile(profile);

      // Load latest cleanup session
      const { data: session } = await supabase!
        .from('cleanup_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (session?.relationship_end_date) {
        const days = Math.floor(
          (new Date().getTime() - new Date(session.relationship_end_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        setDaysSinceBreakup(Math.max(0, days));
      }

      // Update cleanup progress based on session data
      if (session) {
        const itemsFound = session.items_found || 0;
        const itemsProcessed = session.items_processed || 0;

        setCleanupProgress({
          messages: { 
            total: Math.floor(itemsFound * 0.4), 
            cleaned: Math.floor(itemsProcessed * 0.4) 
          },
          photos: { 
            total: Math.floor(itemsFound * 0.3), 
            cleaned: Math.floor(itemsProcessed * 0.3) 
          },
          social: { 
            total: Math.floor(itemsFound * 0.2), 
            cleaned: Math.floor(itemsProcessed * 0.2) 
          },
          financial: { 
            total: Math.floor(itemsFound * 0.1), 
            cleaned: Math.floor(itemsProcessed * 0.1) 
          }
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMilestones = async () => {
    try {
      if (isDemo || !isSupabaseConfigured) {
        setMilestones(mockData.milestones);
        return;
      }

      const { data } = await supabase!
        .from('recovery_milestones')
        .select('*')
        .eq('user_id', user?.id)
        .eq('achieved', true)
        .order('achieved_at', { ascending: false })
        .limit(5);

      if (data) {
        setMilestones(data);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const loadCleanupStats = async () => {
    try {
      if (isDemo || !isSupabaseConfigured) {
        setCleanupStats(mockData.cleanupStats);
        return;
      }

      const { data } = await supabase!
        .from('cleanup_stats')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setCleanupStats(data);
      }
    } catch (error) {
      console.error('Error loading cleanup stats:', error);
    }
  };

  const setRandomMotivationalMessage = () => {
    const messages = [
      "Você está mais forte do que imagina 💪",
      "Cada dia é um passo em direção à sua melhor versão ✨",
      "O amor próprio é o melhor investimento 💖",
      "Você merece alguém que te escolha todos os dias 🌟",
      "Sua jornada de crescimento é inspiradora 🚀",
      "Você está se tornando a pessoa que sempre foi destinada a ser 🦋",
      "Cada respiração é um novo começo 🌸"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'social', label: 'Social Media', icon: Users },
    { id: 'photos', label: 'Photo Scanner', icon: Image },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'chat', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const CleanupCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    progress: { total: number; cleaned: number };
    color: 'primary' | 'success' | 'warning' | 'danger';
  }> = ({ title, icon, progress, color }) => (
    <Card className="p-6" hover>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <ProgressBar 
        progress={progress.cleaned} 
        total={progress.total} 
        color={color}
        showPercentage={true}
      />
    </Card>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatInterface />;
      
      case 'social':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media Cleanup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facebook Card */}
              <div>
                <FacebookConnection 
                  onConnectionChange={setFacebookConnected}
                />
              </div>
              
              {/* Instagram Card */}
              <Card className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Instagram</h3>
                  <p className="text-gray-600 mb-4">Remover fotos, stories e unfollows automáticos</p>
                  <Button variant="secondary" className="w-full">
                    Em Breve
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );
      
      case 'photos':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Scanner</h2>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Photo Analysis</h3>
              <p className="text-gray-600 mb-4">Nossa IA irá analisar suas fotos e identificar seu ex-parceiro</p>
              <Button>Iniciar Scan</Button>
            </Card>
          </div>
        );
      
      case 'messages':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Message Cleanup</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Remover conversas e mídias compartilhadas</p>
                <Button>Conectar WhatsApp</Button>
              </Card>
            </div>
          </div>
        );
      
      case 'financial':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Disconnect</h2>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Shared Accounts</h3>
              <p className="text-gray-600 mb-4">Identificar e remover conexões financeiras</p>
              <Button>Analisar Contas</Button>
            </Card>
          </div>
        );
      
      case 'progress':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Tracker</h2>
            {milestones.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Conquistas Recentes</h3>
                </div>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                    >
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-yellow-900" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                        <p className="text-gray-600 text-sm">{milestone.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {milestone.achieved_at && new Date(milestone.achieved_at).toLocaleDateString('pt-BR')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={userProfile?.full_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="p-6 space-y-8">
            {/* Demo Mode Banner */}
            {isDemo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Modo Demonstração</h3>
                    <p className="text-sm text-blue-800">
                      Você está usando dados de demonstração. Configure o Supabase para funcionalidade completa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Facebook Connection Status */}
            {facebookConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Facebook Conectado</h3>
                    <p className="text-sm text-green-800">
                      Sua conta do Facebook foi conectada com sucesso. Acesse "Social Media" para ver os dados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {userProfile?.full_name || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600">Como você está se sentindo hoje?</p>
            </motion.div>

            {/* Days Counter */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                {daysSinceBreakup}
              </h1>
              <p className="text-xl text-gray-600 mb-4">dias seguindo em frente</p>
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-gray-500">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </motion.div>

            {/* Motivational Message */}
            <Card className="p-6 text-center" gradient>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-pink-500" />
                <h2 className="text-lg font-semibold text-gray-900">Mensagem do Dia</h2>
              </div>
              <p className="text-gray-700 italic text-lg">{motivationalMessage}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={setRandomMotivationalMessage}
                className="mt-4"
              >
                Nova mensagem
              </Button>
            </Card>

            {/* Cleanup Stats Summary */}
            {cleanupStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {cleanupStats.total_cleanups || 0}
                  </div>
                  <p className="text-gray-600">Limpezas Realizadas</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {cleanupStats.total_items_removed || 0}
                  </div>
                  <p className="text-gray-600">Itens Removidos</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {cleanupStats.time_saved_minutes || 0}min
                  </div>
                  <p className="text-gray-600">Tempo Economizado</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {cleanupStats.recovery_score || 0}%
                  </div>
                  <p className="text-gray-600">Score de Recuperação</p>
                </Card>
              </div>
            )}

            {/* Cleanup Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CleanupCard
                title="Mensagens"
                icon={<MessageCircle className="w-6 h-6 text-purple-600" />}
                progress={cleanupProgress.messages}
                color="primary"
              />
              <CleanupCard
                title="Fotos & Vídeos"
                icon={<Image className="w-6 h-6 text-green-600" />}
                progress={cleanupProgress.photos}
                color="success"
              />
              <CleanupCard
                title="Redes Sociais"
                icon={<Users className="w-6 h-6 text-blue-600" />}
                progress={cleanupProgress.social}
                color="warning"
              />
              <CleanupCard
                title="Financeiro"
                icon={<CreditCard className="w-6 h-6 text-red-600" />}
                progress={cleanupProgress.financial}
                color="danger"
              />
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="primary" 
                  className="flex items-center justify-center space-x-2 py-4"
                  onClick={() => setActiveView('messages')}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Limpar Mensagens</span>
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex items-center justify-center space-x-2 py-4"
                  onClick={() => setActiveView('photos')}
                >
                  <Image className="w-5 h-5" />
                  <span>Analisar Fotos</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-center space-x-2 py-4"
                  onClick={() => setActiveView('chat')}
                >
                  <Bot className="w-5 h-5" />
                  <span>Conversar com Luna</span>
                </Button>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LoveCleanup AI
              </h1>
              <p className="text-xs text-gray-500">
                {isDemo ? 'Demo Mode' : 'Dashboard'}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id as ActiveView)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'chat' && (
                      <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                        IA
                      </span>
                    )}
                    {item.id === 'social' && facebookConnected && (
                      <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                        ●
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};