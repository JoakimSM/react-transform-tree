import React from 'react';
import kinds from './constants/kinds.const';
import kindOf from './kindOf';

type EmptyNode = ?Boolean;
type TextNode = string | number;
type DomElement = {
    type: string,
    children: NodeOrNodeArray, // eslint-disable-line
};
type ComponentElement = {
    type: string,
    children: NodeOrNodeArray, // eslint-disable-line
};

type Node = EmptyNode | TextNode | DomElement | ComponentElement;
type NodeOrNodeArray = Node | Array<Node>;

type KindHandlers = {
    [kind: $Values<typeof kinds>]: (path: Path) => NodeOrNodeArray; // eslint-disable-line
};

type Path = {
    node: NodeOrNodeArray,
    kind: $Values<typeof kinds>,
    defaultHandler: () => any,
    walk: (childNode: NodeOrNodeArray, childHandlers: ?KindHandlers) => NodeOrNodeArray,
    walkChildren: (childHandlers: ?KindHandlers) => NodeOrNodeArray,
    kindHandlers: KindHandlers,
};


function defaultHandler(path: Path) {
    const kind = kindOf(path.node);
    if (kind === kinds.EMPTY) {
        return path.node;
    }
    if (kind === kinds.TEXT) {
        return path.node;
    }
    if (kind === kinds.FRAGMENT) {
        return path.node.map(path.traverse);
    }
    return React.cloneElement(
        path.node,
        path.node.props,
        ...path.walkChildren(),
    );
}

const defaultHandlerEmpty = (path: Path) => path.node;
const defaultHandlerText = (path: Path) => path.node;
const defaultHandlerFragment = (path: Path) => path.node.map(path.walk);
const defaultHandlerDomOrComponentElement = (path: Path) => React.cloneElement(
    path.node,
    path.node.props,
    ...path.walkChildren(),
);

const defaultHandlersForKinds = {
    [kinds.EMPTY]: defaultHandlerEmpty,
    [kinds.TEXT]: defaultHandlerText,
    [kinds.FRAGMENT]: defaultHandlerFragment,
    [kinds.DOM_ELEMENT]: defaultHandlerDomOrComponentElement,
    [kinds.COMPONENT_ELEMENT]: defaultHandlerDomOrComponentElement,
};

function doWalk(node: NodeOrNodeArray, handlersForKinds: KindHandlers) {
    const path = {
        node,
        kind: kindOf(node),
        defaultHandler() {
            return defaultHandler(path);
        },
        walk(childNode, childHandlers = handlersForKinds) {
            return walk(childNode, childHandlers); //eslint-disable-line
        },
        walkChildren(childHandlers = handlersForKinds) {
            return React
                .Children
                .toArray(path.node.props.children)
                .map(
                    childNode => path.walk(childNode, childHandlers),
                );
        },
    };

    return handlersForKinds[path.kind](path);
}

export default function walk(node: NodeOrNodeArray, kindsHandlers: ?KindHandlers) {
    const handlers = { ...defaultHandlersForKinds, ...kindsHandlers };
    return doWalk(node, handlers);
}
