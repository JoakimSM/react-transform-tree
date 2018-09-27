// @flow
import * as React from 'react';
import kinds from './constants/kinds.const';
import kindOf from './kindOf';

type EmptyNode = ?boolean;
type TextNode = string | number;
type DomElement = React.Element<any>;
type ComponentElement = React.Element<any>;

type Node = EmptyNode | TextNode | DomElement | ComponentElement;
export type NodeOrNodeArray = Node | Array<Node>;

type Path<TNode> = {
    node: TNode,
    kind: $Values<typeof kinds>,
    defaultHandler: () => any,
    walk: (childNode: NodeOrNodeArray, childHandlers: ?KindHandlers) => NodeOrNodeArray, // eslint-disable-line
    walkChildren: (childHandlers: ?KindHandlers) => NodeOrNodeArray, // eslint-disable-line
};

type KindHandlers = {
    empty?: (path: Path<EmptyNode>) => any,
    text?: (path: Path<TextNode>) => any,
    fragment?: (path: Path<Array<Node>>) => any,
    domElement?: (path: Path<DomElement>) => any,
    componentElement?: (path: Path<ComponentElement>) => any,
};

const defaultHandlerEmpty = (path: Path<EmptyNode>) => path.node;
const defaultHandlerText = (path: Path<TextNode>) => path.node;
const defaultHandlerFragment = (path: Path<Array<Node>>) => path.node.map(n => path.walk(n));
const defaultHandlerDomOrComponentElement = (path: Path<DomElement | ComponentElement>) => React.cloneElement(
    path.node,
    path.node.props,
    // $FlowFixMe
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
            // $FlowFixMe
            return defaultHandlersForKinds[path.kind](path);
        },
        walk(childNode, childHandlers = handlersForKinds) {
            return walk(childNode, childHandlers); //eslint-disable-line
        },
        walkChildren(childHandlers = handlersForKinds) {
            if (!path.node || !path.node.props || !path.node.props.children) {
                return [];
            }

            return React
                .Children
                .toArray(path.node.props.children)
                .map(
                    childNode => path.walk(childNode, childHandlers),
                );
        },
    };
    // $FlowFixMe
    return handlersForKinds[path.kind](path);
}

export default function walk(node: NodeOrNodeArray, kindsHandlers: ?KindHandlers) {
    const handlers = { ...defaultHandlersForKinds, ...kindsHandlers };
    return doWalk(node, handlers);
}
