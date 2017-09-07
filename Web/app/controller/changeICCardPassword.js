$(function () {
    //初始化系统通用变量
    var sqlStr, serverDate, customerCode;
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        customerCode = null;
        ISystemService.getObjectProperty.objName = "Customer";
        ISystemService.getObjectProperty.property = "CustomerCode";
        ISystemService.getObjectProperty.ojbID = $.cookie('CustomerID');
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                customerCode = e.value;
            }(ISystemService.getObjectProperty.resultValue));
        }
        
        if (customerCode != null) {
            $("#iccard").empty();
            sqlStr = "select ICCardID, ICCardNumber from ICCard where CustomerCode = '" + customerCode + "'";
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var rowLength = rows.length;
                        for (var i = 0; i < rowLength; i++) {
                            var rowResult = rows[i].values;
                            $("#iccard").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                        }
                    }
                }(ISystemService.execQuery.resultValue));
            }
        }
        $("#iccard").get(0).selectedIndex = 0;
        $("#txtoriginalpwd").val("");
        $("#txtnewpwd").val("");
        $("#txtconfirmpwd").val("");

    });

    //保存
    $("#btn_Save").click(function () {
        var originalpwd = null;
        if ($("#txtnewpwd").val() != $("#txtconfirmpwd").val()) {
            alert("两次输入的新密码不一致,请重新输入!");
            return;
        }
        if ($("#txtnewpwd").val().length < 4 ) {
            alert("新密码长度至少为4位!");
            return;
        }

        arr = $("#txtnewpwd").val().split(" ");
        if (arr.length != 1) {
            alert("新密码不能含有空格！");
            return ;
        }

        ISystemService.getObjectProperty.objName = "ICCard";
        ISystemService.getObjectProperty.property = "Password";
        ISystemService.getObjectProperty.ojbID = $("#iccard").val();
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                originalpwd = e.value;
            }(ISystemService.getObjectProperty.resultValue));
        }
        if (originalpwd != $("#txtoriginalpwd").val()) {
            alert("原密码输入不正确!！");
            return;
        }

        ISystemService.excuteNoneReturnQuery.sqlString = "update [ICCard] set [Password]='" + $("#txtnewpwd").val() + "' where [ICCardID]= " + $("#iccard").val();
        rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
        if (ISystemService.excuteNoneReturnQuery.success) {
            $("#btn_Save").attr("disabled", true);
            alert("密码修改成功!");
        }
        else {
            alert("密码修改失败!");
        }
    });

    $("#iccard").change(function () {
        $("#txtoriginalpwd").val("");
        $("#txtnewpwd").val("");
        $("#txtconfirmpwd").val("");
        $("#btn_Save").attr("disabled", false);
    });
   
})