var controls = Object.create(null);
var tools = Object.create(null);

/**
 * This function creates and returns an
 * element based on the arguments passed
 */
function elt(name, attributes) {

    //creates element with given name
    var node = document.createElement(name);

    //if there are attributes passed
    //add each attribute
    if (attributes) {

        //looping through attribute
        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                node.setAttribute(attr, attributes[attr]);
            }
        }
    }

    //adds passed elements as children of element
    for (var i = 2 ; i < arguments.length ; i++) {
        var child = arguments[i];
        if(typeof child == "string") {
            child = document.createTextNode(child);
        }
        node.appendChild(child);
    }

    return node;
}

/**
 * Creates the paint panel
 */
function createPaint(parent) {

    //creates canvas element
    var canvas = elt("canvas", {width: 500, height: 300});
    var cx = canvas.getContext("2d");

    //create the toolbar for holding tools
    var toolbar = elt("div", {class: "toolbar"});
    for (var name in controls){
        toolbar.appendChild(controls[name](cx));
        toolbar.appendChild(elt("br"));
    }

    //creates the panel and canvas in the passed parent element
    var panel = elt("div", {class: "picturepanel"}, canvas);
    parent.appendChild(elt("div", null, panel, toolbar))
}

/**
 * Creates the tools as a select element
 */
controls.tool = function(cx) {
    var select = elt("select");
    for (var name in tools) {
        select.appendChild(elt("option", null, name));
    }

    cx.canvas.addEventListener("mousedown", function(event) {
        if (event.which == 1) {
            tools[select.value](event, cx);
            event.preventDefault();
        }
    });
    return elt("span", null, "Tool: ", select);
};

/**
 * Returns the elements position relative
 * to the top corner of the canvas
 */
function relativePos(event, element) {
    var rect = element.getBoundingClientRect();
    return {x: Math.floor(event.clientX - rect.left),
            y: Math.floor(event.clientY - rect.top)};
}

/**
 * Handles the motion of the pen dragging
 * across canvas
 *
 * @param onMove function to call for each
 *               "mousemove" event
 *
 * @param onEnd function to call when the
 *              mouse button is released
 */
function trackDrag(onMove, onEnd) {

    function end(event) {
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", end);

        if(onEnd) {
            onEnd(event);
        }
    }

    addEventListener("mousemove", onMove);
    addEventListener("mouseup", end);

}

/**
 * Decides what happens wiht a line tool
 *
 * @param event
 * @param cx
 * @param onEnd
 */
tools.Line = function(event, cx, onEnd) {

    //make both ends of line round
    cx.lineCap = "round";

    var pos = relativePos(event, cx.canvas);

    trackDrag(function(event) {
        cx.beginPath();
        cx.moveTo(pos.x, pos.y);
        pos = relativePos(event, cx.canvas);
        cx.lineTo(pos.x, pos.y);
        cx.stroke();
    }, onEnd);
};

/**
 * Adds an erasing tool
 *
 * @param event
 * @param cx
 * @constructor
 */
tools.Erase = function(event, cx) {
    cx.globalCompositeOperation = "destination-out";

    tools.Line(event, cx, function() {
        cx.globalCompositeOperation = "source-over";
    });
};

/**
 * Adds a color picker to the controls
 *
 * @param cx canvas to control colors
 */
controls.color = function(cx) {
    var input = elt("input", {type: "color"});

    // sets fill style and stroke style in
    // canvas to selected color from color picker
    input.addEventListener("change", function() {
        cx.fillStyle = input.value;
        cx.strokeStyle = input.value;
    });

    return elt("span", null, "Color: ", input);
};

/**
 * Adds a brush stroke selection to controls
 * @param cx
 */
controls.brushSize = function(cx) {
    var select = elt("select");

    var sizes = [1, 2,3, 4, 5, 8, 12, 25, 35, 50, 74, 100];

    sizes.forEach(function(size) {
        select.appendChild(elt("option", {value: size},
                            size + " pixels"));
    });

    select.addEventListener("change", function() {
        cx.lineWidth = select.value;
    });

    return elt("span", null, "Brush size: ", select);
};

/**
 * Allows us to save the image by grabbing the
 * dataUrl from the canvas object
 *
 * @param cx
 */
controls.save = function(cx) {
    var link = elt("a", {href: "/", target: "_blank"}, "Save");

    function update() {
        try {
            link.href = cx.canvas.toDataURL();
        } catch (e) {
            if (e instanceof SecurityError) {
                link.href = "javascript: alert(" +
                    JSON.stringify("Can't save: " + e.toString()) + ")";
            } else {
                throw e;
            }
        }
    }

    link.addEventListener("mouseover", update);
    link.addEventListener("focus", update);

    return link;
};

controls.openFile = function(cx) {
    var input = elt("input", {type: "file"});;
    input.addEventListener("change", function() {
        if (input.files.length == 0) return;

        var reader = new FileReader();
        reader.addEventListener("load", function() {
            loadImageURL(cx, reader.result);
        });
        reader.readAsDataURL(input.files[0]);
    });
    return elt("div", null, "Open file ", input);
};

/**
 * Loads an image URL to be linked to
 *
 * @param cx
 * @param url
 */
function loadImageURL(cx, url) {
    var image = document.createElement("img");

    image.addEventListener("load", function() {
        var color = cx.fillStyle, size = cx.lineWidth;
        cx.canvas.width = image.width;
        cx.canvas.height = image.height;
        cx.drawImage(image, 0, 0);
        cx.fillStyle = color;
        cx.strokeStyle = color;
        cx.lineWidth = size;
    });

    image.src = url;
}

/**
 * Opens the url based on form submission
 * @param cx
 */
controls.openURL = function (cx) {
    var input = elt ("input", {type : "text"});
    var form = elt ("form" , null ,
        "Open URL : ", input,
        elt ("button", {type : "submit"} , "load"));
    form.addEventListener("submit", function(event) {
        event.preventDefault() ;
        loadImageURL(cx, input.value);
    });
    return form;
};

/**
 * Adds text drawing
 *
 * @param event
 * @param cx
 * @constructor
 */
tools.Text = function(event, cx) {
    var text = prompt("Text: ");

    if (text) {
        var pos = relativePos(event, cx.canvas);
        cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
        cx.fillText(text, pos.x, pos.y);
    }
};

/**
 * Adds spray paint can to drawing tools
 *
 * @param event
 * @param cx
 * @constructor
 */
tools.Spray = function(event, cx) {
    var radius = cx.lineWidth / 2;
    var area = radius * radius * Math.PI;
    var dotsPerTick = Math.ceil(area/30);

    var currentPos = relativePos(event, cx.canvas);
    var spray = setInterval(function() {
        for (var i = 0; i < dotsPerTick; i++) {
            var offset = randomPointInRadius(radius);
            cx.fillRect(currentPos.x + offset.x,
                        currentPos.y + offset.y, 1, 1);
        }
    }, 25);

    trackDrag(function(event) {
        currentPos = relativePos(event, cx.canvas);
    }, function() {
        clearInterval(spray);
    });
};

/**
 * Selects random point within a given radius
 *
 * @param radius
 * @returns {{x: number, y: number}}
 */
function randomPointInRadius(radius) {
    for (;;) {
        var x = Math.random() * 2 - 1;
        var y = Math.random() * 2 - 1;

        if (x*x + y*y <= 1) {
            return {x: x*radius, y: y*radius};
        }
    }
}