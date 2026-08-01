import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { getDueCards, processReview, getTotalCards } from '../services/srs';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBrain, FaLayerGroup } from 'react-icons/fa';

const Review = () => {
  const [dueCards, setDueCards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cards = getDueCards();
    // Shuffle the deck for a better review experience
    setDueCards(cards.sort(() => Math.random() - 0.5));
  }, []);

  const handleRating = (quality) => {
    const card = dueCards[currentCardIdx];
    processReview(card.id, quality);

    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentCardIdx + 1 < dueCards.length) {
        setCurrentCardIdx(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 200);
  };

  const currentCard = dueCards[currentCardIdx];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full pt-28">
        
        {isFinished || dueCards.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full border border-gray-100"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">You're All Caught Up!</h2>
            <p className="text-gray-500 mb-8">You've reviewed all your due flashcards for today. Great job keeping your streak alive!</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
            >
              Back to Dashboard
            </button>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Review Header */}
            <div className="flex justify-between items-center w-full max-w-lg mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FaBrain />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Review Session</p>
                  <p className="text-lg font-bold text-gray-800 truncate max-w-[200px]">{currentCard.topic}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{currentCardIdx + 1} <span className="text-gray-400 text-lg">/ {dueCards.length}</span></p>
              </div>
            </div>

            {/* Flashcard */}
            <div className="relative w-full max-w-lg h-80 perspective-1000 cursor-pointer group mb-10" onClick={() => setIsFlipped(!isFlipped)}>
              <motion.div 
                className="w-full h-full relative preserve-3d transition-transform duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
              >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-white/20">
                  <FaLayerGroup className="text-white/20 text-6xl mb-4 absolute top-8 right-8" />
                  <p className="text-white text-2xl font-medium text-center">Think about the answer...</p>
                  <span className="absolute bottom-6 text-white/60 text-sm uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full">Click to reveal</span>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-3xl shadow-xl flex items-center justify-center p-8 border-2 border-indigo-100 overflow-y-auto">
                  <p className="text-gray-800 text-xl text-center leading-relaxed font-medium">{currentCard.text}</p>
                </div>
              </motion.div>
            </div>

            {/* SRS Controls */}
            <AnimatePresence mode="wait">
              {isFlipped ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-4 gap-3 w-full max-w-lg"
                >
                  <button onClick={(e) => { e.stopPropagation(); handleRating(0); }} className="py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold transition flex flex-col items-center">
                    <span className="text-lg">Again</span>
                    <span className="text-xs font-normal opacity-70">&lt; 1m</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRating(1); }} className="py-4 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-2xl font-bold transition flex flex-col items-center">
                    <span className="text-lg">Hard</span>
                    <span className="text-xs font-normal opacity-70">1d</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRating(2); }} className="py-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold transition flex flex-col items-center">
                    <span className="text-lg">Good</span>
                    <span className="text-xs font-normal opacity-70">3d</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRating(3); }} className="py-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-2xl font-bold transition flex flex-col items-center">
                    <span className="text-lg">Easy</span>
                    <span className="text-xs font-normal opacity-70">7d</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[72px] flex items-center justify-center text-gray-400 font-medium"
                >
                  Reveal the card to rate your memory.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Review;
