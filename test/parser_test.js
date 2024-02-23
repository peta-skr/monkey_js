import * as ast from "../src/ast/ast.js";
import * as parser from "../src/parser/parser.js";
import Lexer from "../src/lexer/lexer.js";
import assert from "assert";

describe("ParserTest", () => {
  it("TestLetStatements", () => {
    const tests = [
      ["let x = 5;", "x", 5],
      ["let y = 10;", "y", 10],
      ["let foobar = 838383;", "foobar", 838383],
    ];

    for (let test of tests) {
      let l = new Lexer(test[0]);
      let p = new parser.Parser(l);

      let program = p.parseProgram();
      checkParserErrors(p);
      if (program == null) {
        assert.fail("parseProgram() returned null");
      }

      if (program.Statements.length != 1) {
        assert.fail(
          `program.Statements does not contain 3 statments. got="${program.Statements.length}"`
        );
      }
      let stmt = program.Statements[0];
      if (!testLetStatement(stmt, test[1])) {
        assert.fail(`stmt not ${test[1]}`);
      }
      if (!testLiteralExpression(stmt.value, test[2])) {
        assert.fail(`stmt not ${test[2]}`);
      }
    }
  });

  it("TestReturnStatements", () => {
    const tests = [
      ["return 5;", 5],
      ["return true;", true],
      ["return foobar;", "foobar"],
    ];

    for (let test of tests) {
      let l = new Lexer(test[0]);
      let p = new parser.Parser(l);
      let program = p.parseProgram();
      checkParserErrors(p);

      if (program.Statements.length != 1) {
        assert.fail(
          `program.Statements does not contain 3 statments. got="${program.Statements.length}"`
        );
      }

      let stmt = program.Statements[0];
      if (!(stmt instanceof ast.ReturnStatement)) {
        assert.fail(`stmt not ast.ReturnStatement. got=${stmt}`);
      }

      if (stmt.TokenLiteral() != "return") {
        assert.fail(
          `stmt.TokenLiteral not 'return', got ${stmt.TokenLiteral()}`
        );
      }

      if (testLiteralExpression(stmt.returnValue, test[1])) {
        return;
      }
    }
  });

  it("TestIdentifierExpression", () => {
    let input = "foobar;";

    let l = new Lexer(input);
    let p = new parser.Parser(l);
    let program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length !== 1) {
      assert.fail(
        `program has not enough statements. got=${program.Statements.length}`
      );
    }

    let stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
      assert.fail(
        `program.Statements[0] is not ast.ExpressionStatement. got=${stmt}`
      );
    }

    let ident = stmt.expression;
    if (!(ident instanceof ast.Identifier)) {
      assert.fail(`exp not ast.Identifier. got=${ident}`);
    }

    if (ident.value !== "foobar") {
      assert.fail(`ident.value not foobar. got${ident.TokenLiteral()}`);
    }
  });

  it("TestIntegerLiteralExpression", () => {
    let input = "5;";

    let l = new Lexer(input);
    let p = new parser.Parser(l);
    let program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length !== 1) {
      assert.fail(
        `program has not enough statements. got=${program.Statements.length}`
      );
    }

    let stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
      assert.fail(
        `program.Statements[0] is not ast.ExpressionStatement. got=${stmt}`
      );
    }

    let literal = stmt.expression;
    if (!(literal instanceof ast.IntegerLiteral)) {
      assert.fail(`exp not ast.IntegerLiteral. got=${literal}`);
    }

    if (literal.value !== 5) {
      assert.fail(`literal.value not 5. got=${literal.value}`);
    }

    if (literal.TokenLiteral() !== "5") {
      assert.fail(`literal.TokenLiteral() not 5. got${literal.TokenLiteral()}`);
    }
  });

  it("TestParsingPrefixExpressions", () => {
    let inputs = [
      ["!5;", "!", 5],
      ["-15", "-", 15],
    ];

    for (let input of inputs) {
      let l = new Lexer(input[0]);

      let p = new parser.Parser(l);
      let program = p.parseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        assert.fail(
          `program has not enough statements. got=${program.Statements.length}`
        );
      }

      let stmt = program.Statements[0];
      if (!(stmt instanceof ast.ExpressionStatement)) {
        assert.fail(
          `program.Statements[0] is not ast.ExpressionStatement. got=${stmt}`
        );
      }
      let exp = stmt.expression;
      if (!(exp instanceof ast.PrefixExpression)) {
        assert.fail(`stmt not ast.PrefixExpression. got=${exp.expression}`);
      }

      if (exp.operator !== input[1]) {
        assert.fail(`exp.Operator not ${input[1]}. got=${exp.value}`);
      }

      if (!testIntegerLiteral(exp.right, input[2])) {
        return;
      }
    }
  });

  it("TestParsingInfixExpressions", () => {
    let inputs = [
      ["5 + 5;", 5, "+", 5],
      ["5 - 5;", 5, "-", 5],
      ["5 * 5;", 5, "*", 5],
      ["5 / 5;", 5, "/", 5],
      ["5 > 5;", 5, ">", 5],
      ["5 < 5;", 5, "<", 5],
      ["5 == 5;", 5, "==", 5],
      ["5 != 5;", 5, "!=", 5],
      ["foobar + barfoo;", "foobar", "+", "barfoo"],
      ["foobar - barfoo;", "foobar", "-", "barfoo"],
      ["foobar * barfoo;", "foobar", "*", "barfoo"],
      ["foobar / barfoo;", "foobar", "/", "barfoo"],
      ["foobar > barfoo;", "foobar", ">", "barfoo"],
      ["foobar < barfoo;", "foobar", "<", "barfoo"],
      ["foobar == barfoo;", "foobar", "==", "barfoo"],
      ["foobar != barfoo;", "foobar", "!=", "barfoo"],
      ["true == true", true, "==", true],
      ["true != false", true, "!=", false],
      ["false == false", false, "==", false],
    ];

    for (let input of inputs) {
      let l = new Lexer(input[0]);
      let p = new parser.Parser(l);
      let program = p.parseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        assert.fail(
          `program.Statements does not contain 1 statment. got=${program.Statements.length}\n`
        );
      }

      let stmt = program.Statements[0];
      if (!(stmt instanceof ast.ExpressionStatement)) {
        assert.fail(
          `program.Statements[0] is not ast.ExpressionStatement. got=${stmt}`
        );
      }
      let exp = stmt.expression;
      if (!testInfixExpression(exp, input[1], input[2], input[3])) {
        return;
      }
    }
  });

  it("TestOperatorPrecedenceParsing", () => {
    let inputs = [
      ["-a * b", "((-a) * b)"],
      ["!-a", "(!(-a))"],
      ["a + b + c", "((a + b) + c)"],
      ["a + b - c", "((a + b) - c)"],
      ["a * b * c", "((a * b) * c)"],
      ["a * b / c", "((a * b) / c)"],
      ["a + b / c", "(a + (b / c))"],
      ["a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"],
      ["3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"],
      ["5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"],
      ["5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"],
      ["3 + 4 * 5 == 3 * 1 + 4 * 5", "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"],
      ["true", "true"],
      ["false", "false"],
      ["3 > 5 == false", "((3 > 5) == false)"],
      ["3 < 5 == true", "((3 < 5) == true)"],
      ["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
      ["(5 + 5) * 2", "((5 + 5) * 2)"],
      ["2 / (5 + 5)", "(2 / (5 + 5))"],
      ["(5 + 5) * 2 * (5 + 5)", "(((5 + 5) * 2) * (5 + 5))"],
      ["-(5 + 5)", "(-(5 + 5))"],
      ["!(true == true)", "(!(true == true))"],
      ["a + add(b * c) + d", "((a + add((b * c))) + d)"],
      [
        "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
        "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
      ],
      ["add(a + b + c * d / f + g)", "add((((a + b) + ((c * d) / f)) + g))"],
    ];

    for (let input of inputs) {
      let l = new Lexer(input[0]);
      let p = new parser.Parser(l);
      let program = p.parseProgram();
      checkParserErrors(p);

      let actual = program.String();
      if (actual != input[1]) {
        assert.fail(`expected=${input[1]}, got=${actual}`);
      }
    }
  });

  it("TestBooleanExpression", () => {
    let tests = [
      ["true;", true],
      ["false;", false],
    ];

    for (let test of tests) {
      let l = new Lexer(test[0]);
      let p = new parser.Parser(l);
      let program = p.parseProgram();
      checkParserErrors(p);

      if (program.Statements.length != 1) {
        assert.fail(
          `program has not enough statements. got${program.Statements.length}`
        );
      }

      let stmt = program.Statements[0];
      if (!(stmt instanceof ast.ExpressionStatement)) {
        assert.fail(
          `program.Statements[0] is not ast.ExpressionStatement. got=${program.Statements[0]}`
        );
      }

      let boolean = stmt.expression;

      if (!(boolean instanceof ast.Boolean)) {
        assert.fail(`exp not ast.Boolean. got=${boolean}`);
      }

      if (boolean.value != test[1]) {
        assert.fail(`boolean.value not ${test[1]}. got=${boolean.value}`);
      }
    }
  });

  it("TestIfExpression", () => {
    let input = "if(x < y) { x }";

    let l = new Lexer(input);
    let p = new parser.Parser(l);
    let program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length != 1) {
      assert.fail(
        `program.Statements does not contain ${1} statements. got=${
          program.Statements.length
        }\n`
      );
    }

    let stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
      assert.fail(
        `program.Statements[0] is not ast.ExpressionStatment. got=${stmt}`
      );
    }

    let exp = stmt.expression;
    if (!(exp instanceof ast.IfExpression)) {
      assert.fail(`stmt.expression is not ast.IfExpression. got=${exp}`);
    }

    if (!testInfixExpression(exp.condition, "x", "<", "y")) {
      return;
    }

    if (exp.consequence.statements.length != 1) {
      assert.fail(
        `consequence is not 1 statements. got=${exp.consequence.Statements[0]}`
      );
    }

    let consequence = exp.consequence.statements[0];
    if (!(consequence instanceof ast.ExpressionStatement)) {
      assert.fail(
        `Statements[0] is not ast.ExpressionStatement. got=${consequence}`
      );
    }

    if (!TestIdentifier(consequence.expression, "x")) {
      return;
    }

    if (exp.alternative != null) {
      assert.fail(
        `exp.alternative.Statements was not null. got=${exp.alternative}`
      );
    }
  });

  it("TestFunctionLiteralParsing", () => {
    let input = "fn(x, y) { x + y; }";

    let l = new Lexer(input);
    let p = new parser.Parser(l);
    let program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length != 1) {
      assert.fail(
        `program.Statements does not contain 1 statement. got=${program.Statements.length}`
      );
    }

    let stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
      assert.fail(`program.Statements[0] is not ast.Expression. got=${stmt}`);
    }

    let func = stmt.expression;
    if (!(func instanceof ast.FunctionLiteral)) {
      assert.fail(`stmt.expression is not ast.FunctionLiteral. got=${func}`);
    }

    if (func.parameters.length != 2) {
      assert.fail(
        `function literal parameters wrong. want 2, got=${func.parameters.length}`
      );
    }

    testLiteralExpression(func.parameters[0], "x");
    testLiteralExpression(func.parameters[1], "y");

    if (func.body.statements.length != 1) {
      assert.fail(
        `func.body.Statements has not 1 statements. got=${func.body.statements.length}`
      );
    }

    let bodyStmt = func.body.statements[0];
    if (!(bodyStmt instanceof ast.ExpressionStatement)) {
      assert.fail(
        `function body stmt is not ast.ExpressionStatement. got=${bodyStmt}`
      );
    }

    testInfixExpression(bodyStmt.expression, "x", "+", "y");
  });

  it("TestFucntionParameterParsing", () => {
    let tests = [
      ["fn() {};", []],
      ["fn(x) {};", ["x"]],
      ["fn(x, y, z) {};", ["x", "y", "z"]],
    ];

    for (let test of tests) {
      let l = new Lexer(test[0]);
      let p = new parser.Parser(l);
      let program = p.parseProgram();
      checkParserErrors(p);

      let stmt = program.Statements[0];
      let func = stmt.expression;

      if (func.parameters.length != test[1].length) {
        assert.fail(
          `length parameter wrong. want ${test[1].length}, got=${func.parameters.length}`
        );
      }

      for (let i = 0; i < test[1].length; i++) {
        testLiteralExpression(func.parameters[i], test[1][i]);
      }
    }
  });

  it("TestCallExpressionParsing", () => {
    let input = "add(1, 2 * 3, 4 + 5);";

    let l = new Lexer(input);
    let p = new parser.Parser(l);
    let program = p.parseProgram();
    checkParserErrors(p);

    if (program.Statements.length != 1) {
      assert.fail(
        `program.Statements does not contain 1 statement. got=${program.Statements.length}`
      );
    }

    let stmt = program.Statements[0];
    if (!(stmt instanceof ast.ExpressionStatement)) {
      assert.fail(`stmt is not ast.ExpressionStatement. got=${stmt}`);
    }

    let exp = stmt.expression;
    if (!(exp instanceof ast.CallExpression)) {
      assert.fail(`exp os mpt ast.CallExpression. got=${exp}`);
    }

    if (!TestIdentifier(exp.function, "add")) {
      return;
    }

    if (exp.arguments.length != 3) {
      assert.fail(`wrong length of arguments. got=${exp.arguments.length}`);

      testLiteralExpression(exp.arguments[0], 1);
      testInfixExpression(exp.arguments[1], 2, "*", 3);
      testInfixExpression(exp.arguments[2], 4, "+", 5);
    }
  });
});

