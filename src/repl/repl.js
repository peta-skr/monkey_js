import lexer from "../lexer/lexer.js";
import * as token from "../token/token.js";
import * as readline from "node:readline/promises";
import * as parser from "../parser/parser.js";
import * as evaluator from "../evaluator/evaluator.js";
import * as object from "../object/environment.js";
import { stdin as input, stdout as output } from "node:process";

const PROMPT = ">> ";

export async function start() {
  const rl = readline.createInterface({ input, output });
  let env = object.newEnvironment();

  while (true) {
    const answer = await rl.question(PROMPT);
    if (answer === null) {
      return;
    }
    let l = new lexer(answer);
    let p = new parser.Parser(l);

    let program = p.parseProgram();

    if (p.errors.length != 0) {
      printParserErrors(p.Errors());
      continue;
    }

    let evaluated = evaluator.Eval(program, env);

    if (evaluated !== null) {
      console.log(evaluated.inspect());
    }
  }
}

function printParserErrors(errors) {
  for (let error of errors) {
    console.log(error);
  }
}
