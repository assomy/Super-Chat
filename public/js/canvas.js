// Wrap everything in a function
var canv = (function(window) {
    canvas = null,
    context = null,
    begin = null,
    end = null,
    tool = null,
    EventUtil = {
      addListener: function(node, evnt, func) {
        if (document.addEventListener) {
          node.addEventListener(evnt, func, false);
        } else if (document.attachEvent) {
          node.attachEvent('on' + evnt, func);
        } else {
          node['on' + event] = func;
        }
      }
    };

  function init () {
    // Find the canvas element.
    canvas = document.getElementById('imageView');
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }

    // Pencil tool instance.
    tool = new tool_pencil();

    // Attach the mousedown, mousemove and mouseup event listeners.
    EventUtil.addListener(canvas, 'mousedown', ev_canvas)
    EventUtil.addListener(canvas, 'mousemove', ev_canvas)
    EventUtil.addListener(canvas, 'mouseup', ev_canvas)
  }
   // This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  function tool_pencil () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
        socket.emit('begin', {x: ev._x, y: ev._y});
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
        socket.emit('drawing', {x: ev._x, y: ev._y});
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
      }
    };
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  function draw(obj) {
    context.strokeStyle = "#000";
    context.beginPath();
    context.moveTo(obj.begin.x, obj.begin.y);
    context.lineTo(obj.end.x, obj.end.y);
    context.closePath();
    context.stroke();
  }

  function drawStart(x, y) {
    context.strokeStyle = "#000";
    context.beginPath();
    context.moveTo(x, y);
  }

  function drawing(x, y) {
    context.lineTo(x, y);
    context.stroke();
  }

  EventUtil.addListener(window, 'load', init);

  init();

  return {
    pencil: tool_pencil,
    ev_canvas: ev_canvas,
    context: (context == null) ? canvas.getContext('2d') : context,
    draw: draw,
    drawStart: drawStart,
    drawing: drawing
  }
})(this);