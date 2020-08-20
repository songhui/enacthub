/**
 * Sample meta data to 
 */
let entry = {
    "type": "divenact.template",
    "app": "tellu-1",
    "name": "divenact.test.5",
    "licence": "Apache-2.0"
}

/**
 * The actual model
 */
let model = require('./files/deployment.template.json')

const axios = require('axios')
const credential = require('./credential.json')
const Buffer = require('buffer/').Buffer 
//const FormData = require('form-data'); // npm install --save form-data
const fs = require('fs')

const token = Buffer.from(`${credential.name}:${credential.password}`, 'utf8').toString('base64')

let run = async () => {
    try {
        /**
         * First step: register a new entry into the hub using the meta-data
         */
        let request_config = {
            headers: {
              'Authorization': `Basic ${token}`,
              'Content-Type': 'application/json'
            }
        };
        let res = await axios.put(
            `http://${credential.host}/${credential.db}/_design/edit/_update/register`,
            entry,
            request_config
        )
        console.log(res.data)

        /**
         * Second step: upload the actual model.
         * NB: Remember to achieve the ID and version from the response of the last step
         */
        let id = res.headers['x-couch-id']
        let rev = res.headers['x-couch-update-newrev']
        request_config.headers['If-Match'] = rev;
          
        res = await axios.put(
            `http://${credential.host}/${credential.db}/${id}/model`, 
            model, 
            request_config
        );
        console.log(res.data)

        /**
         * New entry registered. Now we can try to download the meta info and the model
         * Note that for reading/downloading, no authorization is needed
         */
        console.log("Meta-info:")
        console.log((await axios.get(`http://${credential.host}/${credential.db}/${id}/`)).data)

        console.log("Model (first 200 characters): ")
        let result = (await axios.get(`http://${credential.host}/${credential.db}/${id}/model`)).data
        console.log(JSON.stringify(result, null, 2).substring(0,100)+'...')
    }
    catch(error){
        console.log(error)
    }
    
}

run()




