
export const waiting = async (timer: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, timer));
}

export const existsBigIntInArray = (arr: bigint[], value: bigint): boolean => {
    return arr.some((item) => item === value);
};