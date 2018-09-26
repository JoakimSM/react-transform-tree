// @flow
import kinds from './constants/kinds.const';
import type { NodeOrNodeArray } from './walk';

const isEmptyKind = (node): boolean %checks => node === null || node === undefined || typeof node === 'boolean';
const isTextKind = (node): boolean %checks => typeof node === 'string' || typeof node === 'number';
const isDomElement = (nodeType): boolean %checks => typeof nodeType === 'string';

export default function kindOf(node: NodeOrNodeArray) {
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
