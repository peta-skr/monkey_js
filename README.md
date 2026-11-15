# monkey_js

『Go言語でつくるインタプリタ』（Thorsten Ball）のMonkey言語インタプリタを、本のGoではなくJavaScript（Node.js、ES Modules）で書いたもの。第3章（評価）の途中、`let` による変数の束縛までを実装した。

同じ本をGoで書き始めた [interpreter_go](https://github.com/peta-skr/interpreter_go) は第2章の途中で止まっている。こちらはその後に言語を変えて取り組み直したもので、構文解析は第2章の最後（関数リテラルと関数呼び出し）まで進んでいる。

## できること

- 字句解析: 整数、識別子、キーワード（`fn` `let` `true` `false` `if` `else` `return`）、演算子 `=` `+` `-` `*` `/` `!` `<` `>` `==` `!=`、区切り記号
- 構文解析: `let` 文、`return` 文、式文、前置・中置演算子の優先順位、括弧、真偽値、`if` / `else`、関数リテラル、関数呼び出し
- 評価: 整数と真偽値の演算、前置演算子 `!` `-`、比較、`if` / `else`、入れ子のブロックから抜ける `return`、`let` で束縛した変数の参照
- エラー: 型の不一致、未知の演算子、未定義の識別子をエラー値として返し、そこで評価を止める
- REPL

関数は構文解析まではできるが、評価器が関数を扱わないため呼び出しても結果は返らない。文字列・配列・ハッシュ・組み込み関数（本の第4章）も未実装。また整数の割り算はJavaScriptの数値の割り算になるので、`5 / 2` は本のGo版の `2` ではなく `2.5` になる。

```
>> let a = 5;
>> a * (2 + 3)
25
>> if (a > 3) { 10 } else { 20 }
10
>> -true
ERROR: unknown operator: -BOOLEAN
```

## 動かし方

Node.jsが必要（`node:readline/promises` を使うので17以降）。REPLは依存パッケージなしで動く。

```sh
node index.js    # REPLを起動
npm install      # テストに使う mocha を入れる
npm test         # mocha test/
```

## 構成

| パス | 役割 |
| --- | --- |
| `src/token/token.js` | トークンの種類とキーワード表 |
| `src/lexer/lexer.js` | 字句解析 |
| `src/ast/ast.js` | 抽象構文木のノード |
| `src/parser/parser.js` | Prattパーサによる構文解析 |
| `src/object/object.js` | 実行時の値（整数・真偽値・null・return値・エラー） |
| `src/object/environment.js` | 変数を保持する環境 |
| `src/evaluator/evaluator.js` | 木を辿って評価する評価器 |
| `src/repl/repl.js` `index.js` | REPL |
| `test/` | mochaのテスト（字句解析・構文解析・評価） |

## 設計・実装のポイント

本のGoのコードをJavaScriptに置き換えるときの書き方は次のとおり。

- Goの型スイッチ（`switch node := node.(type)`）は、`instanceof` による分岐に置き換えた
- 前置・中置の構文解析関数は、`this` を保つために `bind(this)` してからトークンの種類をキーにした `Map` に登録する
- 実行時の値は共通の基底クラスを継承したクラスで表す。`true` `false` `null` はそれぞれ1つのインスタンスを使い回すので、真偽値どうしの `==` / `!=` は参照の比較で判定できる
- `return` とエラーは値として呼び出し元へ返し、プログラムやブロックの評価ループがそれを見て処理を止める（コミット「add error handing」）
- 環境は `Map` を包んだクラスで、REPLの1回の起動の間は同じ環境を使い続ける
- テストは本のGoのテスト（`TestLetStatements` など）を、名前を残したままmochaに移した

## 学んだこと

- Prattパーサで、トークンごとに前置・中置の解析関数を登録し、演算子の優先順位を扱う方法
- Goの型スイッチや構造体を、JavaScriptのクラスと `instanceof` で書き直す方法と、`this` の束縛に気を付ける点
- `return` とエラーを特別な値として伝え、評価を途中で止める仕組み
- 環境に名前と値を登録して、変数の束縛と参照を実装する方法

## 参考

- Thorsten Ball『Go言語でつくるインタプリタ』（オライリー・ジャパン、原書『Writing An Interpreter In Go』）: [interpreterbook.com](https://interpreterbook.com/)
