export class ObjectType {}

export const INTEGER_OBJ = "INTEGER";
export const BOOLEAN_OBJ = "BOOLEAN";
export const NULL_OBJ = "NULL";
export const RETURN_VALUE_OBJ = "RETURN_VALUE";
export const ERROR_OBJ = "ERROR";

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

export class Error extends Object {
  constructor(message) {
    super();
    this.message = message;
  }

  type() {
    return ERROR_OBJ;
  }

  inspect() {
    return "ERROR: " + this.message;
  }
}
