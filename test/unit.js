"use strict";

QUnit.module( "mousewheel" );

function makeWheelEvent( deltaX, deltaY ) {
    var event = window.document.createEvent( "Event" );
    event.initEvent( "wheel", true, true );
    event.deltaX = deltaX;
    event.deltaY = deltaY;
    event.deltaMode = 0;
    return event;
}

QUnit.test( ".on() and .trigger()", function( assert ) {
    assert.expect( 1 );

    var markup = jQuery( "<div>wheelme</div>" ).appendTo( "body" );

    markup.on( "mousewheel", function( e ) {
        assert.ok( true, "triggered a mousewheel event on " + e.target.innerText );
    } );
    markup.trigger( "mousewheel" );

    markup.remove();
} );

QUnit.test( ".mousewheel() shorthand", function( assert ) {
    assert.expect( 1 );

    var markup = jQuery( "<p>wheelme</p>" ).appendTo( "body" );

    markup.mousewheel( function( e ) {
        assert.ok( true, "triggered a mousewheel event on " + e.target.innerText );
    } );
    markup.mousewheel();

    // Should not trigger another event
    markup.unmousewheel();
    markup.mousewheel();

    markup.remove();
} );

QUnit.test( "natively triggered events", function( assert ) {
    assert.expect( 6 );

    var markup = jQuery( "<p>wheelme</p>" ).appendTo( "body" );

    markup.on( "mousewheel", function( e ) {
        assert.ok( true, "triggered a mousewheel event on " + e.target.innerText );
        assert.ok( "deltaX" in e, "got a deltaX in the event" );
        assert.ok( !isNaN( parseFloat( e.deltaY ) ), "deltaY is a number: " + e.deltaY );
    } );

    // First wheel event "calibrates" so we won't measure this one
    var event1 = makeWheelEvent( 0, 2.2 );
    markup[ 0 ].dispatchEvent( event1 );

    var event2 = makeWheelEvent( 0, 10.528 );
    markup[ 0 ].dispatchEvent( event2 );

    markup.remove();
} );

QUnit.test( "mouse event properties are passed through", function( assert ) {
    assert.expect( 4 );

    var markup = jQuery( "<p>wheelme</p>" ).appendTo( "body" );

    markup.on( "mousewheel", function( e ) {
        var org = e.originalEvent;
        assert.equal( org.clientX, 342, "original event has clientX: " + org.clientX );
        assert.equal( org.clientY, 301, "original event has clientY: " + org.clientY );
        assert.ok( e.offsetX < org.clientX, "got plausible offsetX in the event: " + e.offsetX );
        assert.ok( e.offsetY < org.clientY, "got plausible offsetY in the event: " + e.offsetY );
    } );

    // Not sure why this property is manipulating offsetX/Y but the behavior cannot
    // change in a minor version so it will stay since it's set to true right now.
    // For testing we just want to ensure that the properties get through.
    var event1 = makeWheelEvent( 0, 2.2 );
    event1.offsetX = 1;
    event1.offsetY = 2;
    event1.clientX = 342;
    event1.clientY = 301;
    markup[ 0 ].dispatchEvent( event1 );

    markup.remove();
} );
