import * as ast from "../ast/ast.js";
import * as token from "../token/token.js";

const LOWEST = 0;
const EQUALS = 1;
const LESSGREATER = 2;
const SUM = 3;
const PRODUCT = 4;
const PREFIX = 5;
const CALL = 6;

let precedences = new Map();
precedences.set(token.EQ, EQUALS);
precedences.set(token.NOT_EQ, EQUALS);
precedences.set(token.LT, LESSGREATER);
precedences.set(token.GT, LESSGREATER);
precedences.set(token.PLUS, SUM);
precedences.set(token.MINUS, SUM);
precedences.set(token.SLASH, PRODUCT);
precedences.set(token.ASTERISK, PRODUCT);
precedences.set(token.LPAREN, CALL);

export class Parser {
  constructor(l) {
    this.l = l;
    this.curToken;
    this.peekToken;
    this.errors = [];

    this.prefixParseFns = new Map();
    this.infixParseFns = new Map();

    this.registerPrefix(token.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(token.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(token.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(token.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(token.TRUE, this.parseBoolean.bind(this));
    this.registerPrefix(token.FALSE, this.parseBoolean.bind(this));
    this.registerPrefix(token.LPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(token.IF, this.parseIfExpression.bind(this));
    this.registerPrefix(token.FUNCTION, this.parseFunctionLiteral.bind(this));

    this.registerInfix(token.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(token.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(token.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(token.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(token.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(token.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(token.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(token.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(token.LPAREN, this.parseCallExpression.bind(this));

    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.NextToken();
  }

  parseProgram() {
    let program = new ast.Program();

    while (!this.curTokenIs(token.EOF)) {
      let stmt = this.parseStatement();
      if (stmt != null) {
        program.Statements.push(stmt);
      }
      this.nextToken();
    }

    return program;
  }

  parseStatement() {
    switch (this.curToken.type) {
      case token.LET:
        return this.parseLetStatement();
      case token.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement() {
    let stmt = new ast.LetStatement(this.curToken);

    if (!this.expectPeek(token.IDENT)) {
      return null;
    }

    stmt.name = new ast.Identifier(this.curToken, this.curToken.literal);

    if (!this.expectPeek(token.ASSIGN)) {
      return null;
    }

    this.nextToken();

    stmt.value = this.parseExpression(LOWEST);

    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  curTokenIs(t) {
    return this.curToken.type === t;
  }

  peekTokenIs(t) {
    return this.peekToken.type === t;
  }

  expectPeek(t) {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  Errors() {
    return this.errors;
  }

  peekError(token) {
    this.errors.push(
      `expected next token to be ${token}, got ${this.peekToken.type} instead`
    );
  }

  parseReturnStatement() {
    let stmt = new ast.ReturnStatement(this.curToken);

    this.nextToken();

    stmt.returnValue = this.parseExpression(LOWEST);

    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  registerPrefix(tokenType, fn) {
    this.prefixParseFns.set(tokenType, fn);
  }

  registerInfix(tokenType, fn) {
    this.infixParseFns.set(tokenType, fn);
  }

  parseExpressionStatement() {
    let stmt = new ast.ExpressionStatement(this.curToken);

    stmt.expression = this.parseExpression(LOWEST);

    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseExpression(precedence) {
    if (!this.prefixParseFns.has(this.curToken.type)) {
      this.noPrefixParseFnError(this.curToken.type);
      return null;
    }

    let prefix = this.prefixParseFns.get(this.curToken.type);
    let leftExp = prefix();

    while (
      !this.peekTokenIs(token.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      let infix = this.infixParseFns.get(this.peekToken.type);
      if (infix == null) {
        return leftExp;
      }

      this.nextToken();

      leftExp = infix(leftExp);
    }

    return leftExp;
  }

  parseIdentifier() {
    return new ast.Identifier(this.curToken, this.curToken.literal);
  }

  parseIntegerLiteral() {
    let lit = new ast.IntegerLiteral(this.curToken);
    let number = Number(this.curToken.literal);

    if (Number.isNaN(number)) {
      let msg = `could not parse ${this.curToken.literal} as integer`;
      this.errors.push(msg);
      return null;
    }

    lit.value = number;

    return lit;
  }

  noPrefixParseFnError(token) {
    let msg = `no prefix parse function for ${token} found`;
    this.errors.push(msg);
  }

  parsePrefixExpression() {
    let expression = new ast.PrefixExpression(
      this.curToken,
      this.curToken.literal
    );

    this.nextToken();

    expression.right = this.parseExpression(PREFIX);

    return expression;
  }

  peekPrecedence() {
    if (precedences.has(this.peekToken.type)) {
      return precedences.get(this.peekToken.type);
    }

    return LOWEST;
  }

  curPrecedence() {
    if (precedences.has(this.curToken.type)) {
      return precedences.get(this.curToken.type);
    }

    return LOWEST;
  }

  parseInfixExpression(left) {
    let expression = new ast.InfixExpression(
      this.curToken,
      left,
      this.curToken.literal
    );

    let precedence = this.curPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);

    return expression;
  }

  parseBoolean() {
    return new ast.Boolean(this.curToken, this.curTokenIs(token.TRUE));
  }

  parseGroupedExpression() {
    this.nextToken();

    let exp = this.parseExpression(LOWEST);
    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    return exp;
  }

  parseIfExpression() {
    let expression = new ast.IfExpression(this.curToken);

    if (!this.expectPeek(token.LPAREN)) {
      return null;
    }

    this.nextToken();
    expression.condition = this.parseExpression(LOWEST);

    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(token.LBRACE)) {
      return null;
    }

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(token.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(token.LBRACE)) {
        return null;
      }

      expression.alternative = this.parseBlockStatement();
    }

    return expression;
  }

  parseBlockStatement() {
    let block = new ast.BlockStatement(this.curToken);
    block.statements = [];

    this.nextToken();

    while (!this.curTokenIs(token.RBRACE) && !this.curTokenIs(token.EOF)) {
      let stmt = this.parseStatement();
      if (stmt !== null) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }
    return block;
  }

  parseFunctionLiteral() {
    let lit = new ast.FunctionLiteral(this.curToken);

    if (!this.expectPeek(token.LPAREN)) {
      return null;
    }

    lit.parameters = this.parseFunctionParameters();

    if (!this.expectPeek(token.LBRACE)) {
      return null;
    }

    lit.body = this.parseBlockStatement();

    return lit;
  }

  parseFunctionParameters() {
    let identifiers = [];

    if (this.peekTokenIs(token.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    let ident = new ast.Identifier(this.curToken, this.curToken.literal);
    identifiers.push(ident);

    while (this.peekTokenIs(token.COMMA)) {
      this.nextToken();
      this.nextToken();
      let ident = new ast.Identifier(this.curToken, this.curToken.literal);
      identifiers.push(ident);
    }

    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    return identifiers;
  }

  parseCallExpression(func) {
    let exp = new ast.CallExpression(this.curToken, func);
    exp.arguments = this.parseCallArguments();
    return exp;
  }

  parseCallArguments() {
    let args = [];

    if (this.peekTokenIs(token.RPAREN)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    args.push(this.parseExpression(LOWEST));

    while (this.peekTokenIs(token.COMMA)) {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression(LOWEST));
    }

    if (!this.expectPeek(token.RPAREN)) {
      return null;
    }

    return args;
  }
}
