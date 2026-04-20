export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isAlert?: boolean;
  disease?: string | null;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  isAlert: boolean;
  disease: string | null;
}
