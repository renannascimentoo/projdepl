import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  MessageCircle, 
  Image, 
  Users, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Menu, 
  X,
  AlertTriangle,
  Lock,
  Zap,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "Identificação Inteligente",
      description: "IA avançada com reconhecimento facial e detecção de padrões para encontrar todas as memórias do seu ex.",
      details: ["Reconhecimento facial em fotos", "Detecção de nomes em conversas", "Análise de padrões de comunicação"]
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Limpeza Total de Mensagens",
      description: "Remove completamente conversas de WhatsApp, Instagram, Facebook, Twitter e mais.",
      details: ["WhatsApp, Instagram, Facebook", "Snapchat, Discord, Telegram", "Histórico completo deletado"]
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Social Media Cleanup",
      description: "Unfollow automático, remoção de marcações e exclusão de posts compartilhados.",
      details: ["Unfollow/Block automático", "Remove marcações em fotos", "Deleta posts compartilhados"]
    },
    {
      icon: <Image className="w-8 h-8 text-pink-600" />,
      title: "Apagador de Fotos/Vídeos",
      description: "IA detecta seu ex em todas as mídias com opção de deletar ou arquivar.",
      details: ["IA detecta o ex em mídias", "Opção: deletar ou arquivar", "Sincroniza com nuvem"]
    },
    {
      icon: <CreditCard className="w-8 h-8 text-red-600" />,
      title: "Desconexão Financeira",
      description: "Identifica e remove conexões financeiras, assinaturas e contas compartilhadas.",
      details: ["Transações compartilhadas", "Remove acesso a contas", "Cancela assinaturas"]
    },
    {
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      title: "Tracker de Progresso",
      description: "Acompanhe sua jornada com contador de dias, conquistas e recursos de bem-estar.",
      details: ["Contador de dias livre", "Conquistas motivacionais", "Recursos de bem-estar"]
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload de foto do ex",
      description: "Envie 2-5 fotos claras para nossa IA identificar",
      icon: <Image className="w-6 h-6" />
    },
    {
      number: "02", 
      title: "Conecte suas contas",
      description: "Autorize acesso às suas redes sociais e dispositivos",
      icon: <Users className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Confirme a limpeza",
      description: "Revise o que será deletado e confirme a ação",
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Siga em frente!",
      description: "Receba relatório completo e comece sua nova vida",
      icon: <Heart className="w-6 h-6" />
    }
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      age: 28,
      text: "Em 1 hora, 5 anos de memórias foram apagadas. Libertador! Finalmente consegui seguir em frente sem gatilhos constantes.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Carlos Mendes",
      age: 32,
      text: "Não sabia que ainda tinha 2000+ fotos dele no meu celular. Agora posso recomeçar de verdade sem medo de encontrar lembranças.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Maria Santos",
      age: 24,
      text: "O app encontrou conversas que eu nem lembrava que existiam. Finalmente estou livre de todas as memórias digitais!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  const faqs = [
    {
      question: "É realmente permanente?",
      answer: "Sim, todas as ações são irreversíveis. Uma vez deletado, não há como recuperar. Por isso temos múltiplas confirmações antes de executar qualquer ação."
    },
    {
      question: "Meus dados ficam seguros?",
      answer: "Absolutamente. Usamos criptografia de ponta a ponta e não armazenamos suas informações pessoais. Todos os dados são processados localmente e deletados após o uso."
    },
    {
      question: "Funciona em todas as redes sociais?",
      answer: "Sim, suportamos WhatsApp, Instagram, Facebook, Twitter, Snapchat, Discord, Telegram e mais. Estamos sempre adicionando novas plataformas."
    },
    {
      question: "E se eu me arrepender?",
      answer: "Por isso temos um processo de confirmação rigoroso. Recomendamos reflexão antes de usar. Também oferecemos opção de arquivar ao invés de deletar."
    },
    {
      question: "Quanto tempo demora?",
      answer: "Depende da quantidade de dados. Geralmente entre 30 minutos a 2 horas. Você recebe atualizações em tempo real do progresso."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LoveCleanup AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Funcionalidades</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">Como Funciona</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Preços</a>
              <a href="#faq" className="text-gray-600 hover:text-purple-600 transition-colors">FAQ</a>
              <Button onClick={onGetStarted} size="sm">
                Começar Agora
              </Button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600">Funcionalidades</a>
              <a href="#how-it-works" className="block text-gray-600">Como Funciona</a>
              <a href="#pricing" className="block text-gray-600">Preços</a>
              <a href="#faq" className="block text-gray-600">FAQ</a>
              <Button onClick={onGetStarted} className="w-full">
                Começar Agora
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recomeçar
                </span>{" "}
                Nunca Foi Tão Fácil
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                A IA que remove seu ex de todas as plataformas digitais.{" "}
                <span className="font-semibold text-gray-900">Permanentemente. Sem volta.</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="text-lg px-8 py-4"
              >
                Começar Limpeza Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4"
              >
                Ver Como Funciona
              </Button>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2,847</div>
                    <div className="text-sm text-gray-600">Fotos Deletadas</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                    <div className="text-sm text-gray-600">Mensagens Removidas</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">15</div>
                    <div className="text-sm text-gray-600">Redes Limpas</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">47min</div>
                    <div className="text-sm text-gray-600">Tempo Total</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tecnologia Que Realmente Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa IA avançada encontra e remove todas as memórias digitais do seu ex, 
              permitindo que você siga em frente sem gatilhos emocionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full" hover>
                  <div className="mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Processo simples e seguro em 4 passos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-purple-600">
                    <span className="text-sm font-bold text-purple-600">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 border-2 border-red-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-4">
                  ⚠️ Todas as ações são PERMANENTES e IRREVERSÍVEIS
                </h3>
                <div className="space-y-3 text-red-800">
                  <p>• Recomendamos reflexão cuidadosa antes de usar</p>
                  <p>• Não há possibilidade de recuperação após a exclusão</p>
                  <p>• Recursos de apoio emocional estão disponíveis</p>
                  <p>• Considere fazer backup de itens importantes antes de prosseguir</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button variant="secondary" className="flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Recursos de Apoio
                  </Button>
                  <Button variant="ghost" className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Falar com Especialista
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Histórias de Recomeço
            </h2>
            <p className="text-xl text-gray-600">
              Pessoas reais que encontraram a liberdade digital
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.age} anos
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha Seu Plano
            </h2>
            <p className="text-xl text-gray-600">
              Comece gratuitamente ou tenha acesso completo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">R$ 0</div>
                <p className="text-gray-600">Para experimentar o poder da IA</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>100 fotos analisadas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>1 rede social</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Limpeza básica de contatos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Relatório básico</span>
                </li>
              </ul>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={onGetStarted}
              >
                Começar Grátis
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 border-2 border-purple-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  R$ 29<span className="text-lg text-gray-600">,90</span>
                </div>
                <p className="text-gray-600">Limpeza completa e definitiva</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Fotos ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Todas as redes sociais</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>IA avançada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Limpeza financeira</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Relatório detalhado</span>
                </li>
              </ul>
              <Button 
                className="w-full"
                onClick={onGetStarted}
              >
                Experimentar Premium - 7 dias grátis
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Badges */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">🔒 Criptografia de Ponta a Ponta</h3>
              <p className="text-gray-600">Seus dados são protegidos com a mesma tecnologia dos bancos</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">🛡️ Dados Não Armazenados</h3>
              <p className="text-gray-600">Processamento local, nenhuma informação fica em nossos servidores</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Compliance LGPD</h3>
              <p className="text-gray-600">Totalmente em conformidade com as leis de proteção de dados</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa saber sobre o LoveCleanup AI
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Support */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Este momento é difícil, mas você não está sozinho(a)
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Oferecemos recursos de apoio emocional e parceria com psicólogos especializados 
            em relacionamentos para ajudar você nesta jornada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Recursos de Bem-Estar
            </Button>
            <Button variant="ghost" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Recomeçar?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Junte-se a milhares de pessoas que já encontraram a liberdade digital
          </p>
          <Button 
            variant="secondary"
            size="lg"
            className="text-lg px-8 py-4"
            onClick={onGetStarted}
          >
            Começar Nova Vida Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">LoveCleanup AI</span>
              </div>
              <p className="text-gray-400">
                Tecnologia que liberta. Recomeços que transformam.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Apoio Emocional</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>Made with 💜 for new beginnings © 2024 LoveCleanup AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};