const Apify = require('apify');
const urlClass = require('url');

const { utils: { log } } = Apify;
//limit to avoid blocking
const idLimit = 10;

exports.handleStart = async ({ request, $ }) => {
    const divList = await $('[data-asin]').get();
    if (divList.length === 0)
    {
        throw Error('no data asin, propably got captcha');

    }

    processedIds = [];
    const requestQueue = await Apify.openRequestQueue();
    let count = 0;
    for(const div of divList)
    {
        const amazonId = div.attribs['data-asin'];
        if(processedIds[amazonId])
        {
            continue;
        }
        const nextUrl = 'https://www.amazon.com/gp/offer-listing/'+amazonId;
        const aList = await $('a[class=a-link-normal]',div).get();
        for(const aTag of aList)
        {
            const regex = `https://.*/dp/${amazonId}/`;
            const absoluteLink = urlClass.resolve(request.url, aTag.attribs.href);
            const result = absoluteLink.match(regex);
            if(result!=null && count++<idLimit)
            {
                await requestQueue.addRequest({'url':result[0], userData:{'nextUrl':nextUrl, label:'NEXT_URL'}});
                processedIds[amazonId] = true;
                break;                              
            }
        }
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
