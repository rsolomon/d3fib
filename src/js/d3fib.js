(function(d3, _) {

  var PHI = 1.61803398875;  // Golden ratio, baby

  // Basic dimensions of the svg container
  var windowHeight = document.documentElement.clientHeight,
    windowWidth = document.documentElement.clientWidth;

  // Colors used for the shapes.
  var colors = ['#EFDFBB', '#9EBEA6', '#335D6A', '#D64F2A', '#7A8A7F'];

  // Create the primary svg container. We will append all of our shapes
  // and other goodness to this.
  var svg = d3.select("body").append("svg")
    .attr("width", windowWidth)
    .attr("height", windowHeight)
    .attr("class", "PiYG");

  var rotate = 45,  // Rotation of all objects rendered and to be rendered.
    speed = 500,    // Speed to zoom and add objects (ms).
    index = 1;      // Current index of the object being rendered.

  // Keep track of the attributes of the previous 2 objects being rendered.
  var prev1 = {
      x:  Math.round(windowWidth / 2),
      y: Math.round(windowHeight / 2),
      width: 1,
      height: 1
    },
    prev2 = _.clone(prev1);

  /**
   * Calculate the dimensions of the next object using the fibonacci sequence.
   */
  function fib() {
    return prev1.width + prev2.width;
  }

  // Object used for scaling shapes using the Golden Ratio.
  // @see `scale`
  var _translate = {
    x: (windowWidth / 2) - ((windowWidth / 2) / PHI),
    y: (windowHeight / 2) - ((windowHeight / 2) / PHI),
    width: 0,
    height: 0
  };

  /**
   * Scale and translate an object by phi.
   */
  function scale(object) {
    _.each(_.keys(_translate), function(key) {
      object[key] = (object[key] / PHI) + _translate[key];
    });
    return object;
  }

  function drawNext() {
    var dim = fib(index++),
      x, y;

    // Calculate the coordinates for the next shape.
    switch (index % 4) {
      case 0:
        x = prev1.x + prev1.width;
        y = prev2.y;
        break;

      case 1:
        x = prev2.x;
        y = prev1.y - dim;
        break;

      case 2:
        x = prev1.x - dim;
        y = prev1.y;
        break;

      case 3:
        x = prev1.x;
        y = prev1.y + prev1.width;
        break;
    }

    var attrs = {
      x: x,
      y: y,
      width: dim,
      height: dim,
      fill: colors[index % colors.length]
    };
    prev2 = prev1;
    prev1 = attrs;
    var rect = svg.append('rect')
      .attr(prev2)
      .attr("transform", "rotate(" + rotate + "," + (windowWidth / 2) + "," + (windowHeight / 2) + ")")
      .transition()
      .attr(attrs)
      .duration(speed)
      .ease('linear')
      .each('end', function() {
        if (index > 15) {

          // If a sufficient amount of content is on the screen, start
          // to scale back everything. This is done instead of zooming so that
          // the animation can continue forever. If zoomed, overflows and memory
          // problems would happen fairly quickly.
          var rects = d3.selectAll('rect');
          rects.each(function() {
            var $this = d3.select(this);

            // Get rid of objects entirely that are no longer visible.
            if ($this.attr('width') < 1) {
              $this.remove();
            }

            // Scale the content on the screen by phi.
            var translated = scale({
              x: $this.attr('x'),
              y: $this.attr('y'),
              width: $this.attr('width'),
              height: $this.attr('height')
            });

            $this.transition()
              .attr(translated)
              .attr("transform", "rotate(" + rotate + "," + (windowWidth / 2) + "," + (windowHeight / 2) + ")")
              .duration(speed)
              .ease('linear');
          });

          // Scale our previous 2 objects as well, so the next object generated
          // is of the proper size and position.
          scale(prev1);
          scale(prev2);
        }
        drawNext();
      });
  }

  // Begin the trip!
  drawNext();
})(d3, _);

