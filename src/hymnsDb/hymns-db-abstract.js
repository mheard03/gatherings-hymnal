class HymnsDbAbstract {
  static hymnCompare(a,b) {
    let result = 0;
    if (result == 0 && a.hymnal && b.hymnal) result = a.hymnal.priority - b.hymnal.priority;
    if (result == 0) result = a.hymnNo - b.hymnNo;
    if (result == 0) result = a.hymnNoTxt - b.hymnNoTxt;
    if (result == 0) result = a.suffix - b.suffix;
    return result;
  }

  static hymnCompareAlpha(a,b) {
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  }
}

export default HymnsDbAbstract;