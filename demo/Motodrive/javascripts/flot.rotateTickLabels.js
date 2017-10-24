var rotateTickLabels = function(plot) {
    var axes = plot.getAxes();
    var deg2radians = Math.PI / 180;
    var tickAngle, rotateAngle, cos, sin, tickLabels, length, $tickLabel, height, width,
        left, top, x1, x2, x3, minX, maxX, y1, y2, y3, minY, maxY;

    var isIE = !$.support.leadingWhitespace;

    // rotate labels on X axes if needed
    var i = 1;
    var curXaxis = axes.xaxis;

    while (curXaxis && !isNaN(curXaxis.options.tickAngle)) {
        tickAngle = curXaxis.options.tickAngle;
        rotateAngle = tickAngle * deg2radians;
        cos = Math.cos(rotateAngle);
        sin = Math.sin(rotateAngle);

        tickLabels = plot.getPlaceholder().find(".x" + i + "Axis > .tickLabel");
        length = tickLabels.length;

        for (var j=0; j<length; j++) {
            $tickLabel = $(tickLabels[j]);

            // original height / width of the div with text
            height = $tickLabel.outerHeight();
            width = $tickLabel.outerWidth();

            if (isIE) {
                // IE8 and below
                // width after rotation
                // http://stackoverflow.com/questions/3276467/adjusting-div-width-and-height-after-rotated
                // (w,0) rotation
                x1 = cos * width;
                // (0,h) rotation
                x2 = -sin * height;
                // (w,h) rotation
                x3 = cos * width - sin * height;

                minX = Math.min(0, x1, x2, x3);
                maxX = Math.max(0, x1, x2, x3);

                // diff to the left
                left = parseInt($tickLabel.css("left"), 10);
                left = isNaN(left) ? 0 : left;

                // rotate
                $tickLabel.css({
                    "filter": "progid:DXImageTransform.Microsoft.Matrix(M11="+cos+",M12="+(-sin)+",M21="+sin+",M22="+cos+",SizingMethod='auto expand')",
                    "zoom": 1,
                    "background-color": "white",
                    "left": left + Math.abs((maxX - minX - width) / 2) + "px" // adjust left position
                });
            } else {
                // modern browsers
                // rotate
                $tickLabel.css({
                    "-webkit-transform": "rotate(" + tickAngle + "deg)",
                    "-moz-transform": "rotate(" + tickAngle + "deg)",
                    "-ms-transform": "rotate(" + tickAngle + "deg)",
                    "-o-transform": "rotate(" + tickAngle + "deg)",
                    "transform": "rotate(" + tickAngle + "deg)"
                });

                // height after rotation
                // http://stackoverflow.com/questions/3276467/adjusting-div-width-and-height-after-rotated
                // (w,0) rotation
                y1 = sin * width;
                // (0,h) rotation
                y2 = cos * height;
                // (w,h) rotation
                y3 = sin * width + cos * height;

                minY = Math.min(0, y1, y2, y3);
                maxY = Math.max(0, y1, y2, y3);

                // diff to the top
                top = parseInt($tickLabel.css("top"), 10);
                top = isNaN(top) ? 0 : top;

                // adjust top position
                $tickLabel.css("top", top + ((maxY - minY - height) / 2) + "px");
            }
        }

        i++;
        curXaxis = axes['x' + i + 'axis'];
    }

    // rotate labels on Y axes if needed
    i = 1;
    var curYaxis = axes.yaxis;

    while (curYaxis && !isNaN(curYaxis.options.tickAngle)) {
        tickAngle = curYaxis.options.tickAngle;
        rotateAngle = tickAngle * deg2radians;
        cos = Math.cos(rotateAngle);
        sin = Math.sin(rotateAngle);

        tickLabels = plot.getPlaceholder().find(".y" + i + "Axis > .tickLabel");
        length = tickLabels.length;

        for (var k=0; k<length; k++) {
            $tickLabel = $(tickLabels[k]);

            // original height / width of the div with text
            height = $tickLabel.outerHeight();
            width = $tickLabel.outerWidth();

            if (isIE) {
                // IE8 and below
                // height after rotation
                // http://stackoverflow.com/questions/3276467/adjusting-div-width-and-height-after-rotated
                // (w,0) rotation
                y1 = sin * width;
                // (0,h) rotation
                y2 = cos * height;
                // (w,h) rotation
                y3 = sin * width + cos * height;

                minY = Math.min(0, y1, y2, y3);
                maxY = Math.max(0, y1, y2, y3);

                // diff to the top
                top = parseInt($tickLabel.css("top"), 10);
                top = isNaN(top) ? 0 : top;

                // rotate
                $tickLabel.css({
                    "filter": "progid:DXImageTransform.Microsoft.Matrix(M11="+cos+",M12="+(-sin)+",M21="+sin+",M22="+cos+",SizingMethod='auto expand')",
                    "zoom": 1,
                    "background-color": "white",
                    "top": top - Math.abs((maxY - minY - width) / 2) + "px" // adjust top position
                });
            } else {
                // modern browsers
                // rotate
                $tickLabel.css({
                    "-webkit-transform": "rotate(" + tickAngle + "deg)",
                    "-moz-transform": "rotate(" + tickAngle + "deg)",
                    "-ms-transform": "rotate(" + tickAngle + "deg)",
                    "-o-transform": "rotate(" + tickAngle + "deg)",
                    "transform": "rotate(" + tickAngle + "deg)"
                });

                // width after rotation
                // http://stackoverflow.com/questions/3276467/adjusting-div-width-and-height-after-rotated
                // (w,0) rotation
                x1 = cos * width;
                // (0,h) rotation
                x2 = -sin * height;
                // (w,h) rotation
                x3 = cos * width - sin * height;

                minX = Math.min(0, x1, x2, x3);
                maxX = Math.max(0, x1, x2, x3);

                // diff to the left
                left = parseInt($tickLabel.css("left"), 10);
                left = isNaN(left) ? 0 : left;

                // adjust left position
                $tickLabel.css("left", left - ((maxX - minX - width) / 2) + "px");
            }
        }

        i++;
        curYaxis = axes['y' + i + 'axis'];
    }
}
