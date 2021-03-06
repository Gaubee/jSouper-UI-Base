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

    function systemAutocompleteHandle(value) { //默认处理函数
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

    var old_value = data.autocomplete;

    var tempValue;
    vm.set("autocomplete", Model.Observer(function getter(key, old_value /* === acArray*/ , currentKey) {
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
            acResult !== value && value) {
            //重置参数形式

            if (value instanceof Object) {
                if (value instanceof Function) {
                    //函数型
                    acHandle = acArray = value;
                } else {
                    //数组型
                    acHandle = systemAutocompleteHandle;
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
            //滞空缓存
            tempValue = undefined;
        }
        if (!acArray) {
            return acBoolean;
        }
        return acArray;
    }));

    vm.set("autocomplete", old_value);

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
    /*
     * 格式验证的拓展
     */
    //三种参数形式：
    //正则型
    //字符型，编译成正则
    //函数型，根据value返回错误提示信息

    //缓存input节点
    var inputNode = vm.queryElement({
        tagName: "INPUT"
    })[0];

    //不论系统是否支持pattern属性，统一用自定义的。这样样式能得到统一
    //闭包保存的正则验证
    var patternRule;
    var patternReault;
    var patternHandle;

    function systemPatternHandle(value) {
        //确保title的变动也会引发pattern值的变动，所以提到if-else逻辑外面
        var result = vm.get("title");
        if (patternRule.test(value)) {
            vm.set("__system.attrs.pattern_error", false);
        } else {
            vm.set("__system.attrs.pattern_error", true);
            return new String(result)
        }
    };
    var old_value = data.pattern;

    vm.set("pattern", Model.Observer(function getter(key, old_value, currentKey) {
        var value = vm.get("value");
        //这里不用缓存判断，因为要确保title的值改变能起正确的作用
        if (patternRule || patternHandle) {
            patternReault = patternHandle(value);
        }
        return patternReault;
    }, function setter(key, value, currentKey) {
        //这里无需绑定，所以setter无需返回值，因此，如果是系统的set(get())，value将是空的
        if (value && value !== patternReault) {
            if (typeof value === "string") {
                patternRule = new RegExp(value);
                patternHandle = systemPatternHandle;
            } else if (value instanceof RegExp) {
                patternRule = value;
                patternHandle = systemPatternHandle;
            } else if (value instanceof Function) {
                patternRule = null;
                patternHandle = value;
            }
        }
    }));

    vm.set("pattern", old_value);
    //初始化条件又依赖于其内部（Observer），无法自动触发。所以手动Get一次进行依赖生成
    vm.get("pattern", old_value);

    //输入框提交时转化为验证错误的状态的判定条件
    vm.set("__system.attrs.show_pattern_error", Model.Observer(function() {
        var pattern_error = vm.get("__system.attrs.pattern_error");
        // var isFocus = vm.get("__system.attrs.isFocus");
        var isSubmitted = vm.get("__system.attrs.isSubmitted");
        var result = pattern_error && isSubmitted;
        return result;
    }));

    //点击错误提示的事件，依旧保持input node的焦点
    vm.set("__system.events.click.pattern", function() {
        //阻止stopBlur事件发生
        vm.set('__system.attrs.stopBlur', true);
        //在blur事件过后再次聚焦
        setTimeout(function (argument) {
            inputNode.focus();
        })
    })
}

jSouper.modulesInit["form.text"] = function(vm) {

    //添加自动完成功能
    _initAutoComplete(vm);

    //添加自动对焦功能
    __initAutofocus(vm);

    //添加验证功能
    __initPattern(vm);

    //进行通用的表单初始化函数进行初始化配置
    _initVM(vm);
};

jSouper.modulesInit["form.submit"] = function(vm) {

    //缓存input节点
    var inputNode = vm.queryElement({
        tagName: "INPUT"
    })[0];

    var systemEvents = {
        "event-click-pattern": function() {
            var formNode = inputNode.form;
            var jsouperFormUis = formNode.getElementsByTagName("jsouperFormUi");
            var goSubmit = true;
            jSouper.$.E(jsouperFormUis, function(jsouperFormUi) {
                var jsouperFormUiHandle = jSouper.queryHandle(jsouperFormUi);
                if (jsouperFormUiHandle) {
                    var jsouperFormUiVM = jsouperFormUiHandle.viewModel;
                    jsouperFormUiVM.set("__system.attrs.isSubmitted", true);
                    goSubmit = goSubmit && !jsouperFormUiVM.get("__system.attrs.pattern_error");
                }
            })
            return goSubmit;
        }
    }

    //进行通用的表单初始化函数进行初始化配置
    _initVM(vm, systemEvents);
};
