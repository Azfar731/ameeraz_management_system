import { TransactionType } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  replace,
} from "@remix-run/node";
import {
  Form,
  useOutletContext,
  useSubmit,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import Select from "react-select";
import { authenticate } from "~/utils/auth/functions.server";
import {
  getAllTransactionMenuOptions,
  getSingleTransactionMenuOption,
} from "~/utils/functions";
import { ProductSaleRecordCreateFormType } from "~/utils/productSaleRecord/types";
import { productSaleRecordCreate1Schema } from "~/utils/productSaleRecord/validation.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate({ request, requiredClearanceLevel: 2 });
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate({request, requiredClearanceLevel: 2 });

  const formData = await request.formData();

  const transaction_type = formData.get("transaction_type");
  const validationResult = productSaleRecordCreate1Schema.safeParse({
    transaction_type,
  });
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }
  throw replace("part2");
}

export default function Product_Sale_Record_Create_Part1() {
  const navigation = useNavigation();
  const actionData = useActionData<{
    errors: { transaction_type: string[] };
  }>();
  //hooks
  const submit = useSubmit();
  const { formData, setFormData } = useOutletContext<{
    formData: ProductSaleRecordCreateFormType;
    setFormData: React.Dispatch<
      React.SetStateAction<ProductSaleRecordCreateFormType>
    >;
  }>();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const transaction_type = formData.get("transaction_type")?.toString() || "";
    setFormData((prev) => ({
      ...prev,
      transaction_type: transaction_type as TransactionType,
    }));
    submit(form);
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Form
        method="post"
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <label
          htmlFor="transaction_type"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Transaction Type
        </label>
        <Select
          options={getAllTransactionMenuOptions()}
          name="transaction_type"
          id="transaction_type"
          defaultValue={getSingleTransactionMenuOption(
            formData.transaction_type
          )}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
          required
        />
        {actionData?.errors.transaction_type && (
          <p className="text-red-500 text-xs italic">
            {actionData.errors.transaction_type.join(", ")}
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
        >
          Next
        </button>
      </Form>
    </div>
  );
}
