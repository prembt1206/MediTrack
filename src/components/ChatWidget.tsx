'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  X, 
  Send, 
  Sparkles, 
  Languages, 
  Bot, 
  User, 
  Database,
  RefreshCw
} from 'lucide-react';
import { ChatMessage } from '@/types/database';

const SUPPORTED_LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'Hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am MediBot powered by the Gemini API. Ask me about medicine availability, prices, or pharmacy locations in your preferred language!',
      timestamp: 'Just now',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          language: selectedLanguage,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat request failed');

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: data.language,
        inventoryContextUsed: data.inventoryContextUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Error: ${errMsg}. Please try again shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="relative">
          <div className="absolute -top-8 right-1 pointer-events-none flex items-center gap-1.5 text-[10px] font-[480] bg-[#1e1e2a] text-[#ededf3] border border-[#e2e3ed]/20 px-2.5 py-0.5 rounded-[40px] shadow-none whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5266eb]" />
            <span>MediBot AI Online</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 h-12 px-4 rounded-[40px] bg-[#1e1e2a] hover:bg-[#272735] text-[#ededf3] shadow-none transition-colors cursor-pointer"
            aria-label="Open MediBot AI Pharmacy Assistant"
          >
            <div className="relative">
              <Bot className="h-5 w-5 text-[#ededf3]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5266eb]" />
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-[480] leading-tight flex items-center gap-1 text-[#ededf3]">
                MediBot <Sparkles className="h-3 w-3 text-[#c3c3cc]" />
              </p>
              <p className="text-[10px] text-[#c3c3cc]">AI Assistant</p>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal: 12px radius, no shadow */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] rounded-[12px] bg-[#1e1e2a] shadow-none flex flex-col overflow-hidden animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#171721] border-b border-[#70707d]/20 text-[#ededf3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[40px] bg-[#272735] flex items-center justify-center text-[#ededf3]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-[480] flex items-center gap-2 text-[#ededf3] tracking-[0.01em]">
                  MediBot AI
                  <span className="text-[9px] px-2 py-0.5 rounded-[40px] bg-[#272735] text-[#c3c3cc] font-[480]">
                    Google Cloud AI
                  </span>
                </h3>
                <p className="text-[11px] text-[#c3c3cc] flex items-center gap-1 font-normal">
                  <Database className="h-2.5 w-2.5" />
                  Realtime Stock Grounded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-[40px] bg-[#272735] hover:bg-[#323244] flex items-center justify-center text-[#c3c3cc] hover:text-[#ededf3] transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="px-3.5 py-2 bg-[#171721] border-b border-[#70707d]/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#c3c3cc] font-normal">
              <Languages className="h-3.5 w-3.5 text-[#c3c3cc]" />
              <span>Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#1e1e2a] border border-[#e2e3ed]/20 text-[#ededf3] rounded-[32px] px-3 py-1 text-xs font-normal focus:outline-none focus:border-[#e2e3ed] cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#171721] text-[#ededf3]">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#171721] text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="h-7 w-7 rounded-[40px] bg-[#1e1e2a] text-[#ededf3] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-[8px] p-3 shadow-none ${
                      isBot
                        ? 'bg-[#1e1e2a] text-[#ededf3]'
                        : 'bg-[#272735] text-[#ededf3] font-normal'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed font-normal">{msg.content}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 text-[#c3c3cc]`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.inventoryContextUsed && (
                        <span className="flex items-center gap-0.5 text-[8px] bg-[#171721] text-[#ededf3] px-1.5 py-0.5 rounded-[40px] font-normal">
                          ✓ Verified Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="h-7 w-7 rounded-[40px] bg-[#272735] text-[#ededf3] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[#c3c3cc] text-xs py-2 font-normal">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#ededf3]" />
                <span>Checking live pharmacy inventory in {selectedLanguage}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Inquiries */}
          <div className="px-3 py-2 bg-[#171721] border-t border-[#70707d]/15 overflow-x-auto flex gap-1.5 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage('Is Dolo 650 in stock near Koramangala?')}
              className="text-[10px] whitespace-nowrap px-3 py-1 rounded-[40px] bg-[#272735] hover:bg-[#323244] text-[#ededf3] transition-colors cursor-pointer shadow-none font-[480]"
            >
              💊 Dolo 650 Stock
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Do you have Augmentin 625 Duo?')}
              className="text-[10px] whitespace-nowrap px-3 py-1 rounded-[40px] bg-[#272735] hover:bg-[#323244] text-[#ededf3] transition-colors cursor-pointer shadow-none font-[480]"
            >
              🏥 Augmentin Antibiotic
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('Kannada');
                handleSendMessage('ನನಗೆ ಡೋಲೋ 650 ಸಿಗುತ್ತಾ? (Do you have Dolo 650 in Kannada?)');
              }}
              className="text-[10px] whitespace-nowrap px-3 py-1 rounded-[40px] bg-[#272735] hover:bg-[#323244] text-[#ededf3] transition-colors cursor-pointer shadow-none font-[480]"
            >
              🇮🇳 ಕನ್ನಡ ಪ್ರಶ್ನೆ
            </button>
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#171721] border-t border-[#70707d]/20 flex items-center gap-2"
          >
            <Input
              type="text"
              placeholder={`Ask in ${selectedLanguage} (e.g. Is Pan 40 available?)...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs h-9 bg-[#1e1e2a] border-[#e2e3ed]/20 text-[#ededf3] placeholder:text-[#c3c3cc] rounded-[32px] focus:border-[#e2e3ed]"
              disabled={loading}
            />
            {/* Primary Cobalt Button */}
            <Button
              type="submit"
              size="sm"
              variant="default"
              className="h-9 w-9 p-0 rounded-[32px] shrink-0 bg-[#5266eb] hover:bg-[#4355d6] text-white shadow-none border-0"
              disabled={loading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

        </div>
      )}

    </div>
  );
}
