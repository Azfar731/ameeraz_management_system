import { z } from "zod";
import { ClearanceLevel } from "../auth/functions";

const BaseUserValidation = z.object({
    userName: z.string().regex(
        /^[A-Za-z0-9]+$/,
        "User name must only contain alphabets and digits.",
    ).min(1, "UserName is required"),
    fname: z.string().regex(
        /^[A-Za-z]+$/,
        "First name must only contain alphabets.",
    )
        .min(1, "First name is required."),
    lname: z.string().regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Last name must only contain alphabets and a single space.",
    )
        .min(1, "Last name is required."),
    role: z.enum(["worker", "manager", "owner"]),
    password: z.string().min(5, "Password must be Atleast 5 characters long"),
});

const NewUserValidation = (loggedInUserClearance: number) => {
    return BaseUserValidation
        .refine((data) => {
            if (data.role === "owner") {
                return loggedInUserClearance === ClearanceLevel.Admin;
            } else {
                return loggedInUserClearance >= ClearanceLevel.Owner;
            }
        });
};

const UpdateUserValidation = ({loggedInUserClearance, currentUserAccountClearance, sameUser}:{loggedInUserClearance: number, currentUserAccountClearance: number, sameUser: boolean}  ) =>{
    
    return BaseUserValidation.omit({
        role: true,
        password: true
    }).extend({
        account_status: z.enum(["active", "inActive"]),
    }).refine( () => {
        if(sameUser) return true
        else if(loggedInUserClearance === ClearanceLevel.Admin){
            return true
        }else{
            loggedInUserClearance > currentUserAccountClearance
        }
    })
}

export {  NewUserValidation, UpdateUserValidation };
