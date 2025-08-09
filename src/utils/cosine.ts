export const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((acc, val) => acc + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((acc, val) => acc + val ** 2, 0));
  return dot / (magA * magB + 1e-10);
};
export const normalizeVector = (vec: number[]): number[] => {
  const mag = Math.sqrt(vec.reduce((acc, val) => acc + val ** 2, 0));
  return vec.map(val => val / (mag + 1e-10));
};