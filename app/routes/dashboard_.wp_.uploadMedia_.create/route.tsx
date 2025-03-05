import {
  ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, redirect, useActionData, useNavigation } from "@remix-run/react";
import Select from "react-select";
import { createMedia } from "~/utils/media/db.server";
import { MediaValidation } from "~/utils/media/validation";
import { upload_media } from "~/utils/wp_api/mediaFunctions.server";

export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      directory: "/tmp",
      file: ({ filename }) => filename,
      maxPartSize: 5_000_000, // 5MB limit
    }),
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  const file = formData.get("file");
  if (!file) {
    return { errors: { file: ["File couldn't be parsed"] } };
  }

  // Convert formData to an object but manually add the file
  const formObject = Object.fromEntries(formData.entries());

  const validationResult = await MediaValidation.safeParseAsync({
    ...formObject,
    fileType: file.type,
  });
  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  const { fileType, name, type } = validationResult.data;
  try {
    const mediaId = await upload_media({
      filePath: file.filepath,
      type: fileType,
    });
    await createMedia({ id: mediaId, name, type });
    return redirect("/dashboard/wp");
  } catch (error) {
    console.log("Error: ", error);
    return { errors: { file: ["Failed to upload file to Meta Servers."] } };
  }
}

type mediaErrors = {
  name: string[];
  file: string[];
  type: string[];
};

export default function Upload_Media() {
  const actionData = useActionData<{ errors: mediaErrors }>();

  const navigation = useNavigation();

  return (
    <div className="flex justify-center  ">
      <Form
        method="post"
        encType="multipart/form-data"
        className="bg-white mt-14 p-6 rounded shadow-md w-80"
      >
        <div className="w-full flex justify-center items-center">
          <h1 className="block text-gray-700 text-2xl font-bold mt-4">
            Upload Media
          </h1>
        </div>
        <label
          htmlFor="name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          File Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
        />
        {actionData?.errors.name && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errors.name[0]}
          </h2>
        )}
        <label
          htmlFor="type"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Media Type
        </label>
        <Select
          name="type"
          options={[
            { value: "img", label: "Image" },
            { value: "vid", label: "Video" },
          ]}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
          required
        />
        {actionData?.errors.type && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errors.type[0]}
          </h2>
        )}
        <label
          htmlFor="file"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Upload File
        </label>
        <input
          type="file"
          name="file"
          accept=".mp4,.3gp,.png,.jpeg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
        />
        {actionData?.errors.file && (
          <h2 className="text-red-500 font-semibold">
            {actionData?.errors.file[0]}
          </h2>
        )}
        <div className="w-full flex justify-center items-center">
          <button
            type="submit"
            disabled={
              navigation.state === "submitting" ||
              navigation.state === "loading"
            }
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </Form>
    </div>
  );
}
