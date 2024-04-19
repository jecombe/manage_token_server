
export const waiting = async (timer: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, timer));
};

export const existsBigIntInArray = (arr: bigint[], value: bigint): boolean => {
  return arr.some((item) => item === value);
};

export const calculateBlocksPerDay = (blockIntervalSeconds: number): number => {
  const secondsInDay = 24 * 60 * 60;
  const blocksPerDay = secondsInDay / blockIntervalSeconds;
  return Math.round(blocksPerDay);
};

export const getAbiEvent = (): string[] => {
  return [
    "event Approval(address indexed owner, address indexed sender, uint256 value)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];
};


export const subtractOneDay = (currentDate: Date): Date => {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const currentTimestamp = currentDate.getTime();
  const newTimestamp = currentTimestamp - oneDayInMilliseconds;
  return new Date(newTimestamp);
};


export const removeTimeFromDate = (currentDate: Date): Date => {
  const localDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    0,
    0,
    0,
    0
  );
  localDate.setUTCHours(0);
  localDate.setUTCMinutes(0);
  localDate.setUTCSeconds(0);
  localDate.setUTCMilliseconds(0);
  return localDate;
};


export const parseTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toString();
};
