const Apify = require('apify');
const urlClass = require('url');

const { utils: { log } } = Apify;
//limit to avoid blocking
const idLimit = 10;

exports.handleStart = async ({ request, $ }) => {
    const requestQueue = await Apify.openRequestQueue();
    //get all product unique links in right regex pattern
    const links = [... new Set($('div[data-asin] a.a-link-normal.a-text-normal').map(function ()
    { return $(this).attr('href'); }).get().filter(x => x.match('/dp/')).map(x => x.match(/.*\/dp\/.*\//)[0]))];
    
    for(const link of links)
    {
        const amazonId = link.split('/dp/')[1].replace('/','');
        const nextUrl = 'https://www.amazon.com/gp/offer-listing/'+amazonId;
        const absoluteLink = new urlClass.URL(link, request.url).href;
        await requestQueue.addRequest({url:absoluteLink, userData:{nextUrl:nextUrl, label:'NEXT_URL'}});
    }
};

exports.handleNextURL = async ({ request, $}, INPUT) =>
{
    const requestQueue = await Apify.openRequestQueue();
    const itemScrape = {}
    itemScrape.keyword = INPUT.keyword;
    itemScrape.title = $('title').text().trim();
    if (!itemScrape.title)
    {
        throw Error('no title, propably got captcha')
    }
    itemScrape.itemUrl = request.url;
    itemScrape.description = $('meta[name=description]').attr('content');
    if(!itemScrape.description) itemScrape.description = $('#feature-bullets li').text() 
    
    await requestQueue.addRequest({ 'url': request.userData.nextUrl, 'userData': { itemScrape: itemScrape, label: 'DETAIL' } });
};

exports.handleDetail = async ({ request, $ }) =>
{
    const itemScrapeTemplate = request.userData.itemScrape;
    const offerList = await $('.olpOffer').get();
    for (const offer of offerList)
    {
        let itemScrape = await Object.assign({}, itemScrapeTemplate);
        itemScrape.price= $('.olpOfferPrice',offer).text().trim();
        itemScrape.shipping = $('.olpFbaPopoverTrigger',offer).text().trim();
        if(!itemScrape.shipping)
        {
            itemScrape.shipping = $('.a-list-item',offer).first().text().trim();
        }
        itemScrape.seller = $('.olpSellerName', offer).text().trim();
        if (!itemScrape.seller)
        {
            itemScrape.seller = $('.olpSellerName img', offer).attr('alt');                        
        }
        await Apify.pushData(itemScrape);
    }
};
