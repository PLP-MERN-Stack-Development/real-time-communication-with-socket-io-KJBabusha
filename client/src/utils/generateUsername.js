export const generateUsername = () => {
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `Anonymous-${random}`;
};
