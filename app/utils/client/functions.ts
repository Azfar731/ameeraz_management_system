const getSearchParams = (searchParams: URLSearchParams) => {
    const mobile_num = searchParams.get("mobile_num") || undefined;
    const fname = searchParams.get("fname") || undefined;
    const lname = searchParams.get("lname") || undefined;
    const subscribe = searchParams.get("subscribe") || undefined;
    const areas = searchParams.get("areas")?.split("|");

    return { mobile_num, fname, lname, areas, subscribe };
};


export {getSearchParams}