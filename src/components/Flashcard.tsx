import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Volume2, RotateCcw, Filter, Play } from 'lucide-react';
import { Word, CEFRLevel } from '../constants';

interface FlashcardProps {
  allWords: Word[];
  selectedLevel: CEFRLevel;
  selectedGroupIndex: number;
  totalGroups: number;
  onLevelChange: (level: CEFRLevel) => void;
  onGroupChange: (index: number) => void;
}

export default function Flashcard({ 
  allWords, 
  selectedLevel, 
  selectedGroupIndex, 
  totalGroups,
  onLevelChange, 
  onGroupChange 
}: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  // 每次切换组或等级时，重置卡片状态
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [allWords]);

  const handleNext = useCallback(() => {
    if (allWords.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % allWords.length), 150);
  }, [allWords.length]);

  const handlePrev = useCallback(() => {
    if (allWords.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + allWords.length) % allWords.length), 150);
  }, [allWords.length]);

  const toggleFlip = useCallback(() => setIsFlipped((prev) => !prev), []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. 设置界面：包含等级和组选择
  if (isSettingUp) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto p-8 bg-white rounded-3xl shadow-xl border border-sage-100"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
          <Filter size={24} className="text-emerald-600" /> Study Settings
        </h2>
        
        <div className="space-y-10">
          {/* 等级选择 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Level</label>
            <div className="grid grid-cols-4 gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => onLevelChange(l)}
                  className={`py-3 rounded-xl font-bold transition-all ${selectedLevel === l ? 'bg-emerald-600 text-white shadow-lg' : 'bg-sage-50 text-slate-400 hover:bg-sage-100'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 组选择 (紧跟在等级下面) */}
          {totalGroups > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedLevel}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Group</label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalGroups }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onGroupChange(i)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all border-2 ${selectedGroupIndex === i ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-white text-slate-300 border-slate-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setIsSettingUp(false)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} /> Start Learning ({allWords.length} words)
          </button>
        </div>
      </motion.div>
    );
  }

  // 2. 学习界面 (保持你之前的漂亮设计)
  const currentWord = allWords[currentIndex];

  return (
    <div className="max-w-md w-full mx-auto p-4 flex flex-col items-center">
      {/* 顶部状态条 */}
      <div className="w-full mb-8 flex justify-between items-end">
        <div>
          <span className="text-2xl font-black text-emerald-600">{selectedLevel}</span>
          <span className="ml-2 text-xs font-bold text-slate-300 uppercase tracking-widest">Group {selectedGroupIndex + 1}</span>
        </div>
        <button onClick={() => setIsSettingUp(true)} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* 进度条 */}
      <div className="w-full h-1 bg-sage-100 rounded-full mb-10 overflow-hidden">
        <motion.div className="h-full bg-emerald-600" animate={{ width: `${((currentIndex + 1) / allWords.length) * 100}%` }} />
      </div>

      {/* 卡片主体 */}
      <div className="relative w-full aspect-[4/5] cursor-pointer perspective-1000" onClick={toggleFlip}>
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 正面 */}
          <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-sage-100 flex flex-col items-center justify-center p-8 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <button className="absolute top-6 left-6 p-2 text-slate-200 hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); speak(currentWord.word); }}>
              <Volume2 size={24} />
            </button>
            <h2 className="text-5xl font-display font-bold text-slate-800 text-center">{currentWord.word}</h2>
            <div className="mt-8 text-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <RotateCcw size={12} /> Tap to Flip
            </div>
          </div>

          {/* 背面 */}
          <div className="absolute inset-0 bg-emerald-600 rounded-3xl shadow-xl flex flex-col p-8 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="flex-grow flex flex-col items-center justify-center text-white">
              <span className="text-[10px] font-bold opacity-50 uppercase mb-2">Meaning</span>
              <h2 className="text-3xl font-bold mb-4">{currentWord.english_translation}</h2>
              <p className="font-mono text-emerald-100 opacity-80 italic">[{currentWord.romanization}]</p>
              <div className="w-full h-px bg-white/10 my-6" />
              <p className="text-center text-lg leading-relaxed">{currentWord.example_sentence_native}</p>
              <p className="text-center text-sm text-emerald-100/60 mt-2">{currentWord.example_sentence_english}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部导航 */}
      <div className="flex items-center gap-12 mt-12">
        <button onClick={handlePrev} className="p-4 rounded-full bg-white shadow-sm border border-sage-100 text-slate-400 hover:text-emerald-600"><ChevronLeft size={24} /></button>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">{currentIndex + 1} / {allWords.length}</span>
        <button onClick={handleNext} className="p-4 rounded-full bg-white shadow-sm border border-sage-100 text-slate-400 hover:text-emerald-600"><ChevronRight size={24} /></button>
      </div>
    </div>
  );
}