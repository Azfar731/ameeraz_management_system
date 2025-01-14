import { ActionFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Expense_Form from "~/components/expenses/Expenses_Form";
import { createOperationalExpense } from "~/utils/expenses/db.server";
import { getExpenseFormData } from "~/utils/expenses/functions.server";
import { ExpenseErrors } from "~/utils/expenses/types";
import { expensesSchema } from "~/utils/expenses/validation.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const vendorData = getExpenseFormData(formData);

  const validationResult = expensesSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const new_expense = await createOperationalExpense(validationResult.data);

  throw replace(`/transactions/expenses/${new_expense.expense_id}`);
}

export default function Create_Expense() {
  const actionData = useActionData<{ errors: ExpenseErrors }>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Expense_Form errorMessages={actionData?.errors} />
    </div>
  );
}
