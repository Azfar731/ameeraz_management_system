

type BaseUserErrorMessages = {
    fname: string[];
    lname: string[];
    userName: string[];
    account_status: string[];
    role: string[];
    password: string[];
}

type UpdateUserErrorMessages = Omit<BaseUserErrorMessages, "password" | "role">

type CreateUserErrorMessages = Omit<BaseUserErrorMessages, "account_status">
export type { UpdateUserErrorMessages, CreateUserErrorMessages}