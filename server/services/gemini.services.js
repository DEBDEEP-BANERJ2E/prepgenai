// // import {GoogleGenAI} from "@google/genai"
// // import { buildPrompt } from "../utils/promptBuilder"

// // const genai = new GoogleGenAI({
// //     api : import.meta.env.VITE_GEMINI_API_KEY
// // })

// // export const runAI = async () =>{
// //     const response = await genai.models.generateContent({
// //         model :  "gemini-3-flash-preview",
// //         contents : buildPrompt
// //     })

// //     console.log(response.text);

// // }

// // await runAI()

// const GEMINI_URI =
//   "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview:generateContent";

// export const generateGeminiResponse = async (prompt) => {
//   try {
//     const response = await fetch(
//       `${GEMINI_URI}?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: prompt,
//                 },
//               ],
//             },
//           ],
//         }),
//       },
//     );

//     if (!response.ok) {
//       const err = await response.text();
//       throw new Error(err);
//     }

//     const data = await response.json();

//     const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!text) {
//       throw new Error("No text returned from Gemini");
//     }

//     const cleanText = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(cleanText);
//   } catch (error) {
//     console.error("Gemini Fetch Error:", error.message);
//     throw new Error("Gemini API fetch failed");
//   }
// };


import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config()

// console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


export const generateGeminiResponse = async (prompt) => {
  try {
    // 1️⃣ build the final prompt string  // this is handeling in geenrate.controller.js
    // const prompt = buildPrompt(promptData);   

    // 2️⃣ send to Gemini
    const response = await genai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    // 3️⃣ get text output
    const text = response.text;

    console.log(text.data);
    

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    // 4️⃣ clean markdown (Gemini sometimes wraps JSON)
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 5️⃣ parse JSON (because your prompt enforces JSON)
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini SDK Error:", error.message);
    throw error;
  }
};
