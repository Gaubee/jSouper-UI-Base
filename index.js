jSouper.ready(function() {
    jSouper.app({
        Id: "jSouper-base",
        Data: {
            form: {
                login: [{
                    label:"用户名",
                    "class":"my-input",
                    type: "text",
                    name: "username",
                    placeholder: "请输入用户名",
                    autocomplete:["123","234","345","456"],
                    // autocomplete:function (value,vm) {
                    //     var result = ["@126.com","@163.com","@qq.com"];
                    //     for(var i = 0,len = result.length;i<len;i+=1){
                    //         result[i] = value+result[i]
                    //     }
                    //     return result;
                    // },
                    // autocomplete:true,
                    autofocus:true,
                    attrs:{
                        id:"test",
                        title:"{{placeholder}}"
                    },
                    events:{
                        click:function (e,vi) {
                            console.log(e.type);
                        },
                        dbclick:"{{'events.click'}}",
                        mouseenter:function (e,vi) {
                            console.log("mouseEnter!!");
                        }
                    }
                }, {
                    type: "password",
                    name: "login_password",
                    placeholder: "密码"
                }, {
                    type: "submit",
                    value: "登录",
                    click: function(e, vm) {
                        alert("登录成功");
                    }
                }],
                register: [{
                    type: "radio",
                    label: "性别",
                    name: "sex",
                    items: [{
                        key: "男",
                        value: "1"
                    }, {
                        key: "女",
                        value: "0"
                    }],
                    value: "0"
                }, {
                    type: "checkbox",
                    label: "兴趣",
                    name: "like",
                    items: [{
                        key: "呵呵",
                        value: "hehe1"
                    }, {
                        key: "呵呵呵",
                        value: "hehe2",
                    }],
                    value: ["hehe2"]
                }]
            },
        }
    });
});
