
var directions = {
  isnorth: function(delta) { return delta > 0; },
  iseast:  function(delta) { return delta > 0; },
  issouth: function(delta) { return delta < 0; },
  iswest:  function(delta) { return delta > 0; },
  isnortheast: function(deltaX, deltaY) { return deltaX > 0 && deltaY > 0; },
  isnorthwest: function(deltaX, deltaY) { return deltaX < 0 && deltaY > 0; },
  issouthwest: function(deltaX, deltaY) { return deltaX > 0 && deltaY < 0; },
  issoutheast: function(deltaX, deltaY) { return deltaX < 0 && deltaY < 0; },

  north: 1,
  east: 1,
  south: -1,
  west: -1
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
    north: function() { return events.modern.generate(0, -120); },
    east:  function() { return events.modern.generate(120, 0);  },
    south: function() { return events.modern.generate(0, 120);  },
    west:  function() { return events.modern.generate(-120, 0); },
    northeast: function() { return events.modern.generate(120, -120);  },
    northwest: function() { return events.modern.generate(-120, -120); },
    southwest: function() { return events.modern.generate(-120, 120);  },
    southeast: function() { return events.modern.generate(120, 120);   }
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
    equal(event.deltaX, directions.east);
    equal(event.deltaY, directions.north);
  });
  this.$target.trigger( events.modern.northeast() );
});
