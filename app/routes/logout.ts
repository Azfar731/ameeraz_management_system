import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";


export async function action({request}: ActionFunctionArgs){
    const session = await getSession(request.headers.get("cookie"));
    return redirect("/login", {
        headers: {"Set-Cookie": await destroySession(session)}
    })
}