import { supabase } from "./index.js";
import {v4 as uuidv4} from 'uuid';

/**
 * Create a new participant in a session
 * @param {Object} params
 * @param {String} params.sessionId
 * @param {String} params.nickname
 * @param {String|null} params.userId
 * @param {String} params.avatarColor
 * @returns Participant Object
**/
export async function createParticipant({sessionId, nickname,userId = null,avatarColor = '#3B82F6'}){
    const {data, error} = await supabase
    .from('participants')
    .insert([{
      id: uuidv4(),
      session_id: sessionId,
      user_id: userId,
      nickname,
      avatar_color: avatarColor,
      joined_at: new Date().toISOString(),
      is_active: true,
      total_score: 0,
      total_correct: 0,
      total_answered: 0
    }])
    .select()
    .single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Get participant by nickname in a session
 * @param {String} sessionId
 * @param {String} nickname
 * @returns Participant Object or null
**/

export async function getParticipantByNickName(sessionId,nickname){
    const {data,error} = await supabase
    .from('participants')
    .select('*')
    .eq('session_id',sessionId)
    .eq('nickname',nickname)
    .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}