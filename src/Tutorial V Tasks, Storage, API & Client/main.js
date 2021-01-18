const Apify = require('apify'); 
const ApifyClient = require('apify-client');
const TaskClient = ApifyClient.TaskClient;
const { utils: { log } } = Apify;
const axios = require('axios').default;

Apify.main(async () =>
{ 
    //default input for testing
    let INPUT = {
        "memory": 4096, // Memory has to be a power of 2
        "useClient": false,
        "fields": ["title", "url", "price"],
        "maxItems": 10
    }
    if (Apify.isAtHome())
    {
        INPUT = await Apify.getInput();
    }


    if (!INPUT || INPUT === {})
    {
        log.info("No input");
        return;
    }

    log.info('input',INPUT);

    const amazonScraperTaskId = "MpEHxpusHMW3UteqL";

    const token = process.env.APIFY_TOKEN || process.env.MY_APIFY_TOKEN;

    const apifyClient = new ApifyClient({
        token: token
    });

    const taskClient = apifyClient.task(amazonScraperTaskId);
    

    log.info('starting task');
        let runInfo = (!INPUT.useClient) ?
        (await axios.post(`https://api.apify.com/v2/actor-tasks/${amazonScraperTaskId}/runs?token=${token}&memory=${INPUT.memory}`)).data.data :
        await taskClient.start(
            {
                memory: INPUT.memory,
                waitSecs:1
            });
  
    log.info('polling');
    //polling
    const runClient = apifyClient.run(runInfo.id)
    let finished = false; 
    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        let result = (!INPUT.useClient) ? (await axios.get(`https://api.apify.com/v2/acts/${runInfo.actId}/runs/${runInfo.id}`)).data.data:
            await runClient.get();
        log.info(result.status);
        finished = result.status == "SUCCEEDED";
       
      }
    
    
    //get data from default dataset of the run
    log.info('get data from dataset');
    const datasetClient = apifyClient.dataset(runInfo.defaultDatasetId)
    const csvData = (!INPUT.useClient) ? (await axios.get
        (`https://api.apify.com/v2/datasets/${runInfo.defaultDatasetId}/items?token=${token}&format=csv&limit=${INPUT.maxItems}&fields=${INPUT.fields.join(',')}`)).data :
        (await datasetClient.downloadItems(
            'csv',
            {
                limit: 10,
                fields: INPUT.fields
            }));
    
    const defaultKVSId = process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID || 'default';

    
    //put csv to the KVS
    log.info('set output.csv to KVS')
    if (Apify.isAtHome())
    {
        const keyValueStoreClient = apifyClient.keyValueStore(defaultKVSId);
        const result = (!INPUT.useClient)?
            await axios.post(`https://api.apify.com/v2/key-value-stores/${defaultKVSId}/records/output.csv?token=${token}`,
                {
                    data: csvData,
                    headers:
                    {
                        'Content-Type': 'text/plain'
                    }
                }):
            await keyValueStoreClient.setRecord({
                key: 'output.csv',
                value: csvData
            });
            log.info("result:",result);
    }
    else
    { 
        const result = await Apify.setValue('output.csv', result);
        log.info("result:",result);
    }
    log.info('Finished');
})