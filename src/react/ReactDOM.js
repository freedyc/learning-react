const render = (vnode, container) => {
    // console.log('ReactDOM render', vnode, container);
    // vnode => node;
    const node = createNode(vnode, container);
    if (node) container.appendChild(node);
};

const createNode = (vnode, parentNode) => {
    const { type, props } = vnode;
    let node = null;
    if (typeof type === 'function') {
        node = type.isReactComponent ? updateClassComponent(vnode, parentNode) : updateFunctionComponent(vnode, parentNode);
    } else if (type === 'TEXT') {
        node = document.createTextNode('type');
    } else if (type) {
        node = document.createElement(type);
    } else {
        node = document.createDocumentFragment();
    }
    if (type === undefined) {
        reconcilerChildren(vnode, parentNode);
    } else {
        reconcilerChildren(vnode, node);
        updateNode(node, props);
    }
    return node;
}

const updateClassComponent = (vnode, parentNode) => {
    const { type, props} = vnode;
    const compoent = new type(props);
    const _vnode = compoent.render();
    return createNode(_vnode, parentNode); 
}

const updateFunctionComponent = (vnode, parentNode) => {
    const { type, props} = vnode;
    const _vnode = type(props);
    return createNode(_vnode, parentNode); 
}

const reconcilerChildren = (vnode, node) => {
    const { children } = vnode.props;
    for (let i = 0; i< children.length; i++ ) {
        if (Array.isArray(children[i])) {
            children[i].forEach(it => render(it, node))
        } else {
            render(children[i], node)
        }
    }
}
const updateNode = (node, nextVal) => {
    Object.keys(nextVal).filter(it => it !== "children").forEach(it => {
        if (it.slice(0, 2) === 'on') {
            let eventName = it.slice(2).toLocaleLowerCase();
            node.addEventListener(eventName, nextVal(it));
        } else {
            node[it] = nextVal[it]
        }
    })
}

export default {render};
