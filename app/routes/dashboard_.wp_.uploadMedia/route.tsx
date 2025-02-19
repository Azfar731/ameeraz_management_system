import {
  ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
import Select from "react-select";
import { upload_media } from "~/utils/wp_api/mediaFunctions.server";

export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      directory: "/tmp",
      maxPartSize: 5_000_000, // 5MB limit
    }),
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { errors: { file: ["File upload error. Uplaod a Valid file"] } };
  }

  try {
    const mediaId = await upload_media(file);
    throw redirect(`/dashboard/wp`);
  } catch (error) {
    return { errors: { file: ["Failed to upload file to Meta Servers"] } };
  }
}

export default function Upload_Media() {
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
          htmlFor="file_name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          File Name
        </label>
        <input
          type="text"
          name="file_name"
          id="file_name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          required
        />
        <label
          htmlFor="media_type"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Media Type
        </label>
        <Select
          name="media_type"
          options={[
            { value: "img", label: "Image" },
            { value: "vid", label: "Video" },
          ]}
          className="basic-multi-select mb-4"
          classNamePrefix="select"
          required
        />
        <label
          htmlFor="file_name"
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
        <div className="w-full flex justify-center items-center">
          <button
            type="submit"
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload
          </button>
        </div>
      </Form>
    </div>
  );
}
