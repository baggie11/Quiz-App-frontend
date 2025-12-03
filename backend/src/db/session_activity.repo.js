import {supabase} from './index.js';
import {v4 as uuidv4} from 'uuid';

export async function logActivity({sessionId, participantId = null, activityType, metadata = {}}){
    const {data, error} = await supabase
    .from('session_activity')
    .insert([{
        id : uuidv4(),
        session_id : sessionId,
        participant_id : participantId,
        activity_type : activityType,
        metadata,
        created_at : new Date().toISOString()
    }])
    .select()
    .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getLatestQuestionStart(sessionId){
    //we look for the most recent activity_type = 'question_start'
    const {data, error} = await supabase
    .from('session_activity')
    .select('*')
    .eq('session_id',sessionId)
    .eq('activity_type','question_start')
    .order('created_at',{ascending :false})
    .limit(1)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}