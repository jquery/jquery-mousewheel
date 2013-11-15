
var directions = {
  isNorth: function(delta) { return delta > 0; },
  isEast:  function(delta) { return delta < 0; },
  isSouth: function(delta) { return delta < 0; },
  isWest:  function(delta) { return delta > 0; },
  isNorthEast: function(deltaX, deltaY) { return deltaX < 0 && deltaY > 0; },
  isNorthWest: function(deltaX, deltaY) { return deltaX > 0 && deltaY > 0; },
  isSouthWest: function(deltaX, deltaY) { return deltaX < 0 && deltaY < 0; },
  isSouthEast: function(deltaX, deltaY) { return deltaX > 0 && deltaY < 0; }
};
var events = {
  modern: {
    generate: function(deltaX, deltaY) {
      return jQuery.Event({
        type: 'mousewheel',
        deltaX: deltaX,
        deltaY: deltaY
      });
    },
    north: function() { return events.modern.generate(0, 120);  },
    east:  function() { return events.modern.generate(-120, 0); },
    south: function() { return events.modern.generate(0, -120); },
    west:  function() { return events.modern.generate(120, 0);  },
    northeast: function() { return events.modern.generate(-120, 120);  },
    northwest: function() { return events.modern.generate(120, 120);   },
    southwest: function() { return events.modern.generate(-120, -120); },
    southeast: function() { return events.modern.generate(120, -120);  }
  }
};

module("mousewheel", {
  setup: function() {
    this.$target = $('<div style="width:100px;height:100px" />').appendTo('#qunit-fixture');
  },
  teardown: function() {
    this.$target.remove();
  }
});

test("North East", function() {
  this.$target.on('mousewheel', function(event) {
    ok(directions.isEast(event.deltaX));
    ok(directions.isNorth(event.deltaY));
  });
  this.$target.trigger( events.modern.northeast() );
});
