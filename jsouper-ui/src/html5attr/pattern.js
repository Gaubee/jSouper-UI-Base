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
