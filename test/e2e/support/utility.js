var studyUrl = {
    get  function () {
        return this.value;
    },
    set  function (url) {
        this.value = url;
    }
};

var projUrl = {
    get  function () {

        return this.value;
    },
    set  function (url) {

        this.value = url;
    }
};

module.exports = {
    studyUrl: studyUrl,
    projUrl: projUrl
}
