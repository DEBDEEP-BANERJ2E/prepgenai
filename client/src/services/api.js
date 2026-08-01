import { setUserData } from "../redux/userSlice";
import { buildPrompt } from "./promptBuilder";

// Create a local mock user so the app thinks we are logged in
export const getCurrUser = async (dispatch) => {
    try {
        const storedCredits = localStorage.getItem('prepgen_credits');
        const credits = storedCredits !== null ? parseInt(storedCredits) : 100;
        localStorage.setItem('prepgen_credits', credits);
        
        const mockUser = {
            id: "local_user",
            name: "Local User",
            email: "local@example.com",
            credits: credits
        };
        dispatch(setUserData(mockUser));
    } catch (error) {
        console.log(error.message);
    }
}

const deductCredit = (amount = 1) => {
    const storedCredits = localStorage.getItem('prepgen_credits');
    let credits = storedCredits !== null ? parseInt(storedCredits) : 100;
    
    if (credits < amount) {
        throw new Error("Insufficient credits! Please buy more credits from the pricing page.");
    }
    
    credits -= amount;
    localStorage.setItem('prepgen_credits', credits);
    
    // Dispatch a custom event so the UI can listen and update Redux
    window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: { credits } }));
    
    return credits;
}

const GEMINI_URI = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

export const generateNodes = async (payload) => {
    try {
        console.log("Generating via frontend directly...");
        const prompt = buildPrompt(payload);
        
        const storedCredits = localStorage.getItem('prepgen_credits');
        let credits = storedCredits !== null ? parseInt(storedCredits) : 100;
        
        if (credits < 1) {
            throw new Error("Insufficient credits");
        }

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY in client/.env");
        }

        const response = await fetch(`${GEMINI_URI}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            if (response.status === 429) {
                throw new Error("API Quota Exceeded (429 Rate Limit). Please wait a few moments or try again later.");
            }
            throw new Error(err.error?.message || "Unknown API Error");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No text returned from Gemini");
        }

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsedContent = JSON.parse(cleanText);

        // Save to localStorage for history
        const newNote = {
            _id: Date.now().toString(),
            topic: payload.topic,
            classLevel: payload.classLevel,
            examType: payload.examType,
            revisionMode: payload.revisionMode,
            includeDiagram: payload.includeDiagram,
            includeChart: payload.includeChart,
            createdAt: new Date().toISOString(),
            content: parsedContent
        };
        const existingHistory = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
        localStorage.setItem('prepgen_history', JSON.stringify([newNote, ...existingHistory]));
        
        // Auto-initialize SRS flashcards for the new note
        import('./srs').then(module => {
            module.initCardsForNote(newNote);
        }).catch(err => console.error("SRS Init Error:", err));

        // Deduct 5 credits
        const creditsLeft = deductCredit(5);

        return { data: parsedContent, creditsLeft: creditsLeft, noteId: newNote._id };

    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export const downloadPdf = async (result) => {
    try {
        alert("PDF download is simulated in local-only mode. Use Ctrl+P to print the page.");
        window.print();
    } catch (error) {
        throw new Error("Pdf download fail");
    }
}

export const historyNotesData = async (page = 1, limit = 10) => {
    try {
        const historyData = JSON.parse(localStorage.getItem('prepgen_history') || '[]');
        
        const total = historyData.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const currentPage = page;
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = historyData.slice(startIndex, endIndex);

        return {
            historyData: paginatedData,
            total: total,
            totalPages: totalPages,
            currentPage: currentPage,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        }
    } catch (error) {
        console.error("API Error:", error);
        throw new Error("History could not be fetched");
    }
}

export const explainLikeIm5 = async (text, contextTopic = "") => {
    try {
        deductCredit(5);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY in client/.env");
        }

        const prompt = `You are a friendly and enthusiastic teacher. Explain the following text to me as if I am 5 years old. Keep it short, use analogies, and make it very easy to understand.
        
Context Topic (if any): ${contextTopic}
Text to explain: "${text}"

Please provide just the simple explanation without any intro or outro text.`;

        const response = await fetch(`${GEMINI_URI}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to get ELI5 explanation");
        }

        const data = await response.json();
        const simplifiedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!simplifiedText) {
            throw new Error("No text returned");
        }

        return simplifiedText.trim();
    } catch (error) {
        console.error("ELI5 Error:", error);
        throw new Error("Failed to simplify text");
    }
}

