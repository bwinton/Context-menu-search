var self = require('sdk/self');
var data = self.data;

var selection = require("sdk/selection");
var cm = require("sdk/context-menu");

var panels = require("sdk/panel");

var browserWindow = require("sdk/window/utils").getMostRecentBrowserWindow();

var browserDocument = browserWindow.document;
var selectedText = "";


console.log(browserWindow.content.document);
//console.log(browserDocument.commandDispatcher.focusedWindow.document);
var doc = browserWindow.content.document;
browserWindow.addEventListener("scroll", function (eve) {
  var miniD =  browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "id", "minimizerDots");
    if(miniD)
    {
        var xulStackB = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "class", "browserStack");
        xulStackB.removeChild(miniD);
    }
})
//console.log(browserWindow.content.document);


var clientXDoc = 0, clientYDoc = 0, selectedPhrase = "";
function myListener() {


    var bdy = browserWindow.content.document.getElementsByTagName("body");
    //console.log(bdy.length + "assd");
    //var sel =browserWindow.content.getSelection();
    //console.log(sel.focusNode.offsetTop);
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
    if (selectedPhrase !== "")
        showSearchContext(selectedPhrase, clientXDoc, clientYDoc);
}

selection.on('select', myListener);



function panelHide() {
    //this.show();

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

        // xulStackB.removeChild(minimizerDots);
        //maker(selectedText, x,y);

    }


}

var searchResultPanel = null, counter = 0;

function maker(selectedText, x, y) {
    var iconStack = browserDocument.createElement("image");
//iconStack.setAttribute("value","Click here");
    iconStack.setAttribute("src", self.data.url("context-search-indicator.svg"));//"./data/images/context-search-indicator.svg");
    iconStack.setAttribute("top", y);
    iconStack.setAttribute("left", x);
    iconStack.setAttribute("height", "30");
    iconStack.setAttribute("width", "30");
    iconStack.setAttribute("id", "minimizerDots");


    var xulBro = browserDocument.getElementById("content");
    var xulStackBro = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "class", "browserStack");

    xulStackBro.appendChild(iconStack);


    if (searchResultPanel == null) {
        // searchResultPanel.hide();

        needNewPanel = true;
        searchResultPanel = panels.Panel({
            width: 400,
            height: 280
            //, contentURL: data.url("context-search-results.html")
 ,onHide: panelHide
        });
        searchResultPanel.on("show", function () {
            searchResultPanel.port.emit("showt", selectedPhrase);
        });

        //var conextMenuPosition = contextMenu.getBoundingClientRect();


        searchResultPanel.port.on("hideP", function () {
            searchResultPanel.hide();


            //var parentBro = browserDocument.getElementById("content-deck");
            //parentBro.appendChild(iconStack);
            ////browserElem.parentNode.insertBefore(iconStack, browserElem.nextSibling);
            //iconStack.appendChild(browserElem);
            //iconStack.appendChild(dotsIconDiv);

            // console.log(eParentNode.innerHTML);
        });

        //searchResultPanel.show({position: {top: conextMenuPosition.top - 75, left: conextMenuPosition.left}});

    }
    else {

    }


    iconStack.addEventListener("click", function () {
        if (searchResultPanel.isShowing) {
            searchResultPanel.hide();
            needNewPanel=true;
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