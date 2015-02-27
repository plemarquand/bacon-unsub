module.exports = (Bacon, method) => {

    const performUsub = (target, method) => {
        // Only proxy the destroy method once
        if (target[method] && target[method].addHandler) {
            return target[method].addHandler;
        }

        // Save reference to the old method to delegate to.
        const oldDestroy = target[method] || () => {};
        target[method] = (...args) => {
            // Perform the unsubscriptions
            target[method].handlers.forEach(handler => handler());
            target[method].handlers = undefined;

            oldDestroy.apply(target, args);
        };

        target[method].handlers = [];
        target[method].addHandler = (handler) => target[method].handlers.push(handler);
        return target[method].addHandler;
    };

    const unsubOn = (unsub, target, method) => {
        // Looks up or creates the addHandler method and adds the unsubscription to it.
        performUsub(target, method)(unsub);
        return unsub;
    };

    const augment = (Bacon, globalMethod = 'destroy') => {
        // Wraps the method on the prototype so the returned unsubscription method
        // is wrapped with with the `unsubOn` implementation.
        const augmentMethod = (proto, method) => {

            const savedMethod = proto[method];

            proto[method] = function(...args) {
                // Call the delegate method and get the unsubscription method.
                const unsub = savedMethod.apply(this, args);

                // Augment the method with 'unsubOn' so it can be chained
                unsub.unsubOn = (target, method) => unsubOn(unsub, target, method || globalMethod);

                return unsub;
            };
        };

        augmentMethod(Bacon.Observable.prototype, 'subscribe');
        augmentMethod(Bacon.Observable.prototype, 'onValue');
        augmentMethod(Bacon.Observable.prototype, 'onEnd');
        augmentMethod(Bacon.Observable.prototype, 'onError');
    };

    // TODO: Catch invalid bacon

    augment(Bacon, method);

    return Bacon;
};