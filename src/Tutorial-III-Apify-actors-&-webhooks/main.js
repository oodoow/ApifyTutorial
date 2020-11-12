const Apify = require('apify'); 
const { utils: { log } } = Apify;

Apify.main(async () =>
{ 
    const INPUT = await Apify.getInput();
    //const INPUT = {defaultDatasetId :"RJy3eYurogxvwQXlK"}
    if (!INPUT || INPUT == {})
    {
        log.info("No input");
        return;

        
    }
    
    console.log(INPUT);
    console.log(INPUT.defaultDatasetId);
    //get data from amazon scraper default dataset
    let dataset = await Apify.openDataset(INPUT.defaultDatasetId, { forceCloud: true });
    const data = await dataset.getData();
    
    console.log('dataItems:');
    console.log(data.items);
    if (!data.items.length)
    {
        log.info("No, data!");
    }


    
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