function testLetStatement(s, name) {
  if (s.TokenLiteral() != "let") {
    assert.fail(`s.TokenLiteral not 'let'. got=${s.TokenLiteral()}`);
    return false;
  }

  if (!s instanceof ast.LetStatement) {
    assert.fail(`s not ast.LetStatement. got=${s}`);
    return false;
  }

  if (s.name.value != name) {
    assert.fail(`s.name.value not 'name'. got=${s.name.value}`);
    return false;
  }

  if (s.name.TokenLiteral() != name) {
    assert.fail(
      `s.name.TokenLiteral() not 'name'. got=${s.name.TokenLiteral()}`
    );
    return false;
  }

  return true;
}

function checkParserErrors(parser) {
  let errors = parser.Errors();
  if (errors.length == 0) {
    return;
  }

  console.error(`parser has ${errors.length} errors`);

  for (let error of errors) {
    console.error(`parser error: ${error}`);
  }

  assert.fail();
}

function testIntegerLiteral(il, value) {
  if (!(il instanceof ast.IntegerLiteral)) {
    assert.fail(`il not ast.IntegerLiteral. got=${il}`);
    return false;
  }

  if (il.value !== value) {
    assert.fail(`il.value not ${value}. got=${il.TokenLiteral()}`);
    return false;
  }

  return true;
}

