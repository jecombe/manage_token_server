
export const waiting = async (timer: number): Promise<void>  => {
    return new Promise((resolve) => setTimeout(resolve, timer));
}