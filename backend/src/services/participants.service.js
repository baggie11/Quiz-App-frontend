// services/session.service.js
import { getSessionByJoinCode } from "../db/sessions.repo.js";
import {
  createParticipant,
  getParticipantByNickName
} from "../db/participants.repo.js";

export async function joinSessionService({
  sessionCode,
  rollNumber
}) {
  // 1. Validate session
  const session = await getSessionByJoinCode(sessionCode);
  if (!session) {
    throw new Error("Invalid session code");
  }

  // if (session.status !== "active") {
  //   throw new Error("Session is not active");
  // }

  // 2. Normalize roll number (voice-safe)
  const nickname = rollNumber.trim().toUpperCase();

  // 3. Prevent duplicate roll numbers in same session
  const existingParticipant = await getParticipantByNickName(
    session.id,
    nickname
  );

  if (existingParticipant) {
    throw new Error("This roll number has already joined the session");
  }

  // 4. Create participant
  const participant = await createParticipant({
    sessionId: session.id,
    nickname
  });

  return {
    participantId: participant.id,
    sessionId: session.id,
    rollNumber: participant.nickname
  };
}
