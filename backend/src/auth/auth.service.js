import { getUserByEmail, createUser } from "../db/users.repo";
import { hashPassword,verifyPassword } from "./password.utils";
import jwt from 'jsonwebtoken';
import 'dotenv/config';


//sign up function
export async function SignUp(email,password,fullName) {

    //check if the user already exists
    const existing = await getUserByEmail(email);
    if(existing) throw new Error('Email already registered');

    // get the password hash and the salt
    const {hash,salt} = await hashPassword(password);

    const user = await createUser({
        email,
        password_hash : hash,
        salt,
        full_name: fullName,
        email_verified : true,
    });

    const token = jwt.sign({userId : user.id,role : user.role,email : user.email}, process.env.JWT_SECRET,{expiresIn: '2h'});
    return {token,user};
}

//login handler
export async function Login(email,password){
    const user = await getUserByEmail(email);
    if (!user) throw new Error('user not found');

    const valid = await verifyPassword(password,user.salt,user.password_hash);
    if (!valid) throw new Error('Invalid Password');

    const token = jwt.sign(
        {userId : user.id, email : user.email},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    );

    return {token,user};
}