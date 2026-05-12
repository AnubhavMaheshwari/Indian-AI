import { useEffect, useState } from 'react';
import Chatbot from "./Components/Chatbot";
import GoalBreakdown from "./Components/GoalBreakdown";
import HabitLogger from "./Components/HabitLogger";
import IndiaMap from "./Components/India-map/IndiaMap";
import StateDetail from "./Components/India-map/StateDetail";

function App() {
  const [messages, setMessages] = useState([]);
  const [currentView, setCurrentView] = useState('chat');
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedState(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const renderNavigation = () => (
    <div className="absolute top-4 right-4 z-[5] flex flex-col gap-[0.7rem] items-end max-md:relative max-md:items-stretch max-md:mb-4 max-md:top-auto max-md:right-auto">
      <div className="flex gap-[0.9rem] flex-wrap justify-end max-md:justify-center">
        <button 
          className="inline-flex items-center gap-[0.45rem] py-[0.95rem] px-[1.35rem] border border-white/12 rounded-full text-white bg-white/5 backdrop-blur-[16px] text-base font-bold cursor-pointer transition-all duration-180 ease-in hover:-translate-y-[2px] hover:bg-white/10 hover:border-white/25 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]" 
          onClick={() => setCurrentView('goals')}
        >
          🎯 Goals
        </button>
        <button 
          className="inline-flex items-center gap-[0.45rem] py-[0.95rem] px-[1.35rem] border border-white/12 rounded-full text-white bg-white/5 backdrop-blur-[16px] text-base font-bold cursor-pointer transition-all duration-180 ease-in hover:-translate-y-[2px] hover:bg-white/10 hover:border-white/25 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]" 
          onClick={() => setCurrentView('habits')}
        >
          📊 Habits
        </button>
      </div>
      <div className="flex gap-[0.9rem] flex-wrap justify-end max-md:justify-center">
        <button 
          className="inline-flex items-center gap-[0.45rem] py-[0.95rem] px-[1.35rem] border border-white/12 rounded-full text-white bg-white/5 backdrop-blur-[16px] text-base font-bold cursor-pointer transition-all duration-180 ease-in hover:-translate-y-[2px] hover:bg-white/10 hover:border-white/25 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]" 
          onClick={() => setCurrentView('curations')}
        >
          ✨ Curations
        </button>
        <button 
          className="inline-flex items-center gap-[0.45rem] py-[0.95rem] px-[1.35rem] border border-white/12 rounded-full text-white bg-white/5 backdrop-blur-[16px] text-base font-bold cursor-pointer transition-all duration-180 ease-in hover:-translate-y-[2px] hover:bg-white/10 hover:border-white/25 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]" 
          onClick={() => setCurrentView('socialize')}
        >
          🤝 Socialize
        </button>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'goals':
        return <GoalBreakdown onBack={() => setCurrentView('chat')} />;
      case 'habits':
        return <HabitLogger onBack={() => setCurrentView('chat')} />;
      case 'curations':
        return <div className="w-full max-w-[900px] mx-auto mt-[5rem] p-6 rounded-[1.25rem] border border-white/10 bg-white/5 backdrop-blur-[16px]">Curations</div>;
      case 'socialize':
        return <div className="w-full max-w-[900px] mx-auto mt-[5rem] p-6 rounded-[1.25rem] border border-white/10 bg-white/5 backdrop-blur-[16px]">Socialize</div>;
      default:
        return (
          <>
            {renderNavigation()}
            <Chatbot messages={messages} setMessages={setMessages} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-[minmax(300px,38vw)_minmax(0,1fr)] max-lg:grid-cols-[minmax(280px,44vw)_minmax(0,1fr)] max-md:grid-cols-1 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent bg-[length:100%_30%] bg-no-repeat">
      {/* Left sidebar with India map */}
      <aside className="sticky top-0 h-screen flex flex-col items-center gap-4 pt-[1.4rem] px-4 pb-4 box-border border-r border-blue-400/25 bg-gradient-to-b from-[#111111f5] to-[#0a0a0cfc] shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] max-md:relative max-md:h-auto max-md:min-h-[52vh] max-md:border-r-0 max-md:border-b max-md:border-blue-400/20 sm:min-h-[46vh] sm:px-3">
        <div className="w-full text-center text-[clamp(1.5rem,2vw,2.2rem)] font-extrabold tracking-[0.12em] text-[#3f7cff] uppercase sm:tracking-[0.08em]">INDIAN-AI</div>
        <div className="flex-1 w-full flex items-center justify-center pt-2 px-0 pb-3 box-border">
          <div className="w-full max-w-full">
            <IndiaMap selected={selectedState} onSelect={setSelectedState} />
          </div>
        </div>
      </aside>

      <main className="relative min-w-0 min-h-screen flex items-stretch justify-center p-[1.1rem_1.1rem_1.4rem] box-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%),rgba(0,0,0,0.18)] max-md:min-h-auto">
        {renderCurrentView()}
      </main>

      {selectedState && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#020617]/60 backdrop-blur-[4px]" onClick={() => setSelectedState(null)}>
          <div className="w-full max-w-[1040px] h-[92vh] max-h-[720px] rounded-2xl overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.45)]" onClick={(event) => event.stopPropagation()}>
            <StateDetail stateName={selectedState} onClose={() => setSelectedState(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;