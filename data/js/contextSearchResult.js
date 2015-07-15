'use strict';
var selectedPhrase = '';
$(function () {
    $('#nav-tab').find('a').on('click', function () {
        $('#nav-tab').find('li').removeClass('active');
        var $this = $(this);
        $this.parent().addClass('active');
        $('#tab-content').find('.tab-pane.active').removeClass('active');
        $($this.attr('href')).addClass('active');
        //addon.port.emit('hideIconT',true);
    });
    check('windows 10');
});

function dragS(event, searchKey) {

    var dt = event.dataTransfer;
    var targetLink = '';
    switch (searchKey) {
        case 1:
            targetLink = 'http://www.merriam-webster.com/dictionary/' + selectedPhrase;
            break;
        case 2:
            targetLink ='https://en.wikipedia.org/wiki/' + selectedPhrase;
            break;
        case 3:
            targetLink = 'http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2050601.m570.l1313.TR10.TRC0.A0.H0.X' + selectedPhrase + '.TRS0&_nkw=' + selectedPhrase + '&_sacat=0';
            break;
    }
    dt.setData("text/uri-list", targetLink);
    dt.setData("text/plain", targetLink);
    var currentEl = event.target;
    //currentEl.setAttribute('data-link',currentEl.href);
    //currentEl.href = targetLink;
}

function dropS (event){
    var $currentEl = $(event.target);
    //$currentEl.id;
    //$('shop-link').attr("href","#shop");
}

//addon.port.on('showt',
function check(text) {
    text = $.trim(text);
    selectedPhrase = text;
    $("#nav-tab").find("a").eq(0).click(); // select the first tab by default for each new search
    // get definition from merriam-webster for selection text
    var site = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + text + '?key=19366857-7e67-4db8-977e-6d613ef8a8df';
    var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + site + '"') + '&format=xml?';
    var $definition = $('#definition');
    getContent($definition, yql, function (data) {
        $definition.removeClass('loading');
        if (data && data.results) {
            var definitionXml = $.parseXML(data.results[0]),
                $xml = $(definitionXml);
            var $suggestionXml = $xml.find('suggestion').length;
            if ($suggestionXml == 0) {
                var wordType = $xml.find('fl').eq(0).text();
                if (wordType) {
                    $('#selectionType').text(wordType);
                    var $serialNumber = $xml.find('def').find('sn');
                    var meaningCount = $serialNumber.length;
                    var $defList = $xml.find('def').find('dt');
                    var $listItems = $();

                    for (var i = 0; i < meaningCount; i++) {
                        if (isNaN($serialNumber.eq(i).text().charAt(0)) === false) {
                            $listItems = $listItems.add($('<li>', {'style': ' margin-left:5px'}).text($defList.eq(i).text()));
                        }
                        else {
                            var lastChild = $listItems[$listItems.length - 1];
                            if (lastChild) {
                                lastChild = $(lastChild);
                                if (lastChild.children().length === 0) {
                                    lastChild.append($('<ul>', {'style': ' list-style: outside none none'}).append($('<li>', {'style': ' list-style: outside none none'}).text($defList.eq(i).text())));
                                }
                                else {
                                    lastChild.find('ul').append($('<li>', {'style': ' list-style: outside none none'}).text($defList.eq(i).text()));
                                }
                            }
                        }
                        //  $listItems = $listItems.add($('<li>').text($defList.eq(i).text()));
                    }
                    if (($xml.find('fl').eq(0).text() !== '' ) || $listItems.length) {

                        $('#meaningList').empty().append($listItems);
                        $definition.find('.more').off('click')
                            .on('click', () => {
                                addon.port.emit('hideP', true);
                                //add animation for the box
                                //setTimeout(function(){}, 6000);
                                window.open('http://www.merriam-webster.com/dictionary/' + text, '_blank');
                            });
                    }
                }
                else {
                    $definition.addClass('no-result');
                    $definition.find('.term').text(text);
                }

            }
            else {
                $('#selectionType').text('');
                var $suggestionList = $();
                var $suggestionItems = $xml.find('suggestion');
                for (var k = 0; k < $suggestionXml; k++) {
                    $suggestionList = $suggestionList.add($('<li>', {'style': ' '})
                        .append($('<a>', {'class': 'suggestion-link'}).text($suggestionItems.eq(k).text()).on('click', (event) => {
                            addon.port.emit('hideP', true);
                            //add animation for the box
                            //setTimeout(function(){}, 6000);
                            window.open('http://www.merriam-webster.com/dictionary/' + event.target.text, '_blank');
                        })));
                }


                $('#meaningList').empty()

                    .append($('<li>', {'style': ' list-style: outside none none;margin-left:5px'}).text(`The word you've entered isn't in the dictionary. May be you can try:`)
                        .append($('<ol>', {'class': 'custom-counter'}))
                        .append($suggestionList));
                //$("#nav-tab").find("a").eq(1).click();
            }
        }
        else {
            $definition.addClass('no-result').find('.term').text(text);
            $("#nav-tab").find("a").eq(1).click();
        }
    }, () => {
        $definition.removeClass('loading');
        $definition.addClass('no-result').find('.term').text(text);
        $("#nav-tab").find("a").eq(1).click();
    });


    // get info from wiki for selection text, the exintro part is removed from the query as sometime it gives no rest, for example maker
    var $wiki = $('#wiki');
    getContent($wiki, 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=' + text + '&format=json&redirects=',
        function (data) {
            $wiki.removeClass('loading');
            if (data) {
                var resultData = data.query.pages, firstPage;
                $.each(resultData, (i) => {
                    firstPage = i;
                    return false;
                });
                var wikiResult = data.query.pages[firstPage].extract;
                if (wikiResult) {
                    $wiki.find('.content').html(wikiResult).end().find('.more').off('click')
                        .on('click', () => {
                            addon.port.emit('hideP', true);
                            //add animation for the box
                            //setTimeout(function(){}, 6000);
                            window.open('https://en.wikipedia.org/wiki/' + text);
                        });
                }
                else {
                    $wiki.find('.term').text(text);
                    $wiki.addClass('no-result');
                }
            }
            else {
                $wiki.addClass('no-result');
            }
        });


