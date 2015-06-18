$(function () {
    addon.port.on("showt", function (text)
    {

        // get info from wiki for selection text
        getContent("http://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=" + text + "&format=json&exintro=1&redirects=",
            function (data) {
                var resultData = data.query.pages, firstPage;
                $.each(resultData, function (i, item) {
                    firstPage = i;
                    return;
                });

                $("#wiki").find(".content").html(data.query.pages[firstPage].extract).end().find(".more").attr("href", "https://en.wikipedia.org/wiki/" + text);

                //   truncateText($("#tab-content"), $("#wiki"));
            });

// get definition from merriam-webster for selection text
        var site = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + text + "?key=19366857-7e67-4db8-977e-6d613ef8a8df";
        var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + site + '"') + '&format=xml&callback=?';

        getContent(yql, function (data) {
            var definitionXml = $.parseXML(data.results[0]),
                $xml = $(definitionXml),
                $title = $xml.find("ew");
            $("#selectionType").text($xml.find("fl").eq(0).text());
            var $serialNumber = $xml.find("def").find("sn");
            var meaningCount = $serialNumber.length;
            var $defList = $xml.find("def").find("dt");
            var $listItems = $();

            for (var i = 0; i < meaningCount; i++) {

                if (isNaN($serialNumber.eq(i).text().charAt(0)) == false) {
                    $listItems = $listItems.add($("<li>",{"style":" margin-left:5px"}).text($defList.eq(i).text()))
                }
                else {
                    var lastChild = $listItems[$listItems.length - 1];
                    if (lastChild) {
                        lastChild = $(lastChild);
                        if (lastChild.children().length == 0) {
                            lastChild.append($("<ul>",{"style":" list-style: outside none none"}).append($("<li>",{"style":" list-style: outside none none"}).text($defList.eq(i).text())));
                        }
                        else {
                            lastChild.find("ul").append($("<li>",{"style":" list-style: outside none none"}).text($defList.eq(i).text()));
                        }
                    }
                }
                //  $listItems = $listItems.add($("<li>").text($defList.eq(i).text()));
            }
            $("#meaningList").append($listItems);
            $("#definition").find(".more").attr("href", "http://www.merriam-webster.com/dictionary/" + text);
            // truncateText($("#tab-content"), $("#definition"));
        });

// get shop data from ebay
        getContent("http://svcs.ebay.com/services/search/FindingService/v1?SECURITY-APPNAME=Mycomp927-53f9-4def-999b-94baba31191&OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=" + text + "&paginationInput.entriesPerPage=2",
            function (data) {

                var items = data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
                var $listTemplate = $("#shop-list").find("tfoot").children().clone();
                var $list = $();


                for (var i = 0; i < items.length; ++i) {
                    var item = items[i], $currentItem = $listTemplate.clone();
                    var title = item.title;
                    var pic = item.galleryURL;
                    var viewItem = item.viewItemURL;

                    if (null != title && null != viewItem) {


                        $list = $list.add($currentItem.find("img").attr("src", pic).css({
                                height: "50px",
                                width: "50px"
                            }).end()
                                .find(".price").text(item.sellingStatus[0].currentPrice[0].__value__).end()
                                .find(".title").text(title).attr("href", viewItem).end()
                        );

                    }
                }

                $("#shop-list").find("tbody").append($list);
                $("#shop").find(".more").attr("href",
                    "http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2050601.m570.l1313.TR10.TRC0.A0.H0.X" + text + ".TRS0&_nkw=" + text + "&_sacat=0");
                // truncateText($("#tab-content"), $("#shop"));
            });


    }
    )
    ;
    var el = document.getElementById('nav-tab');

    el.addEventListener('click', onTabClick, false);


});


function getContent(url, callbackSuccess, callbackError) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "jsonp",
        cache: false,
        crossDomain: true,
        processData: true,
        success: callbackSuccess,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("error");
        }
    });
}

function onTabClick(event) {
    var actives = document.querySelectorAll('.active');

    // deactivate existing active tab and panel
    for (var i = 0; i < actives.length; i++) {
        actives[i].className = actives[i].className.replace('active', '');
    }

    // activate new tab and panel
    event.target.parentElement.className += ' active';
    document.getElementById(event.target.href.split('#')[1]).className += ' active';
}

