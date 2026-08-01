import React, { useEffect, useState, useRef } from 'react'
import { historyNotesData } from '../services/api'
import { AnimatePresence, motion } from "motion/react"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { GiHamburgerMenu } from "react-icons/gi"
import { FaTrash } from "react-icons/fa"
import FinalResult from '../components/FinalResult'
import { saveFile } from '../services/fileStorage'

function History() {
  // ============ STATE MANAGEMENT ============
  const [historyDATA, setHistoryDATA] = useState([])          // Current page notes
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)   // Mobile sidebar toggle
  const [activeNoteId, setActiveNoteId] = useState(null)      // Selected note ID
  const [selectedNote, setSelectedNote] = useState(null)      // Selected note data
  const [loading, setLoading] = useState(false)               // Loading state
  const fileInputRef = useRef(null)
  
  // ============ PAGINATION STATE ============
  const [currentPage, setCurrentPage] = useState(1)           // Current page number
  const [totalPages, setTotalPages] = useState(1)             // Total pages available
  const [totalNotes, setTotalNotes] = useState(0)             // Total notes count
  const [hasNextPage, setHasNextPage] = useState(false)       // Can go next?
  const [hasPrevPage, setHasPrevPage] = useState(false)       // Can go back?
  
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const credits = userData?.credits || 0

  const ITEMS_PER_PAGE = 10  // How many notes per page

  // ============ FETCH HISTORY WITH PAGINATION ============
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        console.log("Fetching page:", currentPage)
        
        // Call API with current page
        const data = await historyNotesData(currentPage, ITEMS_PER_PAGE)
        
        // Update all state
        setHistoryDATA(data.historyData)
        setTotalPages(data.totalPages)
        setTotalNotes(data.total)
        setHasNextPage(data.hasNextPage)
        setHasPrevPage(data.hasPrevPage)
        
        console.log("Loaded:", data.historyData.length, "notes")
        
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [currentPage])  // Re-fetch when page changes

  // ============ SIDEBAR AUTO-OPEN ON DESKTOP ============
  useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  };

  // Run once on mount
  handleResize();

  // Listen for resize
  window.addEventListener("resize", handleResize);

  // Cleanup
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);


  // ============ OPEN NOTE HANDLER ============
  const openNote = (note) => {
    navigate('/workspace', { state: { noteId: note._id } });
  }
  const handleDeleteNote = (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) return;

    const existingHistory = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
    const updatedHistory = existingHistory.filter(note => note._id !== noteId);
    localStorage.setItem('prepgen_history', JSON.stringify(updatedHistory));
    
    // Refresh UI
    setHistoryDATA(prev => prev.filter(note => note._id !== noteId));
    setTotalNotes(prev => prev - 1);
    
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      setSelectedNote(null);
    }
  };

  // ============ UPLOAD FILE HANDLER ============
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileId = await saveFile(file);
      
      const newNote = {
        _id: Date.now().toString(),
        topic: file.name,
        createdAt: new Date().toISOString(),
        fileId: fileId,
        fileType: file.type,
        content: {
          isManual: true,
          isFileNote: true
        }
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
      localStorage.setItem('prepgen_history', JSON.stringify([newNote, ...existingHistory]));
      
      // Navigate to Workspace immediately
      navigate('/workspace', { state: { noteId: newNote._id } });
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. " + err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ============ PAGINATION HANDLERS ============
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setActiveNoteId(null)      // Clear selection when changing page
      setSelectedNote(null)
    }
  }

  const goToNextPage = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (hasPrevPage) {
      handlePageChange(currentPage - 1)
    }
  }

  const goToFirstPage = () => {
    handlePageChange(1)
  }

  const goToLastPage = () => {
    handlePageChange(totalPages)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-8'>
      
      {/* ============ HEADER ============ */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-6 items-start flex justify-between md:items-center gap-4 flex-wrap shadow-[0_20px_45px_rgba(0,0,0,0.6)] no-print"
      >
        <div onClick={() => navigate("/")} className='cursor-pointer'>
          <h1 className='text-2xl font-bold bg-linear-to-r from-white via-gray-300 to-white bg-clip-text text-transparent'>
            ExamNotes AI
          </h1>
          <p className='text-sm text-gray-300 mt-1'>AI-powered exam-oriented notes & revision</p>
        </div>
      
        <div className='flex items-center gap-4'>
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className='lg:hidden text-white text-2xl'>
              <GiHamburgerMenu/>
            </button>
          )}
          <button 
            className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm' 
            onClick={() => navigate("/pricing")}
          >
            <span className='text-xl'>💠</span>
            <span>{credits}</span>
            <motion.span 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.97 }}
              className='ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-white text-xs font-bold'
            >
              ➕
            </motion.span>
          </button>
        </div>
      </motion.header>

      {/* ============ MAIN CONTENT GRID ============ */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        
        {/* ============ SIDEBAR ============ */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className='fixed lg:static top-0 left-0 z-50 lg:z-auto w-72 lg:w-auto h-full lg:h-[355vh] lg:rounded-3xl lg:col-span-1 bg-black/90 lg:bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.6)] p-5 overflow-y-auto no-print'
            >
              {/* Mobile back button */}
              <button onClick={() => setIsSidebarOpen(false)} className='lg:hidden text-white mb-4'>
                ⬅️ back
              </button>

              <div className='mb-4 space-y-1'>
                {/* New Notes Button */}
                <button 
                  onClick={() => navigate("/notes")} 
                  className='w-full px-3 py-2 rounded-lg text-sm text-gray-200 bg-white/10 text-start hover:bg-white/20 transition-all'
                >
                  ➕ New Notes
                </button>

                {/* Upload File Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className='w-full px-3 py-2 mt-2 rounded-lg text-sm text-gray-200 bg-indigo-600/30 text-start hover:bg-indigo-600/50 transition-all border border-indigo-500/30 flex items-center gap-2'
                >
                  📄 Upload File (PDF/PPT)
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".pdf,.ppt,.pptx,.doc,.docx" 
                  className="hidden" 
                />

                <hr className="border-white/10 my-4" />

                {/* Header with total count */}
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent'>
                    📚 Your Notes
                  </h2>
                  <span className='text-xs text-gray-400'>({totalNotes})</span>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                    <p className="text-sm text-gray-400 mt-2">Loading...</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && historyDATA.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No notes created yet</p>
                    <button 
                      onClick={() => navigate("/notes")} 
                      className='mt-4 px-4 py-2 rounded-lg text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-all'
                    >
                      Create Your First Note
                    </button>
                  </div>
                )}

                {/* Notes List */}
                {!loading && historyDATA.length > 0 && (
                  <>
                    <ul className='space-y-3'>
                      {historyDATA.map((note, i) => (
                        <li 
                          key={note._id} 
                          onClick={() => openNote(note)} 
                          className={`cursor-pointer rounded-xl p-3 border transition-all ${
                            activeNoteId === note._id
                              ? "bg-indigo-500/30 border-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.6)]"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div className='flex justify-between items-start'>
                            <p className='text-sm font-semibold text-white line-clamp-2 pr-2'>
                              {note.topic}
                            </p>
                            <button 
                              onClick={(e) => handleDeleteNote(e, note._id)}
                              className='text-gray-500 hover:text-red-400 p-1 rounded transition flex-shrink-0'
                              title="Delete Note"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>

                          {/* Tags */}
                          <div className='flex flex-wrap gap-2 mt-2 text-xs'>
                            {note.classLevel && (
                              <span className='px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300'>
                                Class: {note.classLevel}
                              </span>
                            )}
                            {note.examType && (
                              <span className='px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300'>
                                {note.examType}
                              </span>
                            )}
                          </div>

                          {/* Features */}
                          <div className='flex gap-3 mt-2 text-xs text-gray-300'>
                            {note.revisionMode && <span>⚡ Revision</span>}
                            {note.includeDiagram && <span>📊 Diagram</span>}
                            {note.includeChart && <span>📈 Chart</span>}
                          </div>

                          {/* Timestamp */}
                          {note.createdAt && (
                            <p className='text-xs text-gray-400 mt-2'>
                              {new Date(note.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* ============ PAGINATION CONTROLS ============ */}
                    {totalPages > 1 && (
                      <div className='mt-6 space-y-3'>
                        {/* Page Info */}
                        <div className='text-center text-sm text-gray-300'>
                          Page {currentPage} of {totalPages}
                        </div>

                        {/* Navigation Buttons */}
                        <div className='flex items-center justify-center gap-2'>
                          {/* First Page */}
                          <button
                            onClick={goToFirstPage}
                            disabled={!hasPrevPage}
                            className={`px-2 py-1.5 rounded-lg text-xs ${
                              !hasPrevPage
                                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                            title="First Page"
                          >
                            ⏮️
                          </button>

                          {/* Previous Page */}
                          <button
                            onClick={goToPrevPage}
                            disabled={!hasPrevPage}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                              !hasPrevPage
                                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            ← Prev
                          </button>
                          
                          {/* Next Page */}
                          <button
                            onClick={goToNextPage}
                            disabled={!hasNextPage}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                              !hasNextPage
                                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            Next →
                          </button>

                          {/* Last Page */}
                          <button
                            onClick={goToLastPage}
                            disabled={!hasNextPage}
                            className={`px-2 py-1.5 rounded-lg text-xs ${
                              !hasNextPage
                                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                            title="Last Page"
                          >
                            ⏭️
                          </button>
                        </div>

                        {/* Page Numbers (Optional - for desktop) */}
                        <div className='hidden md:flex items-center justify-center gap-1 flex-wrap'>
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1
                            // Show only nearby pages (current ± 2)
                            if (
                              pageNum === 1 || 
                              pageNum === totalPages || 
                              (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                    currentPage === pageNum
                                      ? "bg-indigo-500 text-white"
                                      : "bg-white/10 text-white hover:bg-white/20"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            } else if (
                              pageNum === currentPage - 3 || 
                              pageNum === currentPage + 3
                            ) {
                              return <span key={pageNum} className='text-gray-400'>...</span>
                            }
                            return null
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ CONTENT AREA ============ */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} 
          className='lg:col-span-3 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] p-6 min-h-[75vh] overflow-y-auto print:shadow-none print:p-0 print:bg-transparent print:col-span-4'
        >
          {/* Empty State - Dashboard Landing */}
          {!selectedNote && (
            <div className="h-full flex flex-col pt-12 items-center text-center no-print max-w-2xl mx-auto">
              
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white">
                <span className="text-5xl">📚</span>
              </div>
              
              <h2 className='text-4xl font-extrabold text-gray-800 mb-4 tracking-tight'>
                Welcome to your Library
              </h2>
              
              <p className='text-lg text-gray-500 mb-12 max-w-lg leading-relaxed'>
                Select a topic from the sidebar to open it in your AI Workspace, or create a brand new study guide right now.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
                  <span className="text-3xl mb-2">📄</span>
                  <p className="text-3xl font-bold text-indigo-600">{totalNotes}</p>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mt-1">Total Notes</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
                  <span className="text-3xl mb-2">🔥</span>
                  <p className="text-3xl font-bold text-orange-500">Active</p>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mt-1">Study Status</p>
                </div>
              </div>

              <motion.button 
                onClick={() => navigate("/notes")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] transition-all flex items-center gap-3"
              >
                <span>➕</span> Generate New Note
              </motion.button>
            </div>
          )}

          {/* Selected Note Display using FinalResult Component */}
          {selectedNote && (
            <div>
              {/* Note Header with Topic Info */}
              <div className='mb-4 pb-4 border-b border-gray-200'>
                <div className='flex items-start justify-between gap-4 flex-wrap'>
                  <div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                      {selectedNote.topic}
                    </h1>
                    
                    {/* Meta Info Tags */}
                    <div className='flex flex-wrap gap-2 text-sm'>
                      {selectedNote.classLevel && (
                        <span className='px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium'>
                          🎓 Class {selectedNote.classLevel}
                        </span>
                      )}
                      {selectedNote.examType && (
                        <span className='px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium'>
                          📝 {selectedNote.examType}
                        </span>
                      )}
                      {selectedNote.createdAt && (
                        <span className='px-3 py-1 rounded-full bg-gray-100 text-gray-700'>
                          📅 {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Back to List Button (Mobile) */}
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className='lg:hidden px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium no-print'
                  >
                    ← Back to List
                  </button>
                </div>

                {/* Feature Tags */}
                {(selectedNote.revisionMode || selectedNote.includeDiagram || selectedNote.includeChart) && (
                  <div className='flex gap-3 mt-3 text-sm text-gray-600 no-print'>
                    {selectedNote.revisionMode && (
                      <span className='flex items-center gap-1'>
                        ⚡ <span>Revision Mode</span>
                      </span>
                    )}
                    {selectedNote.includeDiagram && (
                      <span className='flex items-center gap-1'>
                        📊 <span>Includes Diagram</span>
                      </span>
                    )}
                    {selectedNote.includeChart && (
                      <span className='flex items-center gap-1'>
                        📈 <span>Includes Chart</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Render the note content using FinalResult component */}
              {selectedNote.content ? (
                <FinalResult result={selectedNote.content} />
              ) : (
                <div className='text-center py-12 text-gray-500'>
                  <p>Note content is not available</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default History