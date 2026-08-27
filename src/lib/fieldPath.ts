/**
 * fieldPath.ts
 * Safe generic field-path utility for deep object/array access and immutable updates.
 */

/**
 * Gets a value at a given path.
 * Path examples: "couple.partnerA.name", "events[0].title"
 */
export function getByPath(obj: any, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;

  const segments = path.replace(/\[(\w+)\]/g, ".$1").split(".");
  let current = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    current = current[segment];
  }

  return current;
}

/**
 * Updates a value immutably at a given path.
 * Creates nested objects and arrays as needed if they don't exist.
 */
export function setByPath(obj: any, path: string, value: any): any {
  if (!path) return obj;

  const segments = path.replace(/\[(\w+)\]/g, ".$1").split(".");

  function update(currentObj: any, index: number): any {
    if (index === segments.length) {
      return value;
    }

    const segment = segments[index];
    const isNextSegmentArrayIndex =
      index + 1 < segments.length && !isNaN(Number(segments[index + 1]));

    // Determine the default structure for the current level if it doesn't exist
    let newObj = currentObj;
    if (newObj === null || newObj === undefined) {
      newObj = isNextSegmentArrayIndex || !isNaN(Number(segment)) ? [] : {};
    } else {
      newObj = Array.isArray(newObj) ? [...newObj] : { ...newObj };
    }

    const key = isNaN(Number(segment)) ? segment : Number(segment);
    (newObj as any)[key as any] = update(((currentObj as any) || {})[key as any], index + 1);

    return newObj;
  }

  return update(obj, 0);
}
