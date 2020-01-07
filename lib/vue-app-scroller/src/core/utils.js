// 验证触摸事件
const _isTouch = (timeStamp, touches) => {
    if (touches && !touches.length) {
        throw new Error('Invalid touch list: ' + touches);
    }
    if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
        throw new Error('Invalid timestamp value: ' + timeStamp);
    }
};

// 缓动函数
const _easeOut = pos => {
    return Math.pow(pos - 1, 3) + 1;
};
const _easeInOut = pos => {
    if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 3);
    }
    return 0.5 * (Math.pow(pos - 2, 3) + 2);
};

export default {
    _isTouch,
    _easeOut,
    _easeInOut
};
