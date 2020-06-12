let babel = require("@babel/core");
let generate = require("@babel/generator").default;
// console.log(generate);
// let ast1 = babel.parse('let a = 1')
// console.log(ast1)
let t = babel.types;
// let ast = t.callExpression(t.memberExpression(t.identifier("console"), t.identifier("log")), [t.binaryExpression('+', t.numericLiteral(1), t.numericLiteral(2))]);
let funAst = t.functionExpression(undefined, [t.identifier('a')], t.blockStatement([
    t.variableDeclaration('let', [t.variableDeclarator(t.identifier('b'), t.binaryExpression('+',t.identifier('a'), t.numericLiteral(2)))]),
    t.returnStatement(t.binaryExpression('+',t.identifier('a'),t.identifier('b')))
]))
let ast = t.variableDeclaration('var', [t.variableDeclarator(t.identifier('a'),funAst),t.variableDeclarator(t.identifier('b'),t.numericLiteral(2))])

console.log(generate(ast));
