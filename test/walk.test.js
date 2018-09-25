import React from 'react';
import { walk, kinds } from '../src';

const sourceNode = (
    <div>
        <div>
            <span>
                test
            </span>
        </div>
    </div>
);

const sourceNodeAdvanced = (
    <div>
        <div>
            <span>
                test
            </span>
        </div>
        <span
            className="test"
        >
            lastText
        </span>
    </div>
);

const getChildren = data => ({ ...data, node: data.node.props.children });
const executeFn = fn => (data) => {
    fn(data);
    return data;
};
const pipe = (...fns) => x => fns.reduce((v, fn) => fn(v), x);

const basicWalk = () => {
    const walkedNode = walk(sourceNode);

    const getNodeCheckList = pipe(
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => { data.checklist.push(data.node); }),
    );

    const sourceNodeCheckList = getNodeCheckList({ node: sourceNode, checklist: [] }).checklist;
    const walkedNodeCheckList = getNodeCheckList({ node: walkedNode, checklist: [] }).checklist;
    const isEqual = sourceNodeCheckList.every((item, index) => item === walkedNodeCheckList[index]);
    expect(isEqual).toBeTruthy();
};

const replaceDomElementWalk = () => {
    const walkedNode = walk(sourceNode, {
        [kinds.DOM_ELEMENT]: (path) => {
            const { node } = path;
            if (node.type === 'div') {
                return React.createElement(
                    'span',
                    node.props,
                    ...path.walkChildren(),
                );
            }
            return React.cloneElement(
                node,
                node.props,
                ...path.walkChildren(),
            );
        },
    });

    const getNodeCheckList = pipe(
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => { data.checklist.push(data.node); }),
    );
    const sourceNodeCheckList = getNodeCheckList({ node: sourceNode, checklist: [] }).checklist;
    const walkedNodeCheckList = getNodeCheckList({ node: walkedNode, checklist: [] }).checklist;
    const isEqual = sourceNodeCheckList.every((item, index) => (
        item === 'div' ? walkedNodeCheckList[index] === 'span' : item === walkedNodeCheckList[index]));
    expect(isEqual).toBeTruthy();
};

const replaceDomElementAdvancedWalk = () => {
    const walkedNode = walk(sourceNodeAdvanced, {
        [kinds.DOM_ELEMENT]: (path) => {
            const { node } = path;
            if (node.type === 'div') {
                return React.createElement(
                    'span',
                    node.props,
                    ...path.walkChildren(),
                );
            }
            return React.cloneElement(
                node,
                node.props,
                ...path.walkChildren(),
            );
        },
    });

    const getNodeCheckList = pipe(
        executeFn((data) => { data.checklist.push(data.node.type); }),
        getChildren,
        executeFn((data) => {
            data.checklist.push(data.node[0].type);
            data.checklist.push(data.node[1].type);
        }),
        data => ({
            ...data,
            node: [
                data.node[0].props.children,
                data.node[1],
            ],
        }),
        executeFn((data) => { data.checklist.push(data.node[0].type); }),
        data => ({
            ...data,
            node: [
                data.node[0].props.children,
                data.node[1],
            ],
        }),
        executeFn((data) => { data.checklist.push(data.node[0]); }),
        data => ({
            ...data,
            node: data.node[1].props.children,
        }),
        executeFn((data) => { data.checklist.push(data.node); }),
    );
    const sourceNodeCheckList = getNodeCheckList({ node: sourceNodeAdvanced, checklist: [] }).checklist;
    const walkedNodeCheckList = getNodeCheckList({ node: walkedNode, checklist: [] }).checklist;
    const isEqual = sourceNodeCheckList
        .every((item, index) => (
            item === 'div' ? walkedNodeCheckList[index] === 'span' : item === walkedNodeCheckList[index]));
    expect(isEqual).toBeTruthy();
};

test('basic walk', basicWalk);
test('replace div with span', replaceDomElementWalk);
test('replace div with span advanced', replaceDomElementAdvancedWalk);
