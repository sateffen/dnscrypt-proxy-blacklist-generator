/**
 * Represents a tree node
 */
class Node {
    /**
     * Constructor for a node
     * @param {string} aValue
     */
    constructor(aValue) {
        /**
         * The actual value in this tree
         * @type {string}
         */
        this.value = aValue;

        /**
         * Whether this node was an exlicit end or not. If a node is exlicit, it's the
         * end of one rule appended to the tree.
         * This is used to prevent unneeded duplications. If the list contains `example.com`
         * and `www.example.com` the second is implicitly blocked by the first, as `example.com`
         * is treated as `*.example.com`
         */
        this.explicitEnd = false;

        /**
         * The list of childNodes
         */
        this.children = [];
    }

    /**
     * Adds given node as child to this node
     * @param {Node} aNode
     */
    addChild(aNode) {
        if (this.explicit === true) {
            return;
        }
        else if (aNode instanceof Node) {
            this.children.push(aNode);
            return;
        }

        throw new TypeError(`Can't add a non node class as node`);
    }

    /**
     * Returns a childNode with given value, if any exists
     * @param {string} aValue
     * @return {Node|undefined}
     */
    getChild(aValue) {
        return this.children.find((aChild) => aChild.value === aValue);
    }

    /**
     * Returns whether this node is an explicit end or not
     * @return {boolean}
     */
    isExplicitEnd() {
        return this.explicitEnd;
    }

    /**
     * Marks this node as an explicit end and removes all children, as they are not needed
     */
    makeExplicitEnd() {
        this.explicitEnd = true;
        this.children = [];
    }

    /**
     * Creates a string list based on the subtree
     * @return {Array<string>}
     */
    toStringList() {
        // if there are no children, just shortcut
        if (this.explicitEnd) {
            return [this.value];
        }
        // else generate the complete list of possible outcomes
        const returnList = [];

        for (const child of this.children) {
            const childTexts = child.toStringList();

            for (const childText of childTexts) {
                returnList.push(this.value === '' ? childText : childText + '.' + this.value);
            }
        }

        return returnList;
    }
}

/**
 * A pointer to the base node, spanning the actual tree
 */
const baseNode = new Node('');

/**
 * A regexp for checking, that an url has a valid format
 */
const validUrlCharacters = /^[\wäüöÄÖÜß.*-]+$/u;

/**
 * Validates given url and returns a valid version of it, or null if there is no valid version
 * @param {string} aUrl The url to validate
 * @return {string|null}
 */
function validateUrl(aUrl) {
    let url = aUrl;

    if (aUrl[aUrl.length - 1] === '/') {
        url = url.slice(0, -1);
    }

    if (validUrlCharacters.test(url)) {
        return url;
    }

    return null;
}

/**
 * A helper function to add an url to the tree. This will insert given url in the tree as needed
 * @param {string} aUrl The url to add
 */
function addToTree(aUrl) {
    const validatedUrl = validateUrl(aUrl);

    if (validatedUrl === null) {
        console.log('URL does not match schema, can\'t use it:', aUrl);
        return;
    }

    const urlParts = validatedUrl.split('.');
    let iterator = baseNode;

    for (let i = urlParts.length - 1; i >= 0; i--) {
        // if the current node is an explicitEnd, we don't need to append any children, as they are covered already
        if (iterator.isExplicitEnd()) {
            break;
        }

        const part = urlParts[i];
        const potentialChild = iterator.getChild(part);

        if (potentialChild) {
            iterator = potentialChild;
        }
        else {
            const newChild = new Node(part);
            iterator.addChild(newChild);
            iterator = newChild;
        }
    }

    iterator.makeExplicitEnd();
}

/**
 * Returns a list of urls generated from the basetree
 * @return {Array<string>}
 */
function getUrlList() {
    return baseNode.toStringList();
}

module.exports = {
    addToTree,
    getUrlList,
};
