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
	return "What is " + text + "?"; \
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




function showSearchContext(selectedText){
 var contextMenu = browserDocument.getElementById("contentAreaContextMenu");
	console.log(selectedText); // todo: remove

var temporaryContextMenuChild = contextMenu.children;

// Add New panel
var searchResultPanel = panels.Panel({
width:400,
height: 280,
contentURL: data.url("context-search-results.html")
// contentScript:''
});
	searchResultPanel.on("show", function() {
  searchResultPanel.port.emit("showt", selectedText);
});
searchResultPanel.show({
	position: {top:400, right:400}
});
}



function dummy(text, callback) {
	callback(text);
}

exports.dummy = dummy;