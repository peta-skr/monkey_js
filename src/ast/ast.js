import * as token from "../token/token.js";

export class Node {
  constructor() {}

  TokenLiteral() {}

  String() {}
}

export class Statement extends Node {
  constructor() {
    super();
  }
  statementNode() {}
}

export class Expression extends Node {
  constructor() {
    super();
  }

  expressionNode() {}
}

export class Program extends Node {
  constructor() {
    super();
    this.Statements = [];
  }

  TokenLiteral() {
    if (this.Statements.length > 0) {
      return this.Statements[0].TokenLiteral();
    } else {
      return "";
    }
  }

  String() {
    let out = "";

    for (let s of this.Statements) {
      out += s.String();
    }

    return out.toString();
  }
}

export class LetStatement extends Statement {
  constructor(tok) {
    super();
    this.token = tok;
    this.name;
    this.value;
  }

  statementNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = "";

    out += this.TokenLiteral() + " ";
    out += this.name.String();
    out += " = ";

    if (this.value != null) {
      out += this.value.String();
    }

    out += ";";

    return out.toString();
  }
}

export class Identifier extends Expression {
  constructor(tok, value) {
    super();
    this.token = tok;
    this.value = value;
  }

  expressionNode() {}
  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    return this.value;
  }
}

export class ReturnStatement extends Statement {
  constructor(tok) {
    super();
    this.token = tok;
    this.returnValue;
  }

  statementNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = "";

    out += this.TokenLiteral() + " ";

    if (this.returnValue != null) {
      out += this.returnValue.String();
    }

    out += ";";

    return out.toString();
  }
}

export class ExpressionStatement extends Statement {
  constructor(tok) {
    super();
    this.token = tok;
    this.expression;
  }

  statementNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    if (this.expression !== null) {
      return this.expression.String();
    }

    return "";
  }
}

export class IntegerLiteral extends Expression {
  constructor(tok, value) {
    super();
    this.token = tok;
    this.value;
  }

  expressionNode() {}
  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    return this.token.literal;
  }
}

export class PrefixExpression extends Expression {
  constructor(tok, operator) {
    super();
    this.token = tok;
    this.operator = operator;
    this.right;
  }

  expressionNode() {}
  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let str = "(";
    str += this.operator;
    str += this.right.String();
    str += ")";

    return str;
  }
}

export class InfixExpression extends Expression {
  constructor(tok, left, operator) {
    super();
    this.token = tok;
    this.left = left;
    this.operator = operator;
    this.right;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let str = "(";
    str += this.left.String();
    str += " " + this.operator + " ";
    str += this.right.String();
    str += ")";

    return str;
  }
}

export class Boolean extends Expression {
  constructor(tok, value) {
    super();
    this.token = tok;
    this.value = value;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    return this.token.literal;
  }
}

export class IfExpression extends Expression {
  constructor(tok) {
    super();
    this.token = tok;
    this.condition;
    this.consequence;
    this.alternative;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = "";

    out += "if";
    out += this.condition.String();
    out += " ";
    out += this.consequence.String();

    if (this.alternative != null) {
      out += "else ";
      out += this.alternative.String();
    }

    return out.toString();
  }
}

export class BlockStatement extends Statement {
  constructor(tok) {
    super();

    this.token = tok;
    this.statements;
  }

  StatementNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = "";

    for (let stmt of this.statements) {
      out += stmt.String();
    }
    return out.toString();
  }
}

export class FunctionLiteral extends Expression {
  constructor(tok) {
    super();
    this.token = tok;
    this.parameters = [];
    this.body;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = "";

    let params = [];
    for (let p of this.parameters) {
      params.push(p);
    }

    out += this.TokenLiteral();
    out += "(";
    out += params.join(", ");
    out += ") ";
    out += this.body.String();

    return out.toString();
  }
}

export class CallExpression extends Expression {
  constructor(tok, func) {
    super();
    this.token = tok;
    this.function = func;
    this.arguments;
  }

  expressionNode() {}

  TokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = "";

    let args = [];
    for (let a of this.arguments) {
      args.push(a.String());
    }

    out += this.function.String();
    out += "(";
    out += args.join(", ");
    out += ")";

    return out.toString();
  }
}
