import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useActionData } from "@remix-run/react";
import Expense_Form from "~/components/expenses/Expenses_Form";
import { authenticate } from "~/utils/auth/functions.server";
import { createOperationalExpense } from "~/utils/expenses/db.server";
import { getExpenseFormData } from "~/utils/expenses/functions.server";
import { ExpenseErrors } from "~/utils/expenses/types";
import { expensesSchema } from "~/utils/expenses/validation.server";
import { createLog } from "~/utils/logs/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });
  return null;
}
export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 2 });

  const formData = await request.formData();
  const vendorData = getExpenseFormData(formData);

  const validationResult = expensesSchema.safeParse(vendorData);
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const new_expense = await createOperationalExpense(validationResult.data);
  await createLog({
    userId,
    log_type: "create",
    log_message: `Created Expense Record. Link: /transactions/expenses/${new_expense.expense_id}`,
  });
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
