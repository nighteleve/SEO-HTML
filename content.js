chrome.extension.onRequest.addListener(function(request, sender, callback)
{
    if (request.action == 'getSource')
    {   
        callback(jsModifiedPageSource());
    };
});



/**
 * Original HTML source.
 *
 * @returns {*}
 */
function originalPageSource ()
{
    var httpRequest = new XMLHttpRequest();

    httpRequest.open('GET', document.location.href, false);
    httpRequest.send(null);

    if (httpRequest.status === 200)
    {
        return httpRequest.responseText;
    }

    return '';
}


var getDocTypeAsString = function () { 
    var node = document.doctype;
    return node ? "<!DOCTYPE "
         + node.name
         + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
         + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
         + (node.systemId ? ' "' + node.systemId + '"' : '')
         + '>\n' : '';
};


/**
 * HTML source after Javascript DOM modifications.
 *
 * @returns {*}
 */
function jsModifiedPageSource ()
{
    return getDocTypeAsString() + document.documentElement.outerHTML;
}




