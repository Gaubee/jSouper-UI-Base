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

    function _setParameter(value) {
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
