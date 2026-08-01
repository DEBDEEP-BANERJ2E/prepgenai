import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaPlay, FaPause, FaRedo, FaBrain, FaCoffee, FaTimes, FaExpandAlt } from 'react-icons/fa';

const PomodoroTimer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Whether widget is visible
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef(null);

  const MODES = {
    work: { time: 25 * 60, label: 'Focus', icon: <FaBrain />, color: 'from-indigo-500 to-purple-600' },
    shortBreak: { time: 5 * 60, label: 'Short Break', icon: <FaCoffee />, color: 'from-green-400 to-emerald-500' },
    longBreak: { time: 15 * 60, label: 'Long Break', icon: <FaCoffee />, color: 'from-blue-400 to-cyan-500' }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a notification sound here if possible, or just browser alert
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].time);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-[9999] cursor-move no-print"
    >
      <motion.div 
        layout
        className={`bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden ${
          isExpanded ? 'rounded-2xl p-5 w-72' : 'rounded-full p-2 w-auto'
        }`}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-3 py-1"
              onDoubleClick={() => setIsExpanded(true)}
            >
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-white font-bold font-mono text-lg">{formatTime(timeLeft)}</span>
              <button 
                onClick={toggleTimer} 
                className="text-white/80 hover:text-white p-1 transition"
              >
                {isActive ? <FaPause size={14} /> : <FaPlay size={14} />}
              </button>
              <div className="w-px h-5 bg-white/20 mx-1"></div>
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-white/50 hover:text-white transition"
                title="Expand Timer"
              >
                <FaExpandAlt size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <span className="text-indigo-400">⏱️ Pomodoro</span>
                </div>
                <div className="flex gap-2 text-white/50">
                  <button onClick={() => setIsExpanded(false)} className="hover:text-white transition cursor-pointer">
                    <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>
                  </button>
                  <button onClick={() => setIsOpen(false)} className="hover:text-red-400 transition cursor-pointer ml-2">
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex bg-white/10 rounded-lg p-1">
                {Object.keys(MODES).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${
                      mode === m ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {MODES[m].label}
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className={`relative flex flex-col items-center justify-center py-6 rounded-xl bg-gradient-to-br ${MODES[mode].color} border border-white/20 shadow-inner`}>
                <span className="text-white/80 mb-1">{MODES[mode].icon}</span>
                <h1 className="text-5xl font-bold text-white font-mono tracking-wider drop-shadow-md">
                  {formatTime(timeLeft)}
                </h1>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={toggleTimer}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-100 transition shadow-lg"
                >
                  {isActive ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 transition"
                >
                  <FaRedo size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PomodoroTimer;
