import Event from './Event';

class Touch extends Event {
    // eslint-disable-next-line no-useless-constructor
    constructor(selector) {
        super(selector);
    }
    doTouchStart(touches, timeStamp) {
        // realize
        console.log(touches, timeStamp);
    }
    doTouchMove(touches, timeStamp) {
        // realize
        console.log(touches, timeStamp);
    }
    doTouchEnd(timeStamp) {
        // realize
        console.log(timeStamp);
    }
}


export default Touch;
