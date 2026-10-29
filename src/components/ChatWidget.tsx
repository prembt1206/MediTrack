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
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="relative">
          <div className="absolute -top-8 right-1 pointer-events-none flex items-center gap-1.5 text-[10px] font-sans bg-[#ffffff] text-[#393737] border border-[#393737]/15 px-2.5 py-0.5 rounded-[100px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#393737]" />
            <span>MediBot AI Online</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 h-12 px-4 rounded-[100px] bg-[#ffffff] hover:bg-[#f7f7f7] text-[#393737] border border-[#393737]/15 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-colors cursor-pointer"
            aria-label="Open MediBot AI Pharmacy Assistant"
          >
            <div className="relative">
              <Bot className="h-5 w-5 text-[#393737]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#393737]" />
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-tight flex items-center gap-1 text-[#393737] font-sans">
                MediBot <Sparkles className="h-3 w-3 text-[#888787]" />
              </p>
              <p className="text-[10px] text-[#888787] font-sans">AI Assistant</p>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal: 15px radius, soft shadow */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] rounded-[15px] bg-[#ffffff] border border-[#393737]/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#f7f7f7] border-b border-[#393737]/10 text-[#393737] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 flex items-center justify-center text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 text-[#393737] font-sans">
                  MediBot AI
                  <span className="text-[9px] px-2 py-0.5 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 text-[#888787] font-sans">
                    Google Cloud AI
                  </span>
                </h3>
                <p className="text-[11px] text-[#888787] flex items-center gap-1 font-normal font-sans">
                  <Database className="h-2.5 w-2.5" />
                  Realtime Stock Grounded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-[100px] bg-[#ffffff] hover:bg-[#f7f7f7] border border-[#393737]/15 flex items-center justify-center text-[#888787] hover:text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="px-3.5 py-2 bg-[#f7f7f7] border-b border-[#393737]/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#888787] font-normal font-sans">
              <Languages className="h-3.5 w-3.5 text-[#888787]" />
              <span>Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#ffffff] border border-[#393737]/20 text-[#393737] rounded-[100px] px-3 py-1 text-xs font-normal focus:outline-none focus:border-[#393737] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#ffffff] text-[#393737]">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f7f7f7] text-xs font-sans">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="h-7 w-7 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 text-[#393737] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-[12px] p-3 ${
                      isBot
                        ? 'bg-[#ffffff] border border-[#393737]/8 text-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
                        : 'bg-[#393737] text-white font-normal shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed font-normal">{msg.content}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 ${isBot ? 'text-[#888787]' : 'text-white/70'}`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.inventoryContextUsed && (
                        <span className="flex items-center gap-0.5 text-[8px] bg-[#f7f7f7] border border-[#393737]/15 text-[#393737] px-1.5 py-0.5 rounded-[100px] font-normal">
                          ✓ Verified Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="h-7 w-7 rounded-[100px] bg-[#393737] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[#888787] text-xs py-2 font-normal font-sans">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#393737]" />
                <span>Checking live pharmacy inventory in {selectedLanguage}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Inquiries */}
          <div className="px-3 py-2 bg-[#f7f7f7] border-t border-[#393737]/10 overflow-x-auto flex gap-1.5 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage('Is Dolo 650 in stock near Koramangala?')}
              className="text-[10px] whitespace-nowrap px-3 py-1 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
            >
              💊 Dolo 650 Stock
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Do you have Augmentin 625 Duo?')}
              className="text-[10px] whitespace-nowrap px-3 py-1 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
            >
              🏥 Augmentin Antibiotic
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('Kannada');
                handleSendMessage('ನನಗೆ ಡೋಲೋ 650 ಸಿಗುತ್ತಾ? (Do you have Dolo 650 in Kannada?)');
              }}
              className="text-[10px] whitespace-nowrap px-3 py-1 rounded-[100px] bg-[#ffffff] border border-[#393737]/15 hover:bg-[#ececec] text-[#393737] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
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
            className="p-3 bg-[#f7f7f7] border-t border-[#393737]/10 flex items-center gap-2"
          >
            <Input
              type="text"
              placeholder={`Ask in ${selectedLanguage} (e.g. Is Pan 40 available?)...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs h-9 bg-[#ffffff] border-[#393737]/20 text-[#393737] placeholder:text-[#888787] rounded-[100px] focus:border-[#393737] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-sans"
              disabled={loading}
            />
            {/* Pill CTA Button: Warm Graphite #393737 */}
            <Button
              type="submit"
              size="sm"
              variant="default"
              className="h-9 w-9 p-0 rounded-[100px] shrink-0 bg-[#393737] hover:bg-[#2b2929] text-white shadow-none border-0"
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