export const chatWithContext = async (userMessage, chatHistory, noteContext) => {
    try {
        deductCredit(5);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY in client/.env");
        }

        // Format history for the prompt
        const formattedHistory = chatHistory.map(msg => 
            `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`
        ).join('\n');

        const prompt = `You are a highly intelligent and helpful AI tutor inside a study workspace.
Your primary job is to answer the user's questions based strictly on the study notes provided below.
If the answer cannot be found in the notes, you may use your general knowledge, but you must first clarify that the information is not in the notes.

--- PROVIDED NOTE CONTEXT ---
Topic: ${noteContext.topic}
Content:
${noteContext.notes || ''}
Revision Points:
${noteContext.revisionPoints ? noteContext.revisionPoints.join('\n') : ''}
-----------------------------

--- CHAT HISTORY ---
${formattedHistory}
User: ${userMessage}
AI:`;

        const response = await fetch(`${GEMINI_URI}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to get chat response");
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("No text returned");
        }

        return responseText.trim();
    } catch (error) {
        console.error("Chat Error:", error);
        throw new Error("Failed to send message");
    }
}

export const expandNoteSection = async (contextText, userInstruction, fullNoteContext) => {
    try {
        deductCredit(5);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY in client/.env");
        }

        const prompt = `You are a highly intelligent AI tutor helping a student expand their study notes.
        
--- EXISTING NOTE CONTEXT ---
Topic: ${fullNoteContext.topic || "Unknown"}
Content Preview: ${fullNoteContext.notes ? fullNoteContext.notes.substring(0, 1000) + '...' : ''}
-----------------------------

The user has selected the following text from their notes:
"${contextText}"

The user's instruction is: 
"${userInstruction}"

Your task:
1. Write a detailed, educational expansion or deep-dive based on the instruction. Use Markdown formatting.
2. Provide exactly 2 new short, punchy revision points (for flashcards) related to your new content.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS JSON:
{
  "expandedText": "The detailed markdown content goes here...",
  "newRevisionPoints": ["Flashcard point 1", "Flashcard point 2"]
}
`;

        const response = await fetch(`${GEMINI_URI}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate expansion");
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("No text returned");
        }

        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Expansion Error:", error);
        throw new Error("Failed to expand note");
    }
}

export const improveText = async (text, instruction) => {
    try {
        deductCredit(5);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

        const prompt = `You are an expert AI editor. Improve or modify the following text based on this instruction: "${instruction}"
        
Text to improve:
"${text}"

Return ONLY the improved text, formatted cleanly. Do not include any intro or outro.`;

        const response = await fetch(`${GEMINI_URI}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error("Failed to improve text");
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("No text returned");
        
        return responseText.trim();
    } catch (error) {
        console.error("Improvement Error:", error);
        throw error;
    }
}

export const generateStudyTools = async (fullText) => {
    try {
        deductCredit(5);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

        const prompt = `Analyze the following student notes and extract study tools from it:
        
"${fullText}"

Your task:
1. Extract exactly 5 most important key concepts and format them as an array of strings for flashcards.
2. Generate 3 short-answer questions and 1 long-answer question based on this text.
3. Suggest a diagram prompt if applicable.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS JSON:
{
  "revisionPoints": ["Flashcard point 1", "Flashcard point 2", "Flashcard point 3", "Flashcard point 4", "Flashcard point 5"],
  "questions": {
    "short": ["Short question 1", "Short question 2", "Short question 3"],
    "long": ["Long question 1"],
    "diagram": "A diagram showing..." 
  }
}
`;

        const response = await fetch(`${GEMINI_URI}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error("Failed to generate study tools");
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("No text returned");
        
        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Study Tools Error:", error);
        throw error;
    }
}