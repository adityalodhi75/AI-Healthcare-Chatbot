import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Message, ChatResponse } from '../types';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { NavBar } from '../components/NavBar';
import { Stethoscope, Sparkles, Shield, Clock3 } from 'lucide-react';

const QUICK_SYMPTOMS = [
  'I have fever and headache',
  'Chest pain and shortness of breath',
  'Stomach pain and nausea',
  'Sore throat and runny nose',
  'Body ache and fatigue',
  'Dizziness and weakness',
];

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcome: Message = {
      id: '1',
      text: 'Hello! I\'m your AI Medical Advisor.\n\nI can help you with:\n  • Symptom analysis and possible diagnosis\n  • Medical advice based on your symptoms\n  • Urgency assessment (when to see a doctor)\n  • General health information\n\nPlease describe your symptoms in detail. For best results, include:\n  • What symptoms you have\n  • How long you\'ve had them\n  • Severity (mild, moderate, severe)\n\nExample: "I have had fever of 38.5°C, severe headache, body aches, and fatigue for 3 days."\n\nHow can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, []);

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, userId: session?.user.id }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data: ChatResponse = await res.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        isAlert: data.isAlert,
        disease: data.disease,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'I encountered a connection issue. Please check your internet and try again.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcome = messages.length <= 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4 min-h-0">
        {showWelcome && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">AI Medical Advisor</h2>
                  <p className="text-blue-100 text-sm">Advanced symptom analysis & diagnosis</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { icon: Sparkles, label: 'Smart Analysis' },
                  { icon: Shield, label: 'Safe Guidance' },
                  { icon: Clock3, label: 'Instant Results' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-white bg-opacity-10 rounded-xl p-2 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1 text-white" />
                    <span className="text-xs text-blue-100 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Start</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => sendMessage(symptom)}
                    disabled={isLoading}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pb-2 min-h-[300px]">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-end gap-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-5 shadow-sm">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="text-sm text-gray-500">Analyzing your symptoms</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-3">
          {!showWelcome && (
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_SYMPTOMS.slice(0, 3).map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => sendMessage(symptom)}
                  disabled={isLoading}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                >
                  {symptom}
                </button>
              ))}
            </div>
          )}
          <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
          <p className="text-xs text-center text-gray-400 mt-2">
            For emergencies, call 911. This AI does not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
