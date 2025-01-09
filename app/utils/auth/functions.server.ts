import { Role } from "@prisma/client";
import { getUserFromId, getUserFromUserName } from "../user/db.server";
import argon2 from "argon2"
import { getSession, commitSession } from "~/sessions";
import { redirect } from "@remix-run/react";

export const ClearanceLevel = {
    Worker: 1,
    Manager: 2,
    Owner: 3,
    Admin: 4,
} as const;


const authenticate = async({request, requiredClearanceLevel}: {request: Request, requiredClearanceLevel: number}) => {
    const session = await getSession(request.headers.get("cookie"))
    const userId = session.get("userId")
    
    if(!userId){ 

    throw redirect("/login", {
        headers: { "Set-Cookie": await commitSession(session) },
    })}

    const user = await getUserFromId(userId)
    if(!user){
        throw new Error("Session User Id is invalid")
    }
    if(getClearanceLevel(user.role) >= requiredClearanceLevel){
        return userId
    }else{
        throw redirect("/un-authorized", {
            headers: { "Set-Cookie": await commitSession(session)}
        })
    }
}



const getClearanceLevel =  (role: Role): number => {
    const clearanceLevels = {
        admin: ClearanceLevel.Admin,
        owner: ClearanceLevel.Owner,
        manager: ClearanceLevel.Manager,
        worker: ClearanceLevel.Worker,
    };

    return clearanceLevels[role as keyof typeof clearanceLevels] ||
        ClearanceLevel.Worker;
};

const getUserIdFromCreds = async (
    { userName, password }: { userName: string; password: string },
) => {
    const user = await getUserFromUserName(userName)
    if(!user) return ""

    if(await argon2.verify(user.password, password)){
        return user.id
    }
    return "";
};

export { authenticate, getClearanceLevel, getUserIdFromCreds  };
