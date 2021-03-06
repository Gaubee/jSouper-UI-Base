/*
 * 表单初始化，通用配置函数
 */

//注意：这里由于其它属性中有也使用到事件绑定等功能，所以初始化一般要放到最后一部，来统一绑定属性

function _initVM(vm, systemEvents) {
    var model = vm.model;
    var data = model._database || {};
    var attrs = data.attrs,
        attrKey, attrValue, defaultAttrValue;
    var events = data.events,
        eventKey, eventValue;
    //唯一标志，极大概念地避免与用户的冲突
    var hashCode = jSouper.$.hashCode(vm, "jsouper_ui_id");

    //添加系统属性
    var formatAttr = {
        //唯一标志
        "jsouper_ui_id": "{{__system.attrs.id}}"
    };

    //添加系统事件
    systemEvents || (systemEvents = {});
    systemEvents["event-focus-isFocus"] = function(e, currentVM) {
        vm.set('__system.attrs.isFocus', true);
    };
    systemEvents["event-blur-isFocus"] = function(e, currentVM) {
        setTimeout(function() {
            if (vm.get("__system.attrs.stopBlur")) {
                vm.set('__system.attrs.stopBlur', false);
                return
            }
            vm.set('__system.attrs.isFocus', false);
        }, 1);
    }
    jSouper.$.fI(systemEvents, function(value, key) {
        var mainKey = key.split("-"); //0:event-    1:event_name-    2:mainKey 3...
        mainKey.splice(0, 1);
        var formatMainKey = "__system.events." + mainKey.join(".");
        formatAttr[key + hashCode] = "{{'" + formatMainKey + "'}}";
        vm.set(formatMainKey, value);
    });

    //初始化唯一标志
    vm.set("__system.attrs.id", hashCode);
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

    //将vm暴露到外部以供获取
    var jSouperUiNode = vm.queryElement({
        tagName: "JSOUPERFORMUI"
    })[0];
    if (jSouperUiNode) {
        jSouper.queryHandle(jSouperUiNode).viewModel = vm;
    }
};
