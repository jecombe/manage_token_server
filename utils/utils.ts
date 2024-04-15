
export const waiting = async (): Promise<void>  => {
    return new Promise((resolve) => setTimeout(resolve, 2000));

}