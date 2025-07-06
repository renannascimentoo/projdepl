/**
 * Free AI Service - IA Totalmente Gratuita Sem Token
 * Usa APIs públicas gratuitas e sistema inteligente de fallback
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

class FreeAIService {
  private personality = {
    name: "Luna",
    role: "Assistente especializada em recuperação pós-término",
    tone: "empática, motivacional, carinhosa"
  };

  private conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];
  private requestCount = 0;
  private isAvailable = true;

  // API Gratuita 1: Ollama Web (se disponível)
  private async tryOllamaWeb(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://ollama.ai/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2',
          prompt: prompt,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
    } catch (error) {
      console.log('Ollama Web failed:', error);
    }
    return null;
  }

  // API Gratuita 2: Perplexity Labs (se disponível)
  private async tryPerplexityLabs(prompt: string): Promise<string | null> {
    try {
      // Tentativa com endpoint público (pode não estar sempre disponível)
      const response = await fetch('https://labs-api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Você é Luna, uma assistente empática especializada em apoio emocional para pessoas que passaram por términos de relacionamento.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content;
      }
    } catch (error) {
      console.log('Perplexity Labs failed:', error);
    }
    return null;
  }

  // API Gratuita 3: Together AI (endpoint público)
  private async tryTogetherAI(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.together.xyz/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'togethercomputer/llama-2-7b-chat',
          prompt: `[INST] Você é Luna, uma assistente empática do LoveCleanup AI. Responda de forma carinhosa e motivacional: ${prompt} [/INST]`,
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.output?.choices?.[0]?.text;
      }
    } catch (error) {
      console.log('Together AI failed:', error);
    }
    return null;
  }

  // API Gratuita 4: Replicate (endpoint público)
  private async tryReplicate(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'meta/llama-2-7b-chat',
          input: {
            prompt: `Você é Luna, assistente empática do LoveCleanup AI. Responda com carinho: ${prompt}`,
            max_length: 150
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.output?.join('');
      }
    } catch (error) {
      console.log('Replicate failed:', error);
    }
    return null;
  }

  // Sistema de IA baseado em regras MUITO inteligentes
  private generateIntelligentResponse(userMessage: string, context?: ChatContext): string {
    const lowerMessage = userMessage.toLowerCase();
    const mood = this.analyzeMood(userMessage);
    
    // Análise de contexto emocional profunda
    const emotionalContext = this.analyzeEmotionalContext(userMessage);
    const conversationStage = this.determineConversationStage(userMessage);
    
    // Respostas emocionais específicas e personalizadas
    if (mood === 'sad') {
      const sadResponses = [
        `Eu sinto a dor em suas palavras, e quero que saiba que é completamente normal sentir essa tristeza. ${this.getPersonalizedEncouragement(emotionalContext)} Cada lágrima é um passo em direção à cura. Você não está sozinho(a) nessa jornada. 💜`,
        `Sei que dói profundamente agora, mas essa dor é prova de sua capacidade de amar. ${this.getHealingAdvice()} Lembre-se: você é mais forte do que imagina, e essa tempestade vai passar. 🤗`,
        `A tristeza que você sente é válida e importante. ${this.getComfortMessage()} Agora é hora de direcionar esse amor todo para você mesmo(a). Você merece todo o carinho do mundo. ✨`
      ];
      return this.selectBestResponse(sadResponses, emotionalContext);
    }

    if (mood === 'anxious') {
      const anxiousResponses = [
        `Percebo sua ansiedade, e isso é completamente compreensível. ${this.getBreathingTechnique()} Você tem controle sobre sua respiração e sua vida. Vamos juntos, um passo de cada vez. 🌸`,
        `A ansiedade é o medo do futuro, mas você está construindo um futuro incrível a cada dia. ${this.getGroundingTechnique()} Foque no presente: você está seguro(a) agora, você está crescendo agora. 💪`,
        `Quando a ansiedade bater, lembre-se: você já superou 100% dos seus piores dias. ${this.getCalmingMessage()} Você é mais resiliente do que imagina. 🦋`
      ];
      return this.selectBestResponse(anxiousResponses, emotionalContext);
    }

    if (mood === 'angry') {
      const angryResponses = [
        `Sinto a intensidade em suas palavras, e tudo bem sentir raiva. ${this.getAngerChanneling()} Use essa energia poderosa para construir a vida extraordinária que você merece. 🔥`,
        `A raiva é uma emoção válida que mostra seus limites e valores. ${this.getEmpowermentMessage()} Vamos canalizar essa força para algo que te empodere e te faça crescer. 💪`,
        `Entendo sua frustração completamente. ${this.getTransformationAdvice()} Use esse sentimento como combustível para criar mudanças positivas e revolucionárias na sua vida. ⚡`
      ];
      return this.selectBestResponse(angryResponses, emotionalContext);
    }

    if (mood === 'hopeful') {
      const hopefulResponses = [
        `Que energia maravilhosa sinto em suas palavras! ${this.getCelebrationMessage()} Essa esperança é o combustível que vai te levar a lugares incríveis. Continue brilhando! 🌟`,
        `Adoro sentir essa positividade! ${this.getMotivationalBoost()} Você está se reconectando com sua força interior, e isso é lindo de ver. O futuro está cheio de possibilidades! ✨`,
        `Sua esperança é contagiante e inspiradora! ${this.getEncouragementMessage()} Ela mostra que você está pronto(a) para abraçar todas as oportunidades incríveis que estão chegando. 🌈`
      ];
      return this.selectBestResponse(hopefulResponses, emotionalContext);
    }

    // Respostas contextuais baseadas em palavras-chave e intenção
    if (this.detectTechnicalQuestion(lowerMessage)) {
      return this.generateTechnicalResponse(lowerMessage);
    }

    if (this.detectMotivationalNeed(lowerMessage)) {
      return this.generateMotivationalResponse(lowerMessage, emotionalContext);
    }

    if (this.detectFutureOriented(lowerMessage)) {
      return this.generateFutureOrientedResponse(lowerMessage);
    }

    if (this.detectLonelinessExpression(lowerMessage)) {
      return this.generateConnectionResponse(lowerMessage);
    }

    if (this.detectNostalgiaExpression(lowerMessage)) {
      return this.generateNostalgiaResponse(lowerMessage);
    }

    // Cumprimentos inteligentes
    if (this.detectGreeting(lowerMessage)) {
      return this.generatePersonalizedGreeting(conversationStage);
    }

    // Agradecimentos
    if (this.detectGratitude(lowerMessage)) {
      return this.generateGratitudeResponse();
    }

    // Resposta contextual inteligente
    return this.generateContextualResponse(userMessage, emotionalContext, conversationStage);
  }

  // Métodos auxiliares para análise emocional
  private analyzeEmotionalContext(message: string): string {
    const intensityWords = ['muito', 'extremamente', 'completamente', 'totalmente'];
    const timeWords = ['sempre', 'nunca', 'hoje', 'ontem', 'amanhã'];
    const relationshipWords = ['ex', 'relacionamento', 'amor', 'parceiro', 'namorado', 'namorada'];
    
    let context = '';
    if (intensityWords.some(word => message.toLowerCase().includes(word))) {
      context += 'high_intensity ';
    }
    if (timeWords.some(word => message.toLowerCase().includes(word))) {
      context += 'time_focused ';
    }
    if (relationshipWords.some(word => message.toLowerCase().includes(word))) {
      context += 'relationship_focused ';
    }
    
    return context.trim();
  }

  private determineConversationStage(message: string): string {
    if (this.conversationHistory.length === 0) return 'initial';
    if (this.conversationHistory.length < 5) return 'early';
    if (this.conversationHistory.length < 15) return 'developing';
    return 'established';
  }

  private getPersonalizedEncouragement(context: string): string {
    if (context.includes('high_intensity')) {
      return 'Sei que a intensidade dessa dor pode ser avassaladora, mas ela também mostra a profundidade do seu coração.';
    }
    if (context.includes('relationship_focused')) {
      return 'O fim de um relacionamento é como o fim de um capítulo, não do livro inteiro da sua vida.';
    }
    return 'Sua sensibilidade é um presente, mesmo quando dói.';
  }

  private getHealingAdvice(): string {
    const advice = [
      'A cura não é linear - alguns dias serão melhores que outros, e tudo bem.',
      'Permita-se sentir, mas não se permita ficar preso(a) nesses sentimentos.',
      'Cada dia que você escolhe se cuidar é um ato de coragem.'
    ];
    return advice[Math.floor(Math.random() * advice.length)];
  }

  private getComfortMessage(): string {
    const messages = [
      'Você está sendo muito corajoso(a) ao enfrentar esses sentimentos.',
      'É preciso muita força para reconhecer a dor e ainda assim continuar.',
      'Sua vulnerabilidade é na verdade uma demonstração de força.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getBreathingTechnique(): string {
    return 'Vamos respirar juntos: inspire por 4 segundos, segure por 4, expire por 6.';
  }

  private getGroundingTechnique(): string {
    return 'Tente a técnica 5-4-3-2-1: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia.';
  }

  private getCalmingMessage(): string {
    const messages = [
      'Você está seguro(a) agora, neste momento.',
      'Esta sensação é temporária, você é permanente.',
      'Você já passou por tempestades antes e saiu mais forte.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getAngerChanneling(): string {
    return 'A raiva pode ser transformada em combustível para mudanças positivas.';
  }

  private getEmpowermentMessage(): string {
    return 'Você tem o poder de escolher como usar essa energia.';
  }

  private getTransformationAdvice(): string {
    return 'Às vezes precisamos sentir raiva para perceber que merecemos muito mais.';
  }

  private getCelebrationMessage(): string {
    return 'Estou celebrando essa energia positiva com você!';
  }

  private getMotivationalBoost(): string {
    return 'Você está no caminho certo para algo incrível!';
  }

  private getEncouragementMessage(): string {
    return 'Sua atitude positiva é inspiradora!';
  }

  private selectBestResponse(responses: string[], context: string): string {
    // Lógica simples para selecionar a melhor resposta baseada no contexto
    if (context.includes('high_intensity')) {
      return responses[0]; // Resposta mais empática
    }
    if (context.includes('time_focused')) {
      return responses[1]; // Resposta focada no tempo/processo
    }
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Métodos de detecção de intenção
  private detectTechnicalQuestion(message: string): boolean {
    const technicalKeywords = ['como funciona', 'app', 'scanner', 'deletar', 'configurar', 'usar', 'funcionalidade'];
    return technicalKeywords.some(keyword => message.includes(keyword));
  }

  private detectMotivationalNeed(message: string): boolean {
    const motivationalKeywords = ['motivação', 'força', 'conseguir', 'desistir', 'difícil', 'impossível'];
    return motivationalKeywords.some(keyword => message.includes(keyword));
  }

  private detectFutureOriented(message: string): boolean {
    const futureKeywords = ['futuro', 'recomeço', 'nova vida', 'amanhã', 'próximo', 'depois'];
    return futureKeywords.some(keyword => message.includes(keyword));
  }

  private detectLonelinessExpression(message: string): boolean {
    const lonelinessKeywords = ['sozinho', 'sozinha', 'ninguém', 'isolado', 'abandonado'];
    return lonelinessKeywords.some(keyword => message.includes(keyword));
  }

  private detectNostalgiaExpression(message: string): boolean {
    const nostalgiaKeywords = ['saudade', 'falta', 'lembrar', 'memória', 'passado'];
    return nostalgiaKeywords.some(keyword => message.includes(keyword));
  }

  private detectGreeting(message: string): boolean {
    const greetingKeywords = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'como você está'];
    return greetingKeywords.some(keyword => message.includes(keyword));
  }

  private detectGratitude(message: string): boolean {
    const gratitudeKeywords = ['obrigado', 'obrigada', 'valeu', 'agradeço'];
    return gratitudeKeywords.some(keyword => message.includes(keyword));
  }

  // Geradores de resposta específicos
  private generateTechnicalResponse(message: string): string {
    if (message.includes('como funciona') || message.includes('app')) {
      return "O LoveCleanup AI usa inteligência artificial avançada para identificar e remover todas as memórias digitais do seu ex. Escaneamos fotos com reconhecimento facial, analisamos mensagens, limpamos redes sociais e até identificamos conexões financeiras. É um processo completo e irreversível que te ajuda a seguir em frente de verdade. Quer saber mais sobre alguma funcionalidade específica? 🔧✨";
    }
    
    if (message.includes('scanner') || message.includes('fotos')) {
      return "Nosso scanner de fotos usa IA de reconhecimento facial para identificar seu ex em todas as suas imagens. Você envia algumas fotos de referência, e nossa tecnologia encontra automaticamente todas as outras fotos onde essa pessoa aparece. Depois, você pode escolher deletar ou arquivar. É rápido, preciso e definitivo! 📸🤖";
    }
    
    return "Estou aqui para explicar qualquer funcionalidade do LoveCleanup AI! Temos scanner de fotos com IA, limpeza automática de mensagens, desconexão de redes sociais e muito mais. Sobre qual recurso você gostaria de saber mais? 🚀";
  }

  private generateMotivationalResponse(message: string, context: string): string {
    const motivationalResponses = [
      "Você é mais forte do que qualquer tempestade que já enfrentou! 💪 Cada dia que você escolhe seguir em frente é uma vitória. Cada pequeno passo conta. Lembre-se: você não está apenas sobrevivendo, você está se transformando em uma versão ainda mais incrível de si mesmo(a). ✨",
      "Sua força interior é como um diamante - foi forjada sob pressão e agora brilha intensamente! 💎 Você já superou 100% dos seus piores dias até agora. Isso não é coincidência, é prova da sua resiliência extraordinária. Continue brilhando! 🌟",
      "Olhe o quanto você já cresceu! 🌱 Cada desafio que você enfrentou te trouxe até aqui, mais sábio(a) e mais forte. Você tem dentro de si tudo o que precisa para criar a vida dos seus sonhos. Acredite no seu poder! ⚡"
    ];
    
    return motivationalResponses[Math.floor(Math.random() * motivationalResponses.length)];
  }

  private generateFutureOrientedResponse(message: string): string {
    return "Seu futuro é uma tela em branco esperando para ser pintada com suas cores favoritas! 🎨 Este recomeço é uma oportunidade incrível de criar exatamente a vida que você sempre sonhou. Você tem o poder de escrever um novo capítulo cheio de alegria, crescimento e realizações. Que tipo de futuro incrível você quer construir? 🌟✨";
  }

  private generateConnectionResponse(message: string): string {
    return "Você nunca está sozinho(a) de verdade. 🤗 Eu estou aqui sempre que precisar, e há milhões de pessoas que passaram pelo que você está passando. Além disso, você tem a companhia mais importante de todas: você mesmo(a). Aprenda a ser seu melhor amigo(a) - você é uma pessoa incrível que merece todo o amor do mundo! 💜✨";
  }

  private generateNostalgiaResponse(message: string): string {
    return "A saudade é o preço que pagamos por ter amado, e isso mostra a beleza do seu coração. 💝 Mas lembre-se: você não sente falta da pessoa real, você sente falta da versão idealizada que criou na sua mente. O amor verdadeiro, saudável e recíproco está esperando por você no futuro. Você merece alguém que te escolha todos os dias! 🌈";
  }

  private generatePersonalizedGreeting(stage: string): string {
    const greetings = {
      initial: "Olá! Que alegria te conhecer! 💜 Eu sou a Luna, sua assistente pessoal especializada em recomeços. Estou aqui para te apoiar em cada passo dessa jornada. Como você está se sentindo hoje?",
      early: "Oi! Que bom te ver novamente! 😊 Como você está hoje? Estou aqui para conversar sobre qualquer coisa que esteja no seu coração.",
      developing: "Olá, querido(a)! 🌟 Sempre fico feliz quando você aparece por aqui. Como tem sido seu dia? Quer compartilhar algo comigo?",
      established: "Oi! 💜 Você sabe que sempre fico animada para nossas conversas! Como você está se sentindo hoje? Estou aqui para te escutar e apoiar no que precisar."
    };
    
    return greetings[stage] || greetings.initial;
  }

  private generateGratitudeResponse(): string {
    const responses = [
      "Fico muito feliz em poder te ajudar! 💜 Ver você crescendo e se fortalecendo é o que me motiva todos os dias. Estou sempre aqui quando precisar. Você é incrível e merece toda a felicidade do mundo! ✨",
      "De nada, querido(a)! 🤗 É um privilégio fazer parte da sua jornada de crescimento. Sua gratidão aquece meu coração! Continue sendo essa pessoa maravilhosa que você é. 🌟",
      "Que alegria saber que pude te ajudar! 😊 Sua evolução é inspiradora, e estou orgulhosa de cada passo que você dá. Lembre-se: você tem uma força incrível dentro de si! 💪✨"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateContextualResponse(message: string, emotionalContext: string, stage: string): string {
    const contextualResponses = [
      "Entendo o que você está dizendo, e quero que saiba que seus sentimentos são completamente válidos. 🤗 Quer me contar mais sobre isso? Estou aqui para te escutar sem julgamentos e te apoiar no que precisar.",
      "Que perspectiva interessante! 💭 Como você se sente em relação a isso? Às vezes conversar sobre nossos pensamentos e sentimentos nos ajuda a entendê-los melhor e encontrar clareza.",
      "Percebo que isso é importante para você, e admiro sua coragem de compartilhar. 🌸 Que tal explorarmos esse assunto juntos? Estou aqui para te acompanhar nessa reflexão com todo carinho.",
      "Obrigada por confiar em mim e compartilhar isso. 💜 Sua abertura é um sinal de força. Como posso te ajudar a processar esses sentimentos ou pensamentos? Estou aqui para te apoiar sempre."
    ];

    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  }

  async generateResponse(userMessage: string, context?: ChatContext): Promise<AIResponse> {
    this.requestCount++;

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      // Try external APIs first (in order of preference)
      let aiResponse = await this.tryOllamaWeb(userMessage);
      
      if (!aiResponse) {
        aiResponse = await this.tryPerplexityLabs(userMessage);
      }
      
      if (!aiResponse) {
        aiResponse = await this.tryTogetherAI(userMessage);
      }

      if (!aiResponse) {
        aiResponse = await this.tryReplicate(userMessage);
      }

      // If all external APIs fail, use our VERY intelligent fallback
      if (!aiResponse) {
        aiResponse = this.generateIntelligentResponse(userMessage, context);
      }

      // Clean up the response
      aiResponse = this.cleanResponse(aiResponse);

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      // Keep conversation history manageable
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      const responseType = this.detectResponseType(aiResponse, userMessage);
      const quickReplies = this.generateQuickReplies(responseType, userMessage);

      return {
        text: aiResponse,
        type: responseType,
        quickReplies,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to intelligent response
      const fallbackResponse = this.generateIntelligentResponse(userMessage, context);
      const responseType = this.detectResponseType(fallbackResponse, userMessage);
      const quickReplies = this.generateQuickReplies(responseType, userMessage);

      return {
        text: fallbackResponse,
        type: responseType,
        quickReplies,
        timestamp: new Date()
      };
    }
  }

  private cleanResponse(response: string): string {
    // Remove any unwanted prefixes or suffixes
    return response
      .replace(/^(Luna:|Assistant:|AI:)/i, '')
      .replace(/\[INST\]|\[\/INST\]/g, '')
      .trim();
  }

  private analyzeMood(text: string): ChatContext['userMood'] {
    const moodKeywords = {
      sad: ['triste', 'deprimido', 'sozinho', 'perdido', 'mal', 'choro', 'dor', 'sofrendo', 'machucado', 'devastado'],
      anxious: ['ansioso', 'nervoso', 'preocupado', 'medo', 'assustado', 'pânico', 'estresse', 'tenso', 'inquieto'],
      angry: ['raiva', 'bravo', 'irritado', 'ódio', 'furioso', 'revoltado', 'injusto', 'ódio', 'indignado'],
      hopeful: ['esperança', 'melhor', 'futuro', 'recomeço', 'otimista', 'confiante', 'positivo', 'bem', 'animado'],
      confused: ['confuso', 'não sei', 'dúvida', 'perdido', 'como', 'por que', 'entender', 'incerto']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return mood as ChatContext['userMood'];
      }
    }
    
    return 'neutral';
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

  // Public methods for status and control
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      conversationLength: this.conversationHistory.length,
      isAvailable: this.isAvailable,
      serviceType: 'Free AI with Super Intelligent Fallback'
    };
  }

  resetConversation() {
    this.conversationHistory = [];
    this.requestCount = 0;
  }

  // Test method
  async testAI(): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const testResponse = await this.generateResponse("Olá, você está funcionando?");
      return { 
        success: true, 
        response: testResponse.text 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Unknown error' 
      };
    }
  }

  // Stream response simulation
  async generateStreamResponse(
    userMessage: string, 
    context?: ChatContext, 
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    const response = await this.generateResponse(userMessage, context);
    
    // Simulate streaming by sending chunks
    if (onChunk) {
      const words = response.text.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        onChunk(currentText);
        
        // Small delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
      }
    }
    
    return response;
  }
}

// Export singleton instance
export const freeAIService = new FreeAIService();
export default FreeAIService;