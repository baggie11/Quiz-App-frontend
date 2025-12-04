import {supabase} from './index.js';

/**
 * Get session by join code
 * @param {string} joinCode
 * @returns {Promise<Object>} session object
 */

export async function getSessionByJoinCode(joinCode){
    const {data,error} = await supabase
    .from('sessions')
    .select('*')
    .eq('join_code',joinCode)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

/** Get session by ID
 * @param {string} sessionId
 * @returns {Promise<Object>} session object
 */

export async function getSessionById(sessionId){
    const {data, error} = await supabase
    .from('sessions')
    .select("*")
    .eq('id',sessionId)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

/** Create a new session
 * @param {string} teacherId
 * @param {Object} sessionData
 * @returns {Promise<Object>} created session
 */
export async function createSession(teacherId, sessionData) {
  const { title, description, scheduled_start, settings } = sessionData;

  const { data, error } = await supabase
    .from('sessions')
    .insert([{
      teacher_id: teacherId,
      title,
      description,
      scheduled_start: scheduled_start || null,
      settings: settings || {},
      status: 'draft'
    }])
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}


