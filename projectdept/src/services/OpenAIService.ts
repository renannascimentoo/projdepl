/**
 * OpenAI Service - Integração com o Assistente Luna específico
 * Usa o assistente asst_L9ifj9xsGR5RCMl2IMhGuLEN criado na OpenAI
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Thread {
  id: string;
  object: string;
  created_at: number;
  metadata: Record<string, any>;
}

interface Message {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: {
      value: string;
      annotations: any[];
    };
  }>;
}

interface Run {
  id: string;
  object: string;
  created_at: number;
  assistant_id: string;
  thread_id: string;
  status: 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';
  started_at?: number;
  expires_at?: number;
  cancelled_at?: number;
  failed_at?: number;
  completed_at?: number;
  last_error?: {
    code: string;
    message: string;
  };
  model: string;
  instructions?: string;
  tools: any[];
  file_ids: string[];
  metadata: Record<string, any>;
}

interface ChatContext {
  stage?: 'onboarding' | 'active_cleanup' | 'post_cleanup';
  userMood?: 'neutral' | 'sad' | 'anxious' | 'hopeful' | 'angry';
  lastAction?: string | null;
  daysActive?: number;
  userName?: string;
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  private assistantId = 'asst_L9ifj9xsGR5RCMl2IMhGuLEN'; // ID do assistente Luna
  private threadId: string | null = null;
  private isQuotaExceeded = false;
  private isInvalidKey = false;
  private requestCount = 0;
  private maxRequestsPerSession = 50; // Limite para proteger a cota

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured');
      return;
    }

    // Create a new thread for this conversation session
    this.createThread();
  }

  private async createThread(): Promise<void> {
    if (!this.apiKey) return;

    try {
      const response = await fetch(`${this.baseURL}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          metadata: {
            session_start: new Date().toISOString(),
            app: 'LoveCleanup AI'
          }
        })
      });

      if (response.ok) {
        const thread: Thread = await response.json();
        this.threadId = thread.id;
        console.log('Thread criada:', this.threadId);
      } else {
        console.error('Erro ao criar thread:', response.status);
        await this.handleAPIError(response);
      }
    } catch (error) {
      console.error('Erro ao criar thread:', error);
    }
  }

  async generateResponse(userMessage: string, context?: ChatContext): Promise<{
    text: string;
    quickReplies?: string[];
    error?: string;
  }> {
    // Check request limit to protect quota
    if (this.requestCount >= this.maxRequestsPerSession) {
      return {
        text: 'Atingimos o limite de conversas para proteger a cota da OpenAI. Que tal reiniciar nossa conversa? 😊',
        quickReplies: ['Reiniciar conversa', 'Entendi', 'Continuar em modo demo'],
        error: 'session_limit'
      };
    }

    // Check if API is available
    if (!this.apiKey || this.isInvalidKey) {
      return this.getFallbackResponse(userMessage, context);
    }

    if (this.isQuotaExceeded) {
      return {
        text: 'A cota da OpenAI foi excedida. Estou funcionando em modo demonstração por enquanto. 💜',
        quickReplies: ['Entendi', 'Como resolver?', 'Continuar assim'],
        error: 'quota_exceeded'
      };
    }

    if (!this.threadId) {
      await this.createThread();
      if (!this.threadId) {
        return this.getFallbackResponse(userMessage, context);
      }
    }

    try {
      this.requestCount++; // Increment request counter

      // Step 1: Add message to thread
      const messageAdded = await this.addMessageToThread(userMessage);
      if (!messageAdded) {
        return this.getFallbackResponse(userMessage, context);
      }

      // Step 2: Create and run the assistant
      const run = await this.createRun();
      if (!run) {
        return this.getFallbackResponse(userMessage, context);
      }

      // Step 3: Wait for completion and get response
      const response = await this.waitForRunCompletion(run.id);
      
      if (response) {
        // Generate simple quick replies
        const quickReplies = this.generateSimpleQuickReplies(userMessage);
        
        return {
          text: response,
          quickReplies
        };
      } else {
        return this.getFallbackResponse(userMessage, context);
      }

    } catch (error) {
      console.error('OpenAI Assistant API error:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  private async addMessageToThread(content: string): Promise<boolean> {
    if (!this.threadId || !this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseURL}/threads/${this.threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: content
        })
      });

      if (!response.ok) {
        await this.handleAPIError(response);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      return false;
    }
  }

  private async createRun(): Promise<Run | null> {
    if (!this.threadId || !this.apiKey) return null;

    try {
      const response = await fetch(`${this.baseURL}/threads/${this.threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: this.assistantId,
          instructions: 'Responda como Luna, a assistente empática do LoveCleanup AI. Seja natural, conversacional e útil.'
        })
      });

      if (!response.ok) {
        await this.handleAPIError(response);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar run:', error);
      return null;
    }
  }

  private async waitForRunCompletion(runId: string): Promise<string | null> {
    if (!this.threadId || !this.apiKey) return null;

    const maxAttempts = 30; // 30 segundos máximo
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.baseURL}/threads/${this.threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!response.ok) {
          console.error('Erro ao verificar run:', response.status);
          const errorHandled = await this.handleAPIError(response);
          if (errorHandled) {
            // Error was handled (quota/auth issue), return null to trigger fallback
            return null;
          }
          // For other errors, continue trying
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          continue;
        }

        const run: Run = await response.json();

        switch (run.status) {
          case 'completed':
            return await this.getLatestAssistantMessage();
          
          case 'failed':
            console.error('Run falhou:', run.status, run.last_error);
            
            // Check if the failure is due to quota/billing issues
            if (run.last_error?.message) {
              const errorMessage = run.last_error.message.toLowerCase();
              if (errorMessage.includes('quota') || 
                  errorMessage.includes('billing') ||
                  errorMessage.includes('exceeded your current quota') ||
                  errorMessage.includes('rate_limit_exceeded') ||
                  errorMessage.includes('insufficient_quota')) {
                console.warn('OpenAI quota exceeded during run execution');
                this.isQuotaExceeded = true;
              }
            }
            
            // Return null to trigger fallback response
            return null;
          
          case 'cancelled':
          case 'expired':
            console.error('Run cancelado/expirado:', run.status);
            return null;
          
          case 'requires_action':
            // Para este caso, vamos apenas aguardar
            console.log('Run requer ação, aguardando...');
            break;
          
          default:
            // Still running (queued, in_progress), wait a bit
            break;
        }

        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;

      } catch (error) {
        console.error('Erro ao aguardar run:', error);
        // For network errors, try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    console.error('Timeout aguardando resposta do assistente');
    return null;
  }

  private async getLatestAssistantMessage(): Promise<string | null> {
    if (!this.threadId || !this.apiKey) return null;

    try {
      const response = await fetch(`${this.baseURL}/threads/${this.threadId}/messages?limit=1`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!response.ok) {
        console.error('Erro ao buscar mensagens:', response.status);
        await this.handleAPIError(response);
        return null;
      }

      const data = await response.json();
      const messages: Message[] = data.data;

      if (messages.length > 0 && messages[0].role === 'assistant') {
        const content = messages[0].content[0];
        if (content.type === 'text') {
          return content.text.value;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar mensagem:', error);
      return null;
    }
  }

  private async handleAPIError(response: Response): Promise<boolean> {
    try {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'Unknown error';
      const errorCode = errorData.error?.code || '';

      console.log('OpenAI API Error:', {
        status: response.status,
        code: errorCode,
        message: errorMessage
      });

      switch (response.status) {
        case 401:
          console.warn('OpenAI API: Invalid API key');
          this.isInvalidKey = true;
          return true;
        
        case 429:
          if (errorMessage.includes('quota') || 
              errorMessage.includes('billing') ||
              errorMessage.includes('exceeded your current quota') ||
              errorCode === 'insufficient_quota' ||
              errorCode === 'rate_limit_exceeded') {
            console.warn('OpenAI API: Quota exceeded');
            this.isQuotaExceeded = true;
            return true;
          } else {
            console.warn('OpenAI API: Rate limit exceeded, trying again...');
            return false; // Don't mark as handled, will retry
          }
        
        default:
          console.error(`OpenAI API: HTTP ${response.status} -`, errorMessage);
          // Check if any other status contains quota-related errors
          if (errorMessage.includes('quota') || 
              errorMessage.includes('billing') ||
              errorMessage.includes('exceeded your current quota')) {
            console.warn('OpenAI API: Quota exceeded (detected in error message)');
            this.isQuotaExceeded = true;
            return true;
          }
          return false;
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI error response:', parseError);
      return false;
    }
  }

  private getFallbackResponse(userMessage: string, context?: ChatContext): {
    text: string;
    quickReplies?: string[];
    error?: string;
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // If quota is exceeded, provide specific message
    if (this.isQuotaExceeded) {
      return {
        text: 'A cota da OpenAI foi excedida. Verifique seu plano e faturamento na OpenAI para continuar usando o assistente especializado. Por enquanto, estou funcionando em modo demonstração. 💜',
        quickReplies: ['Como resolver?', 'Entendi', 'Continuar assim', 'Configurar OpenAI'],
        error: 'quota_exceeded'
      };
    }
    
    // If invalid key
    if (this.isInvalidKey) {
      return {
        text: 'A chave da OpenAI parece estar inválida. Verifique sua configuração para usar o assistente especializado. Por enquanto, estou funcionando em modo demonstração. 🔧',
        quickReplies: ['Como configurar?', 'Entendi', 'Continuar assim'],
        error: 'invalid_key'
      };
    }
    
    // Emotional responses
    if (lowerMessage.includes('triste') || lowerMessage.includes('mal') || lowerMessage.includes('sozinho')) {
      return {
        text: 'Eu entendo que você está passando por um momento difícil. É normal sentir isso. Estou aqui para te apoiar. Quer conversar sobre o que está sentindo? 💜',
        quickReplies: ['Sim, quero conversar', 'Como posso me sentir melhor?', 'Obrigado(a)', 'Mudemos de assunto']
      };
    }
    
    // Greetings
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('como você está')) {
      return {
        text: 'Olá! Eu sou a Luna, sua assistente pessoal do LoveCleanup AI. Estou aqui para conversar sobre qualquer coisa que você quiser. Como posso te ajudar hoje? 😊',
        quickReplies: ['Estou bem', 'Preciso de ajuda', 'Vamos conversar', 'Como você funciona?']
      };
    }

    // Questions about functionality
    if (lowerMessage.includes('como funciona') || lowerMessage.includes('o que você faz')) {
      return {
        text: 'Eu sou a Luna, uma IA especializada em apoio emocional para pessoas que estão passando por términos. Posso conversar sobre qualquer assunto, dar apoio, ou explicar sobre o LoveCleanup AI. Sobre o que você gostaria de falar?',
        quickReplies: ['Apoio emocional', 'LoveCleanup AI', 'Conversa geral', 'Fazer perguntas']
      };
    }
    
    // Default response
    return {
      text: 'Entendo. Conte-me mais sobre isso ou pergunte qualquer coisa que quiser. Estou aqui para conversar! 😊',
      quickReplies: ['Conte mais', 'Mudemos de assunto', 'Fazer uma pergunta', 'Estou bem']
    };
  }

  private generateSimpleQuickReplies(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    // Emotional context
    if (lowerMessage.includes('triste') || lowerMessage.includes('mal')) {
      return ['Obrigado(a)', 'Como posso me sentir melhor?', 'Conte mais', 'Mudemos de assunto'];
    }
    
    // Questions
    if (lowerMessage.includes('como') || lowerMessage.includes('por que') || lowerMessage.includes('?')) {
      return ['Entendi', 'Explique mais', 'Interessante', 'E depois?'];
    }
    
    // General conversation
    return ['Interessante', 'Conte mais', 'Entendi', 'E você?'];
  }

  // Public methods for status checking
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_openai_api_key_here';
  }

  hasQuotaIssues(): boolean {
    return this.isQuotaExceeded;
  }

  hasInvalidKey(): boolean {
    return this.isInvalidKey;
  }

  // Reset methods
  resetQuotaFlag() {
    this.isQuotaExceeded = false;
  }

  resetInvalidKeyFlag() {
    this.isInvalidKey = false;
    this.initialize();
  }

  async resetConversation() {
    this.requestCount = 0;
    this.threadId = null;
    await this.createThread();
  }

  // Get conversation stats
  getConversationStats() {
    return {
      messageCount: this.requestCount,
      requestCount: this.requestCount,
      requestsRemaining: this.maxRequestsPerSession - this.requestCount,
      isConfigured: this.isConfigured(),
      hasQuotaIssues: this.hasQuotaIssues(),
      hasInvalidKey: this.hasInvalidKey(),
      threadId: this.threadId,
      assistantId: this.assistantId
    };
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
export default OpenAIService;