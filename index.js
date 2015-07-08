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
    console.log(browserDocument.title);
    selectedPhrase = selection.text;
    var sel = browserWindow.content.getSelection();
    if (sel.rangeCount) {
        let selRange = sel.getRangeAt(sel.rangeCount - 1);
        let rect = selRange.getBoundingClientRect();
        clientXDoc = rect.left + (rect.right - rect.left);
        clientYDoc = rect.top + rect.height;
    }
    if (selectedPhrase !== '' && selectedPhrase) {
        showSearchContext(clientXDoc, clientYDoc);
    }
}


function panelHide() {
    //animation can be added here

}

var fetchFresh = false;
function showSearchContext(x, y) {

// Add New panel
    var minimizerDots = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector('#content'), 'id', 'minimizerDots');//browserDocument.getElementById('minimizerDots');
    //console.log(minimizerDots);
    if (minimizerDots == null) {
        maker(x, y);
    }
    else {
        minimizerDots.setAttribute('top', y);
        minimizerDots.setAttribute('left', x);
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
    var xulStackBro = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector('#content'), 'class', 'browserStack');
    xulStackBro.appendChild(iconStack);

    if (searchResultPanel == null) {
        fetchFresh = true;
        searchResultPanel = panels.Panel({
            width: 400,
            height: 280,
            contentURL: data.url('context-search-results.html')
            , onHide: panelHide
        });
        //searchResultPanel.on('show', () => {
        //    searchResultPanel.port.emit('showt', selectedPhrase);
        //});
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


exports.main = () => {
    selection.on('select', myListener);
    browserWindow = windows.getMostRecentBrowserWindow();
    browserDocument = browserWindow.document;
    browserWindow.addEventListener('scroll', () => {
        var miniD = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector('#content'), 'id', 'minimizerDots');
        if (miniD) {
            let xulStackB = browserDocument.getAnonymousElementByAttribute(browserDocument.querySelector('#content'), 'class', 'browserStack');
            // instead of removing position can be changed but changing top, left does not work :(
            xulStackB.removeChild(miniD);
        }
    });
};
