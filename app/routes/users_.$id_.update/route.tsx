import { User } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { getUserFromId } from "~/utils/user/db.server";
import User_Form from "~/components/users/user_form"
import { getClearanceLevel } from "~/utils/auth/functions.server";
import { UserErrorMessages } from "~/utils/user/types";
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No Id found in URL");
  }
  const user = await getUserFromId(id);
  if (!user) {
    `No user found with id ${id}`;
  }
  return { user };
}

export default function Update_User() {
  const { user } = useLoaderData<{ user: User }>();
  const actionData = useActionData<{errorMessages: UserErrorMessages }>()
  return (
  <div className="flex justify-center items-center h-screen">
    <User_Form currentUserClearanceLevel={getClearanceLevel(user.role)} user={user} errorMessage={actionData?.errorMessages}   />
  </div>);
}
