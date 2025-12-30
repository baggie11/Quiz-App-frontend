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

/** List all questions for a session
 * @param {string} sessionId
 * @returns {Promise<Array<Object>>} list of questions
 */
export async function getQuestionsBySession(sessionId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Save a question - insertion
 * @param {Object} questionData
 * @returns {Promise<Object>} inserted question object
 */

export async function insertQuestion(question) {
  const { data, error } = await supabase
    .from('questions')
    .insert([question])
    .select()
    .single();

  

  if (error) throw new Error(error.message);
  return data;
}

export async function insertQuestionOptions(options) {
  const { data, error } = await supabase
    .from('question_options')
    .insert(options)
    .select();
  
  

  if (error) throw new Error(error.message);
}