import Notes from "../models/notes.model.js"

export const historyOFNotes = async(req, res) => {
    try {
        const user = req.userID
        
        // STEP 1: Get pagination parameters from URL query
        // Example: /api/history/notes-history?page=2&limit=10
        const page = parseInt(req.query.page) || 1      // Default to page 1
        const limit = parseInt(req.query.limit) || 10   // Default to 10 items per page
        
        // STEP 2: Calculate OFFSET (how many records to skip)
        // Page 1: skip = (1-1) × 10 = 0  → Start from record 0
        // Page 2: skip = (2-1) × 10 = 10 → Start from record 10
        // Page 3: skip = (3-1) × 10 = 20 → Start from record 20
        const skip = (page - 1) * limit
        
        console.log("User:", user)
        console.log("Page:", page, "Limit:", limit, "Skip:", skip)
        
        // STEP 3: Count total documents for this user
        // This tells us how many pages we need
        const total = await Notes.countDocuments({ user })
        
        // STEP 4: Fetch paginated data using OFFSET approach
        const historyData = await Notes.find({ user })
            .sort({ createdAt: -1 })  // Newest first
            .skip(skip)                // Skip X records (OFFSET)
            .limit(limit)              // Take only Y records (LIMIT)
        
        // STEP 5: Handle case when no notes exist
        if (historyData.length === 0 && page === 1) {
            return res.status(404).json({
                message: "Not found any history",
                success: false,
            })
        }
        
        // STEP 6: Calculate total pages
        // Example: 25 total notes ÷ 10 per page = 2.5 → ceil = 3 pages
        const totalPages = Math.ceil(total / limit)
        
        console.log("History count:", historyData.length, "Total:", total)
        
        // STEP 7: Send response with pagination metadata
        return res.status(200).json({
            message: "Got the History",
            success: true,
            historyData: historyData,      // Array of notes for this page
            total: total,                   // Total count of all notes
            totalPages: totalPages,         // How many pages exist
            currentPage: page,              // Current page number
            hasNextPage: page < totalPages, // Boolean: is there a next page?
            hasPrevPage: page > 1          // Boolean: is there a previous page?
        })
        
    } catch (error) {
        // console.error("Error in historyOFNotes:", error)
        return res.status(500).json({
            message: "Internal Server error",
            success: false,
        })
    }
}