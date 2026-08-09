// Converteix un nombre de bytes en un text llegible.
// El panell mostra consum d'emmagatzematge, i "52428800" no diu res a ningú.

const UNITS = ["B", "kB", "MB", "GB"] as const;

export const formatBytes = (bytes: number): string => {
  if (bytes <= 0) {
    return "0 B";
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  // Els bytes sencers no necessiten decimals; la resta, un de sol
  const decimals = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${UNITS[unitIndex]}`;
};