function TestIdentifier(exp, value) {
  if (!(exp instanceof ast.Identifier)) {
    assert.fail(`exp not ast.Identifier. got=${exp}`);
    return false;
  }

  if (exp.value != value) {
    assert.fail(`exp.value not ${value}. got=${exp.value}`);
    return false;
  }

  if (exp.TokenLiteral() != value) {
    assert.fail(`exp.TokenLiteral not ${value}. got=${exp.TokenLiteral()}`);
    return false;
  }

  return true;
}

function testLiteralExpression(exp, expected) {
  if (typeof expected === "number") {
    return testIntegerLiteral(exp, Number(expected));
  } else if (typeof expected === "string") {
    return TestIdentifier(exp, expected);
  } else if (typeof expected === "boolean") {
    return testBooleanLiteral(exp, expected);
  }
  assert.fail(`type of exp not handled. got=${exp}`);
  return false;
}

function testInfixExpression(exp, left, operator, right) {
  if (!(exp instanceof ast.InfixExpression)) {
    assert.fail(`exp is not ast.InfixExpresion. got=${exp}`);
    return false;
  }

  if (!testLiteralExpression(exp.left, left)) {
    return false;
  }

  if (exp.operator != operator) {
    assert.fail(`exp.operator is not '${operator}'. got=${exp.operator}`);
    return false;
  }

  if (!testLiteralExpression(exp.right, right)) {
    return false;
  }

  return true;
}

function testBooleanLiteral(exp, value) {
  let bo = exp;
  if (!(bo instanceof ast.Boolean)) {
    assert.fail(`exp not ast.Boolean. got=${bo}`);
    return false;
  }

  if (bo.value != value) {
    assert.fail(`bo.value not ${value}. got=${bo.value}`);
    return false;
  }

  if (bo.TokenLiteral() != value.toString()) {
    assert.fail(`bo.TokenLiteral not ${value}. got=${bo.TokenLiteral()}`);
    return false;
  }

  return true;
}
