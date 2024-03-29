import * as ast from "../src/ast/ast.js";
import * as parser from "../src/parser/parser.js";
import Lexer from "../src/lexer/lexer.js";
import * as object from "../src/object/object.js";
import * as environment from "../src/object/environment.js";
import * as ev from "../src/evaluator/evaluator.js";
import assert from "assert";

describe("evaluator test", () => {
  it("TestEvalIntegerExpression", () => {
    let tests = [
      ["5", 5],
      ["10", 10],
      ["-5", -5],
      ["-10", -10],
      ["5 + 5 + 5 + 5 - 10", 10],
      ["2 * 2 * 2 * 2 * 2", 32],
      ["-50 + 100 + -50", 0],
      ["5 * 2 + 10", 20],
      ["5 + 2 * 10", 25],
      ["20 + 2 * -10", 0],
      ["50 / 2 * 2 + 10", 60],
      ["2 * (5 + 10)", 30],
      ["3 * 3 * 3 + 10", 37],
      ["3 * (3 * 3) + 10", 37],
      ["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
    ];

    for (let test of tests) {
      let evaluated = testEval(test[0]);
      testIntegerObject(evaluated, test[1]);
    }
  });

  it("TestEvalBooleanExpression", () => {
    let tests = [
      ["true", true],
      ["false", false],
      ["1 < 2", true],
      ["1 > 2", false],
      ["1 < 1", false],
      ["1 > 1", false],
      ["1 == 1", true],
      ["1 != 1", false],
      ["1 == 2", false],
      ["1 != 2", true],
      ["true == true", true],
      ["false == false", true],
      ["true == false", false],
      ["true != false", true],
      ["false != true", true],
      ["(1 < 2) == true", true],
      ["(1 < 2) == false", false],
      ["(1 > 2) == true", false],
      ["(1 > 2) == false", true],
    ];

    for (let test of tests) {
      let evaluated = testEval(test[0]);
      testBooleanObject(evaluated, test[1]);
    }
  });

  it("TestBangOperator", () => {
    let tests = [
      ["!true", false],
      ["!false", true],
      ["!5", false],
      ["!!true", true],
      ["!!false", false],
      ["!!5", true],
    ];

    for (let test of tests) {
      let evaluated = testEval(test[0]);
      testBooleanObject(evaluated, test[1]);
    }
  });

  it("TestIfElseExpression", () => {
    let tests = [
      ["if (true) { 10 }", 10],
      ["if (false) { 10 }", null],
      ["if (1) { 10 }", 10],
      ["if (1 < 2) { 10 }", 10],
      ["if (1 > 2) { 10 }", null],
      ["if (1 > 2) { 10 } else { 20 }", 20],
      ["if (1 < 2) { 10 } else { 20 }", 10],
    ];

    for (let test of tests) {
      let evaluated = testEval(test[0]);
      let integer = test[1];
      if (typeof integer === "number") {
        testIntegerObject(evaluated, integer);
      } else {
        testNullObject(evaluated);
      }
    }
  });

  it("TestReturnStatements", () => {
    let tests = [
      ["return 10;", 10],
      ["return 10; 9;", 10],
      ["return 2 * 5; 9;", 10],
      ["9; return 2 * 5; 9;", 10],
      ["if (10 > 1) { return 10; }", 10],
      [
        `
      if (10 > 1) {
        if (10 > 1) {
          return 10;
        }

        return 1;
      }
      `,
        10,
      ],
      //       [
      //         `
      // let f = fn(x) {
      //   return x;
      //   x + 10;
      // };
      // f(10);`,
      //         10,
      //       ],
      //       [
      //         `
      // let f = fn(x) {
      //    let result = x + 10;
      //    return result;
      //    return 10;
      // };
      // f(10);`,
      //         20,
      //       ],
    ];

    for (let test of tests) {
      let evaluated = testEval(test[0]);
      testIntegerObject(evaluated, test[1]);
    }
  });

  it("TestErrorHandling", () => {
    let tests = [
      ["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
      ["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
      ["-true", "unknown operator: -BOOLEAN"],
      ["true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
      ["true + false + true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
      ["foobar", "identifier not found: foobar"],
      // ["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
      // ["if (10 > 1) { true + false; }", "unknown operator: BOOLEAN + BOOLEAN"],
      // [
      //   `
      // if (10 > 1) {
      //   if (10 > 1) {
      //     return true + false;
      //   }

      //   return 1;
      // }
      // `,
      //   "unknown operator: BOOLEAN + BOOLEAN",
      // ],
    ];

    for (let test of tests) {
      let evaluated = testEval(test[0]);
      console.log(evaluated);

      let errObj = evaluated;
      if (!(errObj instanceof object.Error)) {
        assert.fail(`no error object returned. got=${evaluated}`);
      }

      if (errObj.message != test[1]) {
        assert.fail(
          `wrong error message. expected=${test[1]}, got=${errObj.message}`
        );
      }
    }
  });

  it("TestLetStatements", () => {
    let tests = [
      ["let a = 5; a;", 5],
      ["let a = 5 * 5; a;", 25],
      ["let a = 5; let b = a; b;", 5],
      ["let a = 5; let b = a; let c = a + b + 5; c;", 15],
    ];

    for (let test of tests) {
      testIntegerObject(testEval(test[0]), test[1]);
    }
  });
});

function testEval(input) {
  let l = new Lexer(input);
  let p = new parser.Parser(l);
  let program = p.parseProgram();
  let env = environment.newEnvironment();

  return ev.Eval(program, env);
}

function testIntegerObject(obj, expected) {
  let result = obj;
  if (!(result instanceof object.Integer)) {
    assert.fail(`object is not Integer. got=${obj}`);
    return false;
  }

  if (result.value !== expected) {
    assert.fail(
      `object has wrong value. got=${result.value}, want=${expected}`
    );
    return false;
  }

  return true;
}

function testBooleanObject(obj, expected) {
  let result = obj;
  if (!(result instanceof object.Boolean)) {
    assert.fail(`object is not Boolean. got=${obj}`);
    return false;
  }

  if (result.value !== expected) {
    assert.fail(
      `object has wrong value. got=${result.value}, want=${expected}`
    );
    return false;
  }

  return true;
}

function testNullObject(obj) {
  if (obj != ev.NULL) {
    assert.fail(`object is not NULL. got=${obj}`);
    return false;
  }

  return true;
}
