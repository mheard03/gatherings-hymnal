function tokenizeHymnId(hymnId) {
  if (!hymnId || !hymnId.trim) return;

  let tokens = hymnId.trim().split('-');
  if (tokens.length < 2 || tokens.length > 3) return;

  let [hymnal, hymnNo, suffix] = tokens;
  hymnNo = parseInt(hymnNo);

  // Validate
  if (!hymnal.length) return; // hymnal name must not be blank
  if (isNaN(hymnNo) || hymnNo < 1 || hymnNo.toString() != tokens[1]) return; // hymnNo must be numeric
  if (suffix && suffix.length != 1) return; // suffix must be length 1 if it exists

  return { hymnal, hymnNo, suffix };
}

class Hymn {
  Hymn() {
    this.hymnId = undefined;
    this.lines = [];
  }
  get hymnal() {
    return tokenizeHymnId(this.hymnId).hymnal;
  }
  get hymnNo() {
    return tokenizeHymnId(this.hymnId).hymnNo;
  }
  get suffix() {
    return tokenizeHymnId(this.hymnId).suffix;
  }
}

export default Hymn;
