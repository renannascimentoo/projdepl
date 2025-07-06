import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, User, Image, MessageCircle, Users, Calendar, RefreshCw, Unlink, CheckCircle, AlertCircle, Loader, Heart, Eye, ThumbsUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { facebookService } from '../../services/FacebookService';

interface FacebookConnectionProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export const FacebookConnection: React.FC<FacebookConnectionProps> = ({ onConnectionChange }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState(facebookService.getConnectionStatus());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial connection status
    const status = facebookService.getConnectionStatus();
    setConnection(status);
    onConnectionChange?.(status.isConnected);
  }, [onConnectionChange]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await facebookService.connectToFacebook();
      
      if (result.success) {
        const newStatus = facebookService.getConnectionStatus();
        setConnection(newStatus);
        onConnectionChange?.(true);
      } else {
        setError(result.error || 'Erro ao conectar com Facebook');
      }
    } catch (error) {
      console.error('Error connecting to Facebook:', error);
      setError('Erro inesperado ao conectar com Facebook');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      await facebookService.disconnectFromFacebook();
      const newStatus = facebookService.getConnectionStatus();
      setConnection(newStatus);
      onConnectionChange?.(false);
    } catch (error) {
      console.error('Error disconnecting from Facebook:', error);
      setError('Erro ao desconectar do Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await facebookService.refreshData();
      const newStatus = facebookService.getConnectionStatus();
      setConnection(newStatus);
    } catch (error) {
      console.error('Error refreshing Facebook data:', error);
      setError('Erro ao atualizar dados do Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connection.isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Facebook className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Conectar ao Facebook
          </h3>
          
          <p className="text-gray-600 mb-6">
            Conecte sua conta do Facebook para analisar e limpar posts, fotos e conexões relacionadas ao seu ex.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Posts e fotos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Lista de amigos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Páginas gerenciadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Análise de conteúdo</span>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              loading={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Facebook className="w-5 h-5 mr-2" />
              {isConnecting ? 'Conectando...' : 'Conectar Facebook'}
            </Button>
            
            <p className="text-xs text-gray-500">
              App ID: 719329824130109 • Dados processados localmente
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={connection.user?.picture?.data?.url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={connection.user?.name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {connection.user?.name || 'Usuário Facebook'}
              </h3>
              <p className="text-gray-600">
                {connection.user?.email || 'Email não disponível'}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Conectado em {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              <Unlink className="w-4 h-4 mr-1" />
              Desconectar
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              {connection.stats.totalPosts}
            </div>
            <div className="text-sm text-blue-700">Posts</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <Image className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {connection.stats.totalPhotos}
            </div>
            <div className="text-sm text-green-700">Fotos</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {connection.stats.totalFriends}
            </div>
            <div className="text-sm text-purple-700">Amigos</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
            <User className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">
              {connection.stats.totalPages}
            </div>
            <div className="text-sm text-orange-700">Páginas</div>
          </div>
        </div>
      </Card>

      {/* Recent Posts */}
      {connection.posts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Posts Recentes ({connection.posts.length})
            </h4>
            <span className="text-sm text-gray-500">
              Últimos {Math.min(connection.posts.length, 10)} posts
            </span>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {connection.posts.slice(0, 10).map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 line-clamp-3">
                      {post.message || post.story || 'Post sem texto'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_time).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {post.type}
                      </span>
                      {post.attachments && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Com mídia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Photos */}
      {connection.photos.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Image className="w-5 h-5 mr-2 text-green-600" />
              Fotos Recentes ({connection.photos.length})
            </h4>
            <span className="text-sm text-gray-500">
              Últimas {Math.min(connection.photos.length, 12)} fotos
            </span>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {connection.photos.slice(0, 12).map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-lg overflow-hidden bg-gray-200 group cursor-pointer"
              >
                <img
                  src={photo.source}
                  alt={photo.name || 'Facebook photo'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=200';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Connection Info */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        {connection.lastSync && (
          <p>
            Última sincronização: {new Date(connection.lastSync).toLocaleString('pt-BR')}
          </p>
        )}
        <p className="flex items-center justify-center space-x-2">
          <Facebook className="w-4 h-4 text-blue-600" />
          <span>App ID: 719329824130109</span>
          <span>•</span>
          <span>Dados seguros e privados</span>
        </p>
      </div>
    </div>
  );
};