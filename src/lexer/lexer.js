import * as token from "../token/token.js";

class Lexer {
  constructor(input) {
    if (!(typeof input === "string")) {
      console.error("arg not string");
      process.exit(1);
    }
    this.input = input;
    this.position = 0; // 現在の文字
    this.readPosition = 1; // これから読み込む位置
    this.ch = this.input[0]; // 現在検査中の文字
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = 0;
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition++;
  }

  NextToken() {
    let tok;

    this.skipWhiteSpace();

    switch (this.ch) {
      case "=":
        if (this.peekChar() === "=") {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch;
          tok = this.newToken(token.EQ, literal);
        } else {
          tok = this.newToken(token.ASSIGN, this.ch);
        }
        break;
      case "+":
        tok = this.newToken(token.PLUS, this.ch);
        break;
      case "!":
        if (this.peekChar() === "=") {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch;
          tok = this.newToken(token.NOT_EQ, literal);
        } else {
          tok = this.newToken(token.BANG, this.ch);
        }
        break;
      case "/":
        tok = this.newToken(token.SLASH, this.ch);
        break;
      case "-":
        tok = this.newToken(token.MINUS, this.ch);
        break;
      case "*":
        tok = this.newToken(token.ASTERISK, this.ch);
        break;
      case "<":
        tok = this.newToken(token.LT, this.ch);
        break;
      case ">":
        tok = this.newToken(token.GT, this.ch);
        break;
      case ";":
        tok = this.newToken(token.SEMICOLON, this.ch);
        break;
      case ",":
        tok = this.newToken(token.COMMA, this.ch);
        break;
      case "(":
        tok = this.newToken(token.LPAREN, this.ch);
        break;
      case ")":
        tok = this.newToken(token.RPAREN, this.ch);
        break;
      case "{":
        tok = this.newToken(token.LBRACE, this.ch);
        break;
      case "}":
        tok = this.newToken(token.RBRACE, this.ch);
        break;
      case 0:
        tok = { type: token.EOF, literal: "" };
        break;
      default:
        if (this.isLetter(this.ch)) {
          let literal = this.readIdentifier();
          tok = {
            type: token.LookupIdent(literal),
            literal: literal,
          };
          return tok;
        } else if (this.isDigit(this.ch)) {
          tok = { type: token.INT, literal: this.readNumber() };
          return tok;
        } else {
          tok = this.newToken(token.ILLEGAL, this.ch);
        }
    }

    this.readChar();
    return tok;
  }

  newToken(tokenType, ch) {
    return new token.Token(tokenType, ch);
  }

  isLetter(ch) {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch == "_";
  }

  readIdentifier() {
    let position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  skipWhiteSpace() {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\r" ||
      this.ch === "\n"
    ) {
      this.readChar();
    }
  }

  readNumber() {
    let position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  isDigit(ch) {
    return typeof ch !== "number" && "0" <= ch && "9" >= ch;
  }

  peekChar() {
    if (this.readPosition >= this.input.length) {
      return 0;
    } else {
      return this.input[this.readPosition];
    }
  }
}

export default Lexer;
