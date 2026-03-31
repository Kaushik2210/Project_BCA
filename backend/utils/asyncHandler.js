// Higher-order function that wraps an async Express route handler.
// Without this, if an `await` call inside a route handler throws an error,
// Express will NOT catch it, and the Node.js server will crash.
//
// How it works:
// 1. It takes your async route handler function as an argument.
// 2. It returns a NEW function with the standard Express (req, res, next) signature.
// 3. Inside, it wraps your handler in `Promise.resolve()` to ensure it's always a promise.
// 4. If the promise rejects (throws an error), `.catch(err => next(err))` passes the error
//    to Express's global error handler middleware instead of crashing the server.
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
    }
}