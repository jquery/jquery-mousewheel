/*!
 * jQuery Mousewheel v@VERSION
 * https://github.com/jquery/jquery-mousewheel
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 */
( function( factory ) {
	"use strict";

	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else if ( typeof exports === "object" ) {

		// Node/CommonJS style for Browserify
		module.exports = factory;
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {
	"use strict";

	var nullLowestDeltaTimeout, lowestDelta,
		slice  = Array.prototype.slice;

	if ( $.event.fixHooks ) {
		$.event.fixHooks.wheel = $.event.mouseHooks;
	}

	var special = $.event.special.mousewheel = {
		version: "@VERSION",

		setup: function() {
			this.addEventListener( "wheel", handler, false );

			// Store the line height and page height for this particular element
			$.data( this, "mousewheel-line-height", special.getLineHeight( this ) );
			$.data( this, "mousewheel-page-height", special.getPageHeight( this ) );
		},

		teardown: function() {
			this.removeEventListener( "wheel", handler, false );

			// Clean up the data we added to the element
			$.removeData( this, "mousewheel-line-height" );
			$.removeData( this, "mousewheel-page-height" );
		},

		getLineHeight: function( elem ) {
			var $elem = $( elem ),
				$parent = $elem.offsetParent();
			if ( !$parent.length ) {
				$parent = $( "body" );
			}
			return parseInt( $parent.css( "fontSize" ), 10 ) ||
				parseInt( $elem.css( "fontSize" ), 10 ) || 16;
		},

		getPageHeight: function( elem ) {
			return $( elem ).height();
		},

		settings: {
			normalizeOffset: true  // calls getBoundingClientRect for each event
		}
	};

	function handler( origEvent ) {
		var args = slice.call( arguments, 1 ),
			delta = 0,
			deltaX = 0,
			deltaY = 0,
			absDelta = 0,
			event = $.event.fix( origEvent );

		event.type = "mousewheel";

		// New school wheel delta (wheel event)
		if ( "deltaY" in origEvent ) {
			deltaY = origEvent.deltaY * -1;
			delta  = deltaY;
		}
		if ( "deltaX" in origEvent ) {
			deltaX = origEvent.deltaX;
			if ( deltaY === 0 ) {
				delta  = deltaX * -1;
			}
		}

		// No change actually happened, no reason to go any further
		if ( deltaY === 0 && deltaX === 0 ) {
			return;
		}

		// Need to convert lines and pages to pixels if we aren't already in pixels
		// There are three delta modes:
		//   * deltaMode 0 is by pixels, nothing to do
		//   * deltaMode 1 is by lines
		//   * deltaMode 2 is by pages
		if ( origEvent.deltaMode === 1 ) {
			var lineHeight = $.data( this, "mousewheel-line-height" );
			delta  *= lineHeight;
			deltaY *= lineHeight;
			deltaX *= lineHeight;
		} else if ( origEvent.deltaMode === 2 ) {
			var pageHeight = $.data( this, "mousewheel-page-height" );
			delta  *= pageHeight;
			deltaY *= pageHeight;
			deltaX *= pageHeight;
		}

		// Store lowest absolute delta to normalize the delta values
		absDelta = Math.max( Math.abs( deltaY ), Math.abs( deltaX ) );

		if ( !lowestDelta || absDelta < lowestDelta ) {
			lowestDelta = absDelta;
		}

		// Get a whole, normalized value for the deltas
		delta  = Math[ delta  >= 1 ? "floor" : "ceil" ]( delta  / lowestDelta );
		deltaX = Math[ deltaX >= 1 ? "floor" : "ceil" ]( deltaX / lowestDelta );
		deltaY = Math[ deltaY >= 1 ? "floor" : "ceil" ]( deltaY / lowestDelta );

		// Normalise offsetX and offsetY properties
		if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
			var boundingRect = this.getBoundingClientRect();
			event.offsetX = event.clientX - boundingRect.left;
			event.offsetY = event.clientY - boundingRect.top;
		}

		// Add information to the event object
		event.deltaX = deltaX;
		event.deltaY = deltaY;
		event.deltaFactor = lowestDelta;

		// Go ahead and set deltaMode to 0 since we converted to pixels
		// Although this is a little odd since we overwrite the deltaX/Y
		// properties with normalized deltas.
		event.deltaMode = 0;

		// Add event and delta to the front of the arguments
		args.unshift( event, delta, deltaX, deltaY );

		// Clear out lowestDelta after sometime to better
		// handle multiple device types that give different
		// a different lowestDelta
		// Ex: trackpad = 3 and mouse wheel = 120
		window.clearTimeout( nullLowestDeltaTimeout );
		nullLowestDeltaTimeout = window.setTimeout( function() {
			lowestDelta = null;
		}, 200 );

		return $.event.dispatch.apply( this, args );
	}

} );
