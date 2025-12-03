import { joinSession, getSessionStatus } from "../services/session.service.js";

/**
 * POST /join
 * Body: { joinCode, nickname, userId }
 */
export async function joinSessionController(req, res) {
  try {
    const { joinCode, nickname, userId } = req.body;

    if (!joinCode || !nickname) {
      return res.status(400).json({
        status: "fail",
        message: "joinCode and nickname are required",
      });
    }

    const result = await joinSession({ joinCode, nickname, userId });

    return res.status(200).json({
      status: "ok",
      data: result,
    });

  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
}

/**
 * GET /:sessionId/status
 */
export async function sessionStatusController(req, res) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing sessionId parameter",
      });
    }

    const result = await getSessionStatus(sessionId);

    return res.status(200).json({
      status: "ok",
      data: result,
    });

  } catch (err) {
    if (err.message === "Session not found") {
      return res.status(404).json({
        status: "fail",
        message: "Session not found",
      });
    }

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}
