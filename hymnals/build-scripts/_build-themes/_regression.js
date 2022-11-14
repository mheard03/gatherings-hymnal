/*
class Regression {
  constructor(data) {
    let points = {
      maxX: [Infinity * -1, 0],
      minX: [Infinity, 0],
      absMinX: [Infinity, 0]
    };
    for (let point of data) {
      let x = point[0];
      if (x > points.maxX[0]) points.maxX = point;
      if (x < points.minX[0]) points.minX = point;
      if (Math.abs(x) < points.absMinX[0]) points.absMinX = point;
    }

    this.linear = new LinearSolver(data, [points.absMinX]).find();
    this.quadratic = new QuadraticSolver(data, [points.minX, points.maxX]).find();
    this.best = (this.linear.r <= this.quadratic.r) ? this.linear : this.quadratic;
  }
}

class Solver {
  constructor(data, intercepts) {
    this.data = data;
    this.intercepts = intercepts;
  }

  leastSquares(f) {
    let distances = this.data.map(d => f(d[0]) - d[1]);
    return distances.reduce((a,b) => a + b * b);
  }

  determineNext(left, center, right) {
    let options = [left, center, right];
    options.sort((a,b) => a.r - b.r);
    if (options[2] == center) {
      let best = this.getQuadratic(options[0].a * 2);
      return [best, center]; 
    }
    else {
      return [options[0], options[1]];
    }
  }
}

class LinearSolver extends Solver {
  constructor(data, intercepts) {
    super(data, intercepts);
  }

  build(a) {
    // y = a*x + b
    let b = this.intercepts[0][1];
    let result = (x) => a*x + b;
    Object.assign(result, {a, b, r: this.leastSquares(result) });
    return result;
  }

  find(left = -1, right = 1) {
    left = (typeof(left) == "number") ? this.build(left) : left;
    right = (typeof(right) == "number") ? this.build(right) : right;
    let e = 0.001;
  
    let center = this.build((left.a + right.a) / 2);
    if (Math.abs(left.r - right.r) < e) {
      return center;
    }
  
    return this.find(...this.determineNext(left, center, right));
  }
}

class QuadraticSolver extends Solver {
  constructor(data, intercepts) {
    super(data, intercepts);
        
    let translate = function (v, t) {
      return v.map((vCoord, i) => vCoord + t[i]);
    }

    let t = intercepts[0].map(i => -i);
    this.translated = {
      intercepts: this.intercepts.map(i => translate(i, t)),
      data: this.data.map(d => translate(d, t))
    }
  }

  build(a) {
    // y = a*x^2 + b*x + c
    // b = -(a*x^2 + c - y)/x
    let c = this.intercepts[0][1];
    let b;
    {
      let x = this.translated.intercepts[1][0];
      let y = this.translated.intercepts[1][1];
      b = -(a*x*x + y)/x;
    }
    
    let result = (x) => a*x*x + b*x + c;
    Object.assign(result, {a, b, c, r: this.leastSquares(result) });
    return result;
  }

  find(left = -1, right = 1) {
    left = (typeof(left) == "number") ? this.build(left) : left;
    right = (typeof(right) == "number") ? this.build(right) : right;
    let e = 0.001;
  
    let center = this.build((left.a + right.a) / 2);
    if (Math.abs(left.r - right.r) < e) {
      return center;
    }
    return this.find(...this.determineNext(left, center, right));
  }
}

export default Regression;
*/