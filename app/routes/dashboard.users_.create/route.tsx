import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import User_Form from "~/components/users/user_form";
import { getClearanceLevel } from "~/utils/auth/functions";
import { createUser, getUserFromId } from "~/utils/user/db.server";
import { CreateUserErrorMessages } from "~/utils/user/types";
import { NewUserValidation } from "~/utils/user/validation.server";
import { Prisma } from "@prisma/client";
import { authenticate } from "~/utils/auth/functions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 3 });
  const user = await getUserFromId(userId);
  if (!user) {
    throw new Error("No User exists for id returned by authenticate function");
  }
  const loggedInUserClearanceLevel = getClearanceLevel(user.role);
  return { loggedInUserClearanceLevel };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 3 });
  const user = await getUserFromId(userId);
  if (!user) {
    throw new Error("No User exists for id returned by authenticate function");
  }
  const formData = await request.formData();
  const dataObject = Object.fromEntries(formData.entries());
  const validationResult = NewUserValidation({
    loggedInUserClearance: getClearanceLevel(user.role),
  }).safeParse(dataObject);
  if (!validationResult.success) {
    return { errorMessages: validationResult.error.flatten().fieldErrors };
  }
  try {
    const new_user = await createUser(validationResult.data);
    throw replace(`/dashboard/users/${new_user.id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          errorMessages: {
            userName: [
              `User with username ${validationResult.data.userName} already exists`,
            ],
          },
        };
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

export default function Create_User() {
  const { loggedInUserClearanceLevel } = useLoaderData<{
    loggedInUserClearanceLevel: number;
  }>();
  const actionData = useActionData<{
    errorMessages: CreateUserErrorMessages;
  }>();

  return (
    <div className="flex justify-center">
      <User_Form
        currentUserClearanceLevel={loggedInUserClearanceLevel}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
