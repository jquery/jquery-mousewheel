/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Requires: jQuery 1.7+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    for ( var i = toFix.length; i; ) {
        $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
    }

    var special = $.event.special.mousewheel = {
        version: '4.0.0-pre',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special._getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special._getPageHeight(this));
        },

        add: function(handleObj) {
            var data = handleObj.data,
                settings = data && data.mousewheel;
            if ( settings ) {
                if ( "throttle" in settings || "debounce" in settings ) {
                    special._delayHandler.call(this, handleObj);
                }
                if ( "intent" in settings ) {
                    special._intentHandler.call(this, handleObj);
                }
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        trigger: function(data, event) {
            if (!event) {
                event = data;
                data = null
            }

            handler.call(this, event);

            return false;
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        },

        _getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        _getPageHeight: function(elem) {
            return $(elem).height();
        },

        _fix: function(orgEvent) {
            var deltaX   = 0,
                deltaY   = 0,
                absDelta = 0,
                event    = $.event.fix(orgEvent);

            // Old school scrollwheel delta
            if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail; }
            if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta  * -1; }
            if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY * -1; }
            if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

            // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
            if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
                deltaX = deltaY;
                deltaY = 0;
            }

            // New school wheel delta (wheel event)
            if ( 'deltaY' in orgEvent ) { deltaY = orgEvent.deltaY; }
            if ( 'deltaX' in orgEvent ) { deltaX = orgEvent.deltaX; }

            // No change actually happened, no reason to go any further
            if ( deltaY === 0 && deltaX === 0 ) { return; }

            // Need to convert lines and pages to pixels if we aren't already in pixels
            // There are three delta modes:
            //   * deltaMode 0 is by pixels, nothing to do
            //   * deltaMode 1 is by lines
            //   * deltaMode 2 is by pages
            if ( orgEvent.deltaMode === 1 ) {
                var lineHeight = $.data(this, 'mousewheel-line-height');
                deltaY *= lineHeight;
                deltaX *= lineHeight;
            } else if ( orgEvent.deltaMode === 2 ) {
                var pageHeight = $.data(this, 'mousewheel-page-height');
                deltaY *= pageHeight;
                deltaX *= pageHeight;
            }

            // Store lowest absolute delta to normalize the delta values
            absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

            if ( !lowestDelta || absDelta < lowestDelta ) {
                lowestDelta = absDelta;

                // Adjust older deltas if necessary
                if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                    lowestDelta /= 40;
                }
            }

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                // Divide all the things by 40!
                deltaX /= 40;
                deltaY /= 40;
            }

            // Get a whole, normalized value for the deltas
            deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
            deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

            // Normalise offsetX and offsetY properties
            if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
                var boundingRect = this.getBoundingClientRect();
                offsetX = event.clientX - boundingRect.left;
                offsetY = event.clientY - boundingRect.top;
            }

            // Add information to the event object
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.deltaFactor = lowestDelta;
            event.offsetX = offsetX;
            event.offsetY = offsetY;
            // Go ahead and set deltaMode to 0 since we converted to pixels
            // Although this is a little odd since we overwrite the deltaX/Y
            // properties with normalized deltas.
            event.deltaMode = 0;

            event.type = 'mousewheel';

            return event;
        },

        _intentHandler: function(handleObj) {
            var timeout, pX, pY, cX, cY,
                hasIntent   = false,
                elem        = this,
                settings    = handleObj.data.mousewheel.intent,
                interval    = settings.interval || 100,
                sensitivity = settings.sensitivity || 7,
                oldHandler  = handleObj.handler,
                track       = function(event) {
                    cX = event.pageX; cY = event.pageY;
                },
                compare    = function() {
                    if ( (Math.abs(pX-cX) + Math.abs(pY-cY)) < sensitivity ) {
                        $(elem).off('mousemove', track);
                        hasIntent = true;
                    } else {
                        pX = cX; pY = cY;
                        timeout = setTimeout(compare, interval);
                    }
                },
                newHandler = function(event) {
                    if (settings.preventDefault  === true) { event.preventDefault();  }
                    if (settings.stopPropagation === true) { event.stopPropagation(); }
                    if (hasIntent) { return oldHandler.apply(elem, arguments); }
                };

            $(elem).on('mouseenter', function(event) {
                pX = event.pageX; pY = event.pageY;
                $(elem).on('mousemove', track);
                timeout = setTimeout(compare, interval);
            }).on('mouseleave', function(event) {
                if (timeout) { clearTimeout(timeout); }
                $(elem).off('mousemove', track);
                hasIntent = false;
            });

            handleObj.handler = newHandler;
        },

        _delayHandler: function(handleObj) {
            var delayTimeout, maxTimeout, lastRun,
                elem       = this,
                method     = "throttle" in handleObj.data.mousewheel ? "throttle" : "debounce",
                settings   = handleObj.data.mousewheel[method],
                leading    = "leading" in settings ? settings.leading : method === "debounce" ? false : true,
                trailing   = "trailing" in settings ? settings.trailing : true,
                delay      = settings.delay || 100,
                maxDelay   = method === "throttle" ? delay : settings.maxDelay,
                oldHandler = handleObj.handler,
                newHandler = function(event) {
                    if ( settings.preventDefault  === true ) { event.preventDefault();  }
                    if ( settings.stopPropagation === true ) { event.stopPropagation(); }

                    var args = arguments,
                        clear = function() {
                            if ( maxTimeout ) { clearTimeout(maxTimeout); }
                            delayTimeout  = null;
                            maxTimeout    = null;
                            lastRun       = null;
                        },
                        run = function() {
                            lastRun = +new Date();
                            return oldHandler.apply(elem, args);
                        },
                        maxDelayed = function() {
                            run();
                            maxTimeout = null;
                        },
                        delayed = function() {
                            clear();
                            if ( trailing ) { run(); }
                        },
                        result;

                    if ( delayTimeout ) {
                        clearTimeout(delayTimeout);
                    } else {
                        if ( leading ) { result = run(); }
                    }

                    delayTimeout = setTimeout(delayed, delay);

                    if ( method === "throttle" ) {
                        if ( maxDelay && (+new Date() - lastRun) >= maxDelay ) { result = maxDelayed(); }
                    } else if ( maxDelay && !maxTimeout ) {
                        maxTimeout = setTimeout(maxDelayed, maxDelay);
                    }

                    return result;
                };
            handleObj.handler = newHandler;
        }
    };

    function handler(event) {
        // might be trigged event, so check for the originalEvent first
        var orgEvent = event ? event.originalEvent || event : window.event,
            args     = slice.call(arguments, 1);

        event = special._fix(orgEvent);

        // Add event to the front of the arguments
        args.unshift(event);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return $.event.dispatch.apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));
