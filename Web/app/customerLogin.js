$(function () {
    self.moveTo(0, 0);
    self.resizeTo(screen.availWidth, screen.availHeight);
    var userName, passWord;
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        $("#txtUserName").val("");
        $("#pswd").val("");
        $("#validcode").val("");        
    });
    var key = new Date().getTime();
    var code = "";
    $("#login").click(function () {
        userName = $.trim($("#txtUserName").val());
        passWord = $.trim($("#pswd").val());
        //userName = "admin";
        //passWord = "123456";
        if (userName == "" ) {
            alert("用户名不能为空!请检查!");
            return;
        }
        if (passWord == "") {
            alert("密码不能为空!请检查!");
            return;
        }
        else {
            callService_Login(userName, passWord);
        }
    });

    ////单击回车执行登录操作
    //$("#divLoginForm").keydown(function () {
    //    if (event.keyCode == 13) {
    //        userName = $.trim($("#txtUserName").val());
    //        passWord = $.trim($("#pswd").val());
    //        if (userName == "" || userName == "输入用户名") {
    //            alert("登录信息不能为空!请检查!");
    //            return;
    //        }
    //        else {
    //            callService_Login(userName, hex_md5(passWord).toUpperCase());
    //        }
    //    }
    //});
    ////用户名输入
    //$("#txtUserName").keydown(function () {
    //    if ($.trim($("#txtUserName").val()) == "输入用户名") {
    //        $("#txtUserName").val("");
    //        return true;
    //    }
    //    return true;
    //});
    ////用户名输入框获取焦点
    //$("#txtUserName").focus(function () {
    //    if ($.trim($("#txtUserName").val()) == "输入用户名") {
    //        $("#txtUserName").val("");
    //        return true;
    //    }
    //});
    ////用户名输入框失去焦点
    //$("#txtUserName").blur(function () {
    //    if ($.trim($("#txtUserName").val()) == "") {
    //        $("#txtUserName").val("输入用户名");
    //        return true;
    //    }
    //    return true;
    //});
    //密码输入
    //$("#fakepswd").keydown(function () {
    //    if ($.trim($("#fakepswd").val()) == "请输入密码") {
    //        $("#divfakepswd").css("display", "none");
    //        $("#divpswd").css("display", "block");
    //        $("#pswd").focus();
    //        return true;
    //    }
    //    return true;
    //});
    ////密码输入框获取焦点
    //$("#fakepswd").focus(function () {
    //    if ($.trim($("#fakepswd").val()) == "请输入密码") {
    //        $("#divfakepswd").css("display", "none");
    //        $("#divpswd").css("display", "block");
    //        $("#pswd").focus();
    //        return true;
    //    }
    //    return true;
    //});
    ////密码输入框失去焦点
    //$("#pswd").blur(function () {
    //    if ($.trim($("#pswd").val()) == "") {
    //        $("#divfakepswd").css("display", "block");
    //        $("#divpswd").css("display", "none");
    //        return true;
    //    }
    //    return true;
    //});

    function callService_Login(username, password) {
        //获取验证码
        ISystemService.executeScalar.sqlString = "select [LogName] from [Log] where [OperaterName] = '" + key + "'";
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                code = e.value;
            }(ISystemService.executeScalar.resultValue));
        }
        if ($("#validcode").val() != code) {
            alert("验证码输入有误，请重新输入！");
            getvalidcode();
            return;
        }
        $.ajax({
            type: "POST",
            url: "/CustomerAuthHandler.ashx",
            data: { "userName": username, "passWord": password },
            async: false,
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (data) {
                var responseText = data;
                if (responseText == "Success") {
                    ////更新登陆用户状态
                    //ISystemService.updateUserState.userID = $.cookie('userID');
                    //ISystemService.updateUserState.state = '在线';
                    //rock.AjaxRequest(ISystemService.updateUserState, rock.exceptionFun);
                    ////根据登录日志，更新用户状态
                    //rock.AjaxRequest(ISystemService.checkUserLoginLog, rock.exceptionFun);

                    window.location.href = "/CustomerIndex.html";
                } else if (responseText == "Error") {
                    alert("用户名或密码错误!请检查!");
                    getvalidcode();
                } else if (responseText == "Userlocked") {
                    alert("该用户以被锁定!请联系管理员!");
                } else {
                    alert("用户名或密码错误!请检查!"); //出现异常
                    getvalidcode();
                }
            }
        });

        ISystemService.excuteNoneReturnQuery.sqlString = "delete from [Log] where [OperaterName] = '" + key + "'";
        rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
    }

    //$("#txtUserName").val("admin");
    //$("#fakepswd").val("123456");

    //$("#txtUserName").val("输入用户名");
    //$("#fakepswd").val("请输入密码");
    $("#imgCode").attr('src', "../../GenerateValidateCode.ashx?id=" + key);
    $("#imgCode").click(function () {
        getvalidcode();
    });

    function getvalidcode() {
        key = new Date().getTime();
        $("#imgCode").attr('src', "../../GenerateValidateCode.ashx?id=" + key);
    }
});
