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
