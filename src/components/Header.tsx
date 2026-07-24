/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Headphones } from 'lucide-react';

interface HeaderProps {
  activeTab: 'flashcards' | 'dictation';
  onTabChange: (tab: 'flashcards' | 'dictation') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center pt-12 pb-8 px-4">
      <h1 className="text-4xl font-display font-bold text-slate-800 mb-2 tracking-tight">
        意语闪现 <span className="text-terracotta-500">Italian Dash</span>
      </h1>
      <p className="text-slate-500 text-sm mb-8">Master Italian with speed and precision.</p>
      
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-sage-100">
        <button
          onClick={() => onTabChange('flashcards')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'flashcards'
              ? 'bg-sage-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-sage-50'
          }`}
        >
          <BookOpen size={18} />
          <span className="font-medium">Flashcards</span>
        </button>
        <button
          onClick={() => onTabChange('dictation')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 ${
            activeTab === 'dictation'
              ? 'bg-sage-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-sage-50'
          }`}
        >
          <Headphones size={18} />
          <span className="font-medium">Dictation</span>
        </button>
      </div>
    </header>
  );
}
