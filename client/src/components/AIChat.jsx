import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSpinner, FaRobot, FaUserCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion } from 'motion/react';
import { chatWithContext } from '../services/api';

const AIChat = ({ activeNote }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load history from localStorage when note changes
  useEffect(() => {
    if (activeNote && activeNote._id) {
      const allChats = JSON.parse(localStorage.getItem('prepgen_chats') || '{}');
      setMessages(allChats[activeNote._id] || []);
    } else {
      setMessages([]);
    }
  }, [activeNote]);

  // Save history to localStorage when messages update
  useEffect(() => {
    if (activeNote && activeNote._id && messages.length > 0) {
      const allChats = JSON.parse(localStorage.getItem('prepgen_chats') || '{}');
      allChats[activeNote._id] = messages;
      localStorage.setItem('prepgen_chats', JSON.stringify(allChats));
    }
  }, [messages, activeNote]);

  // Scroll to bottom when messages or the active note ID change
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeNote?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeNote) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatWithContext(userMessage, messages, {
        topic: activeNote.topic,
        notes: activeNote.content?.notes,
        revisionPoints: activeNote.content?.revisionPoints
      });

      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: error.message || "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 shadow-sm z-10">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <FaRobot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Workspace Assistant</h2>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Context: {activeNote?.topic || 'No active note'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-4">
            <FaRobot size={48} className="text-gray-200" />
            <p className="text-sm">
              {activeNote?.content?.isFileNote 
                ? "I cannot currently read the contents of embedded PDF/PPT files. Please use manual or AI-generated notes for interactive study sessions."
                : "I have full access to the document on the left. Ask me to summarize it, explain a specific concept, or quiz you on it!"}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {msg.role === 'user' ? <FaUserCircle size={20} /> : <FaRobot size={16} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' : 'bg-white border border-gray-100 shadow-sm rounded-tl-none text-gray-800 prose prose-sm prose-indigo'}`}>
                {msg.role === 'user' ? (
                  <p>{msg.text}</p>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              <FaRobot size={16} />
            </div>
            <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={activeNote?.content?.isFileNote ? "Chat is disabled for uploaded files." : "Ask anything about these notes..."}
            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 resize-none outline-none transition custom-scrollbar disabled:opacity-50"
            rows="2"
            disabled={!activeNote || activeNote?.content?.isFileNote}
          />
          <button
            type="submit"
            disabled={!activeNote || isLoading || !input.trim() || activeNote?.content?.isFileNote}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">PrepGen AI Assistant</span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
