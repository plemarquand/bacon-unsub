#  [![NPM version][npm-image]][npm-url]

> Unsubscribe from observables through delegate methods.

Using Bacon with traditional Object Oriented frameworks can be hard. These frameworks typically
rely methods with side effects. Disposing of your observables based on your chosen framework's
component lifecylce can be tedious.

Bacon-unsub is a small utility module that augments Bacon's `onValue`, `onError` `onEnd`, and `subscribe` methods with
an `unsubOn` method that automatically unsubscribes the observable from the source whenever that method
is called.

## Install

```sh
$ npm install --save bacon-unsub
```

## Usage

```js
var Bacon = require('baconjs');

// Augments Bacon subscription methods with the 'unsubOn' method
require('bacon-unsub')(Bacon);

// Mock object that has a destroy method
var frameworkObject = {
	destroy: function() {
		console.log('Framework Destroy');
	}
};

// Repeat numbers until unsubscribed
Bacon.repeatedly(200, [1,2,3,4,5])
    .onValue(function(value) {
    	console.log('Value:', value);
    })
    .unsubOn(frameworkObject, 'destroy');

// Call the delegate method after 2 seconds.
// Values are no longer printed after 'Framework Destroy'.
setTimeout(function() {
	frameworkObject.destroy();
}, 2000);
```

Multiple `unsubOn` calls pointing to the same delegate method will all get unsubscribed when the delegate is called.

```js
Bacon.repeatedly(200, [1,2,3,4,5])
    .onValue(function(value) {
    	console.log('# Value:', value);
    })
    .unsubOn(frameworkObject, 'destroy');

Bacon.repeatedly(200, ['foo', 'bar'])
    .onValue(function(value) {
    	console.log('String Value:', value);
    })
    .unsubOn(frameworkObject, 'destroy');

setTimeout(function() {
	// Unsubscribes both observables
	frameworkObject.destroy();
}, 2000);
```

The following example integrates with [Backbone](http://backbonejs.org/). When the [Backbone.View.remove](http://backbonejs.org/#View-remove) method is called the subscription created in the `initialize` method is automatically unsubscribed.

```js

var Bacon = require('baconjs');
require('bacon-unsub')(Bacon);

var FooView = Backbone.View.extend({
    initialize: function() {
		var el = this.el;

		// Update our view every 200ms with a new value until unsubscribed.
        Bacon.repeatedly(200, [1,2,3,4,5])
            .onValue(function(value) {
            	console.log('Value:', value);
                el.innerText = value;
            })
            .unsubOn(this, 'remove');
    },

    remove: function() {
        console.log('Removed!');
    }
});

// Create the view and append it to the dom.
var view = new FooView();
document.body.appendChild(view.el);

// Remove it after 2 seconds.
setTimeout(function() {
	view.remove();
}, 2000);

```

## License

MIT © [Paul LeMarquand](https://github.com/plemarquand)


[npm-url]: https://npmjs.org/package/bacon-unsub
[npm-image]: https://badge.fury.io/js/bacon-unsub.svg
[travis-url]: https://travis-ci.org/plemarquand/bacon-unsub
[travis-image]: https://travis-ci.org/plemarquand/bacon-unsub.svg?branch=master
[daviddm-url]: https://david-dm.org/plemarquand/bacon-unsub.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/plemarquand/bacon-unsub
