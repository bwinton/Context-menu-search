var self = require('sdk/self');
var data = self.data;

var cm = require("sdk/context-menu");

var panels = require("sdk/panel");

var browserWindow = require("sdk/window/utils").getMostRecentBrowserWindow();

var browserDocument = browserWindow.document;
var selectedText = "";



cm.Item({
	label: "What is ?",
 // context: [cm.PredicateContext(checkSelection),cm.SelectionContext()],
 context: cm.SelectionContext(),
 contentScript: 'self.on("context", function () {\
	var text = window.getSelection().toString();\
	return "What is "+ text + "?"; \
}); \
self.on("click", function (node, data) { \
  self.postMessage(window.getSelection().toString());\
});',
//contentScriptFile: self.data.url("content-script.js"),
accessKey:'s',
onMessage: function (selectedText) {
    showSearchContext(selectedText);
  }
});



function panelHide (){
this.show();

}

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var dotsIcon =  browserDocument.createElementNS(XUL_NS,"image");
dotsIcon.setAttributeNS(XUL_NS,"src","./data/images/context-search-indicator.svg");

function showSearchContext(selectedText){
 var contextMenu = browserDocument.getElementById("contentAreaContextMenu");
	console.log(selectedText); // todo: remove
// var time = (new Date()).getSeconds();
// searchResultPanel.contentURL= data.url("context-search-results.html?t="+ time);
// Add New panel
var searchResultPanel = panels.Panel({
	id:"takethispanel",
width:400,
height: 280,
contentURL: data.url("context-search-results.html")
// ,onHide: panelHide 
});
	searchResultPanel.on("show", function() {
  searchResultPanel.port.emit("showt", selectedText);
});
	searchResultPanel.port.on("hideP", function(){
searchResultPanel.hide();
 browserDocument.appendChild(dotsIcon);
	//console.log(browserDocument.getElementById("sidebar").length); 
});

var conextMenuPosition = contextMenu.getBoundingClientRect();
searchResultPanel.show({
	position: {top:conextMenuPosition.top-75, left:conextMenuPosition.left}
});
}



function dummy(text, callback) {
	callback(text);
}

exports.dummy = dummy;