
export interface LogEntry {
    args: {
        from?: string;
        to?: string;
        value?: bigint;
        owner?: string;
        sender?: string;
    };
    eventName: string;
    blockNumber: bigint;
    transactionHash: string;
}

export interface ParsedLog {
    eventName: string;
    from?: string;
    to?: string;
    owner?: string;
    sender?: string;
    blockNumber: string;
    value: number;
    transactionHash: string;
}

export interface ResultBdd {
    blocknumber: string;
    eventname: string;
    fromaddress: string;
    toaddress: string;
    value: string;
}
