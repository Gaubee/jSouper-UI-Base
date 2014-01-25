/*
 * 表单初始化，通用配置函数
 */

//注意：这里由于其它属性中有也使用到事件绑定等功能，所以初始化一般要放到最后一部，来统一绑定属性

function _initVM(vm) {
    var model = vm.model;
    var data = model._database || {};
    var attrs = data.attrs,
        attrKey, attrValue, defaultAttrValue;
    var events = data.events,
        eventKey, eventValue;
    var formatAttr = {
        "__jsouper_ui_id": "{{__jsouper_ui_id}}"
    };
    //设定唯一标志
    vm.set("__jsouper_ui_id", jSouper.$.hashCode(vm, "__jsouper_ui_id"));
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
    //添置属性
    vm.addAttr(vm.queryElement({
        tagName: "INPUT"
    }), formatAttr);
}
