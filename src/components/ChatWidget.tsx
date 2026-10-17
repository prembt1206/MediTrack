'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Languages, 
  Bot, 
  User, 
  Database,
  RefreshCw,
  ChevronDown
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
      
      {/* Floating Launcher Button with Ambient Floating Pill */}
      {!isOpen && (
        <div className="relative">
          <div className="animate-float-slow absolute -top-8 right-1 pointer-events-none flex items-center gap-1 text-[10px] font-semibold bg-slate-900/90 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-lg shadow-emerald-950/50 backdrop-blur-md whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>MediBot AI Online</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 h-14 px-5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Open MediBot AI Pharmacy Assistant"
          >
            <div className="relative">
              <Bot className="h-6 w-6 group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-tight flex items-center gap-1">
                MediBot AI <Sparkles className="h-3 w-3 text-amber-300" />
              </p>
              <p className="text-[10px] text-teal-100 opacity-90">Multilingual Stock Chat</p>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] max-h-[85vh] rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 glass-card backdrop-blur-xl">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-white">
                  MediBot AI
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-sky-500/20 text-sky-200 border-sky-400/30 flex items-center gap-1">
                    Google Cloud AI
                  </Badge>
                </h3>
                <p className="text-[11px] text-teal-200 flex items-center gap-1">
                  <Database className="h-2.5 w-2.5" />
                  Realtime Stock Grounded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-white/15 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Languages className="h-3.5 w-3.5 text-emerald-400" />
              <span>Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/50 text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                      isBot
                        ? 'bg-slate-900 text-slate-200 border border-slate-800'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 ${
                        isBot ? 'text-slate-400' : 'text-emerald-100'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.inventoryContextUsed && (
                        <span className="flex items-center gap-0.5 text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          ✓ Verified Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="h-7 w-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Checking live pharmacy inventory in {selectedLanguage}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Inquiries with Tactile Buttons */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage('Is Dolo 650 in stock near Koramangala?')}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-700/80 active:scale-95 transition-all cursor-pointer"
            >
              💊 Dolo 650 Stock
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Do you have Augmentin 625 Duo?')}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-teal-950/80 text-slate-300 hover:text-teal-300 border border-slate-800 hover:border-teal-700/80 active:scale-95 transition-all cursor-pointer"
            >
              🏥 Augmentin Antibiotic
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('Kannada');
                handleSendMessage('ನನಗೆ ಡೋಲೋ 650 ಸಿಗುತ್ತಾ? (Do you have Dolo 650 in Kannada?)');
              }}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-950/80 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-700/80 active:scale-95 transition-all cursor-pointer"
            >
              🇮🇳 ಕನ್ನಡ ಪ್ರಶ್ನೆ
            </button>
          </div>

          {/* Input & Send Form with Tactile Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <Input
              type="text"
              placeholder={`Ask in ${selectedLanguage} (e.g. Is Pan 40 available?)...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="text-xs h-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              variant="gradient"
              className="h-9 px-3.5 shrink-0 active:scale-90 transition-transform shadow-md shadow-emerald-500/20"
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
