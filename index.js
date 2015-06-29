var self = require('sdk/self');
var data = self.data;


var cm = require("sdk/context-menu");

var panels = require("sdk/panel");

var browserWindow = require("sdk/window/utils").getMostRecentBrowserWindow();

var browserDocument = browserWindow.document;
var selectedText = "";




cm.Item({
    label: "Define ?",
    // context: [cm.PredicateContext(checkSelection),cm.SelectionContext()],
    context: cm.SelectionContext(),
    contentScript: `self.on("context", function () { var text = window.getSelection().toString().trim(); return 'Define "'+ text + '"?'; }); self.on("click", function (node, data) { self.postMessage(window.getSelection().toString());});`,
//contentScriptFile: self.data.url("content-script.js"),
    accessKey: 's',
    onMessage: function (selectedText) {
        showSearchContext(selectedText);
    }
});


function panelHide() {
    //this.show();

}



//var dotsIconDiv = browserDocument.createElement("div");
//dotsIconDiv.style.backgroundImage = "./data/images/context-search-indicator.svg";
//dotsIconDiv.id = "minimizerDiv";
//dotsIconDiv.style.height ="30px";
//dotsIconDiv.style.width = "30px";
//dotsIconDiv.style.border = "6px solid blue";
//
////dotsIconDiv.style.position = "absolute";
//dotsIconDiv.style.top= "10px";
//dotsIconDiv.style.left="50px";



// 1. Create a stack.

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

//iconStack.style.color="blue";
//iconStack.style.font ="15px";

// 2. Put the stack after the #browser element.


// 3. Move the #browser element into the stack.
// 4. Add the dotsIconDiv into the stack, and position it.
// 5. Show and hide the dotsIconDiv.


function showSearchContext(selectedText) {
    var contextMenu = browserDocument.getElementById("contentAreaContextMenu");
    console.log(selectedText); // todo: remove
// var time = (new Date()).getSeconds();
// searchResultPanel.contentURL= data.url("context-search-results.html?t="+ time);
// Add New panel
    var searchResultPanel = panels.Panel({
        width: 400,
        height: 280,
        contentURL: data.url("context-search-results.html")
// ,onHide: panelHide 
    });
    searchResultPanel.on("show", function () {
        searchResultPanel.port.emit("showt", selectedText);
    });

    var conextMenuPosition = contextMenu.getBoundingClientRect();
    searchResultPanel.show({
        position: {top: conextMenuPosition.top - 90, left: conextMenuPosition.left}
    });

    searchResultPanel.port.on("hideP", function () {
        searchResultPanel.hide();
var minimizerDots =  browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "id", "minimizerDots");//browserDocument.getElementById("minimizerDots");
        console.log(minimizerDots);

        if(minimizerDots == null) {
            var iconStack = browserDocument.createElement("image");
//iconStack.setAttribute("value","Click here");
            iconStack.setAttribute("src", self.data.url("context-search-indicator.svg"));//"./data/images/context-search-indicator.svg");
            iconStack.setAttribute("bottom", "1");
            iconStack.setAttribute("right", "1");
            iconStack.setAttribute("height", "30");
            iconStack.setAttribute("width", "30");
            iconStack.setAttribute("id", "minimizerDots");


            var xulBro = browserDocument.getElementById("content");
            var xulStackBro = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector("#content"), "class", "browserStack");

            xulStackBro.appendChild(iconStack);
            console.log(xulStackBro);

            iconStack.addEventListener("click",function(){
                if(searchResultPanel.isShowing){
                    searchResultPanel.hide();
                }
                else searchResultPanel.show({ position: {top: conextMenuPosition.top - 75, left: conextMenuPosition.left}});

            });

        }



        // browserDocument.getElementsByTagName("tabbrowser")[1];
        var browserElem = browserDocument.getElementById("browser");
        console.log(browserElem);

        //var parentBro = browserDocument.getElementById("content-deck");
        //parentBro.appendChild(iconStack);
        ////browserElem.parentNode.insertBefore(iconStack, browserElem.nextSibling);
        //iconStack.appendChild(browserElem);
        //iconStack.appendChild(dotsIconDiv);

       // console.log(eParentNode.innerHTML);
    });


}


function dummy(text, callback) {
    callback(text);
}

exports.dummy = dummy;