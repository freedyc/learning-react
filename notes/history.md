# History version

## React 15 架构

Reconciler 寻找更新的组件 然后调用 render 渲染到页面 (React 15.drawio)

```js
  // 组件setState,如下 连续执行两个 setState React 会进行批处理，响应到页面只会更新一次, 第一次执行 ReactDOM.render 时不会执行批处理
  this.setState({ count: 1 });
  this.setState({ count: 2 });
```

### React 15 架构的缺点

React 15架构师递归的，一个长任务会导致祖泽， 会有卡顿的现象， 对于大型项目的还是会有体验性的问题

[](./images/react15.png)

### React 16 Fiber架构

执行异步的调度任务会在宏任务重执行，这样可以保证，不会让用户操作失去响应，即使长任务也会对任务切片
[](./images/react16.png)

React 16中新增了任务的优先级， 每一个任务都有对应的优先级，当出现多个更新同时需要处理， React会中断低优先级的任务，去执行高优先级的任务

Sachedule 就是用来调度任务优先级的模块
