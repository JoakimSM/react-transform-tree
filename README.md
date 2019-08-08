[![Build Status](https://travis-ci.com/JoakimSM/react-transform-tree.svg?branch=master)](https://travis-ci.com/JoakimSM/react-transform-tree)

# react-transform-tree
Utility to transform a react tree test test

### Installation

`npm i react-transform-tree`

or 

`yarn add react-transform-tree`

### Usage

`walk(sourceNode, handlersForKinds)` is used to transform a React node tree into another one. `handlersForKinds` is an object accepting property names from the kinds object (see below), where each property value is a function used to transform that specific kind of node. 

Accepting kinds:
empty, text, fragment, domElement, componentElement

The transform function is passed a single object, which has the following properties:
- node: the original node
- kind: one of the kinds specified above
- defaultHandler(): the default handler for the current kind
- walkChildren(): a shortcut to traverse the children of the current node
- walk: a recursive call to the walk function

To replace all div's with span's do something like this.

```
import { walk, kinds } from 'react-transform-tree';

walk(source, {
    [kinds.DOM_ELEMENT]: (path) => {
        const { node } = path;
        if (node.type === 'div') {
            return React.createElement(
                'span',
                node.props,
                ...path.walkChildren(),
            );
        }
        return path.defaultHandler();
    },
});
```


