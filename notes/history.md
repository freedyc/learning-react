## React 15 架构
Reconciler 寻找更新的组件 然后调用 render 渲染到页面 (React 15.drawio)

```js
    组件setState, 连续执行两个setStateReact会进行批处理， 响应到页面只会更新一次, 第一次执行ReactDOM.render时不会执行批处理
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



## React 17
### 对优先级的扩展
从指定一个优先级到指定到指定一个连续优先级的区间

高优先级CPU任务
低优先级CPU任务
低优先级IO任务
假如一个高优先级任务需要执行 30s一个低优先级IO任务执行1s如果说只能有一个优先级的话那只能等30s后再织综IO任务，如果说可以指定一个区间那就是不是这个问题可以得到解决，所有
原本可以指定一个优先级， React17中变成指定多个任务的优先级任务

还有怎么定义这个区间。 是要仔细划分。
ReactFiberLane定义这些任务走那个通道


### Scheduler调度器
调度任务的优先级，高优先任务先进入Reconciler

### 了解React里的优先级 (和时间对应的)
- 生命周期方法： 同步执行 3
- 受控的用户输入： 比如输入内输入的文字，同步执行 2
- 交互事件： 比如动画，高优先执行 2
- 其他： 比如输入请求，低优先执行 4


### 如何设置优先级 （例子待补充）
```
ReactDOM.unstable_runWithPriority

export const NoPriority = 0; // 无优先级
export const ImmediatePriority = 1; // 立即执行
export const UserBlockingPriority = 2; // 用户操作级别优先级
export const NormalPriority = 3; // 正常优先级
export const LowPriority = 4; // 低优先级
export const IdlePriority = 5; // 空闲优先级

```


### Fiber结构
#### 怎么可以查看Fiber结构
1. 在浏览器中获取DOM元素
```
document.body._reactRootContainer  //获取FiberRootNode节点
document.body.__reactContainere$hqmdyaemz9b  // 获取当前的FiberNode

document.querySelector(".uname").__reactInternalInstance$hqmdyaemz9b  // 节点的Fiber实例
document.querySelector(".uname").__reactEventHandlers$hqmdyaemz9b // 事件信息


```
2. 查看源码

```
function FiberNode(tag: WorkTag, pendingProps: mixed, key: null | string, mode: TypeOfMode) {
  // Instance 
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null; // 组件类型 Function class组件
  this.stateNode = null; // Fiber对应的DOM节点

  // Fiber 连接各个节点形成一个Fiber树
  this.return = null; // 父节点
  this.child = null; // 子节点
  this.sibling = null; // 下一个相邻的节点
  this.index = 0;

  this.ref = null;

  // 保存跟新造成的相关信息
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects 标识更新的类型 比如： 删除、新增、更改
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  // 调度优先级： 以前这里是update.expirationTime和之前对比：
  // 1. 高优先级的IO约束任务会阻止较低优先级CPU约束任务无法完成 （时间模型）
  // 2. 可以表示一组多个优先级不同的任务 （时间模型不可以表示一组里边有多个优先级的任务
  // 3. 在新的lane模型中不再以相对数字表示而是用32位二进制去表示， 
        - 任务用lane
        - 批任务用lanes (一个Fiber不仅和单个更新相关，而是和更多更新相关，所以fiber上包含lanes字段)
        - setState调度任务重宝函lane字段， （替换旧模型中的expirationTime);
        - childLanes表示子节点更新任务
  // https://github.com/facebook/react/pull/18796 介绍时间模型转换为lane模型
  // Lane 解耦了任务优先级的概念从(任务a的优先级是否高于任务b?”)到任务批处理(任务a是这组任务的一部分吗?”)
  // Lane 可以使用单一的32位数据类型表示许多不同的任务线程

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null;

  if (enableProfilerTimer) {
    // Note: The following is done to avoid a v8 performance cliff.
    //
    // Initializing the fields below to smis and later updating them with
    // double values will cause Fibers to end up having separate shapes.
    // This behavior/bug has something to do with Object.preventExtension().
    // Fortunately this only impacts DEV builds.
    // Unfortunately it makes React unusably slow for some applications.
    // To work around this, initialize the fields below with doubles.
    //
    // Learn more about this here:
    // https://github.com/facebook/react/issues/14365
    // https://bugs.chromium.org/p/v8/issues/detail?id=8538
    this.actualDuration = Number.NaN;
    this.actualStartTime = Number.NaN;
    this.selfBaseDuration = Number.NaN;
    this.treeBaseDuration = Number.NaN;

    // It's okay to replace the initial doubles with smis after initialization.
    // This won't trigger the performance cliff mentioned above,
    // and it simplifies other profiler code (including DevTools).
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }

  if (__DEV__) {
    // This isn't directly used but is handy for debugging internals:

    this._debugSource = null;
    this._debugOwner = null;
    this._debugNeedsRemount = false;
    this._debugHookTypes = null;
    if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
      Object.preventExtensions(this);
    }
  }
}

```


#### Fiber Tree
可以看到Fiber与Fiber之间以链表形式来连接的，这种结构可以方便中断

#### 大致调度逻辑 16.13
1. 根据优先级区分同步任务和异步任务， 同步任务立即同步执行，最快渲染处理， 异步任务走scheduler 调度
2. 计算得到 expirationTime , expirationTime = currentTime(当前时间) + timeout (不同优先级间隔，时间越短， 优先级越大)
3. 对比startTime和currentTime,将任务分为及时任务和延时任务
4. 及时任务当即执行
5. 延时任务需要等到currentTime >= expirationTime 的时候才会执行
