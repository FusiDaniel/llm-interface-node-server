export const stringNormalizer = (value: string) => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        // .normalize('NFD')
        // .replace(/[\u0300-\u036f]/g, '');
}

export const stringParser = (value: string) => {
    const processedValue = value.replace('json', '').replace(/```/g, '')
    return JSON.parse(processedValue) as string[]; 
}