// let babel = require("@babel/core");

/**
 * @param {babel} babel
 */
module.exports = function (babel) {
    const MARK = "v";
    const DIRECTIVE_IF = MARK + "-if";
    const DIRECTIVE_ELSE_IF = MARK + "-else-if";
    const DIRECTIVE_ELSE = MARK + "-else";
    var t = babel.types;
    return {
        inherits: require("@babel/plugin-syntax-jsx").default,
        visitor: {
            JSXElement: function (path) {
                // IF 属性的 path
                let ifPathMap = getAttrByName(path);
                // let attributesPath = path.get("openingElement.attributes");
                // attributesPath.forEach((attrPath) => {
                //     if (attrPath.node.name.name === DIRECTIVE_IF) {
                //         ifPath = attrPath;
                //     }
                // });
                // ExpressionStatement  JSXElement
                // console.log(path.parentPath.type ,!!IFPath)
                let ifPath = ifPathMap.attrPath;
                if (!ifPathMap.name) {
                    return;
                }
                // else-if 和 else 必须在 if 之后的元素
                if (ifPathMap.name === DIRECTIVE_ELSE_IF || ifPathMap.name === DIRECTIVE_ELSE) {
                    throw path.buildCodeFrameError(
                        "you can not use " + ifPathMap.name + " without a " + DIRECTIVE_IF + " JSXElement"
                    );
                }
                // if 后必须跟表达式  例如 xx-if={} 不能使用 xx-if=""
                if (t.isStringLiteral(ifPath.node.value)) {
                    throw path.buildCodeFrameError(
                        "you can not use " + DIRECTIVE_IF + " with a value of string, please use an expression"
                    );
                }
                // 条件表达式 xx?x:y
                let logicalExpression = t.conditionalExpression(
                    ifPath.node.value.expression,
                    path.node,
                    getElseExpression(t, path)
                );
                if (t.isExpressionStatement(path.parentPath.node)) {
                    // 如果节点是最顶级的节点
                    path.parentPath.replaceWith(t.blockStatement([t.expressionStatement(logicalExpression)]));
                } else if (t.isJSXElement(path.parentPath.node) || t.isArrayExpression(path.parentPath.node)) {
                    path.replaceWith(t.jsxExpressionContainer(logicalExpression));
                } else {
                    throw path.buildCodeFrameError(
                        "you can not use " + DIRECTIVE_IF + " in a child of " + path.parentPath.type
                    );
                }
                // 删除该属性
                ifPath.remove();
            },
        },
    };
};

/**
 * 根据属性名  获取属性的path
 * @param {*} path JSXElement path
 * @returns {{name: string, attrPath:*}}
 */
function getAttrByName(path) {
    let ifPath = {
        name: "",
        attrPath: null,
    };
    let attributesPath = path.get("openingElement.attributes");
    if (!attributesPath || attributesPath.length === 0) {
        return ifPath;
    }
    attributesPath.forEach((attrPath) => {
        if (~[DIRECTIVE_IF, DIRECTIVE_ELSE_IF, DIRECTIVE_ELSE].indexOf(attrPath.node.name.name)) {
            if (ifPath.name) {
                throw path.buildCodeFrameError(
                    "you can not use " + attrPath.node.name.name + " and " + ifPath.name + " in the same JSXElement"
                );
            }
            ifPath.name = attrPath.node.name.name;
            ifPath.attrPath = attrPath;
        }
    });
    return ifPath;
}

/**
 * 获取else 表达式
 * @param {babel.types} t
 * @param {*} preNode
 * @param {*} flag 是否要删除 prePath
 */
function getElseExpression(t, prePath, flag = false) {
    let nextPath = prePath.getSibling(prePath.key + 1);
    if (flag) {
        // prePath 可能是换行符之类  吧这些节点删除
        prePath.remove();
    }
    // 没有后续节点 直接返回 null
    if (!nextPath.node) {
        return t.nullLiteral();
    }
    if (!t.isJSXElement(nextPath.node)) {
        // 空的JSXText  一般是换行符之类  或者 该节点的后一个节点
        if (t.isJSXText(nextPath.node) && isTextEmpty(t, nextPath)) {
            return getElseExpression(t, nextPath, true);
        } else {
            return t.nullLiteral();
        }
    }
    let ifPathMap = getAttrByName(nextPath);
    let ifPath = ifPathMap.attrPath;
    // 没有else 块
    if (!ifPathMap.name || ifPathMap.name === DIRECTIVE_IF) {
        return t.nullLiteral();
    } else if (ifPathMap.name === DIRECTIVE_ELSE) {
        // else 之后不能跟表达式
        if (ifPath.node.value !== null) {
            throw nextPath.buildCodeFrameError(
                "you can not set a string or expression to the attribute" + ifPathMap.name
            );
        }
        let node = nextPath.node;
        ifPath.remove();
        nextPath.remove();
        return node;
    } else {
        // else-if 之后必须跟表达式
        if (t.isStringLiteral(ifPath.node.value)) {
            throw path.buildCodeFrameError(
                "you can not use " + ifPathMap.name + " with a value of string, please use an expression"
            );
        }
        let logicalExpression = t.conditionalExpression(
            ifPath.node.value.expression,
            nextPath.node,
            getElseExpression(t, nextPath)
        );
        ifPath.remove();
        nextPath.remove();
        return logicalExpression;
    }
}

/**
 * 处理回车
 * @param {babel.types} t
 * @param {*} preNode
 */
function isTextEmpty(t, JSXTextPath) {
    let JSXText = JSXTextPath.node;
    if (!t.isJSXText(JSXText)) {
        return;
    }
    let JSXTextValue = JSXText.value.trim();
    JSXTextValue = JSXTextValue.replace(/\s/g, "").trim();
    if (JSXTextValue) {
        JSXTextPath.replaceWith(t.jsxText(JSXTextValue));
    }
    return !JSXTextValue;
}
