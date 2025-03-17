const getSearchParams = (searchParams: URLSearchParams) => {
    const client_mobile_num = searchParams.get("mobile_num") || undefined;
    const client_fname = searchParams.get("fname") || undefined;
    const client_lname = searchParams.get("lname") || undefined;
    const subscribed = searchParams.get("subscribe") || undefined;
    const client_areas = searchParams.get("areas")?.split("|");

    return {
        client_mobile_num,
        client_fname,
        client_lname,
        client_areas,
        subscribed,
    };
};

export { getSearchParams };
