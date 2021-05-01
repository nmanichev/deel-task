const AsyncFunction = (async () => {}).constructor;

module.exports.isFunction = (func) => func instanceof Function;

module.exports.isAsyncFunction = (func) => module.exports.isFunction(func) && func instanceof AsyncFunction;