const util = require('util');
const fs = require('fs');
const http = require('http');
const https = require('https');

/**
 * A local helper function
 * @return {Promise<Buffer>}
 */
const readFileAsPromise = util.promisify(fs.readFile);

/**
 * Requests given source with given request-function, and returns the result as buffer
 * @param {Function} aRequestFunction The actual function to call, either http.get or https.get
 * @param {string} aSource The source to load
 * @return {Promise<Buffer>}
 */
function requestAsPromise(aRequestFunction, aSource) {
    return new Promise((aResolve, aReject) => {
        const request = aRequestFunction(aSource, (aResponse) => {
            if (aResponse.statusCode !== 200) {
                return aReject(new Error(`Got statuscode ${aResponse.statusCode} from source ${aSource}`));
            }

            aResponse.setEncoding('utf8');

            const chunkList = [];
            aResponse.on('data', (aChunk) => chunkList.push(aChunk));
            aResponse.on('end', () => aResolve(chunkList.join('')));
        });

        request.on('error', (aError) => aReject(aError));
    });
}

/**
 * Reads given source-link if possible. Determines by itself which way the given source should be loaded
 * @param {string} aSource The source to read
 * @return {Promise<Buffer>}
 */
async function readSource(aSource) {
    const protocolIndex = aSource.indexOf('://');

    if (protocolIndex === -1) {
        return await readFileAsPromise(aSource);
    }

    const protocol = aSource.slice(0, protocolIndex);
    switch (protocol) {
        case 'file': {
            const start = 'file://'.length;

            return await readFileAsPromise(aSource.slice(start));
        }
        case 'http': {
            return await requestAsPromise(http.get, aSource);
        }
        case 'https': {
            return await requestAsPromise(https.get, aSource);
        }
        default:
            throw new Error(`Could not determine what to do with ${aSource}`);
    }
}

module.exports = {
    readFileAsPromise,
    requestAsPromise,
    readSource,
};
