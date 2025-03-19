import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import {auth_schema} from "./utils/auth/validation.server";
import { getUserIdFromCreds } from "./utils/auth/functions.server";

export const authenticator = new Authenticator<string>();


authenticator.use(
    new FormStrategy(async ({ form }) => {
      // Here you can use `form` to access and input values from the form.
      const userName = form.get("username") as string; // or email... etc
      const password = form.get("password") as string;
      
      
      const validationResult = auth_schema.safeParse({ username: userName, password });
        if (!validationResult.success) {
            return "";
        }

      // Find User
      const userId = await getUserIdFromCreds({userName: userName.toLowerCase(), password});
      
      // And return the user as the Authenticator expects it
      return userId;
    }), "login"
  );


  