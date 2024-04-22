
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
  console.log("======================> ", currentDate);
  
  // Obtenir l'année, le mois et le jour de la date actuelle en utilisant UTC
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();
  const day = currentDate.getUTCDate();

  // Créer une nouvelle instance de Date avec seulement la date (heure par défaut à minuit) en utilisant UTC
  const dateOnly = new Date(Date.UTC(year, month, day));

  console.log("After", dateOnly);
  
  return dateOnly;
};


export const parseTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toString();
};
