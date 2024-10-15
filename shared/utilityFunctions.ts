
function formatDate(input: Date|string): string {
    let date: Date
    if(typeof input === "string"){
        date = new Date(input)
    }else{
        date = input
    }
    
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export { formatDate };
