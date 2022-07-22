class HymnalSectionModel {
  constructor(definition, parent) {
    this.parent = parent;
    this.name = definition.name || "";
    this.hymns = definition.hymns || [];
    this.range = [];
    this.children = [];

    if (!definition.range && !definition.children) {
      return;
    }

    let range = definition.range || [];
    if (definition.children && definition.children.length) {
      this.children = definition.children
        .map(cd => new HymnalSectionModel(cd, this))
        .filter(c => c.range && c.range.length);

      // Make sure range fully contains all children
      let childRanges = this.children.map(r => r.range).filter(r => r.length);
      let rangeMins = [range[0], ...childRanges.map(r => r[0])].filter(n => n || n === 0);
      let rangeMaxes = [range[1], ...childRanges.map(r => r[1])].filter(n => n || n === 0);
      this.range = [Math.min(...rangeMins), Math.max(...rangeMaxes)];

      // Make sure a child exists for every hymn in range
      let dummyChild;
      for (let i = this.range[0]; i <= this.range[1]; i++) {
        let child = this.children.find(c => c.range && c.range[0] <= i && c.range[1] >= i);
        if (child) {
          dummyChild = undefined;
          continue;
        };
        
        if (!dummyChild) {
          dummyChild = new HymnalSectionModel({ name: "", range: [i, i], isVirtual: true });
          this.children.push(dummyChild);
        }
        dummyChild.range[1] = i;
      }

      // Put the children in order
      this.children.sort((a,b) => {
        if (!a.range || !b.range) return 0;
        if (a.range.length < 2 || b.range.length < 2) return 0;
        return a.range[0] - b.range[0];
      });

      delete this.range;
    }
    else {
      this.range = definition.range;
    }
  }

  get htmlId() {
    let myId = (this.name || "")
      .toLocaleLowerCase()
      .replace(/[\s]+/g, " ")
      .replaceAll(" ", "-")
      .replace(/[^a-z\-]/gi, "");
    myId = myId || `s${this.index}`;
    
    if (!this.parent) return myId;
    return `${this.parent.htmlId}-${myId}`;
  }

  get index() {
    if (!this.parent) return 0;
    return this.parent.children.indexOf(this);
  }

  get level() {
    return this.ancestorsAndSelf.length - 1;
  }

  get ancestorsAndSelf() {
    let ancestors = [];
    let parent = this.parent;
    while (parent) {
      ancestors.push(parent);
      parent = parent.parent;
    }
    ancestors.reverse();
    return [...ancestors, this];
  }

  get descendantsAndSelf() {
    let descendants = (this.children || []).flatMap(c => c.descendantsAndSelf);
    return [this, ...descendants];
  }

  populateHymnsFromRanges(hymns) {
    let leafSections = this.descendantsAndSelf.filter(s => !s.children || s.children.length == 0);
    for (let s of leafSections.filter(s => s.range)) {
      s.hymns = hymns.filter(h => h.hymnNo >= s.range[0] && h.hymnNo <= s.range[1]);
    }
  }
}

export { HymnalSectionModel };
export default HymnalSectionModel;