import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Copy, Check, ExternalLink, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  quotaExceeded?: boolean;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ isOpen, onClose, quotaExceeded = false }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const envExample = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# App Configuration
VITE_APP_NAME=LoveCleanup AI
VITE_APP_VERSION=1.0.0`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              quotaExceeded 
                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              {quotaExceeded ? <CreditCard className="w-5 h-5 text-white" /> : <Key className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {quotaExceeded ? 'Resolver Cota da OpenAI' : 'Configurar OpenAI API'}
              </h2>
              <p className="text-gray-600">
                {quotaExceeded ? 'Sua cota foi excedida' : 'Ative a IA completa da Luna'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quota Exceeded Warning */}
            {quotaExceeded && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">Cota da OpenAI Excedida</h3>
                    <p className="text-sm text-red-800 mt-1">
                      Você excedeu o limite de uso da sua conta OpenAI. Para continuar usando a IA completa, você precisa:
                    </p>
                    <ul className="text-sm text-red-800 mt-2 space-y-1">
                      <li>• Verificar seu plano atual na OpenAI</li>
                      <li>• Adicionar um método de pagamento</li>
                      <li>• Aguardar o reset da cota (se aplicável)</li>
                      <li>• Considerar fazer upgrade do plano</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* General Warning */}
            {!quotaExceeded && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-900">Importante</h3>
                    <p className="text-sm text-orange-800 mt-1">
                      Esta é uma demonstração. Em produção, a chave da API deve ficar no backend por segurança.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 - Check Usage/Get API Key */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {quotaExceeded ? '1. Verificar Uso e Faturamento' : '1. Obter Chave da OpenAI'}
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600">
                  {quotaExceeded 
                    ? 'Acesse sua conta OpenAI para verificar o uso atual e resolver problemas de cota:'
                    : 'Acesse a plataforma da OpenAI e crie uma chave de API:'
                  }
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {quotaExceeded ? (
                    <>
                      <Button
                        variant="secondary"
                        className="flex items-center space-x-2"
                        onClick={() => window.open('https://platform.openai.com/usage', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ver Uso da API</span>
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex items-center space-x-2"
                        onClick={() => window.open('https://platform.openai.com/account/billing', '_blank')}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Faturamento</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      className="flex items-center space-x-2"
                      onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir OpenAI Platform</span>
                    </Button>
                  )}
                </div>

                {quotaExceeded ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Soluções Comuns:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Conta gratuita:</strong> Aguarde o reset mensal da cota</li>
                      <li>• <strong>Sem método de pagamento:</strong> Adicione um cartão de crédito</li>
                      <li>• <strong>Limite atingido:</strong> Considere fazer upgrade para um plano pago</li>
                      <li>• <strong>Chave inválida:</strong> Gere uma nova chave de API</li>
                    </ul>
                  </div>
                ) : (
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Faça login ou crie uma conta</li>
                    <li>• Vá em "API Keys" no menu</li>
                    <li>• Clique em "Create new secret key"</li>
                    <li>• Copie a chave gerada (começa com "sk-")</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Step 2 - Configure .env (only if not quota exceeded) */}
            {!quotaExceeded && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Configurar Arquivo .env</h3>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Crie ou edite o arquivo <code className="bg-gray-100 px-2 py-1 rounded">.env</code> na raiz do projeto:
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {envExample}
                    </pre>
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Dica:</strong> Substitua "sk-your-openai-api-key-here" pela sua chave real da OpenAI.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Restart Application */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {quotaExceeded ? '2. Após Resolver a Cota' : '3. Reiniciar Aplicação'}
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600">
                  {quotaExceeded 
                    ? 'Depois de resolver os problemas de cota, clique em "Tentar Novamente" no chat:'
                    : 'Após configurar a chave, reinicie o servidor de desenvolvimento:'
                  }
                </p>
                {!quotaExceeded && (
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg">
                    <code>npm run dev</code>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  A Luna {quotaExceeded ? 'voltará a usar' : 'agora usará'} a IA real da OpenAI para conversas mais inteligentes!
                </p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recursos da IA Completa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Conversas contextuais</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Análise emocional</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Respostas personalizadas</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Suporte empático</span>
                </div>
              </div>
            </div>

            {/* Pricing Info for Quota Issues */}
            {quotaExceeded && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Informações de Preço da OpenAI</h4>
                <p className="text-sm text-gray-600 mb-2">
                  A OpenAI oferece diferentes planos. Contas gratuitas têm limites mensais.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open('https://openai.com/pricing', '_blank')}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Ver Preços</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={onClose}>
              Entendi
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};