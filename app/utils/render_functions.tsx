const generate_heading = (
  title: string,
  subHeading1: string,
  subHeading2: string
) => {
  return [
    <h2
      key={title}
      className="col-span-2 text-xl font-semibold text-gray-800 mt-4 border-b pb-2"
    >
      {title}
    </h2>,
    <h3
      key={`${title} SubHeading 1`}
      className="font-medium text-gray-600 mt-2"
    >
      {subHeading1}
    </h3>,
    <h3
      key={`${title} SubHeading 2`}
      className="font-medium text-gray-600 mt-2"
    >
      {subHeading2}
    </h3>,
  ];
};

function renderZodErrors(errors: Record<string, string[] | undefined>) {
  const errors_jsx: JSX.Element[] = [];
  Object.entries(errors).forEach(([field, messages]) => {
    if (messages && messages.length > 0) {
      console.log(`Field: ${field}`);
      messages[0];
      errors_jsx.push(
        <h2 className="text-red-500 font-semibold">{`${field}: ${messages[0]}`}</h2>
      );
    }
  });
  return errors_jsx;
}

export { generate_heading, renderZodErrors };
