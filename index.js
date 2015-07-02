var self = require('sdk/self'), data = self.data, selection = require("sdk/selection"), panels = require("sdk/panel");

var browserWindow = require("sdk/window/utils").getMostRecentBrowserWindow(), browserDocument = browserWindow.document, doc = browserWindow.content.document;
//var selectedText = "";
var clientXDoc = 0, clientYDoc = 0, selectedPhrase = "";

browserWindow.addEventListener("scroll", function (eve) {
    var miniD = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "id", "minimizerDots");
    if (miniD) {
        var xulStackB = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "class", "browserStack");
        // instead of removing position can be changed but changing top, left does not work :(
        xulStackB.removeChild(miniD);
    }
});


function myListener() {
    selectedPhrase = selection.text;
    var selRange;
    var sel = browserWindow.content.getSelection();
    if (sel.rangeCount) {
        selRange = sel.getRangeAt(sel.rangeCount - 1);
        selRange.collapse();
        var martyrElem = browserDocument.createElement("span");
        selRange.insertNode(martyrElem);
        var rect = martyrElem.getBoundingClientRect();
        clientXDoc = rect.left;
        clientYDoc = rect.top;
        martyrElem.parentNode.removeChild(martyrElem);
    }
    if (selectedPhrase != "" && selectedPhrase)
        showSearchContext(selectedPhrase, clientXDoc, clientYDoc);
}

selection.on('select', myListener);


function panelHide() {
    //animation can be added here

}

var needNewPanel = false;

function showSearchContext(selectedText, x, y) {

// Add New panel

    var minimizerDots = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "id", "minimizerDots");//browserDocument.getElementById("minimizerDots");
    console.log(minimizerDots);
    selectedPhrase = selectedText;
    if (minimizerDots == null) {
        maker(selectedText, x, y);
    }
    else {
        var xulStackB = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "class", "browserStack");
        minimizerDots.setAttribute("top", y);
        minimizerDots.setAttribute("left", x);
        needNewPanel = true;
    }
}

var searchResultPanel = null, counter = 0; // counter used for handle cache in the panel

function maker(selectedText, x, y) {
    var iconStack = browserDocument.createElement("image");
    iconStack.setAttribute("src", self.data.url("context-search-indicator.svg"));
    iconStack.setAttribute("top", y);
    iconStack.setAttribute("left", x);
    iconStack.setAttribute("height", "30");
    iconStack.setAttribute("width", "30");
    iconStack.setAttribute("id", "minimizerDots");


    var xulStackBro = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "class", "browserStack");
    xulStackBro.appendChild(iconStack);

    if (searchResultPanel == null) {
        needNewPanel = true;
        searchResultPanel = panels.Panel({
            width: 400,
            height: 280
            , onHide: panelHide
        });
        searchResultPanel.on("show", function () {
            searchResultPanel.port.emit("showt", selectedPhrase);
        });


        searchResultPanel.port.on("hideP", function () {
            searchResultPanel.hide();

        });
    }


    iconStack.addEventListener("click", function () {
        if (searchResultPanel.isShowing) {
            searchResultPanel.hide();
            needNewPanel = true;
        }
        else {
            if (needNewPanel) {
                searchResultPanel.contentURL = data.url("context-search-results.html?t=" + counter);

                counter += 1;
                needNewPanel = false;
            }
            searchResultPanel.show({position: {top: clientYDoc, left: clientXDoc}});
        }
    });

}

function dummy(text, callback) {
    callback(text);
}

exports.dummy = dummy;