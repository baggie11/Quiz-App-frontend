import {supabase} from './index.js';

export async function getSessionByJoinCode(joinCode){
    const {data,error} = await supabase
    .from('sessions')
    .select('*')
    .eq('join_code',joinCode)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}