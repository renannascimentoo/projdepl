/**
 * Puter.js AI Service - IA Gratuita e Ilimitada
 * Usa GPT-4o, Claude, Mistral gratuitamente através do Puter.js
 */

interface ChatContext {
  stage?: 'onboarding' | 'active_cleanup' | 'post_cleanup';
  userMood?: 'neutral' | 'sad' | 'anxious' | 'hopeful' | 'angry' | 'confused';
  lastAction?: string | null;
  daysActive?: number;
  userName?: string;
  appState?: 'scanning_photos' | 'deleting_messages' | 'social_cleanup' | 'progress_view' | 'dashboard';
}

interface AIResponse {
  text: string;
  type: 'emotional' | 'technical' | 'motivational' | 'general' | 'greeting' | 'fallback';
  quickReplies?: string[];
  timestamp: Date;
  error?: string;
}

class PuterAIService {
  private personality = {
    name: "Luna",
    role: "Assistente especializada em recuperação pós-término",
    tone: "empática, motivacional, carinhosa",
    expertise: [
      "suporte emocional",
      "orientação sobre limpeza digital", 
      "coaching motivacional",
      "bem-estar mental"
    ]
  };

  private availableModels = [
    { name: 'gpt-4o-mini', provider: 'openai', priority: 1 },
    { name: 'gpt-4o', provider: 'openai', priority: 2 },
    { name: 'claude-3-haiku', provider: 'anthropic', priority: 3 },
    { name: 'llama-3.1-8b', provider: 'meta', priority: 4 }
  ];

