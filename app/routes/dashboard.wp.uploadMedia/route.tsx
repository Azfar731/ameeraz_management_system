import { deleteMedia, getAllMedia } from "~/utils/media/db.server";
import { Media } from "@prisma/client";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { FaPlus } from "react-icons/fa";
import { ActionFunctionArgs } from "@remix-run/node";
import { send_delete_request } from "~/utils/wp_api/mediaFunctions.server";
import { formatDate } from "shared/utilityFunctions";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
export async function loader() {
  const media = await getAllMedia();
  return { media };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "DELETE") {
    console.log("recieved a delete request");
    const { id } = await request.json();
    if (!id) {
      return { message: "No ID provided" };
    }
    const response = await send_delete_request(id);

    if (response) {
      await deleteMedia(id);
      return { message: "Media Deleted" };
    } else {
      return { message: "META request returned an error" };
    }
  }
  return null;
}

export default function All_Media() {
  const { media } = useLoaderData<{ media: Media[] }>();
  const actionData = useActionData<{ message: string }>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const handleDeletion = (id: string) => {
    submit({ id }, { method: "delete", encType: "application/json" });
  };

  useEffect(() => {
    if (actionData?.message) {
      actionData.message === "Media Deleted"
        ? toast.success(actionData.message)
        : toast.error(actionData.message);
    }
  }, [actionData]);
  //table values
  const nodes = [...media];
  const data = { nodes };

  const COLUMNS = [
    {
      label: "Created At",
      renderCell: (item: Media) => formatDate(item.created_at),
    },
    {
      label: "Name",
      renderCell: (item: Media) => `${item.name}`,
    },
    {
      label: "Type",
      renderCell: (item: Media) => `${item.type}`,
    },
    {
      label: "Delete",
      renderCell: (item: Media) => (
        <button
          className="border px-2 py-1 rounded-md bg-red-500 hover:bg-red-600 text-sm font-semibold text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={
            navigation.state === "loading" || navigation.state === "submitting"
          }
          onClick={() => handleDeletion(item.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: `
               background-color: #eaf5fd;
             `,
      Row: `
               &:nth-of-type(odd) {
                 background-color: #d2e9fb;
               }
 
               &:nth-of-type(even) {
                 background-color: #eaf5fd;
               }
             `,
    },
  ]);

  return (
    <div className="m-8">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-4xl text-gray-700">
          Media Files
        </h1>
      </div>
      <div className="mt-10">
        <Link
          to="create"
          className="w-44 bg-green-500 hover:bg-green-600 text-white flex items-center justify-around font-bold py-2 px-4 rounded"
        >
          Upload Media <FaPlus />
        </Link>
        <div className="mt-6">
          <CompactTable columns={COLUMNS} data={data} theme={theme} />
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}
