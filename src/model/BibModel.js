export default class BibModel {
    constructor(mms_id, title, call_number, totalBibs, rep_id, rep_url) {
        this.mmsid = mms_id;
        this.title = title;
        this.callNumber = call_number;
        this.totalBibs = totalBibs;
        this.repId = rep_id;
        this.repUrl = rep_url;
    }

    setCallNumber(call_number) {
        this.callNumber = call_number;
    }

    setTotalBibs(totalBibs) {
        this.totalBibs = totalBibs; 
    }

    setRepId(rep_id) {
        this.repId = rep_id;
    }

    setRepUrl(rep_url) {
        this.repUrl = rep_url;
    }
}