/**
 * Created by igor on 20.11.16.
 */

/* 8 */

function f0(selector) {
    if (typeof selector === 'string') {
        var founded = document.querySelectorAll(selector);
        if (founded.length > 1) {
            return founded;
        } else if (founded.length == 1) {
            return founded[0];
        }
    } else if (selector.nodeName) {
        return selector.nodeName;
    }
}

/* 1 */

function f1(selector) {
    if (typeof selector === 'string') {
        var founded = document.querySelectorAll(selector);
        if (founded.length > 0) {
            return founded[0];
        }
    }
}

/* 2 */

function f2(newElement, referenceElement, parentElement) {
    return parentElement.insertBefore(newElement, referenceElement.nextSibling);
}

/* 3 */

function f3(element, name, value) {
    return value === undefined ? element.getAttribute(name) : element.setAttribute(name, value);
}

/* 4 */

function createChess(cont) {
    var FIELD_SIZE = 512;
    Object.assign(cont.style, {
        width: FIELD_SIZE + 'px',
        height: FIELD_SIZE + 'px'
    });
    for (var i = 0; i < 64; i++) {
        var cell = document.createElement('div');
        Object.assign(cell.style, {
            width: FIELD_SIZE / 8 + 'px',
            height: FIELD_SIZE / 8 + 'px',
            cssFloat: 'left',
            backgroundColor: (Math.floor(i/8) % 2) == (i % 8 % 2) ? '#FFF' : '#333'
        });
        cont.appendChild(cell);
    }
}