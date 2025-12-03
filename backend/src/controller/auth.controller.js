import { SignUp,Login,verifyEmail } from "../services/auth.service.js";

/**
 * Controller for Host Signup
**/
export async function userSignUp(req,res){
    try{
        const {email,password,fullName} = req.body;
        if (!email || !password || !fullName){
            return res.status(400).json({message : 'Missing required fields'});
        }
        
        const result = await SignUp(email,password,fullName);
        return res.status(201).json(result);
    }catch(err){
        return res.status(400).json({message : err.message});
    }
}

/**
 * Controller for Host Login
**/

export async function userLogin(req,res){
    try{
        const {email,password} = req.body;
        if (!email || !password){
            return res.status(400).json({message : 'Missing email or password'});
        }

        const result = await Login(email,password);
        return res.status(200).json(result);
    }catch(err){
        return res.status(401).json({message : err.message});
    }
}

/**
 * Controller for email verification
**/

export async function verifyEmailController(req,res){
    try{
        const {email,token} = req.query;
        const result = await verifyEmail(email,token);
        return res.status(200).json(result);
    }catch(err){
        return res.status(400).json({message : err.message});
    }
}
