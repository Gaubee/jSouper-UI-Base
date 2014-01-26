jSouper.modulesInit["form.text"] = function(vm) {

    //添加自动完成功能
    _initAutoComplete(vm);

    //添加自动对焦功能
    __initAutofocus(vm);

    //进行通用的表单初始化函数进行初始化配置
    _initVM(vm);
};
