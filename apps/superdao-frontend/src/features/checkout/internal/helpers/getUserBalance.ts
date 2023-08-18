export const getUserBalance = (balance: string, decimals: number) => parseInt(balance, 10) / 10 ** decimals;
