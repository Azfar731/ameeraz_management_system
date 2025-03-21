import { ActionFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import User_Form from "~/components/users/user_form";
import { getClearanceLevel } from "~/utils/auth/functions";
import { createUser } from "~/utils/user/db.server";
import { CreateUserErrorMessages } from "~/utils/user/types";
import { NewUserValidation } from "~/utils/user/validation.server";
import { Prisma } from "@prisma/client";
export async function loader() {
  const loggedInUserClearanceLevel = 4;
  return { loggedInUserClearanceLevel };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const dataObject = Object.fromEntries(formData.entries());
  console.log("Form Object: ", dataObject);
  const validationResult = NewUserValidation({
    loggedInUserClearance: getClearanceLevel("admin"),
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