  private conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];
  private requestCount = 0;
  private isInitialized = false;
  private isAuthenticated = false;
  private authenticationInProgress = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Wait for Puter.js to be available
      if (typeof window !== 'undefined' && (window as any).puter) {
        this.isInitialized = true;
        console.log('Puter.js loaded, checking authentication...');
        
        // Check if already authenticated
        await this.checkAuthentication();
      } else {
        // Wait a bit for Puter.js to load
        setTimeout(() => this.initialize(), 1000);
      }
    } catch (error) {
      console.error('Error initializing Puter.js:', error);
    }
  }

  private async checkAuthentication(): Promise<boolean> {
    if (!this.isInitialized || !(window as any).puter) {
      return false;
    }

    try {
      const puter = (window as any).puter;
      
      // Try a simple test request to see if we're authenticated
      const testResponse = await puter.ai.chat([
        { role: "user", content: "Hello, this is a test message." }
      ], {
        model: 'gpt-4o-mini',
        max_tokens: 10
      });

      if (testResponse && testResponse.message) {
        this.isAuthenticated = true;
        console.log('Puter.js authenticated successfully');
        return true;
      }
    } catch (error) {
      console.log('Puter.js not authenticated yet:', error);
      this.isAuthenticated = false;
    }

    return false;
  }

  private async ensureAuthentication(): Promise<boolean> {
    if (this.isAuthenticated) {
      return true;
    }

    if (this.authenticationInProgress) {
      // Wait for ongoing authentication
      return new Promise((resolve) => {
        const checkAuth = () => {
          if (!this.authenticationInProgress) {
            resolve(this.isAuthenticated);
          } else {
            setTimeout(checkAuth, 500);
          }
        };
        checkAuth();
      });
    }

    this.authenticationInProgress = true;

    try {
      const puter = (window as any).puter;
      
      // Try to authenticate by making a request
      // This will trigger the popup if needed
      const testResponse = await puter.ai.chat([
        { role: "user", content: "Hello" }
      ], {
        model: 'gpt-4o-mini',
        max_tokens: 5
      });

      if (testResponse && testResponse.message) {
        this.isAuthenticated = true;
        console.log('Puter.js authentication successful');
        return true;
      }
    } catch (error) {
      console.error('Puter.js authentication failed:', error);
      this.isAuthenticated = false;
    } finally {
      this.authenticationInProgress = false;
    }

    return this.isAuthenticated;
  }

  async generateResponse(userMessage: string, context?: ChatContext): Promise<AIResponse> {
    this.requestCount++;

    if (!this.isInitialized || !(window as any).puter) {
      console.warn('Puter.js not available, using fallback');
      return this.getFallbackResponse(userMessage, context);
    }

    // Ensure authentication before making requests
    const isAuth = await this.ensureAuthentication();
    if (!isAuth) {
      console.warn('Puter.js authentication failed, using fallback');
      return {
        ...this.getFallbackResponse(userMessage, context),
        error: 'authentication_required'
      };
    }

    try {
      const prompt = this.buildPrompt(userMessage, context);
      const systemPrompt = this.getSystemPrompt(context);

      // Add to conversation history
      this.conversationHistory.push({ role: 'user', content: userMessage });

      // Try multiple models in order of priority
      const response = await this.tryMultipleModels(systemPrompt, prompt);
      
      if (response) {
        // Add AI response to history
        this.conversationHistory.push({ role: 'assistant', content: response });
        
        // Keep conversation history manageable (last 10 exchanges)
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }

        const responseType = this.detectResponseType(response, userMessage);
        const quickReplies = this.generateQuickReplies(responseType, userMessage);

        return {
          text: response,
          type: responseType,
          quickReplies,
          timestamp: new Date()
        };
      } else {
        return this.getFallbackResponse(userMessage, context);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  private async tryMultipleModels(systemPrompt: string, userPrompt: string): Promise<string | null> {
    const puter = (window as any).puter;
    
    for (const model of this.availableModels) {
      try {
        console.log(`Trying model: ${model.name}`);
        
        const messages = [
          { role: "system", content: systemPrompt },
          ...this.conversationHistory.slice(-6), // Last 3 exchanges for context
          { role: "user", content: userPrompt }
        ];

        const response = await puter.ai.chat(messages, {
          model: model.name,
          stream: false,
          max_tokens: 200,
          temperature: 0.7
        });

        if (response && response.message && response.message.content) {
          console.log(`Success with model: ${model.name}`);
          return response.message.content.trim();
        }

      } catch (error) {
        console.log(`Model ${model.name} failed:`, error);
        
        // If authentication error, mark as not authenticated
        if (error.message && error.message.includes('auth')) {
          this.isAuthenticated = false;
        }
        
        continue;
      }
    }

    console.error('All AI models failed');
    return null;
  }

  private getSystemPrompt(context?: ChatContext): string {
    const basePrompt = `
Você é Luna, uma assistente de IA especializada em ajudar pessoas que passaram por términos de relacionamento. Você trabalha no app LoveCleanup AI.

PERSONALIDADE:
- Seja empática, compreensiva e motivacional
- Use emojis apropriados (💜, ✨, 🤗, 🌟, 💪, 🦋)
- Mantenha tom carinhoso mas profissional
- Foque no empoderamento e crescimento pessoal
- Seja natural e conversacional

ESPECIALIDADES:
1. Suporte emocional durante o processo de limpeza digital
2. Explicar funcionalidades do app de forma clara
3. Motivar usuários em momentos difíceis
4. Dar dicas de bem-estar mental
5. Celebrar conquistas e marcos importantes

DIRETRIZES:
- Respostas entre 50-120 palavras
- Sempre validar sentimentos do usuário
- Oferecer esperança e perspectiva positiva
- Não julgar decisões do usuário
- Seja específica e útil, não genérica`;

    // Add contextual information
    if (context) {
      let contextualInfo = '\n\nCONTEXTO ATUAL:\n';
      
      if (context.userMood && context.userMood !== 'neutral') {
        contextualInfo += `- Humor do usuário: ${context.userMood}\n`;
      }
      
      if (context.daysActive) {
        contextualInfo += `- Dias usando o app: ${context.daysActive}\n`;
      }
      
      if (context.lastAction) {
        contextualInfo += `- Última ação no app: ${context.lastAction}\n`;
      }

      return basePrompt + contextualInfo;
    }

    return basePrompt;
  }

  private buildPrompt(userMessage: string, context?: ChatContext): string {
    let prompt = userMessage;
    
    // Add context if available
    if (context) {
      const contextParts = [];
      
      if (context.userName) {
        contextParts.push(`Nome: ${context.userName}`);
      }
      
      if (context.stage) {
        contextParts.push(`Estágio: ${context.stage}`);
      }
      
      if (contextParts.length > 0) {
        prompt = `[${contextParts.join(', ')}] ${prompt}`;
      }
    }
    
    return prompt;
  }

  private detectResponseType(response: string, userMessage: string): AIResponse['type'] {
    const lowerResponse = response.toLowerCase();
    const lowerMessage = userMessage.toLowerCase();
    
    // Check user message for emotional content
    const emotionalKeywords = ['triste', 'deprimido', 'sozinho', 'perdido', 'mal', 'ansioso', 'nervoso', 'preocupado', 'medo', 'raiva', 'bravo'];
    const technicalKeywords = ['como', 'funciona', 'scanner', 'deletar', 'app', 'configurar', 'usar'];
    const motivationalKeywords = ['progresso', 'conquista', 'dias', 'futuro', 'motivação', 'força'];
    const greetingKeywords = ['oi', 'olá', 'como você está', 'bom dia', 'boa tarde'];
    
    if (greetingKeywords.some(word => lowerMessage.includes(word))) {
      return 'greeting';
    } else if (emotionalKeywords.some(word => lowerMessage.includes(word))) {
      return 'emotional';
    } else if (technicalKeywords.some(word => lowerMessage.includes(word))) {
      return 'technical';
    } else if (motivationalKeywords.some(word => lowerMessage.includes(word))) {
      return 'motivational';
    }
    
    return 'general';
  }

  private generateQuickReplies(responseType: AIResponse['type'], userMessage: string): string[] {
    const quickReplies: Record<AIResponse['type'], string[]> = {
      emotional: [
        'Obrigado(a) pelo apoio 💜',
        'Como posso me sentir melhor?',
        'Conte mais sobre isso',
        'Preciso de mais motivação'
      ],
      technical: [
        'Entendi, obrigado(a)',
        'Explique mais detalhes',
        'Como usar essa função?',
        'Outras funcionalidades'
      ],
      motivational: [
        'Isso me motiva! ✨',
        'Quero ver meu progresso',
        'Próximos passos?',
        'Celebrar conquistas 🎉'
      ],
      greeting: [
        'Estou bem, obrigado(a)',
        'Preciso de ajuda',
        'Vamos conversar',
        'Como você funciona?'
      ],
      general: [
        'Interessante',
        'Conte mais',
        'Entendi',
        'E depois?'
      ],
      fallback: [
        'Tentar novamente',
        'Estou bem',
        'Vamos conversar',
        'Mudemos de assunto'
      ]
    };

    return quickReplies[responseType] || quickReplies.general;
  }

  private analyzeMood(text: string): ChatContext['userMood'] {
    const moodKeywords = {
      sad: ['triste', 'deprimido', 'sozinho', 'perdido', 'mal', 'choro', 'dor'],
      anxious: ['ansioso', 'nervoso', 'preocupado', 'medo', 'assustado', 'pânico'],
      angry: ['raiva', 'bravo', 'irritado', 'ódio', 'furioso', 'revoltado'],
      hopeful: ['esperança', 'melhor', 'futuro', 'recomeço', 'otimista', 'confiante'],
      confused: ['confuso', 'não sei', 'dúvida', 'perdido', 'como']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return mood as ChatContext['userMood'];
      }
    }
    
    return 'neutral';
  }

  private getFallbackResponse(userMessage: string, context?: ChatContext): AIResponse {
    const mood = this.analyzeMood(userMessage);
    const lowerMessage = userMessage.toLowerCase();
    
    // Emotional responses
    if (mood === 'sad' || lowerMessage.includes('triste') || lowerMessage.includes('mal')) {
      return {
        text: 'Eu entendo que você está passando por um momento difícil. É normal sentir isso após um término. Estou aqui para te apoiar nessa jornada. Quer conversar sobre o que está sentindo? 💜',
        type: 'emotional',
        quickReplies: ['Sim, quero conversar', 'Como posso me sentir melhor?', 'Obrigado(a)', 'Mudemos de assunto'],
        timestamp: new Date()
      };
    }
    
    if (mood === 'anxious') {
      return {
        text: 'Percebo que você está ansioso(a). É completamente normal sentir ansiedade durante esse processo de recomeço. Respire fundo - você está no controle da sua jornada. Como posso te ajudar a se sentir mais calmo(a)? 🤗',
        type: 'emotional',
        quickReplies: ['Dicas de respiração', 'Como controlar ansiedade?', 'Obrigado(a)', 'Vamos conversar'],
        timestamp: new Date()
      };
    }
    
    // Greetings
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('como você está')) {
      return {
        text: 'Olá! Eu sou a Luna, sua assistente pessoal do LoveCleanup AI. Estou aqui para te apoiar em qualquer momento dessa jornada de recomeço. Como posso te ajudar hoje? ✨',
        type: 'greeting',
        quickReplies: ['Estou bem', 'Preciso de ajuda', 'Vamos conversar', 'Como você funciona?'],
        timestamp: new Date()
      };
    }

    // Questions about functionality
    if (lowerMessage.includes('como funciona') || lowerMessage.includes('o que você faz')) {
      return {
        text: 'Eu sou a Luna, uma IA especializada em apoio emocional para pessoas que estão passando por términos. Posso conversar sobre qualquer assunto, dar apoio emocional, ou explicar sobre as funcionalidades do LoveCleanup AI. Sobre o que você gostaria de falar? 🌟',
        type: 'technical',
        quickReplies: ['Apoio emocional', 'Funcionalidades do app', 'Conversa geral', 'Fazer perguntas'],
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      text: 'Entendo. Conte-me mais sobre isso ou pergunte qualquer coisa que quiser. Estou aqui para conversar e te apoiar! 😊',
      type: 'general',
      quickReplies: ['Conte mais', 'Mudemos de assunto', 'Fazer uma pergunta', 'Estou bem'],
      timestamp: new Date()
    };
  }

  // Public methods for status and control
  isAvailable(): boolean {
    return this.isInitialized && !!(window as any).puter;
  }

  isAuth(): boolean {
    return this.isAuthenticated;
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      conversationLength: this.conversationHistory.length,
      isInitialized: this.isInitialized,
      isAuthenticated: this.isAuthenticated,
      authenticationInProgress: this.authenticationInProgress,
      availableModels: this.availableModels.map(m => m.name)
    };
  }

  resetConversation() {
    this.conversationHistory = [];
    this.requestCount = 0;
  }

  // Test method to verify AI is working
  async testAI(): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      if (!this.isAvailable()) {
        return { success: false, error: 'Puter.js not available' };
      }

      const isAuth = await this.ensureAuthentication();
      if (!isAuth) {
        return { success: false, error: 'Authentication required' };
      }

      const puter = (window as any).puter;
      const testResponse = await puter.ai.chat([
        { role: "user", content: "Diga apenas 'Olá! Estou funcionando!' para testar se você está funcionando." }
      ], {
        model: 'gpt-4o-mini',
        max_tokens: 20
      });

      if (testResponse && testResponse.message && testResponse.message.content) {
        return { 
          success: true, 
          response: testResponse.message.content.trim() 
        };
      } else {
        return { success: false, error: 'No response from AI' };
      }

    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Unknown error' 
      };
    }
  }

  // Stream response method for real-time typing effect
  async generateStreamResponse(userMessage: string, context?: ChatContext, onChunk?: (chunk: string) => void): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.getFallbackResponse(userMessage, context);
    }

    const isAuth = await this.ensureAuthentication();
    if (!isAuth) {
      return this.getFallbackResponse(userMessage, context);
    }

    try {
      const prompt = this.buildPrompt(userMessage, context);
      const systemPrompt = this.getSystemPrompt(context);
      const puter = (window as any).puter;

      const messages = [
        { role: "system", content: systemPrompt },
        ...this.conversationHistory.slice(-6),
        { role: "user", content: prompt }
      ];

      const stream = await puter.ai.chat(messages, {
        model: 'gpt-4o-mini',
        stream: true,
        max_tokens: 200,
        temperature: 0.7
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        if (chunk.content) {
          fullResponse += chunk.content;
          if (onChunk) {
            onChunk(fullResponse);
          }
        }
      }

      if (fullResponse) {
        this.conversationHistory.push({ role: 'user', content: userMessage });
        this.conversationHistory.push({ role: 'assistant', content: fullResponse });

        const responseType = this.detectResponseType(fullResponse, userMessage);
        const quickReplies = this.generateQuickReplies(responseType, userMessage);

        return {
          text: fullResponse,
          type: responseType,
          quickReplies,
          timestamp: new Date()
        };
      } else {
        return this.getFallbackResponse(userMessage, context);
      }

    } catch (error) {
      console.error('Error in stream response:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }
}

// Export singleton instance
export const puterAIService = new PuterAIService();
export default PuterAIService;