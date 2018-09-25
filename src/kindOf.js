import kinds from './constants/kinds.const';

const isEmptyKind = node => node === null || node === undefined || typeof node === 'boolean';
const isTextKind = node => typeof node === 'string' || typeof node === 'number';
const isDomElement = nodeType => typeof nodeType === 'string';

export default function kindOf(node) {
    if (isEmptyKind(node)) {
        return kinds.EMPTY;
    }
    if (isTextKind(node)) {
        return kinds.TEXT;
    }
    if (Array.isArray(node)) {
        return kinds.FRAGMENT;
    }
    if (isDomElement(node.type)) {
        return kinds.DOM_ELEMENT;
    }
    return kinds.COMPONENT_ELEMENT;
}
