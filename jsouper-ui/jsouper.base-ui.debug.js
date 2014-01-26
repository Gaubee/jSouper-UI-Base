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
    //唯一标志，极大概念地避免与用户的冲突
    var hashCode = jSouper.$.hashCode(vm, "jsouper_ui_id");

    //添加系统属性
    var formatAttr = {
        //唯一标志
        "jsouper_ui_id": "{{__system.attrs.id}}"
    };

    //添加系统事件
    jSouper.$.fI({
        //聚焦时的属性
        "event-focus-isFocus": function(e, currentVM) {
            vm.set('__system.attrs.isFocus', true);
        },
        //失去焦点的属性
        "event-hide-isFocus": function(e, currentVM) {
            setTimeout(function() {
                vm.set('__system.attrs.isFocus', false);
            });
        }
    }, function(value, key) {
        var mainKey = key.split("-"); //0:event-    1:event_name-    2:mainKey
        var formatMainKey = "__system.events." + mainKey[2] + "." + mainKey[1];
        console.log(formatMainKey);
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
};

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

/*
 * 自动完成的表单拓展，适合用在非password类的文本输入
 */
function _initAutoComplete(vm) {
    var model = vm.model;
    var data = model._database || {};

    /*
     * 自动完成的拓展
     */
    //三种参数形式：
    //数组型，作为可选的数据，使用函数型默认处理
    //函数型，根据value返回数组型
    //其它，转化为Boolean类型来声明浏览器的默认自动完成

    //缓存input节点
    var inputNode = vm.queryElement({
        tagName: "INPUT"
    })[0];
    //缓存自动完成的节点
    var autocompleteWrapNode;

    function autocompleteHandle(value) { //默认处理函数
        var result = [];
        var valueReg = RegExp(value, "gi");
        jSouper.$.E(jSouper.$.s(acArray), function(autocompleteItem) {
            if (valueReg.test(autocompleteItem)) {
                result.push(autocompleteItem);
            }
        });
        return result
    };
    var acBoolean; //Boolean型，用于开启原生自动完成功能
    var acArray; //数据源
    var acHandle; //过滤函数
    var acResult; //保存过滤的结果

    function _setParameter(value) {
        if (value instanceof Object) {
            if (value instanceof Function) {
                //函数型
                acHandle = acArray = value;
            } else {
                //数组型
                acHandle = autocompleteHandle;
                acArray = value;
            }
            vm.set("__system.attrs.autocomplete", false);
            vm.set("__system.attrs.close_sys_ac", true);
        } else {
            //布尔型
            acArray = false;
            acBoolean = value;
            vm.set("__system.attrs.autocomplete", acBoolean);
            vm.set("__system.attrs.close_sys_ac", false);
        }
    };
    _setParameter(data.autocomplete);

    var tempValue;
    var tempLength = 0;
    data.autocomplete = Model.Observer(function getter(key, old_value /* === acArray*/ , currentKey) {
        if (!acArray) {
            return vm.get("__system.attrs.autocomplete");
        }
        if (key === currentKey) {

            //获取文本框的值
            var value = vm.get("value");

            //根据缓存判定时候要更新自动提示的值
            if (value !== tempValue) {

                //缓存新值
                tempValue = value;

                //空值时不会显示，在View层已经声明逻辑
                if (value) {
                    var newAcResult = acHandle(value);
                    //从空值转为有值。初始化显示
                    if ((!acResult || !acResult.length /*=== 0*/ ) && newAcResult && newAcResult.length) {
                        //如果之前是空值，each可能还未初始化，所以将元素样式的初始化调到整个流程完成后，确保each的初始化。
                        Model.finallyRun.register(jSouper.$.hashCode(inputNode), function() {
                            var width = inputNode.offsetWidth;
                            autocompleteWrapNode || (autocompleteWrapNode = vm.queryElement({
                                tagName: "AUTOCOMPLETEWRAP"
                            })[0]);
                            //设置样式
                            autocompleteWrapNode && (autocompleteWrapNode.style.cssText = 'min-width:' + width + 'px;_width:expression((document.documentElement.clientWidth||document.body.clientWidth)>' + width + '?"' + width + 'px":"");');
                        })
                    }
                    acResult = newAcResult;
                } else {
                    acResult && (acResult.length = 0);
                }
            }
        }
        return acResult;
    }, function setter(key, value, currentKey) {
        if (currentKey === key &&
            //触发来自外部而不是自身的touchOff所触发的set(get())
            acResult !== value) {
            //重置参数形式
            _setParameter(value);
            //滞空缓存
            tempValue = undefined;
        }
        if (!acArray) {
            return acBoolean;
        }
        return acArray;
    });

    vm.set("__system.events.autocomplete.click", function(e, currentVM) {
        vm.set("value", currentVM.get());
        vm.set("__system.attrs.isFocus", false)
    });
};

function __initAutofocus(vm) {
    var data = vm.model._database;
    if (data.autofocus) {
        //缓存input节点
        var inputNode = vm.queryElement({
            tagName: "INPUT"
        })[0];
        console.log(inputNode);
        //页面加载时显示
        (data.events || (data.events = {}))["ready-autofocus"] = function(e, currentVM) {
            //确保在第一波View已经在append到页面上时，才进行自动对焦
            setTimeout(function() {
                inputNode.focus();
            })
        };
    }
};

function __initPattern(vm) {
    var model = vm.model;
    var data = model._database;
    var pattern = data.pattern;
    data.pattern = Model.Observer(function getter(key, old_value, currentKey) {

    }, function setter(key, value, currentKey) {
        
    });
}

jSouper.modulesInit["form.text"] = function(vm) {

    //添加自动完成功能
    _initAutoComplete(vm);

    //添加自动对焦功能
    __initAutofocus(vm);

    //进行通用的表单初始化函数进行初始化配置
    _initVM(vm);
};
