export class ObjectType {}

export const INTEGER_OBJ = "INTEGER";
export const BOOLEAN_OBJ = "BOOLEAN";
export const NULL_OBJ = "NULL";
export const RETURN_VALUE_OBJ = "RETURN_VALUE";

export class Object {
  constructor() {}

  type() {}

  inspect() {}
}

export class Integer extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return INTEGER_OBJ;
  }

  inspect() {
    return String(this.value);
  }
}

export class Boolean extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return BOOLEAN_OBJ;
  }

  inspect() {
    return String(this.value);
  }
}

export class Null extends Object {
  constructor() {
    super();
  }

  type() {
    return NULL_OBJ;
  }

  inspect() {
    return "null";
  }
}

export class ReturnValue extends Object {
  constructor(value) {
    super();
    this.value = value;
  }

  type() {
    return RETURN_VALUE_OBJ;
  }

  inspect() {
    return this.value.inspect();
  }
}
