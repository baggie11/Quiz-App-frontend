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
