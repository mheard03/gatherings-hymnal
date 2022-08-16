function blankKiller(token) {
  if (!token) return null;
  if (!token.str) return null;
  if (!token.str.trim) return null;
  if (!token.str.trim()) return null;
  return token;
}

export default blankKiller;