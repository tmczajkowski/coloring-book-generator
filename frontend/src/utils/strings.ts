export const stripExtension = (name: string) => {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(0, idx) : name;
};
