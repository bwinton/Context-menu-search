'use strict';
var self = require('sdk/self');
var data = self.data;
var selection = require('sdk/selection');
var panels = require('sdk/panel');
var windows = require('sdk/window/utils');
var browserWindow = '';
var browserDocument = '';
var clientXDoc = 0;
var clientYDoc = 0;
var selectedPhrase = '';

function myListener() {
    selectedPhrase = selection.text;

    var sel = browserWindow.content.getSelection();
    var selAnchorNode = sel.anchorNode;
    var defaultZoom = 1;
    var zoomFactor = (defaultZoom - browserWindow.ZoomManager.zoom).toFixed(4);

    if (!selAnchorNode) {
        var currentActiveElement = browserWindow.content.document.activeElement;
        var startPoint = currentActiveElement.selectionStart;
        var endPoint = currentActiveElement.selectionEnd;
        var currentElBox = getTextBoundingRect(currentActiveElement, startPoint, endPoint, browserWindow.content.document);
        clientXDoc = currentElBox.left + (currentElBox.right - currentElBox.left) - 2;
        clientYDoc = currentElBox.top + currentElBox.height;
    }
    else {
        if (sel.rangeCount) {
            let selRange = sel.getRangeAt(sel.rangeCount - 1);
            let rect = selRange.getBoundingClientRect();
            clientXDoc = rect.left + (rect.right - rect.left);
            clientYDoc = rect.top + rect.height;
        }
    }
    if (selectedPhrase && clientXDoc > 0 && clientYDoc > 0) {
        //zoom check
        if (zoomFactor > 0 || zoomFactor < 0) {
            var zoomPercent = -((zoomFactor / defaultZoom) * 100);
            clientXDoc = clientXDoc + (clientXDoc * zoomPercent / 100) ; // 5 to fix the precision problem
            clientYDoc = clientYDoc + (clientYDoc * zoomPercent / 100) ;
        }
        showSearchContext(clientXDoc, clientYDoc);
    }
}


function getTextBoundingRect(input, selectionStart, selectionEnd, document) {

    var box = input.getBoundingClientRect();
    var docEl = document.documentElement;

    var topPos = box.top + docEl.scrollTop - (docEl.clientTop || 0);
    var leftPos = box.left + docEl.scrollLeft - ( docEl.scrollLeft);
    var textVal = input.value;
    var textLen = textVal.length;
    var appendPart = (start, end) => {
        var span = document.createElement("span");
        span.style.cssText = cssDefaultStyles; //Force styles to prevent unexpected results
        span.textContent = textVal.substring(start, end);
        fakeClone.appendChild(span);
        return span;
    };


    var getInputCSS = (prop, isnumber) => {
        var val = document.defaultView.getComputedStyle(input, null).getPropertyValue(prop);
        return isnumber ? parseFloat(val) : val;
    };

    var width = getInputCSS('width', true),
        height = getInputCSS('height', true);

    // Styles to simulate a node in an input field
    var cssDefaultStyles = "white-space:pre;padding:0;margin:0;",
        listOfModifiers = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing'];

    topPos += getInputCSS('padding-top', true);
    topPos += getInputCSS('border-top-width', true);
    leftPos += getInputCSS('padding-left', true);
    leftPos += getInputCSS('border-left-width', true);
    leftPos += 1; //Seems to be necessary

    for (var i = 0; i < listOfModifiers.length; i++) {
        var property = listOfModifiers[i];
        cssDefaultStyles += property + ':' + getInputCSS(property) + ';';
    }
    // End of CSS variable checks


    var fakeClone = document.createElement("div");
    if (selectionStart > 0) appendPart(0, selectionStart);
    var fakeRange = appendPart(selectionStart, selectionEnd);
    if (textLen > selectionEnd) appendPart(selectionEnd, textLen);

    // Styles to inherit the font styles of the element
    fakeClone.style.cssText = cssDefaultStyles;

    // Styles to position the text node at the desired position
    fakeClone.style.position = "absolute";
    fakeClone.style.top = topPos + "px";
    fakeClone.style.left = leftPos + "px";
    fakeClone.style.width = width + "px";
    fakeClone.style.height = height + "px";
    document.body.appendChild(fakeClone);
    var returnValue = fakeRange.getBoundingClientRect();

    fakeClone.parentNode.removeChild(fakeClone);
    return returnValue;

}

function panelHide() {
    //animation can be added here

}

var fetchFresh = false;

function showSearchContext(x, y) {

// Add New panel
    var minimizerDots = browserDocument.getElementById('minimizerDots');//browserDocument.getElementById('minimizerDots');
    if (minimizerDots == null) {
        maker(x, y);
    }
    else {
        if (minimizerDots.parentNode.isEqualNode(browserDocument.getElementById('content').selectedBrowser)) {
            minimizerDots.setAttribute('top', y);
            minimizerDots.setAttribute('left', x);

        }
        else {
            minimizerDots.parentNode.removeChild(minimizerDots);
            maker(x, y);
        }
        fetchFresh = true;
    }
}

var searchResultPanel = null;

function maker(x, y) {
    var iconStack = browserDocument.createElement('image');
    iconStack.setAttribute('src', self.data.url('context-search-indicator.svg'));
    iconStack.setAttribute('top', y);
    iconStack.setAttribute('left', x);
    iconStack.setAttribute('height', '30');
    iconStack.setAttribute('width', '30');
    iconStack.setAttribute('id', 'minimizerDots');
    let currentBro = browserDocument.getElementById('content').selectedBrowser;
    currentBro.parentNode.appendChild(iconStack);

    if (searchResultPanel == null) {
        fetchFresh = true;
        searchResultPanel = panels.Panel({
            width: 400,
            height: 280,
            contentURL: data.url('context-search-results.html')
            , onHide: panelHide
        });

        searchResultPanel.port.on('hideP', () => {
            searchResultPanel.hide();
        });

    }

    iconStack.addEventListener('click', () => {
        if (searchResultPanel.isShowing) {
            searchResultPanel.hide();
            fetchFresh = true;
        }
        else {
            if (fetchFresh) {
                searchResultPanel.port.emit('showt', selectedPhrase);
                fetchFresh = !fetchFresh;
            }
            searchResultPanel.show({position: {top: clientYDoc, left: clientXDoc}});
        }
    });
}

function hideIcon() {
    var miniD = browserDocument.getElementById('minimizerDots');
    if (miniD) {
        // instead of removing it can be hide but hiding does not work :(
        let currentBro = browserDocument.getElementById('content').selectedBrowser;
        currentBro.parentNode.removeChild(miniD);
    }
}


exports.main = () => {


    selection.on('select', myListener);
    browserWindow = windows.getMostRecentBrowserWindow();
    browserDocument = browserWindow.document;
    browserWindow.addEventListener('scroll', hideIcon);
};
