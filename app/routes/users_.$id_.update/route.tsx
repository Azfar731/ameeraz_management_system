import { User } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import { getUserFromId, updateUser } from "~/utils/user/db.server";
import User_Form from "~/components/users/user_form";
import { getClearanceLevel } from "~/utils/auth/functions";
import { UpdateUserErrorMessages } from "~/utils/user/types";
import { UpdateUserValidation } from "~/utils/user/validation.server";
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

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("No Id found in URL");
  }

  const formData = await request.formData();
  const dataObject = Object.fromEntries(formData.entries());
  console.log("Form Object: ", dataObject);
  const validationResult = UpdateUserValidation({
    loggedInUserClearance: getClearanceLevel("admin"),
    currentUserAccountClearance: getClearanceLevel(user.role),
    sameUser: false,
  }).safeParse(dataObject);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  const updated_user = await updateUser({ id, updates: validationResult.data });
  throw replace(`/users/${updated_user.id}`);
}

export default function Update_User() {
  const { user } = useLoaderData<{ user: User }>();
  const actionData = useActionData<{
    errorMessages: UpdateUserErrorMessages;
  }>();
  return (
    <div className="flex justify-center items-center h-screen">
      <User_Form
        currentUserClearanceLevel={1}
        user={user}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
