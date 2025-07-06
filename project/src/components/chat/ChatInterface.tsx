import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Sparkles, MessageCircle, Bot, AlertCircle, Settings, RefreshCw, Zap, TestTube, CheckCircle, XCircle, Brain, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SetupGuide } from '../ui/SetupGuide';
import { useAuth } from '../../contexts/AuthContext';
import { freeAIService } from '../../services/FreeAIService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  type?: 'greeting' | 'emotional' | 'technical' | 'motivational' | 'general' | 'fallback';
  quickReplies?: string[];
  error?: string;
  isStreaming?: boolean;
}

interface ChatContext {
  stage: 'onboarding' | 'active_cleanup' | 'post_cleanup';
  userMood: 'neutral' | 'sad' | 'anxious' | 'hopeful' | 'angry';
  lastAction: string | null;
  daysActive: number;
  userName?: string;
  appState?: 'scanning_photos' | 'deleting_messages' | 'social_cleanup' | 'progress_view' | 'dashboard';
}

const quickActions = [
  { text: "Como você está?", type: "emotional" },
  { text: "Preciso de motivação", type: "motivational" },
  { text: "Explicar funcionalidades", type: "technical" },
  { text: "Vamos conversar", type: "general" },
  { text: "Dicas de bem-estar", type: "emotional" }
];

export const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Olá! Eu sou a Luna, sua assistente pessoal do LoveCleanup AI. 💜 Agora estou funcionando com IA super inteligente e completamente gratuita, sem necessidade de tokens ou autenticação! Posso conversar sobre qualquer coisa - apoio emocional, funcionalidades do app, ou simplesmente bater papo. Como posso te ajudar hoje? ✨',
      timestamp: new Date(),
      type: 'greeting',
      quickReplies: ["Estou bem", "Preciso de ajuda", "Vamos conversar", "Como você funciona?"]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; response?: string; error?: string } | null>(null);
  const [chatContext, setChatContext] = useState<ChatContext>({
    stage: 'onboarding',
    userMood: 'neutral',
    lastAction: null,
    daysActive: 0,
    userName: user?.user_metadata?.full_name || 'Usuário',
    appState: 'dashboard'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const testAI = async () => {
    setTestResult(null);
    try {
      const result = await freeAIService.testAI();
      setTestResult(result);
      
      if (result.success) {
        // Add test result as a message
        const testMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: `✅ Teste de IA bem-sucedido! ${result.response}`,
          timestamp: new Date(),
          type: 'technical'
        };
        setMessages(prev => [...prev, testMessage]);
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  const sendStreamMessage = async (text: string, isQuickReply: boolean = false) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (!isQuickReply) {
      setInputMessage('');
    }

    // Add streaming message placeholder
    const streamingMessageId = (Date.now() + 1).toString();
    const streamingMessage: Message = {
      id: streamingMessageId,
      sender: 'ai',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, streamingMessage]);

    try {
      // Generate streaming AI response
      const aiResponse = await freeAIService.generateStreamResponse(
        text, 
        chatContext,
        (chunk) => {
          // Update streaming message in real-time
          setMessages(prev => prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...msg, text: chunk }
              : msg
          ));
        }
      );
      
      // Final update with complete response
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? {
              ...msg,
              text: aiResponse.text,
              type: aiResponse.type,
              quickReplies: aiResponse.quickReplies,
              isStreaming: false
            }
          : msg
      ));
      
    } catch (error) {
      console.error('Error generating streaming AI response:', error);
      
      // Update with error message
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? {
              ...msg,
              text: 'Desculpe, tive um problema técnico. Pode tentar novamente? 💙',
              quickReplies: ['Tentar novamente', 'Estou bem', 'Vamos conversar'],
              isStreaming: false
            }
          : msg
      ));
    }
  };

  const handleQuickReply = (reply: string) => {
    sendStreamMessage(reply, true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendStreamMessage(inputMessage);
  };

  const handleResetConversation = () => {
    freeAIService.resetConversation();
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Conversa reiniciada! Olá novamente! 💜 Estou aqui com IA super inteligente e gratuita para conversar sobre qualquer coisa que você quiser. Como posso te ajudar? 😊✨',
        timestamp: new Date(),
        type: 'greeting',
        quickReplies: ["Vamos conversar", "Preciso de ajuda", "Como você funciona?", "Estou bem"]
      }
    ]);
  };

  const getStatusInfo = () => {
    const stats = freeAIService.getStats();
    
    return {
      status: 'IA Super Inteligente Ativa',
      color: 'bg-green-100 text-green-800',
      description: `Sistema híbrido sem limitações • ${stats.requestCount} mensagens`
    };
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 p-4"
    >
      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-purple-600" />
      </div>
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">Luna está pensando</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isAI = message.sender === 'ai';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex ${isAI ? 'flex-row' : 'flex-row-reverse'} items-end space-x-2 max-w-xs lg:max-w-md`}>
          {isAI && (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div className="flex flex-col">
            <div className={`px-4 py-3 rounded-2xl ${
              isAI 
                ? 'bg-gray-100 text-gray-800 rounded-bl-sm' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
            }`}>
              {isAI && (
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-xs font-medium text-purple-600">Luna</span>
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-500">IA Super Inteligente</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                </div>
              )}
              <p className="text-sm leading-relaxed">
                {message.text}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                )}
              </p>
            </div>
            
            <span className={`text-xs text-gray-500 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>
              {message.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>

            {/* Quick Replies */}
            {isAI && message.quickReplies && !message.isStreaming && (
              <div className="flex flex-wrap gap-2 mt-3">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1 text-xs bg-white border border-purple-200 text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const statusInfo = getStatusInfo();
  const stats = freeAIService.getStats();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Luna - IA Super Inteligente</h2>
            <p className="text-sm text-gray-500">{statusInfo.description}</p>
            <p className="text-xs text-gray-400">
              🚀 APIs gratuitas + Sistema inteligente avançado • Sem tokens, sem limitações
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={testAI}
              className="flex items-center space-x-1"
            >
              <TestTube className="w-4 h-4" />
              <span>Testar IA</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetConversation}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reiniciar</span>
            </Button>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
          </div>
        </div>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div className={`border-b p-3 ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`flex items-center space-x-2 ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="text-sm">
              {testResult.success 
                ? '✅ IA funcionando perfeitamente!' 
                : `❌ Erro: ${testResult.error}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Success Banner */}
      <div className="bg-green-50 border-b border-green-200 p-3">
        <div className="flex items-center space-x-2 text-green-800">
          <Brain className="w-4 h-4" />
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm">
            🎉 IA Super Inteligente Ativa! Sistema híbrido com múltiplas APIs gratuitas + fallback inteligentíssimo
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => sendStreamMessage(action.text, true)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Converse com a Luna sobre qualquer coisa..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-3 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar</span>
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          🚀 IA Super Inteligente • {stats.requestCount} mensagens • Totalmente gratuita, sem tokens, sem limitações!
        </div>
      </div>

      {/* Setup Guide Modal */}
      <SetupGuide 
        isOpen={showSetupGuide} 
        onClose={() => setShowSetupGuide(false)}
      />
    </div>
  );
};