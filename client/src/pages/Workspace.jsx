import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FinalResult from '../components/FinalResult';
import AIChat from '../components/AIChat';
import { FaChevronLeft, FaChevronRight, FaFolderOpen, FaArrowRight, FaShareAlt, FaGlobe, FaLock, FaTimes, FaUserPlus, FaSpinner, FaDownload, FaListUl } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';
import { getFile } from '../services/fileStorage';

const Workspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNote, setActiveNote] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [toc, setToc] = useState([]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  useEffect(() => {
    // Check if a note ID was passed via router state
    const noteId = location.state?.noteId;
    const isCommunity = location.state?.isCommunity;
    
    if (isCommunity && noteId) {
       // First check mock notes
       import('../data/mockCommunityNotes').then(module => {
         const mockNote = module.mockCommunityNotes.find(n => n._id === noteId);
         if (mockNote) {
           setActiveNote({ ...mockNote, isReadOnlyCommunity: true });
         } else {
           // Fallback to history if not in mock (i.e. someone else's real public note)
           const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
           const note = history.find(n => n._id === noteId);
           if (note) setActiveNote({ ...note, isReadOnlyCommunity: true });
         }
       });
       return;
    }
    
    const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
    
    if (noteId) {
      const note = history.find(n => n._id === noteId);
      if (note) {
        setActiveNote(note);
      } else if (history.length > 0) {
        // Fallback to most recent if ID not found
        setActiveNote(history[0]);
      }
    } else if (history.length > 0) {
      // Default to most recent note if no ID passed
      setActiveNote(history[0]);
    }
  }, [location.state]);

  const handleToggleVisibility = () => {
    if (!activeNote) return;
    const newVisibility = activeNote.visibility === 'public' ? 'private' : 'public';
    const updatedNote = { ...activeNote, visibility: newVisibility };
    
    // Update local state & localStorage
    setActiveNote(updatedNote);
    const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
    const updatedHistory = history.map(n => n._id === updatedNote._id ? updatedNote : n);
    localStorage.setItem('prepgen_history', JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    let objectUrl = null;
    if (activeNote && activeNote.fileId) {
      setFileLoading(true);
      getFile(activeNote.fileId).then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
        setFileLoading(false);
      }).catch(err => {
        console.error("Failed to load file:", err);
        setFileLoading(false);
      });
    } else {
      setFileUrl(null);
    }
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeNote]);

  // Extract Table of Contents from activeNote Markdown
  useEffect(() => {
    if (activeNote && activeNote.content && activeNote.content.notes) {
      const markdown = activeNote.content.notes;
      const extractedToc = [];
      const regex = /^(#{1,3})\s+(.+)$/gm;
      let match;
      while ((match = regex.exec(markdown)) !== null) {
        extractedToc.push({
          level: match[1].length,
          text: match[2].trim(),
          id: match[2].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
      }
      setToc(extractedToc);
    } else {
      setToc([]);
    }
  }, [activeNote]);

  const handleInvite = () => {
    if (!activeNote || !inviteEmail.trim()) return;
    
    const newCollaborator = { email: inviteEmail, role: inviteRole };
    const collaborators = activeNote.collaborators || [];
    const updatedNote = { ...activeNote, collaborators: [...collaborators, newCollaborator] };
    
    setActiveNote(updatedNote);
    const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
    const updatedHistory = history.map(n => n._id === updatedNote._id ? updatedNote : n);
    localStorage.setItem('prepgen_history', JSON.stringify(updatedHistory));
    
    setInviteEmail("");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-white">
      {/* Top Navigation Bar */}
      <div className="flex-none z-50 no-print">
        <Navbar />
      </div>

      {/* Main Workspace Area (below Navbar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* TOC Sidebar */}
        <div 
          className={`
            fixed left-0 top-[80px] bottom-0 lg:static 
            h-[calc(100vh-80px)] lg:h-full 
            w-[85vw] sm:w-[300px]
            z-40 lg:z-0
            no-print
            bg-gradient-to-b from-indigo-50/30 to-white border-r border-indigo-100 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0 custom-scrollbar
            transition-all duration-300 ease-in-out
            ${isTocOpen ? 'translate-x-0 lg:w-[300px]' : '-translate-x-full lg:w-0 lg:opacity-0 lg:translate-x-0'}
          `}
        >
          {/* Mobile Overlay Background */}
          <div 
            className={`lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 ${isTocOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
            onClick={() => setIsTocOpen(false)}
          />
          <div className="p-5 w-[85vw] sm:w-[300px]">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-md mb-6 flex items-center gap-3">
                  <FaListUl className="text-lg opacity-90" />
                  <h3 className="font-bold text-sm tracking-wide uppercase opacity-95">Document Outline</h3>
                </div>
                
                {toc.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 italic">No headings found in this document.</p>
                  </div>
                ) : (
                  <ul className="space-y-1 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-indigo-100 before:-z-0 z-10">
                    {toc.map((item, idx) => (
                      <li key={idx} className="relative group z-10">
                        <a 
                          href={`#${item.id}`} 
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(item.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          style={{ paddingLeft: `${(item.level - 1) * 16 + 32}px` }}
                          className={`py-2 pr-3 block truncate rounded-lg transition-all duration-200 text-sm
                            ${item.level === 1 
                              ? 'font-bold text-indigo-900 mt-3 mb-1 bg-white shadow-sm border border-indigo-50 hover:border-indigo-200 hover:shadow-md hover:text-indigo-700' 
                              : 'text-gray-600 font-medium hover:text-indigo-600 hover:bg-indigo-50'
                            }
                          `}
                        >
                          {/* Tree node dot */}
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-sm z-20 transition-colors
                            ${item.level === 1 ? 'w-3.5 h-3.5 bg-indigo-600 left-[5.5px]' : 'w-2.5 h-2.5 bg-purple-300 left-[6px] group-hover:bg-indigo-500'}
                          `} />
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
        </div>

        {/* LEFT PANE: Document Viewer */}
        <div className={`h-full transition-all duration-300 ease-in-out ${isChatOpen ? 'lg:w-2/3' : 'w-full'} overflow-y-auto bg-gray-50/50 p-4 lg:p-8 custom-scrollbar`}>
          
          <div className="mb-6 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/history')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition px-2 py-1">
                <FaChevronLeft /> Back to Library
              </button>
              {toc.length > 0 && (
                <button 
                  onClick={() => setIsTocOpen(!isTocOpen)} 
                  className="ml-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <FaListUl className="text-indigo-600" /> {isTocOpen ? 'Hide Outline' : 'Show Outline'}
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {activeNote && !activeNote.isReadOnlyCommunity && (
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition"
                >
                  <FaShareAlt /> Share
                </button>
              )}
              {activeNote && activeNote.isReadOnlyCommunity && (
                <button 
                  onClick={() => {
                    const clonedNote = {
                      ...activeNote,
                      _id: Date.now().toString(),
                      topic: `${activeNote.topic} (Clone)`,
                      visibility: 'private',
                      createdAt: new Date().toISOString(),
                      collaborators: []
                    };
                    delete clonedNote.isReadOnlyCommunity;
                    
                    const existingHistory = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
                    localStorage.setItem('prepgen_history', JSON.stringify([clonedNote, ...existingHistory]));
                    
                    import('../services/srs').then(module => {
                      module.initCardsForNote(clonedNote);
                    }).catch(err => console.error("SRS Init Error:", err));
                    
                    alert(`Successfully cloned "${activeNote.topic}" to your Workspace!`);
                    navigate('/workspace', { state: { noteId: clonedNote._id } });
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition"
                >
                  Clone to Edit
                </button>
              )}
              {/* Mobile Toggle Chat Button */}
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="lg:hidden px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm shadow-sm"
              >
                {isChatOpen ? 'Close Chat' : 'Open Assistant'}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full h-full pb-20">
            {activeNote ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={activeNote._id} // force re-render on note change
                className="h-full"
              >
                {activeNote.fileId ? (
                  <div className="mt-6 bg-white rounded-xl shadow-sm p-4 h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                       <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">📄 {activeNote.topic}</h2>
                       {fileUrl && (
                         <a href={fileUrl} download={activeNote.topic} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
                           <FaDownload /> Download File
                         </a>
                       )}
                    </div>
                    {fileLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-indigo-500">
                        <FaSpinner className="animate-spin text-4xl mb-4" />
                        <p className="font-medium animate-pulse">Loading document from secure storage...</p>
                      </div>
                    ) : fileUrl ? (
                      <div className="flex-1 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {activeNote.fileType === 'application/pdf' ? (
                          <iframe src={fileUrl} className="w-full h-full" title="PDF Viewer" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <FaFolderOpen className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700">Preview Not Available</h3>
                            <p className="text-gray-500 mt-2 max-w-md">Your browser does not natively support previewing this file type ({activeNote.fileType}). Please use the download button above to view it in its native application.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center text-red-500">
                         <FaTimes className="text-4xl mb-2" />
                         <p>Could not load the file. It may have been deleted.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <FinalResult 
                    result={activeNote.content} 
                    noteId={activeNote._id}
                    onUpdate={(updatedContent) => {
                      if (activeNote.isReadOnlyCommunity) {
                        alert("This is a Community Note. Please click 'Clone to Edit' at the top to save your changes.");
                        return;
                      }
                      // Update local state
                      const updatedNote = { ...activeNote, content: updatedContent };
                      setActiveNote(updatedNote);
                      
                      // Update localStorage
                      const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
                      const updatedHistory = history.map(n => n._id === updatedNote._id ? updatedNote : n);
                      localStorage.setItem('prepgen_history', JSON.stringify(updatedHistory));
  
                      // Add new flashcards to SRS system
                      import('../services/srs').then(module => {
                        module.initCardsForNote(updatedNote);
                      }).catch(err => console.error("SRS Init Error:", err));
                    }} 
                  />
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <FaFolderOpen className="text-6xl text-gray-200 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">No active document</h2>
                <p className="text-gray-500 mt-2">Generate a new note or select one from your history.</p>
                <button onClick={() => navigate('/notes')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition flex items-center gap-2">
                  Create Note <FaArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Persistent AI Chat */}
        <div 
          className={`
            fixed right-0 top-[80px] bottom-0 lg:static 
            h-[calc(100vh-80px)] lg:h-full 
            w-[85vw] sm:w-[380px]
            z-40 lg:z-0
            no-print
            transition-all duration-300 ease-in-out 
            ${isChatOpen ? 'translate-x-0 lg:w-1/3' : 'translate-x-full lg:w-0 lg:opacity-0 lg:translate-x-0'}
            shadow-[-20px_0_40px_rgba(0,0,0,0.2)] lg:shadow-none
          `}
        >
          {/* Mobile Overlay Background */}
          <div 
            className={`lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
            onClick={() => setIsChatOpen(false)}
          />
          
          <div className="w-full h-full bg-white relative">
            <AIChat activeNote={activeNote} />
          </div>
        </div>
      </div>

      {/* Persistent Chat Toggle Button (Always visible) */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`
          flex
          no-print
          absolute top-1/2 -translate-y-1/2
          w-8 h-16 bg-white border border-gray-200 shadow-md rounded-l-xl
          items-center justify-center text-gray-400 hover:text-indigo-600 transition-all duration-300 ease-in-out
          z-50
          ${isChatOpen ? 'right-[85vw] sm:right-[380px] lg:right-[33.333333%]' : 'right-0'}
        `}
        style={{ transform: 'translateY(-50%)' }}
        title={isChatOpen ? "Collapse Chat" : "Expand Chat"}
      >
        <FaChevronLeft className={`transition-transform duration-300 ${isChatOpen ? '' : 'rotate-180'}`} />
      </button>

      {/* Persistent TOC Toggle Button (Always visible) */}
      {toc.length > 0 && (
        <button
          onClick={() => setIsTocOpen(!isTocOpen)}
          className={`
            flex
            no-print
            absolute top-1/2 -translate-y-1/2
            w-8 h-16 bg-white border border-gray-200 shadow-md rounded-r-xl
            items-center justify-center text-gray-400 hover:text-indigo-600 transition-all duration-300 ease-in-out
            z-50
            ${isTocOpen ? 'left-[85vw] sm:left-[300px]' : 'left-0'}
          `}
          style={{ transform: 'translateY(-50%)' }}
          title={isTocOpen ? "Hide Outline" : "Show Outline"}
        >
          <FaChevronRight className={`transition-transform duration-300 ${isTocOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaShareAlt className="text-indigo-600" /> Share Note
                </h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Visibility Toggle */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Visibility</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeNote?.visibility === 'public' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                        {activeNote?.visibility === 'public' ? <FaGlobe /> : <FaLock />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{activeNote?.visibility === 'public' ? 'Public (Community Feed)' : 'Private'}</p>
                        <p className="text-xs text-gray-500">{activeNote?.visibility === 'public' ? 'Anyone can explore and clone this note.' : 'Only you and collaborators can view.'}</p>
                      </div>
                    </div>
                    
                    {/* Toggle switch */}
                    <button 
                      onClick={handleToggleVisibility}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activeNote?.visibility === 'public' ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activeNote?.visibility === 'public' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Invite Collaborators */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2"><FaUserPlus /> Invite Collaborators (Simulated)</h4>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="email" 
                      placeholder="Email address..." 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select 
                      value={inviteRole} 
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="commenter">Commenter</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button 
                      onClick={handleInvite}
                      disabled={!inviteEmail.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      Invite
                    </button>
                  </div>
                  
                  {/* Collaborator List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">YOU</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">You (Owner)</p>
                        </div>
                      </div>
                    </div>
                    {activeNote?.collaborators?.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
                            {c.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{c.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{c.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workspace;
