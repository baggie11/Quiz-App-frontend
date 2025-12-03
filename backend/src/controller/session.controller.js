import { joinSession } from "../services/session.service.js";

export async function joinSessionController(req,res){
    try{
        const {joinCode, nickname, userId} = req.body;
        const result = await joinSession({joinCode, nickname,userId});
        return res.status(200).json(result);
    }catch(err){
        return res.status(400).json({message : err.message});
    }
}