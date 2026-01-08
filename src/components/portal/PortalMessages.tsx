'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { sendMessageAction } from '@/app/actions/portal';
import { CrmProjectMessage } from '@/types/crm';

type Props = {
  projectId: string;
  initialMessages: CrmProjectMessage[];
  path: string;
};

export default function PortalMessages({ projectId, initialMessages, path }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    
    // Optimistic update
    const tempId = 'temp-' + Date.now();
    const tempMsg: CrmProjectMessage = {
      id: tempId,
      project_id: projectId,
      author_role: 'client',
      author_name: 'Me',
      text: input,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    const msgText = input;
    setInput('');

    try {
      const res = await sendMessageAction(projectId, msgText, path);
      if (!res.success) {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <User className="size-4" />
        </div>
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Project Chat</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-sm text-neutral-500 py-10">No messages yet. Say hello!</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.author_role === 'client';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none'
              }`}>
                {!isMe && <div className="text-[10px] font-bold text-neutral-500 mb-1">{msg.author_name}</div>}
                {msg.text}
                <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-neutral-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="relative flex items-center">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
                <Send className="size-4" />
            </button>
        </div>
      </div>
    </div>
  );
}
