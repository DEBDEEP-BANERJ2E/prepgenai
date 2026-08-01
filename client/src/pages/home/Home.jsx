import React from "react";
import Navbar from "../../components/Navbar";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDueCards, initCardsForNote, getTotalCards } from "../../services/srs";
import img from "../../assets/img1.png"
import Features from "../../components/Features";
import Footer from "../../components/Footer";



function Home() {

  const navigate = useNavigate()
  const [dueCardsCount, setDueCardsCount] = useState(0);

  useEffect(() => {
    // Backfill: If the user has history but no SRS cards, initialize them
    if (getTotalCards() === 0) {
      const history = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
      history.forEach(note => initCardsForNote(note));
    }
    
    setDueCardsCount(getDueCards().length);
  }, []);


  const showcaseFeatures = [
    {
      id: 1,
      title: "The AI Workspace",
      description: "Chat directly with your notes, ask for explanations, and generate quizzes instantly.",
      image: "/assets/workspace.png"
    },
    {
      id: 2,
      title: "Community Explore",
      description: "Discover, fork, and learn from thousands of public study notes created by the community.",
      image: "/assets/explore.png"
    },
    {
      id: 3,
      title: "Spaced Repetition",
      description: "Master any topic with auto-generated flashcards that adapt to your learning speed.",
      image: "/assets/flashcards.png"
    },
    {
      id: 4,
      title: "AI Co-pilot Editor",
      description: "Write manual notes and let AI summarize, expand, or explain complex sections like you're 5.",
      image: "/assets/editor.png"
    },
    {
      id: 5,
      title: "Collaborate & Share",
      description: "Share your note to the public community with customized editor, viewer, or commenter access.",
      image: "/assets/share.png"
    },
    {
      id: 6,
      title: "Create Your Own Notes",
      description: "Start from scratch and turn your manual notes into powerful study tools instantly.",
      image: "/assets/create.png"
    },
    {
      id: 7,
      title: "Edit & Extend",
      description: "Edit your notes or AI-generated notes effortlessly by adding new sections and expanding concepts.",
      image: "/assets/edit.png"
    },
    {
      id: 8,
      title: "Quick Revision",
      description: "Get a rapid overview and quick revision of your most important study notes before an exam.",
      image: "/assets/quick.png"
    },
    {
      id: 9,
      title: "Focus Mode & Dictation",
      description: "Listen to your notes using voice dictation while staying on track with the built-in Pomodoro timer.",
      image: "/assets/pomodoro.png"
    },
    {
      id: 10,
      title: "PDF Export",
      description: "Export any of your structured, AI-generated notes into clean, beautifully formatted PDFs instantly.",
      image: "/assets/pdf.png"
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white text-black">
      <Navbar />

      {/* top */}
      <section className="max-w-7xl mx-auto px-8 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            whileHover={{ rotateX: 6, rotateY: -6 }}
            className="transform-gpu"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.h1
              className="text-5xl lg:text-6xl font-extrabold leading-tight
              bg-gradient-to-br from-black/90 via-black/60 to-black/90
              bg-clip-text text-transparent"
              whileHover={{ y: -4 }}
              style={{
                transform: "translateZ(40px)",
                textShadow: "0 18px 40px rgba(0,0,0,0.25)",
              }}
            >
              Create Smart <br /> AI Notes in Seconds
            </motion.h1>

            <motion.p
              whileHover={{ y: -2 }}
              className=" mt-6 max-w-xl text-lg
              bg-gradient-to-br from-gray-700 via-gray-500/80 to-gray-700
              bg-clip-text text-transparent"
              style={{
                transform: "translateZ(40px)",
                textShadow: "0 18px 40px rgba(0,0,0,0.25)",
              }}
            >
              Generate exam-focused notes, project documentation, flow diagrams
              and revision-ready content using AI — faster, cleaner and smarter.
            </motion.p>
          </motion.div>

          <div className="mt-10 flex flex-wrap gap-4">
            <motion.button
              onClick={() => navigate("/notes")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl flex items-center gap-2 bg-gradient-to-br from-black/90 via-black/80 to-black/90 border border-white/10 text-white font-semibold text-lg shadow-[0_25px_60px_rgba(0,0,0,0.7)] cursor-pointer"
            >
              Get Started
            </motion.button>
            <motion.button
              onClick={() => {
                const newNote = {
                  _id: Date.now().toString(),
                  topic: "Untitled Note",
                  createdAt: new Date().toISOString(),
                  content: {
                    notes: "# My Note\n\nStart typing your manual note here...",
                    revisionPoints: [],
                    isManual: true
                  }
                };
                const existingHistory = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
                localStorage.setItem('prepgen_history', JSON.stringify([newNote, ...existingHistory]));
                navigate("/workspace", { state: { noteId: newNote._id } });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl flex items-center gap-2 bg-white text-black border border-gray-200 font-semibold text-lg shadow-sm hover:bg-gray-50 cursor-pointer transition"
            >
              ✍️ Create Blank Note
            </motion.button>
          </div>

          {/* SRS Due Today Widget */}
          <AnimatePresence>
            {dueCardsCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between max-w-sm shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-indigo-900 font-bold">{dueCardsCount} Flashcards Due</p>
                    <p className="text-indigo-600/80 text-sm font-medium">Keep your study streak alive!</p>
                  </div>
                </div>
                <button onClick={() => navigate("/review")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm transition">
                  Review
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          whileHover={{
            y: -12,
            rotateX: 8,
            rotateY: -8,
            scale: 1.05,
          }}
          className="transform-gpu"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="overflow-hidden">
            <img
              src={img}
              alt="img"
              style={{ transform: "translateZ(35px)" }}
            />
          </div>
        </motion.div>
      </section>

      {/* SHOWCASE SECTION */}
      <section className="bg-gray-50 py-24 mt-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">See PrepGen AI in Action</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">A full-featured intelligent workspace designed to supercharge your learning and collaboration.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {showcaseFeatures.map((feature, idx) => (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-300"
              >
                <div className="h-64 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-transparent transition-colors z-10" />
                  {/* Image wrapper - falls back elegantly if screenshot is missing */}
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback if the user hasn't added the screenshot yet
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{display: 'none'}} className="absolute inset-0 flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <span className="text-4xl mb-2">📸</span>
                    <span className="text-sm font-medium">Add {feature.image} to public/assets</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* bottom */}
      <section className='max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-4 gap-12 cursor-pointer'>
        <Features icon="📘" title="Exam Notes" des="High-yield exam-oriented notes with revision points."/>
        <Features icon="📂" title="Project Notes" des="Well-structured content for assignments and projects." />
        <Features icon="📊" title="Diagrams" des="Auto-generated visual diagrams for clarity." />
        <Features icon="⬇️" title="PDF Download" des="Download clean, printable PDFs instantly." />

      </section>
      <Footer/>
    </div>
  );
}

export default Home;
