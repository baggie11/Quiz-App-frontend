import {supabase} from './index.js';
import {generateUniqueJoinCode} from '../utils/joinCode.js'; 

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
  const { title, scheduled_start, ended_at} = sessionData;
  const join_code = await generateUniqueJoinCode(4);

  console.log(join_code);

  const { data, error } = await supabase
    .from('sessions')
    .insert([{
      teacher_id: teacherId,
      title,
      scheduled_start: scheduled_start || null,
      ended_at: ended_at || null,
      join_code,
      status: 'draft'
    }])
    .select('id, title, scheduled_start, started_at, ended_at, join_code')
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get all sessions created by a teacher
 * @param {string} teacherId
 * @returns {Promise<Array>} list of sessions
 */

export async function getSessionsByTeacherId(teacherId){
  const {data , error} = await supabase
  .from('sessions')
  .select('*')
  .eq('teacher_id',teacherId)
  .order('scheduled_start',{ascending : False});

  if (error) throw new Error(error.message);
  return data;
}



