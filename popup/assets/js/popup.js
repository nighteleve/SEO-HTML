// Google Analytics Tracking =================================================================

    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-45190281-3']);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    // Add event tracking to G+ profile link
    document.addEventListener('DOMContentLoaded', function()
    {
        document.getElementById('profile_link').addEventListener('click', function()
        {
            _gaq.push(['_trackEvent', 'Links', 'Clicked', 'Author']);
        });
    });

// ===========================================================================================


var NOT_FOUND_LABEL = '';
var DOMAIN = '';

var siteInspector = {

    init : function ()
    {
        chrome.tabs.getSelected(null, function (tab)
        {
            chrome.tabs.sendRequest(tab.id, {action : 'getSource'}, function(source)
            {
                // Extract the domain from current tab
                siteInspector.extract_tab_domain(tab.url);

                var originSource = source;

                // Remove all line-breaks, tabs, etc. for easier regex-ing
                source = source.replace(/\r?\n|\r|\t|\v|\n/g, "");

                var content_html = '';

                content_html += siteInspector.getMetaRobots(source);
                content_html += siteInspector.getCanonical(source);
                content_html += siteInspector.getPageTitle(source);
                content_html += siteInspector.getMetaDescription(source);
                content_html += siteInspector.getH1(source);
                content_html += siteInspector.getH2(source);
                content_html += siteInspector.getH3(source);
                content_html += siteInspector.getH4(source);
                content_html += siteInspector.getH5(source);
                content_html += siteInspector.getLinks(source);
                content_html += siteInspector.getImgs(source);

                // Append HTML to popup
                document.getElementById('content').innerHTML = content_html;
                document.getElementById('source').innerHTML = originSource;


                var headings = document.getElementsByClassName('badge');

                for (var i=0; i<headings.length; i++)
                {
                    headings[i].addEventListener('click', function(element)
                    {
                        siteInspector.toggle_button(element.target);
                    });
                }

                // Some GA tracking
                _gaq.push(['_trackEvent', 'Extension-Usage', 'URL', tab.url]);
                _gaq.push(['_trackEvent', 'Extension-Usage', 'Domain', DOMAIN]);
            });
        });
    },



    toggle_button : function (button)
    {
        var panel = button.parentNode.parentNode;

        if (button.innerText == 'show')
        {
            // Open panel
            panel.className = panel.className + ' open';

            // Change button label
            button.innerText = 'hide';
        }
        else
        {
            // Remove open class from panel
            panel.className = panel.className.replace(/open/g, "");

            // Change button label
            button.innerText = 'show';
        }
    },



    extract_tab_domain : function (url)
    {
        DOMAIN = url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
    },



    getMetaRobots : function (source)
    {
        var items = this._getItems(/<meta name="robots" content="(.*?)"/gi, source);

        return this.appendInfoRow('Meta-Robots', items[0]);
    },



    getPageTitle : function (source)
    {
        var items = this._getItems(/<title>(.*?)<\/title>/gi, source);

        return this.appendInfoRow('Page Title', items[0]);
    },



    getMetaDescription : function (source)
    {
        var items = this._getItems(/<meta name="description" content="(.*?)"/gi, source);

        return this.appendInfoRow('Page Description', items[0]);
    },



    getCanonical : function (source)
    {
        var items = this._getItems(/<link rel="canonical".*?href="(.*?)".*?>/gi, source);

        return this.appendInfoRow('Canonical Tag', items[0]);
    },



    getH1 : function (source)
    {
        var items = this._getItems(/<h1.*?>(.*?)<\/h1>/gi, source);

        return this.appendMultiInfoRow('H1-Tags', items, false, true);
    },



    getH2 : function (source)
    {
        var items = this._getItems(/<h2.*?>(.*?)<\/h2>/gi, source);

        return this.appendMultiInfoRow('H2-Tags', items);
    },



    getH3 : function (source)
    {
        var items = this._getItems(/<h3.*?>(.*?)<\/h3>/gi, source);

        return this.appendMultiInfoRow('H3-Tags', items);
    },



    getH4 : function (source)
    {
        var items = this._getItems(/<h4.*?>(.*?)<\/h4>/gi, source);

        return this.appendMultiInfoRow('H4-Tags', items, true);
    },



    getH5 : function (source)
    {
        var items = this._getItems(/<h5.*?>(.*?)<\/h5>/gi, source);

        return this.appendMultiInfoRow('H5-Tags', items, true);
    },



    getLinks : function (source)
    {
        var items = siteInspector.getInnerHtmlByRegex(/<a.*?href="(.*?)".*?>.*?<\/a>/gi, source);

        var internal_links = 0;
        var external_links = 0;

        for (var i=0; i<items.length; i++)
        {
            if (items[i].indexOf('/') === 0 || (DOMAIN != '' && (items[i].indexOf('http://' + DOMAIN) === 0 || items[i].indexOf('https://' + DOMAIN) === 0)))
            {
                internal_links++;
            }
            else
            {
                external_links++;
            }
        }

        var html    = '<div class="panel panel-default open">';
        html       += '     <div class="panel-heading">Links</div>';
        html       += '     <div class="panel-body">';
        html       += '         <div class="ez-box row"><div class="ez-fl key">Internal Links: </div><div class="ez-fr value">' + internal_links + '</div></div>';
        html       += '         <div class="ez-box row"><div class="ez-fl key">External Links: </div><div class="ez-fr value">' + external_links + '</div></div>';
        html       += '     </div>';
        html       += '</div>';

        return html;
    },



    getImgs : function (source)
    {
        var items = siteInspector.getInnerHtmlByRegex(/<img(.*?)>/gi, source);
        var img_with_alt = 0;
        var img_without_alt = 0;

        for (var i=0; i<items.length; i++)
        {
            if (items[i].indexOf('alt=') != -1 && items[i].indexOf('alt=""') == -1)
            {
                img_with_alt++;
            }
            else
            {
                img_without_alt++;
            }
        }

        var html    = '<div class="panel panel-default open">';
        html       += '     <div class="panel-heading">Images</div>';
        html       += '     <div class="panel-body">';
        html       += '         <div class="ez-box row"><div class="ez-fl key">With alt-attribute: </div><div class="ez-fr value">' + img_with_alt + '</div></div>';
        html       += '         <div class="ez-box row"><div class="ez-fl key">Without alt-attribute: </div><div class="ez-fr value">' + img_without_alt + '</div></div>';
        html       += '     </div>';
        html       += '</div>';

        return html;
    },



    appendInfoRow : function (name, value) {

        if (value == '' || typeof(value) == 'undefined')
        {
            return '';
        }

        // Remove all HTML tags from value. Just display the text.
        if (typeof value === 'string')
        {
            value = value.replace(/<.*?>/g, '');
        }

        var html    = '<div class="panel panel-default open">';
        html       += '    <div class="panel-heading">' + name + '</div>';
        html       += '    <div class="panel-body">' + value + '</div>';
        html       += '</div>';

        return html;
    },



    appendMultiInfoRow : function (label, items, optional, force_open)
    {
        // Make parameter optional optional
        optional = (typeof optional == 'undefined') ? false : optional;

        // Make parameter force_open optional
        force_open = (typeof force_open == 'undefined') ? false : force_open;

        // If data is optional and no items were found, render nothing.
        if (optional && items.length == 0)
        {
            return '';
        }

        var badge_html = items.length == 0 ? '' : '<span class="badge">show</span>';

        // Remove badge html if panel is forced to be open always
        if (force_open)
        {
            badge_html = '';
        }

        var html    =  '<div class="panel panel-default' + (force_open ? ' open' : '') + '">';
        html        += '    <div class="panel-heading">' + label + '<span class="count">(' + items.length + ')</span>' + badge_html + '</div>';
        html        += '    <div class="panel-body">';
        html        += '        <div class="row">';

        if (items.length > 0)
        {
            for (var i=0; i<items.length; i++)
            {
                var value = items[i];

                // Remove all HTML tags from value. Just display the text.
                if (typeof value === 'string')
                {
                    value = value.replace(/<.*?>/g, '');
                }

                html += value;

                // Separate entries by an empty row
                if (i != items.length - 1)
                {
                    html += '<br /><br />';
                }
            }
        }

        html += '</div></div></div>';

        return html;
    },



    getInnerHtmlByRegex : function (regex, source)
    {
        var items = [];

        while (match = regex.exec(source))
        {
            if (typeof match[1] != 'undefined')
            {
                items.push(match[1]);
            }
        }

        return items;
    },



    _getItems : function (regex, source)
    {
        return siteInspector.getInnerHtmlByRegex(regex, source);
    }
};


// Executing siteInspector.init() on doc ready causes some strange behaviour in popup (Chrome bug?).
window.addEventListener('load', function()
{
    setTimeout(function(){ siteInspector.init(); }, 100);
});