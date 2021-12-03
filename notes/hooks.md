# Hooks

前提： hook只能在functioncompoennt使用
renderWithHooks方法是诸如hooks上下文
useState: 在function component定义state
useEffect：模拟生命周期方法， didMount didUpdate willUnmount
useRef：和ref一样的功能
useContext: 在function 使用context
useMemo： 把值缓存一下
useCallback: 把函数缓存一下

## useState

### useState的3个阶段

mountState  得到初始化值 （react-reconciler/src/ReactFiberHooks.new.js）
首先：第一次执行函数体的时候，调用useState会执行mountState,它主要做了一下几件事情
    - 默认值是function,执行function，得到初始的state
    - state是存放在memoizedState属性中
    - 新建一个queue
    - 把queue传递给dispatch
    - 返回默认值和dispatch

其次： dispatchAction
    - 创建一个update
    - update添加到queue中
    - 如果当前有时间，提前计算出state,保存在eagerState （判断当前有没有任务，没有任务就先执行掉， 把计算值放到eagerState上）
    - 调用一次scheduleWork / ScheduleUpdateOnFiber

思考
怎么触发组件更新？
// 执行setState会创建一个update 然后出发 ScheduleUpdateOnFiber导致函数更新

怎么设置的值？
再次更新执行函数拿到state的时候useState相当于updateState,才计算出更改的值 *

updateState

- 递归执行queue里update
- 计算最新的state,赋值给memoizedState

dispatch： ReactCurrentDispatcher.current 赋值时动态的

BeginWork => updateFunctionComponent => renderWithHooks => 第一次赋值为HooksDispatcherOnMount 更新阶段赋值为HooksDispatcherOnUpdate;

## useEffect

### useEffect二个阶段

1. mountEffect
    - 是在beginWork执行的， 打上flag标记，插入一个Effect链表，
    - 在commit阶段dom更新完毕，才会执行useEffect的回调，把create返回值赋值给destroy
2. updateEffect
    - 设置EffecTag
    - 对比依赖是否发生变化如果不一样，则重新push一个新的Effect
执行时机：
在commitRoot => commitLayoutEffects => commitLifeCycles => commitHookEffctListMount 里执行MountEffect
