import { FormValues } from "./category/types";
import { useSearchParams } from "@remix-run/react";
import { PaymentModes, TransactionModes } from "./types";


const capitalizeFirstLetter = (str: string) => {
  if (str.length === 0) return str; // Return the string as is if it's empty
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getPaymentOptionsAsStrings = () => {
  return ["cash", "bank_transfer", "card"];
};

const getPaymentOptions = (): PaymentModes[] => {
  return ["cash", "bank_transfer", "card"];
};
const getAllPaymentMenuOptions = (): {
  value: PaymentModes;
  label: string;
}[] => {
  return [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "card", label: "Card" },
  ];
};

const getSinglePaymentMenuOption = (
  mode_of_payment: PaymentModes,
): { value: PaymentModes; label: string } => {
  switch (mode_of_payment) {
    case "cash":
      return { value: "cash", label: "Cash" };
    case "card":
      return { value: "card", label: "Card" };
    case "bank_transfer":
      return { value: "bank_transfer", label: "Bank Transfer" };
    default:
      throw new Error(
        `Unssuported Payment Mode: ${mode_of_payment} passed to function`,
      );
  }
};

const getTransactionOptions = (): TransactionModes[] => {
  return ["sold", "bought", "returned"];
};

const getAllTransactionMenuOptions = () => {
  return [
    { value: "sold", label: "Sold" },
    { value: "bought", label: "Bought" },
    { value: "returned", label: "Returned" },
  ];
};

const getSingleTransactionMenuOption = (transaction_type: TransactionModes) => {
  switch (transaction_type) {
    case "sold":
      return { value: "sold", label: "Sold" };
    case "bought":
      return { value: "bought", label: "Bought" };
    case "returned":
      return { value: "returned", label: "Returned" };
    default:
      throw new Error(
        `Unssuported Transaction Type: ${transaction_type} passed to function`,
      );
  }
};

const setSearchParameters = (
  formValues: FormValues,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
) => {
  const params = new URLSearchParams();

  // Loop over the properties of formValues and append them to params
  for (const [key, value] of Object.entries(formValues)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        // Join array values with commas and append
        params.set(key, value.join("|"));
      }
    } else if (value) {
      // Append non-empty string values
      params.set(key, value);
    }
  }

  // Set the search params in the URL
  setSearchParams(params);
};

const CreateSearchParamsString = (
  formValues: FormValues,
) => {
  const params = new URLSearchParams();

  // Loop over the properties of formValues and append them to params
  for (const [key, value] of Object.entries(formValues)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        // Join array values with commas and append
        value.forEach((val) => params.set(key, val));
      }
    } else if (value) {
      // Append non-empty string values
      params.set(key, value);
    }
  }

  // Set the search params in the URL
  return params;
};






export {
  capitalizeFirstLetter,
  CreateSearchParamsString,
  getAllPaymentMenuOptions,
  getAllTransactionMenuOptions,
  getPaymentOptions,
  getPaymentOptionsAsStrings,
  getSinglePaymentMenuOption,
  getSingleTransactionMenuOption,
  getTransactionOptions,
  setSearchParameters,
  
  
};
