import { addQuestionsToSession, listQuestions } from '../services/questions.service.js';

/**
 * Add multiple questions to a session
 * Body must be:  [ { question_text, ... }, { ... } ]
 */
export async function addQuestionsController(req, res) {
  try {
    const { sessionId } = req.params;
    const questionsData = req.body;

    if (!Array.isArray(questionsData)) {
      return res.status(400).json({
        status: "fail",
        message: "Request body must be an array of questions"
      });
    }

    const inserted = await addQuestionsToSession(sessionId, questionsData);

    return res.status(201).json({
      status: "ok",
      data: inserted
    });

  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
}

/**
 * List all questions in a session
 */
export async function listQuestionsController(req, res) {
  try {
    const { sessionId } = req.params;

    const questions = await listQuestions(sessionId);

    return res.status(200).json({
      status: "ok",
      data: questions
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
}
