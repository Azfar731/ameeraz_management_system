export default function View({
    pairs,
  }: {
    pairs: { title: string; value: string | number }[];
  }) {
    console.log(pairs);
    const render_cols = pairs.map((pair) => <h2 key={pair.title}>pair.title</h2>);
    const render_values = pairs.map(pair => <h2 key={pair.value}>pair.value</h2>);
    const grid_container = "w-1/2 h-full grid grid-cols-1 gap-4"
    return (
    <div className="w-2/3 bg-grey-500 flex">
      <div className={grid_container}>
          {render_cols}
      </div>
      <div className={grid_container}>
          {render_values}
      </div>
    </div>);
  }
  