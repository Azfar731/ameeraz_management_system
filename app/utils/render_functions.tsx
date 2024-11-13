
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


  export { generate_heading}
