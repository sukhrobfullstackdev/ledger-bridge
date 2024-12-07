export function formatRoundNumber(numberString) {
  const floatValue = parseFloat(numberString);

  if (!isNaN(floatValue) && Number.isInteger(floatValue)) {
    return floatValue.toFixed(1);
  } else {
    return numberString;
  }
}