// 验证触摸事件
export const isTouch = (timeStamp, touches) => {
    if (touches && !touches.length) {
        throw new Error('Invalid touch list: ' + touches);
    }
    let val = timeStamp;
    if (timeStamp instanceof Date) {
        val = timeStamp.valueOf();
    }
    if (typeof val !== 'number') {
        throw new Error('Invalid timestamp value: ' + timeStamp);
    }
};

// 缓动函数
export const easeOut = pos => {
    return Math.pow(pos - 1, 3) + 1;
};
export const easeInOut = pos => {
    let val = pos;
    if ((val /= 0.5) < 1) {
        return 0.5 * Math.pow(val, 3);
    }
    return 0.5 * (Math.pow(val - 2, 3) + 2);
};
