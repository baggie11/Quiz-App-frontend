import { joinSession, getSessionStatus } from "../services/session.service.js";
import { addSession, fetchSession } from '../services/session.service.js';

/**
 * POST /join
 * Body: { joinCode, nickname, userId (optional) }
 * Returns: session and participant info
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

/** GET /session/:sessionId/status
 * Returns session status
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} response
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

/** Create a new session
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} response
 */
export async function createSessionController(req, res) {
  try {
    const teacherId = req.user.id; // assuming JWT middleware sets req.user
    const sessionData = req.body;

    const session = await addSession(teacherId, sessionData);

    return res.status(201).json({ status: 'ok', data: session });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
}

/** Get session details
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} response
 */
export async function getSessionController(req, res) {
  try {
    const { sessionId } = req.params;
    const session = await fetchSession(sessionId);
    return res.status(200).json({ status: 'ok', data: session });
  } catch (err) {
    if (err.message === 'Session not found') return res.status(404).json({ status: 'fail', message: err.message });
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
