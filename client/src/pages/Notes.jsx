import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TopicForm from "../components/TopicForm";

function Notes() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const credits = userData.credits;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-8">
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className=" mb-10
            rounded-2xl
            bg-black/80 backdrop-blur-xl
            border border-white/10
            px-8 py-6
            shadow-[0_20px_45px_rgba(0,0,0,0.6)] items-start
            flex md:items-center justify-between gap-4 flex-col md:flex-row no-print"
      >
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <h1
            className="text-2xl font-bold
            bg-linear-to-r from-white via-gray-300 to-white
            bg-clip-text text-transparent"
          >
            ExamNotes AI
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            AI-powered exam-oriented notes & revision
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button
            className="flex items-center gap-2 
    px-4 py-2 rounded-full
    bg-white/10
    border border-white/20
    text-white text-sm"
            onClick={() => navigate("/pricing")}
          >
            <span className="text-xl">💠</span>
            <span>{credits}</span>
            <motion.span
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.97 }}
              className="ml-2 h-5 w-5 flex items-center justify-center
                        rounded-full bg-white  text-xs font-bold"
            >
              ➕
            </motion.span>
          </button>
          <button
            onClick={() => navigate("/history")}
            className="px-4 py-3 rounded-full
      text-sm font-medium
      bg-white/10
      border border-white/20
      text-white
      hover:bg-white/20
      transition
      flex items-center gap-2"
          >
            📚 Your Notes
          </button>
          <button
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
            className="px-4 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-100 transition shadow-sm flex items-center gap-2"
          >
            ✍️ Create Blank Note
          </button>
        </div>
      </motion.header>

      <motion.div className="mb-12 no-print">
        <TopicForm
          loading={loading}
          setResult={setResult}
          setLoading={setLoading}
          setError={setError}
        />
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col lg:grid lg:grid-cols-4 gap-6 no-print"
        >
          <div className="lg:col-span-1 rounded-2xl bg-white shadow-sm p-6 border border-gray-100">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mt-8"></div>
              <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
          <div className="lg:col-span-3 rounded-2xl bg-white shadow-sm p-8 border border-gray-100">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-10"></div>
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-100 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-40 bg-gray-50 rounded-xl w-full mt-8 border border-gray-100"></div>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mb-6 text-center text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200 no-print">{error}</div>
      )}

      {!result && !loading && !error && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="
              h-64 mt-8
              rounded-2xl 
              flex flex-col items-center justify-center
              bg-white/80 backdrop-blur-xl
              border-2 border-dashed border-indigo-100
              text-gray-500
              shadow-sm no-print
            "
        >
          <svg className="w-16 h-16 text-indigo-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 font-medium">Ready to create your next masterpiece</p>
          <p className="text-xs text-gray-400 mt-2">Fill out the form above to generate AI notes</p>
        </motion.div>
      )}





    </div>
  );
}

export default Notes;
