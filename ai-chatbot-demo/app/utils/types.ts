export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
  }
  
  export interface User {
    email: string;
    history: ChatMessage[];
  }
  