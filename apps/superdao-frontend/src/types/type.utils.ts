// U extends T[] to make sure every item of the array is in T,
// [T] extends [U[number]] ? unknown : 'Invalid' to make sure every item of the T type is in the past array
export const arrayOfAll =
	<T>() =>
	<U extends T[]>(array: U & ([T] extends [U[number]] ? unknown : 'Invalid')) =>
		array;
