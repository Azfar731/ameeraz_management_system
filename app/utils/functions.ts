function capitalizeFirstLetter(str: string) {
    if (str.length === 0) return str; // Return the string as is if it's empty
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export { capitalizeFirstLetter };
