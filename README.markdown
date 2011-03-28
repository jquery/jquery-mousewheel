# jQuery Mouse Wheel Plugin

A jQuery plugin that adds cross-browser mouse wheel support.

In order to use the plugin, simply bind the "mousewheel" event to an element. It also provides two helper methods called `mousewheel` and `unmousewheel` that act just like other event helper methods in jQuery. The event callback receives three extra arguments which are the normalized "deltas" of the mouse wheel. 

Here is an example of using both the bind and helper method syntax.

    // using bind
    $('#my_elem').bind('mousewheel', function(event, delta, deltaX, deltaY) {
        console.log(delta, deltaX, deltaY);
    });
    
    // using the event helper
    $('#my_elem').mousewheel(function(event, delta, deltaX, deltaY) {
        console.log(delta, deltaX, deltaY);
    });

## To use in node.js with [browserify]()
    
    npm install jquery-mousewheel
    npm install jquery-browserify

In your server-side node.js code:

    var express = require('express');
    var app = express.createServer();
    
    app.use(require('browserify')({
        require : [ 'jquery-browserify', 'jquery-mousewheel' ]
    }));

In your browser-side javascript:
    
    var $ = require('jquery-browserify');
    require('jquery-mousewheel')($);

## License

The expandable plugin is licensed under the MIT License (LICENSE.txt).

Copyright (c) 2010 [Brandon Aaron](http://brandonaaron.net)
