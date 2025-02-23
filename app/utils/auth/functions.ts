import { Role } from "@prisma/client";



 const ClearanceLevel = {
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


export {ClearanceLevel, getClearanceLevel}