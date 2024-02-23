import * as ast from "../ast/ast.js";
import * as object from "../object/object.js";

export const TRUE = new object.Boolean(true);
export const FALSE = new object.Boolean(false);
export const NULL = new object.Null();

export function Eval(node) {
  if (node instanceof ast.Program) {
    return evalProgram(node);
  } else if (node instanceof ast.ExpressionStatement) {
    return Eval(node.expression);
  } else if (node instanceof ast.IntegerLiteral) {
    return new object.Integer(node.value);
  } else if (node instanceof ast.Boolean) {
    return nativeBoolToBooleanObject(node.value);
  } else if (node instanceof ast.PrefixExpression) {
    let right = Eval(node.right);
    if (isError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  } else if (node instanceof ast.InfixExpression) {
    let left = Eval(node.left);
    let right = Eval(node.right);
    if (isError(left)) {
      return left;
    }
    if (isError(right)) {
      return right;
    }
    return evalInfixExpression(node.operator, left, right);
  } else if (node instanceof ast.BlockStatement) {
    return evalBlockStatement(node);
  } else if (node instanceof ast.IfExpression) {
    return evalIfExpression(node);
  } else if (node instanceof ast.ReturnStatement) {
    let val = Eval(node.returnValue);
    if (isError(val)) {
      return val;
    }
    return new object.ReturnValue(val);
  }

  return null;
}

// export function evalStatements(stmts) {
//   let result;

//   for (let stmt of stmts) {
//     result = Eval(stmt);

//     if (result instanceof object.ReturnValue) {
//       return result.value;
//     } else if (result instanceof object.Error) {
//       return result;
//     }
//   }

//   return result;
// }

export function nativeBoolToBooleanObject(input) {
  if (input) {
    return TRUE;
  } else {
    return FALSE;
  }
}

export function evalPrefixExpression(operator, right) {
  if (operator === "!") {
    return evalBangOperatorExpression(right);
  } else if (operator === "-") {
    return evalMinusPrefixOperatorExpression(right);
  }

  return newError(`unknown operator: ${operator} ${right.type()}`);
}

export function evalBangOperatorExpression(right) {
  if (right === TRUE) {
    return FALSE;
  } else if (right === FALSE) {
    return TRUE;
  } else if (right === NULL) {
    return TRUE;
  } else {
    return FALSE;
  }
}

export function evalMinusPrefixOperatorExpression(right) {
  if (right.type() !== object.INTEGER_OBJ) {
    return newError(`unknown operator: -${right.type()}`);
  }

  let value = right.value;
  return new object.Integer(-value);
}

function evalInfixExpression(operator, left, right) {
  if (
    left.type() === object.INTEGER_OBJ &&
    right.type() === object.INTEGER_OBJ
  ) {
    return evalIntegerInfixExpression(operator, left, right);
  } else if (operator === "==") {
    return nativeBoolToBooleanObject(left === right);
  } else if (operator === "!=") {
    return nativeBoolToBooleanObject(left != right);
  } else if (left.type() != right.type()) {
    return newError(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  } else {
    return newError(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
  }
}

function evalIntegerInfixExpression(operator, left, right) {
  let leftVal = left.value;
  let rightVal = right.value;

  if (operator === "+") {
    return new object.Integer(leftVal + rightVal);
  } else if (operator === "-") {
    return new object.Integer(leftVal - rightVal);
  } else if (operator === "*") {
    return new object.Integer(leftVal * rightVal);
  } else if (operator === "/") {
    return new object.Integer(leftVal / rightVal);
  } else if (operator === ">") {
    return nativeBoolToBooleanObject(leftVal > rightVal);
  } else if (operator === "<") {
    return nativeBoolToBooleanObject(leftVal < rightVal);
  } else if (operator === "==") {
    return nativeBoolToBooleanObject(leftVal === rightVal);
  } else if (operator === "!=") {
    return nativeBoolToBooleanObject(leftVal != rightVal);
  } else {
    return newError(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
  }
}

function evalIfExpression(ie) {
  let condition = Eval(ie.condition);
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return Eval(ie.consequence);
  } else if (ie.alternative != null) {
    return Eval(ie.alternative);
  } else {
    return NULL;
  }
}

function isTruthy(obj) {
  if (obj === NULL) {
    return false;
  } else if (obj === TRUE) {
    return true;
  } else if (obj === FALSE) {
    return false;
  } else {
    return true;
  }
}

function evalProgram(program) {
  let result;

  for (let statement of program.Statements) {
    result = Eval(statement);

    if (result instanceof object.ReturnValue) {
      return result.value;
    } else if (result instanceof object.Error) {
      return result;
    }
  }

  return result;
}

function evalBlockStatement(block) {
  let result;

  for (let statement of block.statements) {
    result = Eval(statement);

    if (result != null) {
      let rt = result.type();
      if (rt === object.RETURN_VALUE_OBJ || rt === object.ERROR_OBJ) {
        return result;
      }
    }
  }
  return result;
}

function newError(str) {
  return new object.Error(str);
}

function isError(obj) {
  if (obj != null) {
    return obj.type() === object.ERROR_OBJ;
  }
  return false;
}
