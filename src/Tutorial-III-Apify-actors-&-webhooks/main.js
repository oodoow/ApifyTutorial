const Apify = require('apify'); 
const { utils: { log } } = Apify;

Apify.main(async () =>
{ 
    const INPUT = await Apify.getInput();
    if (!INPUT || INPUT == {})
    {
        log.info("No input");
        return;

        
    }

    //get data from amazon scraper default dataset
    let dataset = await Apify.openDataset(INPUT.defaultDatasetId, { forceCloud: true });
    const data = await dataset.getData();
    
  
    log.info(INPUT);
    console.log(INPUT);
    console.log(data.items);

    
    const getPriceNumber = (x) => { return parseFloat(x.replace('$', '')) };
    const sameAsinGroups = Object.entries(data.items.reduce((acc, item) =>
    {
        (acc[item.itemUrl] = acc[item.itemUrl] || []).push(item);
        return acc;
    }, {}));
    const cheapestDealers = sameAsinGroups.map(x => x[1].reduce((acc, item) =>
    {
        return (getPriceNumber(acc.price) < getPriceNumber(item.price)) ? acc : item;
    }));

    dataset = await Apify.openDataset();
    await dataset.pushData(cheapestDealers);
    log.info('Data Pushed');
})
