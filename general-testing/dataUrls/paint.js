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
    var input = elt("input", {type: "file"});
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
