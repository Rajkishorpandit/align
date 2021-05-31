$(function() {
    // ---------- PARAMETERS ---------

    var randomSpeeds = function() {
        return 5000; //return getRandomInteger(1000, 2000);
    }; // The lower, the faster
    var delay = 50; // The higher, the more delay
    var startScreenPercentage = 0.7; // starts from 70% of the screen...
    var endScreenPercentage = 0.97; // ...till 100% (end) of the screen

    // -------------------------------

    // Generates a random integer between the min and max
    var getRandomInteger = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var fbReactions = ["angry", "sad", "surprise", "happy", "shy"];
    var interval;

    $("button").on("click", function(event) {
        interval = setInterval(function() {
            var emojiName = $(event.target).parent().data("emoji");
            $("body").append(
                '<img class="particle" src="https://cdn4.iconfinder.com/data/icons/reaction/32/' +
                emojiName +
                '-512.png" />'
            );
            $(".particle")
                .toArray()
                .forEach(function(particle) {
                    var bounds = getRandomInteger(
                        $("body").width() * startScreenPercentage,
                        $("body").width() * endScreenPercentage
                    );
                    $(particle).animate({ left: bounds, right: bounds },
                        delay,
                        function() {
                            $(particle).animate({ top: "-100%", opacity: 0 },
                                randomSpeeds(),
                                function() {
                                    $(particle).remove();
                                }
                            );
                        }
                    );
                }); /* forEach particle Loop close*/
            clearInterval(interval);
        }, 1); /* setInterval close*/
    }); /* on('click') close*/
}); /* JQuery onDocumentReady close*/

var clicked = false;
//define balloon attribute
$("#balloon").jqFloat("stop", {
    width: 5,
    height: 30,
    speed: 1500,
    minHeight: 300,
});
$("#balloon").on("click", function() {
    clicked = !clicked;
    if (clicked) $(this).jqFloat("play");
    else $(this).jqFloat("stop");
});