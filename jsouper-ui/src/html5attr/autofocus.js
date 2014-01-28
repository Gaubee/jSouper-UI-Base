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
