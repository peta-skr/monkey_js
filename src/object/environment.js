export function newEnvironment() {
  let s = new Map();
  return new Environment(s);
}

class Environment {
  constructor(store) {
    this.store = store;
  }

  get(name) {
    let obj = this.store.get(name);
    return obj;
  }

  set(name, val) {
    this.store.set(name, val);
    return val;
  }

  has(name) {
    return this.store.has(name);
  }
}
