/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Check, AlertCircle, RefreshCw, Trophy, Play, Keyboard } from 'lucide-react';
import { Word } from '../constants';

interface DictationViewProps {
  words: Word[];
}

const ACCENTED_CHARS = ['à', 'è', 'é', 'ì', 'ò', 'ù'];

export default function DictationView({ words: allWords }: DictationViewProps) {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [isFinished, setIsFinished] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [wordCount, setWordCount] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = sessionWords[currentIndex];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlaySound = () => {
    if (currentWord) speak(currentWord.word);
  };

  useEffect(() => {
    if (currentWord && !isFinished && !isSettingUp) {
      handlePlaySound();
    }
  }, [currentIndex, sessionWords, isSettingUp]);

  const startSession = (count: number) => {
    const shuffled = [...allWords]
      .filter(w => w.useful_for_flashcard) // Filter if needed
      .sort(() => 0.5 - Math.random());
    setSessionWords(shuffled.slice(0, count));
    setCurrentIndex(0);
    setUserInput('');
    setStatus('idle');
    setIsFinished(false);
    setIsSettingUp(false);
  };

  const checkInput = (value: string) => {
    if (!currentWord) return;

    const normalizedInput = value.trim().toLowerCase();
    const normalizedAnswer = currentWord.word.trim().toLowerCase();

    if (normalizedInput === normalizedAnswer) {
      setStatus('success');
      setTimeout(() => {
        if (currentIndex < sessionWords.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setUserInput('');
          setStatus('idle');
        } else {
          setIsFinished(true);
        }
      }, 800);
    } else if (normalizedInput.length >= normalizedAnswer.length && normalizedInput !== normalizedAnswer) {
      setStatus('error');
    } else {
      setStatus('idle');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    checkInput(value);
  };

  const insertChar = (char: string) => {
    if (!inputRef.current) return;
    
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const newValue = userInput.substring(0, start) + char + userInput.substring(end);
    
    setUserInput(newValue);
    checkInput(newValue);
    
    // Maintain focus and update selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = start + 1;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleRestart = () => {
    setIsSettingUp(true);
  };

  if (isSettingUp) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto p-8 bg-white rounded-3xl shadow-xl border border-sage-100"
      >
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Play size={24} className="text-sage-600" /> Session Configuration
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Number of Words
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setWordCount(count)}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    wordCount === count 
                      ? 'bg-sage-600 text-white shadow-md' 
                      : 'bg-sage-50 text-slate-500 hover:bg-sage-100'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => startSession(wordCount)}
            className="w-full py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-sage-600/90 transition-all"
          >
            Start Dictation
          </button>
        </div>
      </motion.div>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto p-12 bg-white rounded-3xl shadow-xl text-center border border-sage-100"
      >
        <div className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Ben fatto!</h2>
        <p className="text-slate-500 mb-8">You've completed your dictation session.</p>
        <button
          onClick={handleRestart}
          className="w-full py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-sage-600/90 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} /> Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-sage-100 p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-12">
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Dictation Master
          </div>
          <div className="text-xs font-bold text-sage-600 bg-sage-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {sessionWords.length}
          </div>
        </div>

        <button
          onClick={handlePlaySound}
          className="w-24 h-24 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center hover:bg-sage-100 hover:scale-105 active:scale-95 transition-all shadow-inner border border-sage-100 group"
        >
          <Volume2 size={36} className="group-hover:animate-pulse" />
        </button>
        
        <div className="mt-4 text-slate-400 text-sm italic font-medium">
          Listen and type what you hear
        </div>

        <div className="w-full mt-12 space-y-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type in Italian..."
              autoFocus
              autoComplete="off"
              className={`w-full px-6 py-5 rounded-2xl border-2 outline-none transition-all text-xl font-medium text-center ${
                status === 'success' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : status === 'error'
                  ? 'border-terracotta-500 bg-red-50 text-terracotta-500'
                  : 'border-sage-100 focus:border-sage-600 bg-white text-slate-800 shadow-sm'
              }`}
            />
            <AnimatePresence>
              {status === 'success' && (
                <motion.div 
                   key="success-indicator"
                  initial={{ opacity: 0, scale: 0.5, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-4 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check size={20} strokeWidth={3} />
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div 
                  key="error-indicator"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 flex items-center gap-2 text-terracotta-500 text-sm font-medium justify-center"
                >
                  <AlertCircle size={14} /> <span>Keep trying...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-1.5 justify-center flex-wrap">
                {ACCENTED_CHARS.map((char) => (
                  <button
                    key={char}
                    onClick={() => insertChar(char)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-sage-50 text-slate-600 font-bold hover:bg-sage-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {char}
                  </button>
                ))}
             </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Keyboard size={10} /> Virtual Accents
             </div>
          </div>
        </div>

        <div className="mt-12 w-full pt-8 border-t border-sage-50 text-center">
           <p className="text-slate-400 text-sm mb-1 italic">Translation hint:</p>
           <p className="text-slate-600 font-medium">{currentWord?.english_translation}</p>
        </div>
      </div>
    </div>
  );
}
