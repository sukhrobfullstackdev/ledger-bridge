/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode(data: Uint8Array) {
  return Buffer.from(data).toString("hex");
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text: string) {
  const str = text.startsWith("0x") ? text.substring(2) : text;
  return Buffer.from(str, "hex");
}

export function shuffle(array: any) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}
