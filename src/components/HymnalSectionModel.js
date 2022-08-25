class HymnalSectionModel {
  constructor(definition, parent) {
    this.parent = parent;
    this.name = definition.name || "";
    this.children = [];
    this.hymnIds = [];
    this.range = [];

    if (!definition.children && !definition.hymnIds && !definition.range) {
      return;
    }

    if (definition.children && definition.children.length) {
      this.children = definition.children
        .map(cd => new HymnalSectionModel(cd, this))
        .filter(c => c.range && c.range.length);

      if (definition.hymnIds && definition.hymnIds.length) {
        // Create anonymous section
        let dummyChild = new HymnalSectionModel({ name: "", hymnIds: definition.hymnIds, isVirtual: true }, this);
        this.children.unshift(dummyChild);
      }
      else if (definition.range && definition.range.length) {
        // Make sure range fully contains all children
        let range = definition.range;
        let childRanges = this.children.map(r => r.range).filter(r => r.length);
        let rangeMins = [range[0], ...childRanges.map(r => r[0])].filter(n => n || n === 0);
        let rangeMaxes = [range[1], ...childRanges.map(r => r[1])].filter(n => n || n === 0);
        range = [Math.min(...rangeMins), Math.max(...rangeMaxes)];

        // Make sure a child exists for every hymn in range
        let dummyChild;
        for (let i = range[0]; i <= range[1]; i++) {
          let child = this.children.find(c => c.range && c.range[0] <= i && c.range[1] >= i);
          if (child) {
            dummyChild = undefined;
            continue;
          };
          
          if (!dummyChild) {
            dummyChild = new HymnalSectionModel({ name: "", range: [i, i], isVirtual: true }, this);
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
      }
      delete this.hymnIds;
    }
    else {
      // No children to worry about; this is a leaf node.
      if (definition.hymnIds) {
        this.hymnIds = definition.hymnIds;
        delete this.range;
      }
      else if (definition.range) {
        this.range = [Math.min(...definition.range), Math.max(...definition.range)];
      }
    }
  }

  get htmlId() {
    let myId = (this.name || "")
      .toLocaleLowerCase()
      .replace(/[\s]+/g, " ")
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9\-]/gi, "");
    if (/^[0-9]/.test(myId)) myId = 's' + myId;
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

  populateHymns(hymns) {
    let leafSections = this.descendantsAndSelf.filter(s => !s.children || s.children.length == 0);
    for (let s of leafSections) {
      if (s.range) {
        s.hymns = hymns.filter(h => h.hymnNo >= s.range[0] && h.hymnNo <= s.range[1]);
      }
      else if (s.hymnIds) {
        let matches = hymns.filter(h => s.hymnIds.includes(h.hymnId));
        s.hymns = s.hymnIds.map(id => matches.find(h => h.hymnId == id));
      }
      s.hymns = s.hymns.filter(h => h && !h.isStub);
    }
  }
}

export { HymnalSectionModel };
export default HymnalSectionModel;