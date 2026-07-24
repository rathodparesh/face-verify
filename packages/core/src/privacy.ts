const sensitiveArrays = new Set<number[]>();
const objectUrls = new Set<string>();
export function registerSensitiveArray(value: number[]): number[] { sensitiveArrays.add(value); return value; }
export function registerObjectUrl(value: string): string { objectUrls.add(value); return value; }
export function clearSensitiveData(): void {
  sensitiveArrays.forEach((array) => array.fill(0)); sensitiveArrays.clear();
  objectUrls.forEach((url) => URL.revokeObjectURL(url)); objectUrls.clear();
}
