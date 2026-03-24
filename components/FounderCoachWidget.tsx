'use client';

import { useAdvisor } from '@/hooks/useAdvisor';
import { useState } from 'react';
import { Bot, X, Send, Command } from 'lucide-react';

export default function FounderCoachWidget({ productId }: { productId: string }) {
  const { askAdvisor, response, loading } = useAdvisor(productId);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const currentInput = input;
    setInput('');
    await askAdvisor(currentInput);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#0d0d12] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-[#ffd7ef]" />
              <span className="font-semibold text-sm tracking-wide">Tiramisup AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-[#fafafa] flex flex-col gap-4">
            <div className="bg-white p-3 rounded-lg border border-[#e8e8e8] text-[13px] text-gray-700 leading-relaxed shadow-sm">
              Merhaba! Ürününüzün bulunduğu aşamaya (Pre-launch / Growth) göre odaklanmanız gereken en doğru büyüme adımını bulmak için buradayım. (5 Persona Testi aktif). Nasıl yardımcı olabilirim?
            </div>
            
            {response && (
              <div className="bg-[#0d0d12] text-white p-4 rounded-lg text-[13px] leading-relaxed whitespace-pre-wrap shadow-md">
                {response}
              </div>
            )}
            
            {loading && (
              <div className="flex items-center gap-2 text-[#666d80] text-[13px] animate-pulse">
                <Command size={14} className="animate-spin" /> Orchestrator düşünüyor...
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="p-3 bg-white border-t border-[#e8e8e8] flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bugün 15 kayıt aldık..."
              className="flex-1 px-3 py-2 text-[13px] bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#e8e8e8] focus:outline-none transition"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="p-2 bg-[#0d0d12] text-[#ffd7ef] rounded-lg disabled:opacity-50 hover:bg-gray-800 transition flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#0d0d12] text-[#ffd7ef] shadow-xl hover:scale-105 transition-transform flex items-center justify-center border-4 border-white"
        >
          <Bot size={24} />
        </button>
      )}
    </div>
  );
}
