
export const waiting = async (timer: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, timer));
}

export const existsBigIntInArray = (arr: bigint[], value: bigint): boolean => {
    return arr.some((item) => item === value);
};

export const getAbiEvent = (): string[] =>  {
    return [
        "event Approval(address indexed owner, address indexed sender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]
}