import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useDispatch } from "react-redux";
import { generateNodes } from "../services/api.js";
import { updateCredits } from "../redux/userSlice.js";
import { Toggle } from "./Toggle.jsx";
import { useNavigate } from "react-router-dom";

function TopicForm({ setResult, setLoading, loading, setError }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [examType, setExamType] = useState("");
  const [revisionMode, setRevisionMode] = useState(false);
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [includeChart, setIncludeChart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError("Please Enter the topic name");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const storedCredits = localStorage.getItem('prepgen_credits');
      const credits = storedCredits !== null ? parseInt(storedCredits) : 100;
      if (credits < 1) {
          setError("Insufficient credits! Please buy more credits from the pricing page.");
          setLoading(false);
          return;
      }

      const result = await generateNodes({
        topic,
        classLevel,
        examType,
        revisionMode,
        includeDiagram,
        includeChart,
      });

      setResult(result.data);
      setLoading(false);

      setClassLevel("")
      setTopic("")
      setExamType("")
      setRevisionMode(false)
      setIncludeChart(false)
      setIncludeDiagram(false)

      if(typeof result.creditsLeft == "number"){
        dispatch(updateCredits(result.creditsLeft))
      }

      // Navigate to Workspace
      navigate('/workspace', { state: { noteId: result.noteId } });

    } catch (error) {
      setError(error.message === "Insufficient credits" ? "Insufficient credits! Please buy more credits." : `Failed to generate: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() =>{

    if(!loading){
      setProgress(0)
      setProgressText("")
      return
    }

    let value = 0 //initial
    const interval = setInterval(() => {
      value += Math.random() * 8;

      if (value >= 95) {
        value = 95;
        setProgressText("Almost done…");
        clearInterval(interval);
      } else if (value > 70) {
        setProgressText("Finalizing notes…");
      } else if (value > 40) {
        setProgressText("Processing content…");
      } else {
        setProgressText("Generating notes…");
      }

      setProgress(Math.floor(value));
    }, 700)

    return () => clearInterval(interval)

  }, [loading]) 

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-2xl
        bg-gradient-to-br  from-black/90 via-black/80 to-black/90
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_25px_60px_rgba(0,0,0,0.75)]
        p-8
        space-y-6
        text-white
      "
    >
      <input
        type="text"
        className=" w-full p-3 rounded-xl
        bg-white/10 backdrop-blur-lg
        border border-white/20
        placeholder-gray-400
        text-white
        focus:outline-none focus:ring-2 focus:ring-white/30" required
        placeholder="Enter topic (e.g. Web Development)"
        onChange={(e) => setTopic(e.target.value)}
        value={topic}
      />
      <input
        type="text"
        className=" w-full p-3 rounded-xl
        bg-white/10 backdrop-blur-lg
        border border-white/20
        placeholder-gray-400
        text-white
        focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder="Class / Level (e.g. Class 10)"
        onChange={(e) => setClassLevel(e.target.value)}
        value={classLevel}
      />
      <input
        type="text"
        className=" w-full p-3 rounded-xl
        bg-white/10 backdrop-blur-lg
        border border-white/20
        placeholder-gray-400
        text-white
        focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder="Exam Type (e.g. CBSE, JEE, NEET)"
        onChange={(e) => setExamType(e.target.value)}
        value={examType}
      />

      <div className="flex flex-col md:flex-row gap-6">
        
        <Toggle
          label="Exam Revision Mode"
          checked={revisionMode}
          onChange={() => setRevisionMode(!revisionMode)}
        />

        <Toggle
          label="Include Diagram"
          checked={includeDiagram}
          onChange={() => setIncludeDiagram(!includeDiagram)}
        />

        <Toggle
          label="Include Charts"
          checked={includeChart}
          onChange={() => setIncludeChart(!includeChart)}
        />

      </div>

      <motion.button
        onClick={handleSubmit}
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.95 } : {}}
        disabled={loading}
        className={`
            cursor-pointer
    w-full mt-4
    py-3 rounded-xl
    font-semibold
    flex items-center justify-center gap-3
    transition
    ${
      loading
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-gradient-to-br from-white to-gray-200 text-black shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
    }
  `}
      >
        {loading ? "Generating Notes..." : "Generate Notes"}
      </motion.button>

      {loading && (
        <div className="mt-4 space-y-2">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.6 }}
              className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500"
            ></motion.div>
          </div>

          <div className="flex justify-between text-xs text-gray-300">
            <span>{progressText}</span>
            <span>{progress}%</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            This may take up to 2–5 minutes. Please don’t close or refresh the
            page.
          </p>
        </div>
      )}
    </motion.div>
  );
}
     


export default TopicForm;
