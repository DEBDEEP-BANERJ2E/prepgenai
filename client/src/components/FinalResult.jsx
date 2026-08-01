import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import MermaidSetup from './MermaidSetup';
import RechartSetUp from './RechartSetUp';
import { FaCopy, FaPrint, FaBolt, FaLayerGroup, FaLightbulb, FaTimes, FaSpinner, FaHeadphones, FaPlay, FaPause, FaStop, FaEdit, FaSave, FaMagic, FaImage, FaArrowsAltV, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { explainLikeIm5, expandNoteSection, improveText, generateStudyTools } from "../services/api";
import { saveFile } from '../services/fileStorage';

const CustomImage = ({ src, alt }) => {
  const [blobUrl, setBlobUrl] = useState(src);
  useEffect(() => {
    if (src && src.startsWith('/idb/')) {
      const fileId = src.replace('/idb/', '');
      import('../services/fileStorage').then(({ getFile }) => {
        getFile(fileId).then(blob => {
          setBlobUrl(URL.createObjectURL(blob));
        }).catch(err => console.error("Image load error:", err));
      });
    } else {
      setBlobUrl(src);
    }
  }, [src]);
  return <img src={blobUrl} alt={alt} className="max-w-full h-auto rounded-xl shadow-md my-6 border border-gray-100" />;
};

const generateId = (children) => {
  const text = Array.isArray(children) ? children.join('') : children.toString();
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

const markDownComponent = {
  h1: ({ children }) => <h1 id={generateId(children)} className="text-2xl font-bold text-indigo-700 mt-6 mb-4 border-b pb-2 scroll-mt-24">{children}</h1>,
  h2: ({ children }) => <h2 id={generateId(children)} className="text-xl font-semibold text-indigo-600 mt-5 mb-3 scroll-mt-24">{children}</h2>,
  h3: ({ children }) => <h3 id={generateId(children)} className="text-lg font-semibold text-gray-800 mt-4 mb-2 scroll-mt-24">{children}</h3>,
  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="list-disc ml-6 space-y-1 text-gray-700">{children}</ul>,
  li: ({ children }) => <li className="marker:text-indigo-500">{children}</li>,
  img: CustomImage,
};

const simpleMdeOptions = {
  spellChecker: false,
  hideIcons: ["guide", "fullscreen", "side-by-side"]
};

function FinalResult({ result, noteId, onUpdate }) {
  const [viewMode, setViewMode] = useState("detailed"); // 'detailed', 'quick', 'flashcards'
  const [activeCard, setActiveCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // ELI5 Feature States
  const [selectedText, setSelectedText] = useState("");
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [showEli5Btn, setShowEli5Btn] = useState(false);
  const [eli5Loading, setEli5Loading] = useState(false);
  const [eli5Result, setEli5Result] = useState(null);
  
  // Expansion Feature States
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [expandInstruction, setExpandInstruction] = useState("");
  const [expandLoading, setExpandLoading] = useState(false);
  
  const [sectionInstruction, setSectionInstruction] = useState("");
  const [sectionLoading, setSectionLoading] = useState(false);
  
  // Editor States
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotesContent, setTempNotesContent] = useState("");
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [tempCardContent, setTempCardContent] = useState("");
  
  const [isGeneratingTools, setIsGeneratingTools] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  
  // Image Upload State
  const imageInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Section Reordering State
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderSections, setReorderSections] = useState([]);

  useEffect(() => {
    if (result?.isManual && result.notes.includes("Start typing your manual note here...")) {
      setIsEditingNotes(true);
      setTempNotesContent(result.notes);
    }
  }, [result]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const fileId = await saveFile(file);
      const markdownImage = `\n\n![Image](/idb/${fileId})\n\n`;
      setTempNotesContent(prev => prev + markdownImage);
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };
  
  const handleOpenReorder = () => {
    if (!result?.notes) return;
    const sections = result.notes.split(/(?=^#{1,6}\s)/m).filter(s => s.trim().length > 0);
    setReorderSections(sections);
    setShowReorderModal(true);
  };

  const moveSection = (index, direction) => {
    const newSections = [...reorderSections];
    if (direction === 'up' && index > 0) {
      const temp = newSections[index - 1];
      newSections[index - 1] = newSections[index];
      newSections[index] = temp;
    } else if (direction === 'down' && index < newSections.length - 1) {
      const temp = newSections[index + 1];
      newSections[index + 1] = newSections[index];
      newSections[index] = temp;
    }
    setReorderSections(newSections);
  };

  const handleSaveReorder = () => {
    const newMarkdown = reorderSections.join('\n\n');
    if (onUpdate) {
      onUpdate({
        ...result,
        notes: newMarkdown
      });
    }
    setShowReorderModal(false);
  };
  
  // Hide the floating button when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.eli5-container') && !window.getSelection().toString().trim()) {
        setShowEli5Btn(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cancel speech synthesis on unmount
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Audio Features States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getSpeechText = () => {
    if (viewMode === 'quick' || viewMode === 'flashcards') {
      return result.revisionPoints?.join(". ") || "No revision points available.";
    }
    // Remove markdown symbols for better reading
    return result.notes ? result.notes.replace(/[#*`_]/g, '') : "No notes available.";
  };

  const handleAudio = () => {
    if (!window.speechSynthesis) return alert("Text-to-speech not supported in this browser.");
    
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      const text = getSpeechText();
      const utterance = new SpeechSynthesisUtterance(text);
      // Increase rate slightly for faster reading
      utterance.rate = 1.1; 
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handleSelection = (e) => {
    // Small delay to let the browser register the selection
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 10 && text.length < 1000) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setPopupPos({
          x: rect.left + (rect.width / 2),
          y: rect.top - 40 // positioned above the selection
        });
        setShowEli5Btn(true);
      } else {
        setShowEli5Btn(false);
      }
    }, 10);
  };

  const handleExplain = async () => {
    setShowEli5Btn(false);
    setEli5Loading(true);
    setEli5Result(null);
    try {
      const explanation = await explainLikeIm5(selectedText, result?.topic || "");
      setEli5Result(explanation);
    } catch (err) {
      setEli5Result(err.message || "Oops! I couldn't simplify that right now. Try again.");
    } finally {
      setEli5Loading(false);
    }
  };

  const closeEli5 = () => {
    setEli5Result(null);
    setEli5Loading(false);
    window.getSelection().removeAllRanges();
  };

  const handleExpandSelection = async () => {
    if (!expandInstruction.trim()) return;
    setExpandLoading(true);
    try {
      const expansionData = await expandNoteSection(selectedText, expandInstruction, result);
      
      const newMarkdown = result.notes + `\n\n### ➕ Expansion: ${expandInstruction}\n\n${expansionData.expandedText}`;
      const newFlashcards = [...(result.revisionPoints || []), ...(expansionData.newRevisionPoints || [])];
      
      if (onUpdate) {
        onUpdate({
          ...result,
          notes: newMarkdown,
          revisionPoints: newFlashcards
        });
      }
      
      setShowExpandModal(false);
      setExpandInstruction("");
      window.getSelection().removeAllRanges();
      setShowEli5Btn(false);
    } catch (err) {
      alert(err.message || "Failed to expand section. Please try again.");
    } finally {
      setExpandLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!sectionInstruction.trim()) return;
    setSectionLoading(true);
    try {
      const expansionData = await expandNoteSection("End of document", sectionInstruction, result);
      
      const newMarkdown = result.notes + `\n\n### ➕ New Section: ${sectionInstruction}\n\n${expansionData.expandedText}`;
      const newFlashcards = [...(result.revisionPoints || []), ...(expansionData.newRevisionPoints || [])];
      
      if (onUpdate) {
        onUpdate({
          ...result,
          notes: newMarkdown,
          revisionPoints: newFlashcards
        });
      }
      
      setSectionInstruction("");
    } catch (err) {
      alert(err.message || "Failed to add section. Please try again.");
    } finally {
      setSectionLoading(false);
    }
  };

  const handleSaveNotes = () => {
    if (onUpdate) {
      onUpdate({
        ...result,
        notes: tempNotesContent
      });
    }
    setIsEditingNotes(false);
  };

  const handleSaveCard = (index) => {
    const newFlashcards = [...result.revisionPoints];
    newFlashcards[index] = tempCardContent;
    
    if (onUpdate) {
      onUpdate({
        ...result,
        revisionPoints: newFlashcards
      });
    }
    setEditingCardIndex(null);
  };

  const handleGenerateStudyTools = async () => {
    setIsGeneratingTools(true);
    try {
      const generatedData = await generateStudyTools(result.notes);
      if (onUpdate) {
        onUpdate({
          ...result,
          revisionPoints: generatedData.revisionPoints || [],
          questions: generatedData.questions || {},
          isManual: false // Unflag so it shows all tabs properly if needed
        });
      }
      alert("Study tools generated successfully! Check the Flashcards and Expected Questions tabs.");
      setViewMode("flashcards");
    } catch (err) {
      alert(err.message || "Failed to generate study tools. Please try again.");
    } finally {
      setIsGeneratingTools(false);
    }
  };

  const handleCopilot = async (instruction) => {
    setCopilotLoading(true);
    try {
      const improvedText = await improveText(selectedText, instruction);
      const newMarkdown = result.notes.replace(selectedText, improvedText);
      if (onUpdate) {
        onUpdate({
          ...result,
          notes: newMarkdown
        });
      }
      if (isEditingNotes) {
        setTempNotesContent(newMarkdown);
      }
      setShowEli5Btn(false);
      window.getSelection().removeAllRanges();
    } catch (err) {
      alert(err.message || "Failed to improve text. Please try again.");
    } finally {
      setCopilotLoading(false);
    }
  };

  if (!result) {
    return null;
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(result.notes || "No notes available.");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextCard = () => {
    if (!result.revisionPoints?.length) return;
    setIsFlipped(false);
    setTimeout(() => setActiveCard((prev) => (prev + 1) % result.revisionPoints.length), 150);
  };
  
  const prevCard = () => {
    if (!result.revisionPoints?.length) return;
    setIsFlipped(false);
    setTimeout(() => setActiveCard((prev) => (prev - 1 + result.revisionPoints.length) % result.revisionPoints.length), 150);
  };

  return (
    <div className="mt-6 p-4 space-y-10 bg-white rounded-xl printable-result relative">
      
      {/* ELI5 Floating Action Button */}
      <AnimatePresence>
        {showEli5Btn && !eli5Loading && !eli5Result && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 eli5-container no-print"
            style={{ left: popupPos.x, top: popupPos.y, transform: 'translate(-50%, -100%)' }}
          >
            <div className="flex gap-2">
              <button 
                onClick={handleExplain}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:scale-105 transition whitespace-nowrap"
              >
                <FaLightbulb /> ELI5
              </button>
              <button 
                onClick={() => { setShowExpandModal(true); setShowEli5Btn(false); }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:scale-105 transition whitespace-nowrap"
              >
                ➕ Deep Dive
              </button>
              {result.isManual && (
                <>
                  <button 
                    onClick={() => handleCopilot("Improve the grammar, clarity, and professional tone of this text.")}
                    disabled={copilotLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:scale-105 transition whitespace-nowrap disabled:opacity-50"
                  >
                    {copilotLoading ? <FaSpinner className="animate-spin" /> : "✨ Improve"}
                  </button>
                  <button 
                    onClick={() => handleCopilot("Summarize this text into a concise, easy-to-read paragraph.")}
                    disabled={copilotLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:scale-105 transition whitespace-nowrap disabled:opacity-50"
                  >
                    {copilotLoading ? <FaSpinner className="animate-spin" /> : "📝 Summarize"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ELI5 Modal Result */}
      <AnimatePresence>
        {(eli5Loading || eli5Result) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print eli5-container"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-100"
            >
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2 text-lg"><FaLightbulb /> Explain Like I'm 5</h3>
                <button onClick={closeEli5} className="hover:bg-white/20 p-1 rounded-full transition"><FaTimes /></button>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400 mb-4 pb-4 border-b border-gray-100 line-clamp-3 italic">
                  "{selectedText}"
                </div>
                
                {eli5Loading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-amber-500">
                    <FaSpinner className="animate-spin text-4xl mb-4" />
                    <p className="font-medium animate-pulse">Simplifying magic in progress...</p>
                  </div>
                ) : (
                  <div className="prose text-gray-700 leading-relaxed text-lg font-medium">
                    <ReactMarkdown>{eli5Result}</ReactMarkdown>
                  </div>
                )}
                
                {!eli5Loading && (
                  <div className="mt-8 text-right">
                    <button onClick={closeEli5} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
                      Got it!
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Modal Result */}
      <AnimatePresence>
        {showExpandModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print eli5-container"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-indigo-100"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2 text-lg">➕ Expand Note Section</h3>
                <button onClick={() => {setShowExpandModal(false); setExpandInstruction("");}} className="hover:bg-white/20 p-1 rounded-full transition"><FaTimes /></button>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400 mb-4 pb-4 border-b border-gray-100 line-clamp-3 italic">
                  "{selectedText}"
                </div>
                
                {expandLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-indigo-500">
                    <FaSpinner className="animate-spin text-4xl mb-4" />
                    <p className="font-medium animate-pulse">Expanding section... this might take a moment.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What specific details do you want to add?</label>
                    <textarea 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4 min-h-[100px] text-gray-700"
                      placeholder="e.g. Include real world examples, go deeper into the math, explain the history behind this..."
                      value={expandInstruction}
                      onChange={(e) => setExpandInstruction(e.target.value)}
                    />
                    <div className="text-right flex gap-3 justify-end">
                      <button onClick={() => {setShowExpandModal(false); setExpandInstruction("");}} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
                        Cancel
                      </button>
                      <button onClick={handleExpandSelection} disabled={!expandInstruction.trim()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center gap-2">
                        <FaBolt /> Generate Expansion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & CONTROLS - Hidden when printing */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 no-print border-b border-gray-100 pb-6">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          📘 Note Contents
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button onClick={() => setViewMode("detailed")} className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === 'detailed' ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-black'}`}>Detailed</button>
            {!result.isManual && (
              <>
                <button onClick={() => setViewMode("quick")} className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === 'quick' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:text-black'}`}><FaBolt className="inline mr-1"/> Quick</button>
                <button onClick={() => setViewMode("flashcards")} className={`px-4 py-2 rounded-md text-sm font-semibold transition ${viewMode === 'flashcards' ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-black'}`}><FaLayerGroup className="inline mr-1"/> Flashcards</button>
              </>
            )}
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button 
              onClick={handleAudio} 
              className={`px-3 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${isSpeaking && !isPaused ? 'bg-amber-100 text-amber-700 shadow' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
              title={isSpeaking ? (isPaused ? "Resume Audio" : "Pause Audio") : "Play Audio Notes"}
            >
              {isSpeaking ? (isPaused ? <FaPlay /> : <FaPause />) : <FaHeadphones />}
            </button>
            {isSpeaking && (
              <button 
                onClick={stopAudio} 
                className="px-3 py-2 rounded-md text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-gray-200 transition flex items-center"
                title="Stop Audio"
              >
                <FaStop />
              </button>
            )}
          </div>
          
          <button onClick={handleCopyMarkdown} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 transition">
            <FaCopy /> {copied ? "Copied!" : "Copy MD"}
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 shadow-md transition">
            <FaPrint /> Export PDF
          </button>
        </div>
      </div>

      {/* FLASHCARDS MODE */}
      {viewMode === "flashcards" && (
        <section className="flex flex-col items-center justify-center py-10 no-print">
          <h3 className="text-xl font-bold text-gray-700 mb-6">Interactive Flashcards ({result.revisionPoints?.length ? activeCard + 1 : 0} / {result.revisionPoints?.length || 0})</h3>
          
          {result.revisionPoints?.length > 0 ? (
          <>
            <div className="relative w-full max-w-lg h-64 perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
              <motion.div 
                className="w-full h-full relative preserve-3d transition-transform duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
              >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center p-8 border border-white/20">
                  <p className="text-white text-xl font-medium text-center">Point {activeCard + 1} 🤔</p>
                  <span className="absolute bottom-4 text-white/50 text-xs uppercase tracking-widest">Click to reveal</span>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 border-2 border-indigo-100">
                  {editingCardIndex === activeCard ? (
                    <div className="w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                      <textarea 
                        className="w-full h-full p-4 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 resize-none"
                        value={tempCardContent}
                        onChange={(e) => setTempCardContent(e.target.value)}
                      />
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setEditingCardIndex(null)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold">Cancel</button>
                        <button onClick={() => handleSaveCard(activeCard)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2"><FaSave /> Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 text-lg text-center leading-relaxed font-medium">{result.revisionPoints[activeCard]}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTempCardContent(result.revisionPoints[activeCard]); setEditingCardIndex(activeCard); setIsFlipped(true); }}
                        className="absolute top-4 right-4 p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                        title="Edit Flashcard"
                      >
                        <FaEdit />
                      </button>
                      <span className="absolute bottom-4 text-indigo-300 text-xs uppercase tracking-widest">Click to flip back</span>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button onClick={prevCard} className="px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 font-medium transition text-gray-700 shadow-sm border border-gray-200">← Prev</button>
              <button onClick={nextCard} className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 font-medium transition text-white shadow-md">Next →</button>
            </div>
          </>
          ) : (
            <p className="text-gray-500">No revision points available for this note.</p>
          )}
        </section>
      )}

      {/* QUICK REVISION MODE */}
      {viewMode === "quick" && (
        <section className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8 shadow-sm print-section">
          <SectionHeader icon="⚡" title="Quick Exam Revision" color="green" />
          {result.revisionPoints?.length > 0 ? (
            <ul className="list-disc ml-6 mt-4 space-y-3 text-gray-800 text-lg">
              {result.revisionPoints.map((p, i) => <li key={i} className="pl-2">{p}</li>)}
            </ul>
          ) : (
            <p className="text-gray-500 mt-4">No revision points available for this note.</p>
          )}
        </section>
      )}

      {/* DETAILED MODE */}
      {viewMode === "detailed" && (
        <div className="space-y-10">
          {result.subTopics && (
          <section className="print-section">
            <SectionHeader icon="⭐" title="Prioritized Topics" color="indigo" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {Object.entries(result.subTopics).map(([star, topics]) => (
                <div key={star} className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                  <p className="font-bold text-indigo-700 mb-3 text-lg flex items-center gap-2">{star} Priority</p>
                  <ul className="list-disc ml-4 text-gray-700 space-y-1 text-sm">
                    {topics.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          )}

          <section className="print-section" onMouseUp={handleSelection} onTouchEnd={handleSelection}>
            {result.isManual && (
              <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl shadow-sm text-center no-print">
                <h4 className="text-lg font-bold text-indigo-900 mb-2">Turn Your Notes Into Study Tools!</h4>
                <p className="text-sm text-indigo-700/80 mb-4 max-w-lg mx-auto">Let AI automatically read your manual notes and generate interactive flashcards, expected questions, and revision points.</p>
                <button 
                  onClick={handleGenerateStudyTools}
                  disabled={isGeneratingTools || !result.notes || result.notes.includes("Start typing")}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingTools ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  {isGeneratingTools ? "Generating Tools..." : "✨ Generate Study Tools"}
                </button>
              </div>
            )}
            <div className="flex justify-between items-start">
              <SectionHeader icon="📝" title="Detailed Notes" color="purple" />
              {!isEditingNotes ? (
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={handleOpenReorder}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200 transition flex items-center gap-2"
                  >
                    <FaArrowsAltV /> Reorder Sections
                  </button>
                  <button 
                    onClick={() => { setTempNotesContent(result.notes); setIsEditingNotes(true); }}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition flex items-center gap-2"
                  >
                    <FaEdit /> Edit Notes
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setIsEditingNotes(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition">Cancel</button>
                  <button onClick={handleSaveNotes} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition flex items-center gap-2">
                    <FaSave /> Save
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white border border-purple-100/50 shadow-sm rounded-xl p-8 prose max-w-none text-gray-800">
              {isEditingNotes ? (
                <div className="no-print custom-mde-editor">
                  <SimpleMDE 
                    value={tempNotesContent} 
                    onChange={setTempNotesContent} 
                    options={simpleMdeOptions} 
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageUploading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition flex items-center gap-2 border border-gray-200"
                    >
                      {imageUploading ? <FaSpinner className="animate-spin" /> : <FaImage />}
                      {imageUploading ? "Uploading..." : "Insert Image"}
                    </button>
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
              ) : (
                <ReactMarkdown components={markDownComponent}>{result.notes}</ReactMarkdown>
              )}
            </div>
            <p className="text-xs text-purple-400/80 mt-2 italic no-print text-center">💡 Tip: Highlight any complex text to have AI explain it like you're 5, or deep dive to add more context!</p>
            
            {/* Add Section Input */}
            <div className="mt-6 border-t border-purple-100 pt-6 no-print">
              <label className="block text-sm font-bold text-gray-700 mb-2">➕ Add a New Section</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Add a section about advanced use cases..."
                  value={sectionInstruction}
                  onChange={(e) => setSectionInstruction(e.target.value)}
                  disabled={sectionLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSection();
                  }}
                />
                <button 
                  onClick={handleAddSection}
                  disabled={sectionLoading || !sectionInstruction.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"
                >
                  {sectionLoading ? <FaSpinner className="animate-spin" /> : 'Add'}
                </button>
              </div>
            </div>
          </section>

          {result.diagram?.data && (
            <section className="print-section">
              <SectionHeader icon="📊" title="Concept Diagram" color="cyan" />
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm overflow-x-auto">
                <MermaidSetup diagram={result.diagram?.data} />
              </div>
            </section>
          )}

          {result.charts?.length > 0 && (
            <section className="print-section">
              <SectionHeader icon="📈" title="Visual Data" color="indigo" />
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <RechartSetUp charts={result.charts} />
              </div>
            </section>
          )}

          {result.questions && (
          <section className="print-section bg-rose-50/30 rounded-xl p-8 border border-rose-100/50">
            <SectionHeader icon="❓" title="Expected Questions" color="rose" />
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              {result.questions.short?.length > 0 && (
              <div>
                <p className="font-bold text-rose-800 mb-3 text-lg">Short Answer:</p>
                <ul className="list-disc ml-5 text-gray-800 space-y-2">
                  {result.questions.short.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
              )}
              {result.questions.long?.length > 0 && (
              <div>
                <p className="font-bold text-rose-800 mb-3 text-lg">Long Answer:</p>
                <ul className="list-disc ml-5 text-gray-800 space-y-2">
                  {result.questions.long.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
              )}
            </div>
            {result.questions.diagram && (
              <div className="mt-6 pt-4 border-t border-rose-100">
                <p className="font-bold text-rose-800 mb-2">Diagram Question:</p>
                <p className="text-gray-800 bg-white p-4 rounded-lg border border-rose-100 shadow-sm">{result.questions.diagram}</p>
              </div>
            )}
          </section>
          )}
        </div>
      )}

      {/* Section Reorder Modal */}
      <AnimatePresence>
        {showReorderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-indigo-100"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                <h3 className="font-bold flex items-center gap-2 text-lg"><FaArrowsAltV /> Reorder Sections</h3>
                <button onClick={() => setShowReorderModal(false)} className="hover:bg-white/20 p-1 rounded-full transition"><FaTimes /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                <p className="text-sm text-gray-500 mb-4 text-center">Use the arrows to move sections up or down. Click save when you're done.</p>
                <div className="space-y-3">
                  {reorderSections.map((section, idx) => {
                    // Extract the first line to show as title
                    const lines = section.trim().split('\n');
                    const title = lines[0].substring(0, 60) + (lines[0].length > 60 ? '...' : '');
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition">
                        <div className="flex-1 font-medium text-gray-700 truncate pr-4">
                          {title || "Untitled Section"}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition"
                          >
                            <FaArrowUp />
                          </button>
                          <button 
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === reorderSections.length - 1}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-600 transition"
                          >
                            <FaArrowDown />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowReorderModal(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition">Cancel</button>
                <button onClick={handleSaveReorder} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center gap-2">
                  <FaSave /> Save Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default FinalResult;


function SectionHeader({ icon, title, color }) {  // this is for make the sub heading beatuful
    const colors = {
        indigo: "from-indigo-100 to-indigo-50 text-indigo-700",
        purple: "from-purple-100 to-purple-50 text-purple-700",
        blue: "from-blue-100 to-blue-50 text-blue-700",
        green: "from-green-100 to-green-50 text-green-700",
        cyan: "from-cyan-100 to-cyan-50 text-cyan-700",
        rose: "from-rose-100 to-rose-50 text-rose-700",
    };
    return (
        <div className={`
        mb-4 px-4 py-2 rounded-lg
        bg-gradient-to-r ${colors[color]}
        font-semibold flex items-center gap-2
      `}>
            <span>{icon}</span>
            <span>{title}</span>
        </div>

    )
}