// get shop data from ebay
    var $shop = $('#shop');
    getContent($shop, 'http://svcs.ebay.com/services/search/FindingService/v1?SECURITY-APPNAME=Mycomp927-53f9-4def-999b-94baba31191&OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=' + text + '&paginationInput.entriesPerPage=2',
        function (data) {
            if (data) {
                $shop.removeClass('loading');
                var items = data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
                if (items && items.length) {
                    var $listTemplate = $('#shop-list').find('tfoot').children().clone();
                    var $list = $();
                    for (var i = 0; i < items.length; ++i) {
                        var item = items[i], $currentItem = $listTemplate.clone();
                        var title = item.title;
                        var pic = item.galleryURL;
                        var viewItem = item.viewItemURL;

                        if (null !== title && null !== viewItem) {
                            $list = $list.add($currentItem.find('img').attr('src', pic).css({
                                    height: '50px',
                                    width: '50px'
                                }).end()
                                    .find('.price').text(item.sellingStatus[0].currentPrice[0].__value__).end()
                                    .find('.title').text(title).attr('href', viewItem).end()
                            );
                        }
                    }

                    $('#shop-list').find('tbody').empty().append($list);
                    $shop.find('.more').off('click')
                        .on('click', function () {
                            addon.port.emit('hideP', true);
                            //add animation for the box
                            //setTimeout(function(){}, 6000);
                            window.open('http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2050601.m570.l1313.TR10.TRC0.A0.H0.X' + text + '.TRS0&_nkw=' + text + '&_sacat=0');
                        });
                }
                else {
                    $shop.addClass('no-result');
                    $shop.find('.term').text(text);
                }
            }
        });
}
//);

function getContent($parent, url, callbackSuccess, callbackError) {
    $parent.removeClass('no-result').addClass('loading');
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        cache: false,
        crossDomain: true,
        processData: true,
        success: callbackSuccess,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            callbackError();
            console.log('We think something went wrong :( - ' + errorThrown + url);
        }
    });
    console.log(url);
}


