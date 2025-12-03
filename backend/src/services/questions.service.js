import { createQuestions, getQuestionsBySession } from '../db/questions.repo.js';

/**
 * Add multiple questions to a session
 * questionsData = array of questions
 */
export async function addQuestionsToSession(sessionId, questionsData) {
  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    throw new Error("questionsData must be a non-empty array");
  }

  // Basic validation for each question
  for (const q of questionsData) {
    if (!q.question_text) {
      throw new Error("Each question must have question_text");
    }
    if (!q.options || !Array.isArray(q.options)) {
      throw new Error("Each question must have 'options' as an array");
    }
    if (!q.correct_answers || !Array.isArray(q.correct_answers)) {
      throw new Error("Each question must have 'correct_answers' as an array");
    }
  }

  // Insert all questions using the batch insert repo function
  const inserted = await createQuestions(sessionId, questionsData);
  return inserted;
}

/**
 * Get all questions in a session
 */
export async function listQuestions(sessionId) {
  return await getQuestionsBySession(sessionId);
}
