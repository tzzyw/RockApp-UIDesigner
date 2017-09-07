$(function () {
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,User";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var myform, state, userid,user,
        userid = rock.userInfo.userID,  //需从session中取
        toolBar = new dhtmlXToolbarObject("mytoolBar_container");

        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
        toolBar.addButton("save", 0, "修改");
        toolBar.addSeparator("001", 1);
        toolBar.addButton("renounce", 2, "放弃");
        toolBar.addSeparator("002", 3);

        window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
        formData = [
    {
        type: "fieldset", name: "fiel1", label: "用户修改密码", inputWidth: 525, labelAlign: "left", list: [
        { type: "settings", position: "label-left", labelWidth: 120, inputWidth: 230, labelAlign: "right" },
            { type: "hidden", name: "UserID", label: "用户ID", readonly: true },
            { type: "input", name: "UserName", label: "用户名称" },
            { type: "password", name: "Password", label: "原密码" },
            { type: "password", name: "Pwd", label: "新密码" },
            { type: "password", name: "Pass", label: "重复密码" },
                {
                    type: "button", name: "modify", value: "修改", offsetTop: 10, offsetLeft: 130
                }
        ]
    }];
        myform = new dhtmlXForm("myform_container", formData);
        myform.setReadonly('UserName', true);
        myform.attachEvent("onButtonClick", change);

        if (userid != null) {
            ISystemService.getDynObjectByID.dynObjectID = userid;
            ISystemService.getDynObjectByID.structName = "User";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    if (e != null) {
                        user = e;
                        myform.setItemValue("UserID", userid);
                        myform.setItemValue("UserName", e.userName);

                        state = "modify";
                    }
                    else {
                        alert("从服务器端获取的User对象为空,请检查!");
                    }
                }(ISystemService.getDynObjectByID.resultValue));
            }            
        }        

        myform.setItemFocus("UserName");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "save":
                    change();
                    break
                case "renounce":
                    window.close();
                    break
                default:
                    alert(id + "-->出错啦,请查找错误原因!");
            }
        });

        function change() {
            var uid = userid;
            var username = myform.getInput("UserName").value;
            var ypass = myform.getInput("Password").value;
            var pwd = myform.getInput("Pwd").value;
            var pass = myform.getInput("Pass").value;
            var password = ypass;
            if (username == '') {
                alert('用户名称不能为空');
                return false;
            }
            if (ypass == '') {
                alert('原密码不能为空');
                return false;
            }
            if (pwd.length < 6) {
                alert('新密码不能少于6位');
                return false;
            }
            if (pass == '') {
                alert('重复密码不能为空');
                return false;
            }
            if (pwd != pass) {
                alert('两次密码输入不一致');
                return false;
            }
            password = hex_md5(ypass).toUpperCase();
            if (user.password == password) {
                user.password = hex_md5(pwd).toUpperCase();
                ISystemService.modifyDynObject.dynObject = user;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                myform.setItemValue("Password", "");
                myform.setItemValue("Pwd", "");
                myform.setItemValue("Pass", "");
                alert("密码修改成功！");
            }
            else {
                state = "error";
                alert("原密码不正确,请检查!");
                return false;
            } 
        } 
    });
})