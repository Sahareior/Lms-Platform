export type InFlightStatus = 'idle' | 'pending' | 'success' | 'error';

export interface InFlightChatState {
   question: string;
   userMessageId: string;
   userMessageTime: string;
   status: InFlightStatus;
   aiText?: string;
   error?: string;
}

export type ChatSessionListener = (state: InFlightChatState | null) => void;

class ChatSessionManager {
   private activeState: InFlightChatState | null = null;
   private listeners: Set<ChatSessionListener> = new Set();
   private clearTimer: ReturnType<typeof setTimeout> | null = null;

   constructor() {
      // Check if there was any pending question in sessionStorage across reloads
      try {
         const saved = sessionStorage.getItem('ai_chat_in_flight');
         if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.question && Date.now() - (parsed.timestamp || 0) < 5 * 60 * 1000) {
               this.activeState = {
                  question: parsed.question,
                  userMessageId: parsed.userMessageId || `user-${Date.now()}`,
                  userMessageTime: parsed.userMessageTime || '',
                  status: 'pending',
               };
            } else {
               sessionStorage.removeItem('ai_chat_in_flight');
            }
         }
      } catch {
         // ignore storage errors
      }
   }

   public getActiveState(): InFlightChatState | null {
      return this.activeState;
   }

   public isActive(): boolean {
      return this.activeState?.status === 'pending';
   }

   public subscribe(listener: ChatSessionListener): () => void {
      this.listeners.add(listener);
      // Immediately notify with current state
      listener(this.activeState);
      return () => {
         this.listeners.delete(listener);
      };
   }

   private notify() {
      for (const listener of this.listeners) {
         try {
            listener(this.activeState);
         } catch (err) {
            console.error('Error in chat session listener:', err);
         }
      }
   }

   public async start({
      question,
      userMessageId,
      userMessageTime,
      sendChat,
      saveAiMessage,
   }: {
      question: string;
      userMessageId: string;
      userMessageTime: string;
      sendChat: () => Promise<{ answer: string }>;
      saveAiMessage: (aiText: string) => Promise<unknown>;
   }): Promise<string> {
      if (this.clearTimer) {
         clearTimeout(this.clearTimer);
         this.clearTimer = null;
      }

      this.activeState = {
         question,
         userMessageId,
         userMessageTime,
         status: 'pending',
      };

      try {
         sessionStorage.setItem(
            'ai_chat_in_flight',
            JSON.stringify({
               question,
               userMessageId,
               userMessageTime,
               timestamp: Date.now(),
            })
         );
      } catch {
         // ignore
      }

      this.notify();

      let aiText = '';
      try {
         const res = await sendChat();
         aiText = res.answer;
         this.activeState = {
            question,
            userMessageId,
            userMessageTime,
            status: 'success',
            aiText,
         };
         this.notify();

         try {
            await saveAiMessage(aiText);
         } catch (err) {
            console.error('Failed to save AI response message:', err);
         }
      } catch (err: unknown) {
         aiText = 'Unable to send your question right now. Please try again.';
         const errorMessage = err instanceof Error ? err.message : 'Error';
         this.activeState = {
            question,
            userMessageId,
            userMessageTime,
            status: 'error',
            aiText,
            error: errorMessage,
         };
         this.notify();

         try {
            await saveAiMessage(aiText);
         } catch {
            // ignore
         }
      } finally {
         try {
            sessionStorage.removeItem('ai_chat_in_flight');
         } catch {
            // ignore
         }

         // Keep completed state available briefly so active mounts finish consuming it
         this.clearTimer = setTimeout(() => {
            if (this.activeState?.status !== 'pending') {
               this.activeState = null;
               this.notify();
            }
         }, 800);
      }

      return aiText;
   }
}

export const chatSessionManager = new ChatSessionManager();
