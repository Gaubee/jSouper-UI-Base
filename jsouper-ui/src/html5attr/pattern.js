function __initPattern(vm) {
    var model = vm.model;
    var data = model._database;
    var pattern = data.pattern;
    data.pattern = Model.Observer(function getter(key, old_value, currentKey) {

    }, function setter(key, value, currentKey) {
        
    });

}
