import { Prisma, User } from "@prisma/client";
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
    throw new Response("No Id found in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const user = await getUserFromId(id);
  if (!user) {
    throw new Response(`No user found with id ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return { user };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("No Id found in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const user = await getUserFromId(id);
  if (!user) {
    throw new Response(`No user found with id ${id}`, {
      status: 404,
      statusText: "Not Found",
    });
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
  try {
    const updated_user = await updateUser({
      id,
      updates: validationResult.data,
    });
    throw replace(`/dashboard/users/${updated_user.id}`);
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

export default function Update_User() {
  const { user } = useLoaderData<{ user: User }>();
  const actionData = useActionData<{
    errorMessages: UpdateUserErrorMessages;
  }>();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <User_Form
        currentUserClearanceLevel={1}
        user={user}
        errorMessages={actionData?.errorMessages}
      />
    </div>
  );
}
