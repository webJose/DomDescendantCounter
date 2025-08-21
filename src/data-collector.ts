// DOM data collection utilities
import type { NodeInfo, DescendantData } from './types.js';

declare const $0: Element | null;

export function getData(): DescendantData | null {
    var node = $0;
    if (!node) return null;
    var counts = Object.create(null);
    var total = 0;
    var visibleTotal = 0;

    function isVisibleInViewport(el: unknown) {
        if (!(el instanceof Element)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility !== 'visible' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.width > 0 && rect.height > 0 &&
            rect.bottom > 0 && rect.right > 0 &&
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left < (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function nodeIsElement(node: Node): node is Element {
        return node.nodeType === Node.ELEMENT_NODE;
    }

    function collectTagCountsWithTotal(el: Node, dict: DescendantData['counts']) {
        if (!el || !el.hasChildNodes()) return;
        el.childNodes.forEach(child => {
            var type = nodeIsElement(child) ? child.tagName : child.nodeName.toLowerCase();
            dict[type] ??= {
                count: 0,
                visible: 0
            }
            dict[type]!.count++;
            total++;
            if (nodeIsElement(child) && isVisibleInViewport(child)) {
                dict[type]!.visible++;
                visibleTotal++;
            }
            collectTagCountsWithTotal(child, dict);
        });
    }

    function getNodeInfo(el: Element | null): NodeInfo | null {
        if (!el) return null;
        var tag = el.tagName ? el.tagName.toLowerCase() : el.nodeName.toLowerCase();
        var classList = el.classList ? Array.from(el.classList) : [];
        var id = el.id ? el.id : undefined;
        return { tag, classList, id };
    }

    collectTagCountsWithTotal(node, counts);
    return {
        currentNode: getNodeInfo(node),
        total,
        visible: visibleTotal,
        counts
    };
}
