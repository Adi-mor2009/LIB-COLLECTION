import axios from "axios";

const SERVER_URL = "https://cors-proxy-alma.herokuapp.com/almaws/v1/bibs/";
//const SERVER_URL = "https://api-eu.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/";
const SERVER_URL_AFTER_ID_COLLECTION = "/bibs?";//offset=0&limit=100";
const SERVER_URL_AFTER_ID_BIB = "?view=full&expand=None";
//const API_KEY = "&apikey=l8xx3380e09cbbc2490cbaee30eb37bc1376";
//"https://api-eu.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/$collectionID/bibs?offset=$offset&limit=100&apikey=l8xx3380e09cbbc2490cbaee30eb37bc1376";
//"https://api-eu.hosted.exlibrisgroup.com/almaws/v1/bibs/$MMSID?view=full&expand=None&apikey=l8xx3380e09cbbc2490cbaee30eb37bc1376";
///almaws/v1/bibs/{mms_id}/representations

const types = {
    COLLECTIONS: "collections/",
    REPRESENTATIONS: "/representations",
    NONE: ""
}

async function getDataById(type, id, pageNum, pageSize) {
    const getURL = type==types.COLLECTIONS ? 
    SERVER_URL + type + id + SERVER_URL_AFTER_ID_COLLECTION + "offset=" + pageNum + "&limit=" + pageSize :
    type==types.REPRESENTATIONS ?
    SERVER_URL + id + type :
    SERVER_URL + id + SERVER_URL_AFTER_ID_BIB;
    try {
        const res = await axios.get(getURL);
        return({response: res, error: null});
    } catch (err) {
        console.error("Error while geting collection with id= " + id, err);
        return({response: null, error: err});
    }
}

export default { getDataById, types }