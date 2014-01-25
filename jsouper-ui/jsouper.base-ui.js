(function() {
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
            "jsouper.base-ui.css"
        ]
    };
    for (var i = 0, src; src = csss.dev[i]; i += 1) {
        addSheetFile(_baseUrl + src);
    }
    init_widgets();

    //表单初始化，通用配置函数
    jSouper.initFormVM = initVM;

    function initVM(vm) {
        var model = vm.model;
        var data = model._database || {};
        var attrs = data.attrs,
            attrKey, attrValue, defaultAttrValue;
        var events = data.events,
            eventKey, eventValue;
        var formatAttr = {};
        //绑定自定义属性
        if (attrs) {
            for (attrKey in attrs) {
                attrValue = attrs[attrKey];
                if (/\{[\w\W]*?\{[\w\W]*?\}[\s]*\}/.test(attrValue)) {
                    formatAttr[attrKey] = attrValue;
                } else {
                    formatAttr[attrKey] = "{{attrs." + attrKey + "}}"
                }
            }
        }
        //绑定函数
        if (events) {
            for (eventKey in events) {
                eventValue = events[eventKey];
                if (eventValue instanceof Function) {
                    formatAttr["event-" + eventKey] = "{{'events." + eventKey + "'}}"
                } else {
                    formatAttr["event-" + eventKey] = eventValue;
                }
            }
        }
        vm.addAttr(vm.queryElement({
            tagName: "INPUT"
        }), formatAttr);
    }
    //控件加载并编译

    function init_widgets() {

        jSouper.build({
            Url: _baseUrl + "jsouper.base-ui.xmp"
        })
    }
}());
