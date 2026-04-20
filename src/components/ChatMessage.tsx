import { Activity, User, AlertTriangle, Clock } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function renderBotText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const sectionHeaders = [
      'CLINICAL ASSESSMENT', 'PRIMARY DIAGNOSIS', 'PRESENTING SYMPTOMS',
      'DIFFERENTIAL DIAGNOSES', 'MEDICAL ADVICE', 'URGENCY',
      'IMPORTANT', 'RECOMMENDATION',
    ];
    if (sectionHeaders.some(h => line.startsWith(h))) {
      return (
        <p key={i} className="font-bold text-gray-800 mt-3 mb-0.5 text-xs uppercase tracking-widest">
          {line}
        </p>
      );
    }
    if (line.startsWith('─')) {
      return <hr key={i} className="border-gray-200 my-2" />;
    }
    if (line.startsWith('  •') || line.startsWith('• ')) {
      return (
        <p key={i} className="ml-3 text-gray-700 text-sm py-0.5 leading-snug">
          {line.trim()}
        </p>
      );
    }
    if (line.startsWith('🚨')) {
      return (
        <p key={i} className="font-bold text-red-700 text-sm mb-1">
          {line}
        </p>
      );
    }
    if (line === '') {
      return <div key={i} className="h-1.5" />;
    }
    return (
      <p key={i} className="text-gray-700 text-sm leading-relaxed">
        {line}
      </p>
    );
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  const isAlert = message.isAlert;

  if (!isBot) {
    return (
      <div className="flex justify-end items-end gap-2 animate-fade-in">
        <div className="max-w-[80%] sm:max-w-[70%]">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 px-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-5">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-5 shadow-sm ${
        isAlert ? 'bg-red-500' : 'bg-gradient-to-br from-blue-500 to-blue-700'
      }`}>
        {isAlert ? (
          <AlertTriangle className="w-4 h-4 text-white" />
        ) : (
          <Activity className="w-4 h-4 text-white" />
        )}
      </div>

      <div className="max-w-[85%] sm:max-w-[78%]">
        {isAlert && (
          <div className="mb-1.5">
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Critical Alert
            </span>
          </div>
        )}

        <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border ${
          isAlert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
        }`}>
          <div>{renderBotText(message.text)}</div>
        </div>

        {message.disease && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-blue-700">Identified: {message.disease}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mt-1 px-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
