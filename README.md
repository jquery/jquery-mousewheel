# jQuery Mouse Wheel Plugin

A [jQuery](https://jquery.com/) plugin that adds cross-browser mouse wheel support with delta normalization.

In order to use the plugin, simply bind the `mousewheel` event to an element.

The event object is updated with the normalized `deltaX` and `deltaY` properties.
In addition, there is a new property on the event object called `deltaFactor`. Multiply
the `deltaFactor` by `deltaX` or `deltaY` to get the scroll distance that the browser
has reported.

Here is an example of using both the bind and helper method syntax:

```js
$( "#my_elem" ).on( "mousewheel", function( event ) {
    console.log( event.deltaX, event.deltaY, event.deltaFactor );
} );
```

The old behavior of adding three arguments (`delta`, `deltaX`, and `deltaY`) to the
event handler is now deprecated and will be removed in later releases.


## The Deltas...

The combination of browsers, operating systems, and devices offer a huge range of possible delta values. In fact if the user
uses a trackpad and then a physical mouse wheel the delta values can differ wildly. This plugin normalizes those
values so you get a whole number starting at +-1 and going up in increments of +-1 according to the force or
acceleration that is used. This number has the potential to be in the thousands depending on the device.

### Getting the scroll distance

In some use-cases we prefer to have the normalized delta but in others we want to know how far the browser should
scroll based on the users input. This can be done by multiplying the `deltaFactor` by the `deltaX` or `deltaY`
event property to find the scroll distance the browser reported.

The `deltaFactor` property was added to the event object in 3.1.5 so that the actual reported delta value can be
extracted. This is a non-standard property.

## Building the code in the repo & running tests

```sh
git clone git@github.com:jquery/jquery-mousewheel.git
cd jquery-mousewheel/
npm install
npm test
```

The unit tests are _very_ basic sanity checks; improvements welcome.
To fully test the plugin, load [test/index.html](test/index.html) in each supported
browser and follow the instructions at the top of the file after the unit tests finish.
