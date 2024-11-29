function printZodErrors(errors: Record<string, string[] | undefined>) {
    Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
            console.log(`Field: ${field}`);
            messages.forEach((message, index) => {
                console.log(`  ${index + 1}. ${message}`);
            });
        }
    });
}

export { printZodErrors };
