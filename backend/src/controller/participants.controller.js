// controllers/session.controller.js
import { joinSessionService } from "../services/participants.service.js";

export async function joinSessionController(req, res) {
  try {
    const { roll_number, session_code } = req.body;

    if (!roll_number || !session_code) {
      return res.status(400).json({
        success: false,
        message: "Roll number and session code are required"
      });
    }

    const result = await joinSessionService({
      sessionCode: session_code,
      rollNumber: roll_number
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: "Joined session successfully"
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
}
