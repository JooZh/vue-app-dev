
import Viewport  from './Viewport';

class Scroller extends Viewport {
    constructor(selector, options) {
        super();
        this.mergeOps(options);
        this.initElement(selector);
        this.observer();
    }
    refresh() {
        this.setDimensions();
    }
}

export default Scroller;
