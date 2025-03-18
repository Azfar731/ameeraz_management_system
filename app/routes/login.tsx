import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { commitSession, getSession } from "~/sessions";
import { createLog } from "~/utils/logs/db.server";
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  const userId = session.get("userId");
  const error = session.get("error");
  
  if (userId) {
    throw redirect("/");
  }
  return { error };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticator.authenticate("login", request);
  const session = await getSession(request.headers.get("cookie"));
  if (!userId) {
    session.flash("error", "Invalid username or password");
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
  session.set("userId", userId);
  await createLog({
    userId,
    log_type: "loggedIn",
    log_message: "User logged in",
  });
  throw redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Login() {
  const loaderData = useLoaderData<{ error: string | undefined }>();
  const navigation = useNavigation()
  return (
    <div className="flex justify-center">
      <Form
        method="post"
        className="flex flex-col  bg-white mt-14 p-6 rounded shadow-md w-80 "
      >
        <label
          htmlFor="username"
          className="block text-center text-gray-700 text-sm font-bold mt-4"
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 text-center"
          required
        />

        <label
          htmlFor="password"
          className="block text-center text-gray-700 text-sm font-bold mt-4"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 text-center"
          required
        />

        <button
          type="submit"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
          className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {" "}
          Login
        </button>
        {loaderData.error ? (
          <p className="text-red-500 font-semibold">{loaderData.error}</p>
        ) : null}
      </Form>
    </div>
  );
}
