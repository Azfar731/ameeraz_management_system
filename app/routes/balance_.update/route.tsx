import { ActionFunctionArgs } from "@remix-run/node";
import {
  Form, replace,
  useActionData,
  useNavigation,
  useSearchParams
} from "@remix-run/react";
import { create_balance_transaction } from "~/utils/balance_transactions/db.server";
import { balance_transaction_schema } from "~/utils/balance_transactions/validation.server";
import { authenticate } from "~/utils/auth/functions.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticate({ request, requiredClearanceLevel: 2 });

  const searchParams = new URL(request.url).searchParams;
  const type = searchParams.get("type");
  const formData = await request.formData();
  const amount = formData.get("amount");

  //perform validation
  const validationResult = balance_transaction_schema.safeParse({
    amount,
    type,
  });
  if (!validationResult.success) {
    return { error_messages: validationResult.error.flatten().fieldErrors };
  }

  await create_balance_transaction({
    amount: validationResult.data.amount,
    type: validationResult.data.type,
    userId,
  });

  throw replace("/balance");
}

export default function Balance_Update() {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Form method="post" className="bg-white p-6 rounded shadow-md w-80">
        <label
          htmlFor="amount"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Enter Amount
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          min={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
        />
        {actionData?.error_messages.amount ? (
          <div className="text-red-700">
            {actionData.error_messages.amount[0]}
          </div>
        ) : undefined}
        <button
          type="submit"
          className={`w-full ${
            searchParams.get("type") === "add"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          } text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed`}
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
        >
          {searchParams.get("type") === "add"
            ? "Add Balance"
            : "Subtract Balance"}
        </button>
      </Form>
    </div>
  );
}
