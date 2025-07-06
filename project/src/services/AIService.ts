/**
 * Legacy AIService - Mantido para compatibilidade
 * Agora usa o OpenAIService como backend
 */

import { openAIService } from './OpenAIService';

interface ChatContext {
  stage: 'onboarding' | 'active_cleanup' | 'post_cleanup';
  userMood: 'neutral' | 'sad' | 'anxious' | 'hopeful' | 'angry';
  lastAction: string | null;
  daysActive: number;
  userName?: string;
}

class AIService {
  async generateResponse(
    userMessage: string, 
    context?: ChatContext
  ): Promise<{ text: string; quickReplies?: string[]; error?: string }> {
    return await openAIService.generateResponse(userMessage, context);
  }

  analyzeMessage(text: string): { mood: string; type: string } {
    const lowerText = text.toLowerCase();
    
    const keywords = {
      sad: ['triste', 'deprimido', 'mal', 'sozinho', 'perdido', 'choro', 'dor', 'sofrendo'],
      anxious: ['ansioso', 'nervoso', 'preocupado', 'medo', 'assustado', 'pânico', 'estresse'],
      angry: ['raiva', 'bravo', 'irritado', 'ódio', 'furioso', 'revoltado', 'injusto'],
      hopeful: ['esperança', 'melhor', 'futuro', 'recomeço', 'nova', 'otimista', 'confiante'],
      technical: ['como', 'funciona', 'scanner', 'deletar', 'remover', 'configurar', 'usar'],
      motivational: ['motivação', 'força', 'coragem', 'conseguir', 'superar', 'vencer']
    };

    let detectedMood = 'neutral';
    let messageType = 'general';

    for (const [mood, words] of Object.entries(keywords)) {
      if (words.some(word => lowerText.includes(word))) {
        if (['sad', 'anxious', 'angry', 'hopeful'].includes(mood)) {
          detectedMood = mood;
        }
        if (['technical', 'motivational'].includes(mood)) {
          messageType = mood;
        } else if (['sad', 'anxious'].includes(mood)) {
          messageType = 'emotional';
        } else if (['hopeful'].includes(mood)) {
          messageType = 'motivational';
        }
        break;
      }
    }

    return { mood: detectedMood, type: messageType };
  }

  resetQuotaFlag() {
    openAIService.resetQuotaFlag();
  }

  isQuotaExceeded(): boolean {
    return openAIService.hasQuotaIssues();
  }

  resetConversation() {
    openAIService.resetConversation();
  }

  getConversationSummary(): { messageCount: number; lastInteraction: Date | null } {
    const stats = openAIService.getConversationStats();
    return {
      messageCount: stats.messageCount,
      lastInteraction: stats.messageCount > 0 ? new Date() : null
    };
  }
}

export const aiService = new AIService();
export default AIService;