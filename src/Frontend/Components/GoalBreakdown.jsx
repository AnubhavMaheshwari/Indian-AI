import React, { useState } from 'react';

const GoalBreakdown = ({ onBack }) => {
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const handleGoalBreakdown = async () => {
    if (!goal.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('https://www.indian-ai.com/api/command/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: `break down: ${goal}`
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        console.log('Received response:', data.response);
        
        // Parse the Sarvam AI response to extract structured steps and checkpoints
        const responseText = data.response;
        console.log('🔍 Raw response received:', responseText.substring(0, 500));
        
        // Simple and accurate parsing for Step X: format with bullet points
        let parsedTasks = [];
        
        // Split by steps and process each one
        const stepSections = responseText.split(/Step\s+(\d+):/i);
        console.log(`📋 Found ${Math.floor(stepSections.length / 2)} step sections`);
        
        for (let i = 1; i < stepSections.length; i += 2) {
          const stepNumber = parseInt(stepSections[i]);
          const stepContent = stepSections[i + 1] || '';
          
          // Extract step title (first line)
          const lines = stepContent.trim().split('\n');
          const stepTitle = lines[0]?.trim() || `Step ${stepNumber}`;
          
          console.log(`🔍 Processing Step ${stepNumber}: ${stepTitle}`);
          
          // Extract checkpoints (lines starting with • or -)
          const checkpoints = [];
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
              const checkpoint = cleanLine.replace(/^[•\-]\s*/, '').trim();
              if (checkpoint.length > 10) { // Only meaningful checkpoints
                checkpoints.push(checkpoint);
              }
            }
          }
          
          // Limit to exactly 4 checkpoints as requested in backend
          const limitedCheckpoints = checkpoints.slice(0, 4);
          
          console.log(`✅ Step ${stepNumber} has ${limitedCheckpoints.length} checkpoints`);
          
          if (limitedCheckpoints.length > 0) {
            const subTasks = limitedCheckpoints.map((checkpoint, idx) => ({
              id: `${stepNumber}.${idx + 1}`,
              text: checkpoint,
              completed: false,
              type: 'checkpoint'
            }));
            
            parsedTasks.push({
              id: stepNumber,
              text: stepTitle,
              completed: false,
              fullText: stepContent,
              subTasks: subTasks
            });
          }
        }
        
        // If no steps found with the main pattern, try fallback
        if (parsedTasks.length === 0) {
          console.log('🔄 No steps found, trying fallback parsing...');
          
          // Try numbered list format (1. 2. 3.)
          const numberedSections = responseText.split(/(\d+)\.\s+/);
          
          for (let i = 1; i < numberedSections.length; i += 2) {
            const stepNumber = parseInt(numberedSections[i]);
            const stepContent = numberedSections[i + 1] || '';
            
            const lines = stepContent.trim().split('\n');
            const stepTitle = lines[0]?.trim() || `Step ${stepNumber}`;
            
            // Look for bullet points in this section
            const checkpoints = [];
            for (const line of lines) {
              const cleanLine = line.trim();
              if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
                const checkpoint = cleanLine.replace(/^[•\-]\s*/, '').trim();
                if (checkpoint.length > 10) {
                  checkpoints.push(checkpoint);
                }
              }
            }
            
            const limitedCheckpoints = checkpoints.slice(0, 4);
            
            if (limitedCheckpoints.length > 0) {
              const subTasks = limitedCheckpoints.map((checkpoint, idx) => ({
                id: `${stepNumber}.${idx + 1}`,
                text: checkpoint,
                completed: false,
                type: 'checkpoint'
              }));
              
              parsedTasks.push({
                id: stepNumber,
                text: stepTitle,
                completed: false,
                fullText: stepContent,
                subTasks: subTasks
              });
            }
          }
        }
        
        // If still no parsed tasks, show debug info
        if (parsedTasks.length === 0) {
          console.log('❌ No step structure found in API response');
          console.log('📋 Full response text:', responseText);
          
          // Create a single debug task to show the raw response
          parsedTasks = [{
            id: 1,
            text: "⚠️ Could not parse response - check console for details",
            completed: false,
            fullText: responseText,
            subTasks: [{
              id: '1.1',
              text: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
              completed: false,
              type: 'debug'
            }]
          }];
        }
        
        console.log(`🎯 Final parsed tasks: ${parsedTasks.length} steps found`);
        parsedTasks.forEach((task, idx) => {
          console.log(`  Step ${task.id}: "${task.text}" with ${task.subTasks.length} checkpoints`);
        });
        
        setTasks(parsedTasks);
        // Expand all tasks by default to show checkpoints
        setExpandedTasks(new Set(parsedTasks.map(task => task.id)));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error breaking down goal. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        // If marking main task as completed, mark all sub-tasks as completed
        if (newCompleted) {
          return {
            ...task, 
            completed: newCompleted,
            subTasks: task.subTasks.map(sub => ({ ...sub, completed: true }))
          };
        } else {
          return { ...task, completed: newCompleted };
        }
      }
      return task;
    }));
  };

  const toggleSubTask = (taskId, subTaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubTasks = task.subTasks.map(sub => 
          sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
        );
        
        // Check if all sub-tasks are completed to auto-complete main task
        const allSubTasksCompleted = updatedSubTasks.every(sub => sub.completed);
        
        return {
          ...task,
          subTasks: updatedSubTasks,
          completed: allSubTasksCompleted
        };
      }
      return task;
    }));
  };

  const toggleTaskExpansion = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  return (
    <div className="min-h-screen p-5 md:p-[15px] w-full max-w-full box-border overflow-x-hidden">
      <div className="flex items-center mb-[30px] text-white">
        <button 
          onClick={onBack}
          className="bg-blue-500/15 backdrop-blur-[10px] border border-blue-500/30 text-white py-2.5 px-4 rounded-xl cursor-pointer text-base mr-[15px] transition-all duration-200 hover:bg-blue-500/25 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
        >
          ←
        </button>
        <h1 className="text-[32px] md:text-[24px] font-bold m-0 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          🎯 Goal Breakdown
        </h1>
      </div>

      <div className="bg-blue-500/10 backdrop-blur-[20px] border border-white/20 rounded-[20px] p-[25px] md:p-[20px] mb-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-30px)] box-border">
        <h2 className="m-0 mb-5 text-[20px] text-white font-semibold">
          What's your goal?
        </h2>
        <div className="flex flex-col md:flex-col gap-[15px] md:gap-[10px] md:items-stretch items-center md:items-stretch sm:flex-col lg:flex-row">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Enter your goal (e.g., Learn React, Start a YouTube channel, Lose 10kg)"
            className="flex-1 w-full box-border py-[14px] px-[18px] border border-blue-500/30 rounded-xl text-[16px] bg-blue-500/10 backdrop-blur-[10px] text-white transition-all duration-200 focus:outline-none focus:border-blue-500/60 focus:ring-[3px] focus:ring-blue-500/20 placeholder:text-white/60"
            onKeyPress={(e) => e.key === 'Enter' && handleGoalBreakdown()}
          />
          <button
            onClick={handleGoalBreakdown}
            disabled={loading || !goal.trim()}
            className="w-full lg:w-auto md:w-full py-[14px] px-[24px] text-white border-none rounded-xl cursor-pointer text-[16px] font-semibold transition-all duration-200 disabled:bg-[#ccc] disabled:cursor-not-allowed enabled:bg-gradient-to-br enabled:from-blue-500 enabled:to-blue-700 enabled:hover:-translate-y-[2px] enabled:hover:shadow-[0_4px_15px_rgba(59,130,246,0.4)]"
          >
            {loading ? 'Breaking down...' : 'Break Down'}
          </button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="bg-blue-500/10 backdrop-blur-[20px] border border-blue-500/20 rounded-[20px] p-[25px] md:p-[20px] mb-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-[calc(100vw-40px)] md:max-w-[calc(100vw-30px)] box-border">
          <h2 className="text-white mb-5 text-[22px] font-semibold">
            📋 Action Plan ({tasks.filter(t => t.completed).length}/{tasks.length} main tasks completed)
          </h2>
          
          {/* Progress Bar */}
          <div className="mb-[25px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px] text-white/80 font-medium">
                Overall Progress
              </span>
              <span className="text-[14px] text-white font-semibold">
                {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-[10px] bg-blue-500/20 rounded-[5px] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#28a745] to-[#20c997] transition-all duration-300 ease-in-out rounded-[5px]"
                style={{
                  width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%`
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-[15px]">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`rounded-[16px] overflow-hidden transition-all duration-200 bg-blue-500/10 backdrop-blur-[15px] w-full box-border m-0 hover:border-blue-500/50 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(59,130,246,0.2)] border-2 ${task.completed ? 'border-[#28a745]/60' : 'border-blue-500/30'}`}
              >
                {/* Main Task */}
                <div
                  className={`flex items-center p-[20px] md:p-[15px] cursor-pointer transition-all duration-200 w-full box-border ${task.completed ? 'bg-[#28a745]/20' : 'bg-blue-500/10'}`}
                  onClick={() => toggleTaskExpansion(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className="mr-[15px] w-5 h-5"
                  />
                  <span className={`text-[18px] md:text-[16px] font-semibold flex-1 ${task.completed ? 'text-white/70 line-through' : 'text-white no-underline'}`}>
                    {task.id}. {task.text}
                  </span>
                  <span className="text-[14px] text-white/80 mr-[10px]">
                    {task.subTasks.filter(sub => sub.completed).length}/{task.subTasks.length} sub-tasks
                  </span>
                  <span className={`text-[18px] text-white transition-transform duration-200 ${expandedTasks.has(task.id) ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                  </span>
                </div>

                {/* Sub-tasks */}
                {expandedTasks.has(task.id) && (
                  <div className="p-[15px_20px_20px_55px] md:p-[15px_20px_20px_40px] bg-blue-500/5 border-t border-blue-500/20 w-full box-border">
                    <div className="flex flex-col gap-[10px]">
                      {task.subTasks.map((subTask) => (
                        <div
                          key={subTask.id}
                          onClick={() => toggleSubTask(task.id, subTask.id)}
                          className={`flex items-center p-[12px_15px] md:p-[10px_12px] rounded-[10px] cursor-pointer transition-all duration-200 backdrop-blur-[10px] w-full box-border border hover:border-blue-500/50 hover:-translate-y-[1px] hover:shadow-[0_4px_15px_rgba(59,130,246,0.2)] ${subTask.completed ? 'bg-[#28a745]/20 border-[#28a745]/50' : 'bg-blue-500/10 border-blue-500/30'}`}
                        >
                          <input
                            type="checkbox"
                            checked={subTask.completed}
                            onChange={() => toggleSubTask(task.id, subTask.id)}
                            className="mr-[12px] w-4 h-4"
                          />
                          <span className={`text-[15px] md:text-[14px] ${subTask.completed ? 'text-white/70 line-through' : 'text-white no-underline'}`}>
                            {subTask.text}
                          </span>
                          {subTask.completed && (
                            <span className="ml-auto text-[16px] text-[#28a745]">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {tasks.length > 0 && tasks.every(t => t.completed) && (
            <div className="text-center p-[30px] bg-gradient-to-br from-[#ffeaa7] to-[#fab1a0] rounded-xl my-[20px]">
              <div className="text-[48px] mb-[15px]">🎉</div>
              <h3 className="text-[20px] text-[#2d3436] m-0">
                Congratulations! Goal completed!
              </h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalBreakdown;
