import { getSessionByJoinCode } from "../db/sessions.repo.js";
import { createParticipant, getParticipantByNickName } from "../db/participants.repo.js";
import { logActivity } from "../db/session_activity.repo.js";

export async function joinSession({joinCode, nickname, userId = null}){
    //find session
    const session = await getSessionByJoinCode(joinCode);
    if(!session) throw new Error('Session not found');

    if (session.status !== 'active' && !(session.settings.allow_late_join ?? false)){
        throw new Error('Session is not active or late joining is not allowed');
    }
    

    //check nickname uniqueness
    const existing = await getParticipantByNickName(session.id, nickname);
    if (existing) throw new Error('Roll no already exists in this session');

    //create participant
    const participant = await createParticipant({sessionId : session.id, nickname, userId});

    //log activity
    await logActivity({sessionId : session.id, participantId : participant.id,activityType :'join'});

    return {participant , session};
}