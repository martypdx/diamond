'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function renderer(fragment) {

    init(fragment);

    return function render() {
        const clone = fragment.cloneNode(true);
        const nodes = clone.querySelectorAll('[data-bind]');
        nodes[ nodes.length ] = clone;
        return nodes;
    };
}

function init(fragment) {
    const nodes = fragment.querySelectorAll('text-node');
    for(var i = 0, node = nodes[i]; i < nodes.length; node = nodes[++i]) {
        node = nodes[i];
        node.parentNode.replaceChild(document.createTextNode(''), node);
    }
}

function makeFragment(html) {
    return toFragment(makeDiv(html).childNodes);
}

function toFragment(childNodes) {
    const fragment = document.createDocumentFragment();
    
    let node;
    while(node = childNodes[0]) {
        fragment.appendChild(node);
    }

    return fragment;
}

const div = document.createElement('template');
function makeDiv(html) {
    div.innerHTML = html;
    return div.content;
}

function first(observable, subscriber) {
    let any = false;

    const subscription = observable.subscribe(value => {
        subscriber(value);
        if(any) subscription.unsubscribe();
        any = true;
    });

    if(any) subscription.unsubscribe();
    any = true;

    return subscription;
}

function map(observable, map, subscriber, once = false) {
    let last;
    let lastMapped;
    let any = false;

    const subscription = observable.subscribe(value => {
        if(value !== last) {
            last = value;
            const mapped = map(value);
            if(mapped !== lastMapped) {
                lastMapped = mapped;
                subscriber(mapped);
            }
        }
        if(any && once) subscription.unsubscribe();
        any = true;
    });

    if(any && once) subscription.unsubscribe();
    any = true;

    return subscription;
}

function combine(observables, combine, subscriber, once = false) {
    const length = observables.length;
    let values = new Array(length);
    let lastCombined;
    let subscribed = false;
    let any = false;

    const call = () => {
        const combined = combine.apply(null, values);
        if(combined !== lastCombined ) {
            lastCombined = combined;
            subscriber(combined);
        }
    };

    const subscriptions = new Array(length);
    const unsubscribes = once ? [] : null;

    for(let i = 0; i < length; i++) {
        subscriptions[i] = observables[i].subscribe(value => {
            if(value !== values[i]) {
                values[i] = value;
                if(subscribed) call();
            }

            if(once) {
                if(subscribed) subscriptions[i].unsubscribe();
                else unsubscribes.push(i);
            }

            any = true;
        });
    }

    subscribed = true;
    if(any) call();
    if(once) {
        unsubscribes.forEach(i => subscriptions[i].unsubscribe());
    }
    
    return {
        unsubscribe() {
            for(let i = 0; i < length; i++) {
                subscriptions[i].unsubscribe();
            }
        }
    };
}

const isProp = (name, node) => name in node;

function attrBinder(name) {
    return node => {
        return isProp(name, node)
            ? val => node[name] = val
            : val => node.setAttribute(name, val);
    };
}

function textBinder(index) {
    return node => {
        const text = node.childNodes[index];
        return val => text.nodeValue = val;
    };
}

function __blockBinder(index) {
    return node => {
        const anchor = node.childNodes[index];
        const insertBefore = node => anchor.parentNode.insertBefore(node, anchor);

        const top = document.createComment(' block start ');
        insertBefore(top, anchor);
        
        let unsubscribes = null;
        const unsubscribe = () => {
            if(!unsubscribes) return;
            
            if(Array.isArray(unsubscribes)) {
                for(let unsub of unsubscribes) unsub.unsubscribe && unsub.unsubscribe();
            } else {
                unsubscribes.unsubscribe && unsubscribes.unsubscribe();
            }
            unsubscribes = null;
        };
        
        const observer = val => {
            removePrior(top, anchor);
            unsubscribe();
            if(!val) return;
            
            const fragment = toFragment$1(val);

            if(Array.isArray(fragment)) {
                unsubscribes = [];
                for(let f of fragment) {
                    if(f.unsubscribe) unsubscribes.push(f.unsubscribe);
                    insertBefore(f, anchor);
                }
            } else {
                unsubscribes = fragment.unsubscribe || null;
                insertBefore(fragment, anchor);
            }
        };

        return { observer, unsubscribe };
    };
}

const toFragment$1 = val => typeof val === 'function' ? val() : val;

// TODO: need to unsubscribe to prior fragment
const removePrior = (top, anchor) => {
    let sibling = top.nextSibling;
    while(sibling && sibling !== anchor) {
        const current = sibling;
        sibling = sibling.nextSibling;
        current.remove();
    }
};

function componentBinder(index) {
    return node => {
        return node.childNodes[index];
    };
}

// runtime use:
function _(){}
function $(){}

exports._ = _;
exports.html = _;
exports.$ = $;
exports.renderer = renderer;
exports.makeFragment = makeFragment;
exports.__first = first;
exports.__map = map;
exports.__combine = combine;
exports.__attrBinder = attrBinder;
exports.__textBinder = textBinder;
exports.__blockBinder = __blockBinder;
exports.__componentBinder = componentBinder;
