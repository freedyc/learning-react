
const createElement = (type, props, ...children) => {
    // console.log('createElement', type, props, children);
    if (props) {
        delete props.__source;
        delete props.__self;
    }
 
    return {
        type,
        props: {
            ...props, 
            children: children.map(child => {
                return typeof child === "object" ?  child : createTextNode(child);
            })
        }
    }
};


const createTextNode = (child) => {
    return {
        type: 'TEXT',
        props: {
            children: [],
            nodeValue: child
        }
    }
}

export default {
    createElement,
};