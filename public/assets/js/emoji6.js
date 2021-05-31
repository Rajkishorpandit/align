// shim layer with setTimeout fallback
function requestAnimationFrame(callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
}

var vertSpeed = 2,
  horiSpeed = 2,
  height = 0,
  width = 0;
var items = [];
var lastId = 0;

function startAnimation() {
  var $parent = $('#balloon-container'),
    $elements = $('img', $parent);

  height = $parent.height();
  width = $parent.width();

  items = [];

  $parent.css('position', 'relative').css('overflow', 'hidden');

  // store all the data for animation
  for (var i = 0; i < $elements.length; i++) {
    var $element = $($elements[i]),
      elementWidth = $element.width(),
      elementHeight = $element.height();

    $element.css('position', 'absolute');

    var item = {
      element: $element[0],
      elementHeight: elementHeight,
      elementWidth: elementWidth,
      ySpeed: -vertSpeed,

      omega: (2 * Math.PI * horiSpeed) / (width * 60), //omega= 2Pi*frequency
      random: (Math.random() / 2 + 0.5) * i * 10000, //random time offset
      x: function (time) {
        return (
          ((Math.sin(this.omega * (time + this.random)) + 1) / 2) *
          (width - elementWidth)
        );
      },
      y: height + (Math.random() + 1) * i * elementHeight,
    };
    items.push(item);
  }
}

var counter = 0;
var animationStep = function () {
  //called 60 times a second
  var time = +new Date(); //little trick, gives unix time in ms
  var check = counter % 10 === 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    transformString =
      'translate3d(' + item.x(time) + 'px,' + item.y + 'px,0px)';
    item.element.style.transform = transformString;
    item.element.style.webkitTransform = transformString;

    item.y += item.ySpeed;
    if (check && item.y < -item.elementHeight) {
      //check bounds every 10th iteration
      item.y = height;
    }
  }

  counter %= 10;
  counter++;
  lastId = setTimeout(animationStep, 1000 / 100);
};

//requestAnimationFrame(animationStep);

$(document).ready(function () {
  $('.emoji-btn').click(function (e) {
    let url = $('img', this).attr('src');
    createBalloons(url, 25);
    startAnimation();
    animationStep();
    setTimeout(removeBalloons, 5000);
  });
});

function createBalloons(url, num) {
  var balloonContainer = document.getElementById('balloon-container');
  for (var i = num; i > 0; i--) {
    var balloon = document.createElement('img');
    balloon.src = url;
    // balloon.className = 'balloon';
    // balloon.style.cssText = getRandomStyles(url);
    balloonContainer.append(balloon);
  }
}

function removeBalloons() {
  items = [];
  clearTimeout(lastId);
  $('#balloon-container img').remove();
}
