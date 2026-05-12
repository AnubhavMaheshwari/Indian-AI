import React, { useState, useEffect } from 'react';

const HabitLogger = ({ onBack }) => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(false);

  const addHabit = async () => {
    if (!newHabit.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('https://www.indian-ai.com/api/command/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: `log habit: ${newHabit}`
        }),
      });

      const data = await response.json();
      console.log('Add habit response:', data); // Debug log
      
      if (response.ok && data.response) {
        console.log('Habit added successfully:', data.response);
        setNewHabit('');
        // Add to local state
        const habitName = newHabit.toLowerCase();
        if (!habits.find(h => h.name === habitName)) {
          setHabits([...habits, {
            name: habitName,
            streak: 1,
            lastLogged: new Date().toDateString()
          }]);
        }
      } else {
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logHabit = async (habitName) => {
    setLoading(true);
    
    // Find current habit to get streak info
    const currentHabit = habits.find(h => h.name === habitName);
    const newStreak = currentHabit ? currentHabit.streak + 1 : 1;
    
    try {
      const response = await fetch('https://www.indian-ai.com/api/command/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: `log habit: ${habitName}`
        }),
      });

      const data = await response.json();
      console.log('Log habit response:', data); // Debug log
      
      if (response.ok && data.response) {
        console.log('Habit logged successfully:', data.response);
        // Update local state
        setHabits(habits.map(habit => 
          habit.name === habitName 
            ? { ...habit, lastLogged: new Date().toDateString(), streak: habit.streak + 1 }
            : habit
        ));
      } else {
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingHabits = async () => {
    try {
      const response = await fetch('https://www.indian-ai.com/api/command/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'list habits'
        }),
      });

      const data = await response.json();
      
      if (data.response && data.response !== "📋 No habits tracked yet. Start with 'Log habit: [habit name]'") {
        console.log('Existing habits:', data.response);
        // Parse the habit list and extract habit data
        // The response format is like: "📋 Your Habits (2):\n• Read Books - ✅ Done today (Streak: 1)\n• Went Gym - ✅ Done today (Streak: 1)"
        
        const lines = data.response.split('\n');
        const habitLines = lines.filter(line => line.startsWith('•'));
        
        const parsedHabits = habitLines.map(line => {
          // Parse: "• Read Books - ✅ Done today (Streak: 1)"
          const match = line.match(/• (.+?) - (✅ Done today|⏸️ Pending) \(Streak: (\d+)\)/);
          if (match) {
            const [, name, status, streak] = match;
            return {
              name: name.toLowerCase(),
              streak: parseInt(streak),
              lastLogged: status === '✅ Done today' ? new Date().toDateString() : null
            };
          }
          return null;
        }).filter(Boolean);
        
        setHabits(parsedHabits);
      }
    } catch (error) {
      console.error('Error loading existing habits:', error);
    }
  };

  useEffect(() => {
    loadExistingHabits();
  }, []);

  return (
    <div className="min-h-screen p-5 md:p-[15px] w-full max-w-full box-border overflow-x-hidden">
      <div className="flex items-center mb-[30px] text-white">
        <button 
          onClick={onBack}
          className="bg-blue-500/15 backdrop-blur-[10px] border border-blue-500/30 text-white py-2.5 px-4 rounded-xl cursor-pointer text-base mr-[15px] transition-all duration-200 hover:bg-blue-500/25 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
        >
          ← Back
        </button>
        <h1 className="text-[32px] md:text-[24px] font-bold m-0 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          📊 Habit Logger
        </h1>
      </div>

      <div className="bg-blue-500/10 backdrop-blur-[20px] border border-white/20 rounded-[20px] p-[25px] md:p-[20px] mb-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-30px)] box-border">
        <h2 className="m-0 mb-5 text-[20px] text-white font-semibold">
          Add New Habit
        </h2>
        <div className="flex flex-col md:flex-col gap-[15px] md:gap-[10px] items-center md:items-stretch lg:flex-row">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Enter habit name (e.g., exercise, meditate, read)"
            className="flex-1 w-full box-border py-[14px] px-[18px] border border-blue-500/30 rounded-xl text-[16px] bg-blue-500/10 backdrop-blur-[10px] text-white transition-all duration-200 focus:outline-none focus:border-blue-500/60 focus:ring-[3px] focus:ring-blue-500/20 placeholder:text-white/60"
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            disabled={loading}
          />
          <button
            onClick={addHabit}
            disabled={loading || !newHabit.trim()}
            className="w-full lg:w-auto md:w-full py-[14px] px-[24px] text-white border-none rounded-xl cursor-pointer text-[16px] font-semibold transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed enabled:bg-gradient-to-br enabled:from-blue-500 enabled:to-blue-700 enabled:hover:-translate-y-[2px] enabled:hover:shadow-[0_4px_15px_rgba(59,130,246,0.4)]"
          >
            {loading ? 'Adding...' : 'Add Habit'}
          </button>
        </div>
      </div>

      {habits.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-1 gap-5 mb-[30px]">
          {habits.map((habit, index) => (
            <div
              key={index}
              className="bg-blue-500/10 backdrop-blur-[20px] border border-blue-500/20 rounded-2xl p-[25px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200 hover:border-blue-500/50 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(59,130,246,0.2)] box-border"
            >
              <div className="flex justify-between items-center mb-5 flex-row sm:flex-col sm:items-start sm:gap-2.5">
                <h3 className="text-[18px] font-semibold text-white m-0 capitalize">
                  {habit.name}
                </h3>
                <button
                  onClick={() => logHabit(habit.name)}
                  disabled={loading || habit.lastLogged === new Date().toDateString()}
                  className={`text-white border-none py-2 px-4 rounded-lg text-[14px] font-semibold transition-all duration-200 sm:w-full sm:text-center ${habit.lastLogged === new Date().toDateString() ? 'bg-[#28a745] cursor-not-allowed' : 'bg-gradient-to-br from-blue-500 to-blue-700 cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]'} ${loading && habit.lastLogged !== new Date().toDateString() ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {habit.lastLogged === new Date().toDateString() ? '✓ Done Today' : 'Log Today'}
                </button>
              </div>
              
              <div className="flex flex-col gap-[15px]">
                <div className="flex justify-between">
                  <span className="text-[14px] text-white/70">Current Streak:</span>
                  <span className="text-[18px] font-bold text-blue-500">
                    🔥 {habit.streak} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-white/70">Last Logged:</span>
                  <span className="text-[14px] font-semibold text-white">
                    {habit.lastLogged}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-[50px] md:p-[30px_20px] bg-blue-500/10 backdrop-blur-[20px] border border-blue-500/20 rounded-2xl mb-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-30px)] box-border">
          <div className="text-[64px] md:text-[48px] mb-[20px]">📊</div>
          <h3 className="text-[24px] md:text-[20px] text-white mb-2.5">
            No habits yet!
          </h3>
          <p className="text-[16px] md:text-[14px] text-[#ccc] m-0">
            Add your first habit above to start tracking your progress.
          </p>
        </div>
      )}
    </div>
  );
};

export default HabitLogger;
