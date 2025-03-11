import { Operational_Expenses } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData, useLoaderData } from "@remix-run/react";
import Expense_Form from "~/components/expenses/Expenses_Form";
import { authenticate } from "~/utils/auth/functions.server";
import {
  getOperationalExpenseById,
  updateOperationalExpense,
} from "~/utils/expenses/db.server";
import { getExpenseFormData } from "~/utils/expenses/functions.server";
import { ExpenseErrors } from "~/utils/expenses/types";
import { expensesSchema } from "~/utils/expenses/validation.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });
  
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const expense = await getOperationalExpenseById(id);
  if (!expense) {
    throw new Response(`Expense with id:${id} not found`, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { expense };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Id not provided in URL", {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const formData = await request.formData();
  const vendorData = getExpenseFormData(formData);

  const validationResult = expensesSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const updated_expense = await updateOperationalExpense({
    id,
    ...validationResult.data,
  });

  throw replace(`/transactions/expenses/${updated_expense.expense_id}`);
}

export default function Create_Expense() {
  const loaderData = useLoaderData<{ expense: Operational_Expenses }>();
  const actionData = useActionData<{ errors: ExpenseErrors }>();

  //changing Date types
  const expense = {
    ...loaderData.expense,
    created_at: new Date(loaderData.expense.created_at),
    modified_at: new Date(loaderData.expense.modified_at),
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Expense_Form expense={expense} errorMessages={actionData?.errors} />
    </div>
  );
}
