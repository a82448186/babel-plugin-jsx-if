# babel-plugin-jsx-if
这是一个<code>babel</code>插件, 能够在jsx语法中支持<code>v-if</code>、<code>v-else-if</code>、<code>v-else</code>, 支持自定义前缀 <code>rc-if</code>、<code>xx-if</code>。支持react 和 vue

### 使用：
```
npm i babel-plugin-jsx-if --save-dev
```
添加 jsx-if 到 <code>.babelrc</code> 文件
```
{
  ...
  "plugins": ["transform-vue-jsx", "jsx-if"]
}
```
然后你可以在jsx中使用该语法
```
...
return() {
    <div>
        <span v-if={a<0}>1</span>
        <span v-else-if={a<5}>2</span>
        <span v-else>3</span>
    <div>
}
```

### 自定义前缀
如果你希望自定义指令前缀，你可以添加配置：
```
{
  ...
  "plugins": ["transform-vue-jsx", ["jsx-if", {mark: 'rc'}]]
}
```
```
...
return() {
    <div rc-if={true}><div>
}
```
