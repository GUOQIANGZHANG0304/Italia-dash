import { useState, useMemo } from 'react';
import Header from './components/Header';
import Flashcard from './components/Flashcard';
import DictationView from './components/DictationView';
import { WORD_GROUPS_BY_LEVEL, CEFRLevel } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'dictation'>('flashcards');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('A1');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);

  // 获取当前等级的所有组
  const levelGroups = useMemo(() => WORD_GROUPS_BY_LEVEL[selectedLevel] || [], [selectedLevel]);
  
  // 获取当前正在学习的 50 个词
  const currentWords = useMemo(() => {
    return levelGroups[selectedGroupIndex] || (levelGroups[0] || []);
  }, [levelGroups, selectedGroupIndex]);

  return (
    <div className="min-h-screen bg-sage-50 pb-20">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 mt-8 flex justify-center">
        {activeTab === 'flashcards' ? (
          <Flashcard 
            allWords={currentWords}
            selectedLevel={selectedLevel}
            selectedGroupIndex={selectedGroupIndex}
            totalGroups={levelGroups.length}
            onLevelChange={(level) => {
              setSelectedLevel(level);
              setSelectedGroupIndex(0); // 切等级重置组
            }}
            onGroupChange={setSelectedGroupIndex}
          />
        ) : (
          <DictationView words={currentWords} />
        )}
      </main>

      {/* 底部国旗装饰 */}
      <div className="fixed bottom-0 left-0 w-full h-1.5 flex opacity-30">
        <div className="flex-1 bg-emerald-500" /><div className="flex-1 bg-white" /><div className="flex-1 bg-red-500" />
      </div>
    </div>
  );
}