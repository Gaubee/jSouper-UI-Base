var _baseUrl = "./jsouper-ui/";

function addSheetFile(path) {
    var fileref = document.createElement("link")
    fileref.rel = "stylesheet";
    fileref.type = "text/css";
    fileref.href = path;
    fileref.media = "screen";
    var headobj = document.getElementsByTagName('head')[0];
    headobj.appendChild(fileref);
}
var csss = {
    dev: [
        "jsouper.base-ui.min.css"
    ]
};

for (var i = 0, src; src = csss.dev[i]; i += 1) {
    addSheetFile(_baseUrl + src);
}
init_widgets();

//控件加载并编译

function init_widgets() {

    jSouper.build({
        Url: _baseUrl + "jsouper.base-ui.xmp"
    })
}
