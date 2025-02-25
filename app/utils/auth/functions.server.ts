import { getUserFromId, getUserFromUserName } from "../user/db.server";
import argon2 from "argon2";
import { commitSession, getSession } from "~/sessions";
import { redirect } from "@remix-run/react";
import { getClearanceLevel } from "./functions";
import { captureException } from "@sentry/remix";
const authenticate = async (
    { request, requiredClearanceLevel }: {
        request: Request;
        requiredClearanceLevel: number;
    },
) => {
    const session = await getSession(request.headers.get("cookie"));
    const userId = session.get("userId");

    if (!userId) {
        throw redirect("/login", {
            headers: { "Set-Cookie": await commitSession(session) },
        });
    }

    const user = await getUserFromId(userId);
    if (!user) {
        captureException(new Error(`Invalid Session User Id`));
        throw redirect("/login", {
            headers: { "Set-Cookie": await commitSession(session) },
        });
    }
    if (getClearanceLevel(user.role) >= requiredClearanceLevel) {
        return userId;
    } else {
        throw redirect("/un-authorized", {
            headers: { "Set-Cookie": await commitSession(session) },
        });
    }
};

const getUserIdFromCreds = async (
    { userName, password }: { userName: string; password: string },
) => {
    const user = await getUserFromUserName(userName);
    if (!user) return "";

    if (await argon2.verify(user.password, password)) {
        return user.id;
    }
    return "";
};

export { authenticate, getUserIdFromCreds };
