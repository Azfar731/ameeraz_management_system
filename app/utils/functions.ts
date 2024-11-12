import { FormValues } from "./category/types";
import { useSearchParams } from "@remix-run/react";
import { PaymentModes } from "./types";

const capitalizeFirstLetter = (str: string) => {
    if (str.length === 0) return str; // Return the string as is if it's empty
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const getPaymentOptions = (): PaymentModes[] => {
    return ["cash", "bank_transfer", "card"];
};

const getPaymentMenuOptions = () => {
    return [
        { value: "cash", label: "Cash" },
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "card", label: "Card" },
    ];
};
const setSearchParameters = (formValues: FormValues, setSearchParams: ReturnType<typeof useSearchParams>[1]) => {
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

  

export { capitalizeFirstLetter, getPaymentMenuOptions, getPaymentOptions, setSearchParameters };
