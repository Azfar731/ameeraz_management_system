import {
  Form,
  Link,
  Outlet,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { RiArrowDropRightLine, RiArrowDropLeftLine } from "react-icons/ri";

export default function BalanceRoute() {
  const params = useParams();
  const date_param = params.date || new Date().toISOString().split("T")[0];

  console.log("Date Param:", date_param);
  const navigation = useNavigation();
  const isNavigating =
    navigation.state === "loading" || navigation.state === "submitting";
  const navigate = useNavigate();
  const current_date_string = new Date().toISOString().split("T")[0];

  const nextDate = () => {
    if (date_param === current_date_string) return null;
    const date = new Date(date_param);
    date.setDate(date.getDate() + 1);
    navigate(`/balance/${date.toISOString().split("T")[0]}`);
  };
  //create a function to go to previous date
  const prevDate = () => {
    const date = new Date(date_param);
    date.setDate(date.getDate() - 1);
    navigate(`/balance/${date.toISOString().split("T")[0]}`);
  };

  const handleNavigation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const date = formData.get("date") as string;
    if (date) {
      navigate(`/balance/${date}`);
    }
  };

  return (
    <div className="m-4 pb-4">
      <div className="w-full flex justify-center items-center ">
        <h1 className=" font-semibold text-6xl text-gray-700">Balance Page</h1>
      </div>
      <section className="flex justify-between items-center">
        <Form
          method="get"
          onSubmit={handleNavigation}
          className="bg-gray-100 rounded-lg w-1/4 px-8 py-4"
        >
          <h2 className="text-3xl font-semibold text-gray-700 mt-6">
            Fetch Balance Records
          </h2>
          <label
            htmlFor="date"
            className="block text-gray-700 text-sm font-bold mt-4"
          >
            Date
          </label>
          <input
            id="date"
            name="date"
            aria-label="Date"
            type="date"
            defaultValue={date_param}
            max={current_date_string}
            className=" mt-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:text-sm"
          />
          <button
            type="submit"
            disabled={isNavigating}
            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Fetch
          </button>
        </Form>
        <div className="flex flex-col gap-4">
          <button
            disabled={isNavigating}
            className="w-60 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Link
              to={`/balance/update?type=add`}
              className="flex items-center justify-between"
              aria-disabled={isNavigating}
            >
              Add Balance <FaPlus />
            </Link>
          </button>
          <button
            disabled={isNavigating}
            className="w-60 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Link
              to={`/balance/update?type=subtract`}
              className="flex items-center justify-between"
              aria-disabled={isNavigating}
            >
              Subtract Balance <FaMinus />
            </Link>
          </button>
        </div>
      </section>
      <section>
        <h2 className="text-4xl text-center font-semibold text-gray-700 mt-6">
          Balance Data
        </h2>
        <section className="flex justify-center items-center gap-8">
          <button
            type="button"
            onClick={prevDate}
            className="h-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded "
          >
            <RiArrowDropLeftLine size={40} />
          </button>
          <Outlet />
            <button
            onClick={nextDate}
            className="h-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isNavigating || date_param === current_date_string}
          >
            <RiArrowDropRightLine size={40} />
          </button>
        </section>
      </section>
    </div>
  );
}
