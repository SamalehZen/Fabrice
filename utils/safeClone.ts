type CloneFn = <T>(value: T) => T;

const hasStructuredClone = typeof globalThis.structuredClone === 'function';

const fallbackClone: CloneFn = (value) => {
  if (value === null || value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
};

export const safeClone: CloneFn = (value) => {
  if (hasStructuredClone) {
    return (globalThis.structuredClone as CloneFn)(value);
  }
  return fallbackClone(value);
};
