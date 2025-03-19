import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { captureMessage } from "@sentry/remix";
import { destroySession, getSession } from "~/sessions.server";
import { createLog } from "~/utils/logs/db.server";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get("cookie"));
    const userId = session.get("userId");
    if (userId) {
        await createLog({
            userId,
            log_type: "loggedOut",
            log_message: "User logged out",
        });
    } else {
        captureMessage("Loguot Route hit without a user logged in", "warning");
    }

    // captureException(new Error(`User logged out`));
    return redirect("/login", {
        headers: { "Set-Cookie": await destroySession(session) },
    });
}
