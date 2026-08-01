import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaCopy, FaSearch, FaGlobe, FaTag } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { mockCommunityNotes } from "../data/mockCommunityNotes";

function Explore() {
  const navigate = useNavigate();
  const [publicNotes, setPublicNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Extract unique categories from both mock and local public notes
  const categories = ["All", ...new Set(publicNotes.map(n => n.category || "Uncategorized"))];

  useEffect(() => {
    // Fetch all notes from local history and filter for visibility === 'public'
    const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
    const localPublic = history.filter(note => note.visibility === 'public');
    
    // Merge mock notes and local public notes
    // We prioritize local notes if they somehow have the same ID
    const merged = [...localPublic, ...mockCommunityNotes];
    setPublicNotes(merged);
  }, []);

  const handleClone = (e, note) => {
    e.stopPropagation();
    
    // Duplicate the note but remove the public flag so it's private to the user
    const clonedNote = {
      ...note,
      _id: Date.now().toString(),
      topic: `${note.topic} (Clone)`,
      visibility: 'private',
      createdAt: new Date().toISOString(),
      collaborators: []
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
    localStorage.setItem('prepgen_history', JSON.stringify([clonedNote, ...existingHistory]));
    
    // Re-initialize SRS flashcards for the clone
    import('../services/srs').then(module => {
      module.initCardsForNote(clonedNote);
    }).catch(err => console.error("SRS Init Error:", err));
    
    alert(`Successfully cloned "${note.topic}" to your Workspace!`);
    navigate('/workspace', { state: { noteId: clonedNote._id } });
  };

  const filteredNotes = publicNotes.filter(note => {
    const matchesSearch = note.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (note.category && note.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || (note.category || "Uncategorized") === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="pt-32 px-8 max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <FaGlobe className="text-indigo-600" /> Community Explore
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Discover and clone public notes from the PrepGen community.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search subjects or topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white shadow-sm"
            />
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {publicNotes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Public Notes Yet</h3>
            <p className="text-gray-500">Be the first to share your knowledge! Go to your Workspace, click Share, and set a note to Public.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={note._id}
                  className="break-inside-avoid bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                  onClick={() => navigate('/workspace', { state: { noteId: note._id, isCommunity: true } })}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition">{note.topic}</h3>
                    <div className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md flex items-center gap-1">
                      <FaGlobe size={10} /> Public
                    </div>
                  </div>
                  
                  {note.category && (
                    <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                      <FaTag size={10} /> {note.category}
                    </div>
                  )}
                  
                  {/* Content Preview */}
                  <div className="text-sm text-gray-500 mb-6 line-clamp-4 relative">
                    {note.content?.notes?.substring(0, 200)}...
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                  </div>
                  
                  {/* Tags */}
                  <div className='flex flex-wrap gap-2 mb-6 text-xs'>
                    {note.classLevel && (
                      <span className='px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium'>
                        {note.classLevel}
                      </span>
                    )}
                    {note.examType && (
                      <span className='px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium'>
                        {note.examType}
                      </span>
                    )}
                    {note.content?.revisionPoints?.length > 0 && (
                      <span className='px-2 py-1 rounded-md bg-purple-50 text-purple-600 font-medium'>
                        {note.content.revisionPoints.length} Flashcards
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {/* Simulated Avatars */}
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm">
                        {note.topic.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleClone(e, note)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm"
                    >
                      <FaCopy /> Clone
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredNotes.length === 0 && publicNotes.length > 0 && (
              <p className="text-gray-500 text-center col-span-full py-10">No public notes match your search or filter.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
