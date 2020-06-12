let babel = require("@babel/core");
let code = `
<div>
    <span v-if={a?b:c}>1</span>
    <span v-else-if={a?b:c}>2</span>
    <i v-else>2</i>
</div>
`
console.log(babel.transform(code, {
    plugins: ['./index.js']
}).code.trim())