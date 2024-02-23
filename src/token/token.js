const ILLEGAL = "ILLEGAL";
const EOF = "EOF";

// 識別子＋リテラル
const IDENT = "IDENT";
const INT = "INT";

// 演算子
const ASSIGN = "=";
const PLUS = "+";
const SLASH = "/";
const MINUS = "-";
const ASTERISK = "*";
const BANG = "!";

const LT = "<";
const GT = ">";

const EQ = "==";
const NOT_EQ = "!=";

// デリミタ
const COMMA = ",";
const SEMICOLON = ";";

const LPAREN = "(";
const RPAREN = ")";
const LBRACE = "{";
const RBRACE = "}";

// キーワード
const FUNCTION = "FUNCTION";
const LET = "LET";
const IF = "IF";
const ELSE = "ELSE";
const RETURN = "RETURN";
const TRUE = "TRUE";
const FALSE = "FALSE";

const keywords = new Map();
keywords.set("fn", FUNCTION);
keywords.set("let", LET);
keywords.set("if", IF);
keywords.set("else", ELSE);
keywords.set("return", RETURN);
keywords.set("true", TRUE);
keywords.set("false", FALSE);

function LookupIdent(ident) {
  if (keywords.has(ident)) {
    return keywords.get(ident);
  }
  return IDENT;
}

class TokenType {
  constructor(value) {
    this.value = value;
  }
}

class Token {
  constructor(type, literal) {
    this.type = type; // TokenType インスタンス
    this.literal = literal;
  }
}

export {
  ILLEGAL,
  EOF,
  IDENT,
  INT,
  ASSIGN,
  PLUS,
  COMMA,
  SEMICOLON,
  LPAREN,
  RPAREN,
  LBRACE,
  RBRACE,
  FUNCTION,
  LET,
  ASTERISK,
  BANG,
  GT,
  LT,
  MINUS,
  SLASH,
  ELSE,
  FALSE,
  IF,
  RETURN,
  TRUE,
  EQ,
  NOT_EQ,
  Token,
  TokenType,
  LookupIdent,
};
