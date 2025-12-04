import { supabase } from './index.js';

/**
 * Get a question by its ID
 * @param {string} questionId
 * @returns {Promise<Object>} question object
 */
export async function getQuestionById(questionId) {
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, question_type, options, time_limit, image_url, explanation, order_index')
    .eq('id', questionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** Create multiple questions for a session
 * @param {string} sessionId
 * @param {Array<Object>} questionsData
 * @returns {Promise<Array<Object>>} created questions
 */
export async function createQuestions(sessionId, questionsData) {
  const payload = questionsData.map((q, index) => ({
    session_id: sessionId,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options,
    correct_answers: q.correct_answers,
    order_index: q.order_index ?? index,
    points: q.points ?? 1000,
    time_limit: q.time_limit ?? 30,
    image_url: q.image_url ?? null,
    explanation: q.explanation ?? null
  }));

  const { data, error } = await supabase
    .from('questions')
    .insert(payload)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

/** List all questions for a session
 * @param {string} sessionId
 * @returns {Promise<Array<Object>>} list of questions
 */
export async function listQuestions(sessionId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
