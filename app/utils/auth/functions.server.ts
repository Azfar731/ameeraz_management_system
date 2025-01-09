import { Role } from "@prisma/client";
import { getUserFromUserName } from "../user/db.server";
import argon2 from "argon2"

export const ClearanceLevel = {
    Worker: 1,
    Manager: 2,
    Owner: 3,
    Admin: 4,
} as const;

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

export { getClearanceLevel, getUserIdFromCreds  };
