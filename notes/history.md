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


## Scheduler调度器
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

  this.alternate = null; // 指向worInProgress Fiber, WorkInProgress 是上一次构建的Fiber镜像

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
6. 及时任务执行完成后，也会去判断是否有延时任务到了该执行之时，如果是，就执行延时任务
7. 每一批任务的执行在不同的宏任务中，不阻塞页面的用户交互



## Reconciler （协调器）
主要作用是负责找出变化的组件， React16以上，为了方便打断，数据结构改成链表形式
DOM-diff -> 生成dom元素打标记 -> 等下一个commit阶段渲染
domdiff和生成都都可以打断， 但是commit阶段不允许被打断

### 大致的找出找出变化组件的逻辑
react发生一次更新的时候，比如ReactDOM.render/setState,都会从Fiber Root开始从上往下遍历，然后逐一找到变化的节点。构建完成会形成一颗Fiber Tree. 在React内部同时存在两颗Fiber树

## commit阶段（负责将变化的组件渲染到页面上）
### 3个阶段：
#### commitBeforeMutationEffects (DOM操作前)
1、 处理DOM节点 渲染/删除后的autoFocus、blur逻辑
2、 调用getSnapshotBeforeUpdate生命周期钩子
3、 调度useEffect


#### 双缓存结构
1. 在 React中最多会同时存在两颗Fiber树
2. 当前屏幕上显示内容对应的Fiber树， 称为current Fiber树， current fiber树在FiberNode上称current fiber.
3. 正在内存中构建的Fiber称为workInProgress Fiber树, workInProgress Fiber树中的Fiber节点被称为workInProgress fiber. 他们通过alternate属性连接
4. 如果之前没有FiberTree就逐级创建FiberTree;如果存在FiberTree会构建一个workInProgress Tree,这个tree的Fiber节点可以服用currenttree 上没有变化的节点

##### 为什么是双向缓存结构
1. 可以很快的找到之前对应的fiber
2. 在某些情况下可以直接复用fiber
3. 更新完称后current直接指向workInProgress root, 完成 Fibertree的更新


#### 构建Fiber Tree
Reconciler的代码大致从renderRootSync函数开始， 从高优先级的FiberRoot开始递归 WorkRootSync


workLoopSync:  while true循环如果有workInPress就执行 completeUnitOfwork
completeUnitOfWork: 遍历所有子节点创建FiberNode, 如过字节点不存在则执行PerformUnitOfwork
performUnitOfWork: 判断是否sibling节点，如果没有则返回上层在检查是否有兄弟节点知道所有树都创建完成

1. beginWork和completeWork负责把节点创建完毕

beginWork 会深度遍历子节点
completeWork 负责兄弟节点，没有则返回到父节点。

#### beginWork
1. 判断fiber节点是否可以复用
2. 根据不同的Tag，生成不同Fiber节点（调用reconcilerChild);
  - Mount阶段：创建 Fiber节点
  - Update阶段和现在Fiber节点做对比， 生成新的Fiber节点
    - 单个节点Diff
    - 多个节点Diff
3. 给存在的Fiber节点打上标记newFiber.flags = Placement| Updatre |deletion..
4. 创建Fiber节点赋给WorkInProgress.child，返回WorkInProgress.child，继续下一次循环

说明：
当是function组件时 调用runWithHooks方法，注入hooks上下文执行function函数体

##### diff算法
diff的瓶颈预设几个规则 (ReactChildFiber.new.js)
1. 只对平级，进行比较
2. 节点变化，直接删除，然后重建
3. 存在key值，对比key值一样的节点
###### 单个节点的diff
1. 判断存在对应的接待你，key值是否相同，节点类型一致，可以复用
2. 存在对应节点，key值是否项目，节点类型不一致，标记删除
3. 存在对应节点，key值不同，标记删除
4. 不存在对应节点创建新节点
###### 多个节点diff
1. 对比新旧children相同的index的对象key是否相同，如果是，返回该对象，如果不是返回null
2. key值不等， 不用对比下去了，节点不能复用，跳出
3. 判断是否存在移动，存在则返回新位置
4. 但可以存在新的数组小于老数组情况，即老十足后面有剩余的，所有要删除
5. 新数组存在新增的接待你，创建新阶段
5. 创建一个existingChild代表所有剩余没有匹配掉的节点，然后新的数组根据可以从这个map里边查找，如果有则复用，没有则新建


#### completeUnitOfWork
1. 向上递归completedWork
2. 创建DOM节点，更新DOM节点；DOM节点赋值给stateNode属性
3. 把子节点的sideEffect统统附加到父节点的sideEffect链之上。在commit节点使用
4. 存在兄弟节点，将workInProgrees指向兄弟节点，执行兄弟节点的beginWork过程
5. 不存在兄弟节点返回父节点。继续执行父节点completeWork


### commit阶段 （负责将变化的组件渲染到页面上
分3个阶段
#### commmitBeforeMutationEffects (DOM操作前) 
1. 处理DOM节点，渲染删除后的auutoFcous,blur逻辑
2. 调用getSnapshotBeforeUpdate声明周期钩子
3. 调度useEffect

#### commitMutationEffects (DOM操作时)

#### commitLayoutEffects (DOM操作后) 
1. layout阶段也是遍历effectList,调用声明周期，执行useEffect
2. 赋值ref
3. 处理回调


1. React.render流程
是走的unBatchUpdate，没有schedule调度， 直接到reconciler阶段


unBatchUpdate //不批处理
batchUpdate 批处理

2. this.setState流程

### 性能优化
类组件 
1. 通过showComponentUpdate
2. purComponent 组件， 这个其实直接shouldComponentUpdate对prop和state做一个浅比较



函数组件
1. useCallback 来控制传给自组件的函数
2. React.memo 来实现类似于shouldComponentUpdate 
```
React.memo(() => {
  return (
    <div> </div>
  )
}, () => {}); // 可以省略第二个参数默认做一个浅比较， 如果写第二个参数自己控制组件是否渲染， 返回true代码更新组件
3. useMemo ：对于一些的状态可以优化
```


