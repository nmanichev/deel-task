const { isAsyncFunction } = require("../helpers/type-helper");

module.exports = func => {
    if (!isAsyncFunction(func)) {
        throw new TypeError("You can't expect promises from synchronous function.");
    }

    return (req, res, next) => Promise.resolve(func(req, res, next)).catch(next);
};