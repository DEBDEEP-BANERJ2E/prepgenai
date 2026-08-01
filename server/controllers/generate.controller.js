import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateGeminiResponse } from "../services/gemini.services.js";
import { buildPrompt } from "../utils/promptBuilder.js";

export const generateNotes = async (req, res) => {
  try {
    const {
      topic,
      classLevel,
      examType,
      revisionMode = false,
      includeDiagram = false,
      includeChart = false,
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
        success: false,
      });
    }

    const user = await UserModel.findById(req.userID);

    if (!user) {
      return res.status(404).json({
        message: "User is not found",
        success: false,
      });
    }

    if (user.credits < 10) {
      user.isCreditAvialable = false;
      await user.save();
      return res.status(403).json({
        message: "Insufficient credits balance",
      });
    }

    const prompt = buildPrompt({
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
    });

    const aiResponse = await generateGeminiResponse(prompt)
    

    //then saving it in notes model
    const notes = await Notes.create({
        user : user._id,
        topic,
        classLevel,
        examType,
        revisionMode,
        includeDiagram,
        includeChart,
        content : aiResponse

    })

    // some following conditions also which need to use
        user.credits -= 10;
        if (user.credits <= 0) user.isCreditAvialable = false;

        if (!Array.isArray(user.notes)) {
            user.notes = [];
        }

        user.notes.push(notes._id);

        await user.save();

        return res.status(200).json({
            data: aiResponse,
            noteId: notes._id,
            creditsLeft: user.credits
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "AI generation failed",
            message: error.message
        });

    }
}


