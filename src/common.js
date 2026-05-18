
/**
 * 
 * @param {String} tagName 
 * @param {Object} attributes 
 * @param {*} children 
 * @returns {Element}
 */
export function el (tagName, attributes, children) {
    const element = document.createElement(tagName);

    if (typeof attributes === 'object') {
        Object.keys(attributes).forEach(i => element.setAttribute(i, attributes[i]));
    }

    if (typeof children === 'string') {
        element.textContent = children;
    } else if (children instanceof Array) {
        children.forEach(child => element.appendChild(child));
    }

    return element;
}

/**
 * @param {Element} node 
 */
export function clearNode (node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}