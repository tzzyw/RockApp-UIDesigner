
$(function () {
    //初始化系统通用变量
    var listGrid, sqlStr, serverDate, vehiclePop, vehicleGrid, platName,
    measure = null,
    iCCard = null,
    vehicleDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,ICommonService,IBusinessService,DataTable,DataRow,DataColumn,Measure,ICCard";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //站台选择
        ICommonService.userInDepart.userID = $.cookie('userID');
        ICommonService.userInDepart.departID = 5;
        rock.AjaxRequest(ICommonService.userInDepart, rock.exceptionFun);
        if (ICommonService.userInDepart.success) {
            (function (e) {
                if (e.value) {
                    $("#txtplatName").val("己烷站台");
                    platName = "己烷站台";
                }
            }(ICommonService.userInDepart.resultValue));
        }
        ICommonService.userInDepart.userID = $.cookie('userID');
        ICommonService.userInDepart.departID = 7;
        rock.AjaxRequest(ICommonService.userInDepart, rock.exceptionFun);
        if (ICommonService.userInDepart.success) {
            (function (e) {
                if (e.value) {
                    $("#txtplatName").val("1-丁烯站台");
                    platName = "1-丁烯站台";
                }
            }(ICommonService.userInDepart.resultValue));
        }

        platName = "己烷站台";
        init();
    });



    //读卡
    $("#btnReadCard").click(function () {
        //参数说明：1.test 表明是测试服务是否可以调用。2.port 读卡器端口。3.sector IC卡扇区。4.whichblock 块
        var executableFullPath = "C://Card//ICCard.exe read 3 1 0 0";
        try {
            var shellActiveXObject = new ActiveXObject("WScript.Shell");
            if (!shellActiveXObject) {
                alert('WScript.Shell');
                return;
            }
            shellActiveXObject.Run(executableFullPath, 1, false);
            shellActiveXObject = null;
        }
        catch (errorObject) {
            alert("读卡出错,请联系管理员处理!");
            return;
        }
        readed();
    });  

    //身份验证
    $("#btnidentity").click(function () {
        if ($("#txtICPassword").val() == "") {
            alert("请输入密码再验证身份");
            return;
        }
        var cardNum, customerName, customerCode, fso, file;
        try {
            fso = new ActiveXObject("Scripting.FileSystemObject");
            file = fso.OpenTextFile("C:\\card.cnp", 1)
            cardNum = file.ReadLine();
            file.Close();
        }
        catch (e) {
            alert(e);
        }

        //判定卡号是否合格 条件为true的都是不合格的
        if (isNaN(cardNum)) {
            cardNum = prompt("系统升级需要验证老卡,请输入您IC卡上的3位卡号:", "");
            if (cardNum != null) {
                while (cardNum.length != 3) {
                    cardNum = prompt("卡号长度是3位,请重新输入您IC卡上的3位卡号:", "");
                }
            }
            //根据客户编码获取客户IC卡
            IBusinessService.getICCardByNum.icNum = cardNum;
            rock.AjaxRequest(IBusinessService.getICCardByNum, rock.exceptionFun);
            if (IBusinessService.getICCardByNum.success) {
                (function (e) {
                    iCCard = e;
                }(IBusinessService.getICCardByNum.resultValue))
            }
            //如果获取到IC卡对象说明IC卡已经重新初始化可以使用了
            if (iCCard != null) {
                if (!iCCard.available) {
                    alert("该身份卡已经被禁用,请联系发卡人进行启用!");
                    return;
                }
                if (iCCard.password == $("#txtICPassword").val()) {
                    //获取客户名称进行确认
                    ISystemService.executeScalar.sqlString = "select [CustomerCode] from [ICCard] where [ICCardNumber] = '" + cardNum + "'";
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            customerCode = e.value;
                        }(ISystemService.executeScalar.resultValue));
                    }
                    else {
                        alert("获取IC卡的客户信息出错,请联系管理员处理!");
                        return;
                    }
                    //获取客户名称
                    ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerCode] = '" + customerCode + "'";
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            customerName = e.value;
                        }(ISystemService.executeScalar.resultValue));
                    }
                    else {
                        alert("获取IC卡的客户信息出错,请联系管理员处理!");
                        return;
                    }

                    if (confirm("IC卡的客户是:" + customerName + ". 请确认")) {
                        //验证完毕,重写卡号更新是否重新验证标记
                        //参数说明：1.test 表明是测试服务是否可以调用。2.port 读卡器端口。3.sector IC卡扇区。4.whichblock 块
                        var executableFullPath = "C://Card//ICCard.exe write 3 1 0 " + cardNum;
                        try {
                            var shellActiveXObject = new ActiveXObject("WScript.Shell");
                            if (!shellActiveXObject) {
                                alert('WScript.Shell');
                                return;
                            }
                            shellActiveXObject.Run(executableFullPath, 1, false);
                            shellActiveXObject = null;
                        }
                        catch (errorObject) {
                        }

                        //更新是否重新验证标记
                        iCCard.reInit = "1";
                        ISystemService.modifyDynObject.dynObject = measure;
                        rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                        if (ISystemService.modifyDynObject.success) {
                            $("#txtiCCardNumber").val(cardNum);
                            $("#txtICCustomerCode").val(customerCode);
                            $("#txtcustomer").val(customerName);
                            if (audited()) {
                                alert("客户身份验证通过!");
                            }                            
                        }
                    }

                } else {
                    alert("密码不正确,请重新进行验证!");
                    return;
                }

            } //如果获取不到IC卡对象说明IC卡不存在或者没有重新初始化
            else {
                cardNum = prompt("系统升级需要验证老卡,请输入您IC卡上的3位卡号:", "");
                if (cardNum != null) {
                    while (cardNum.length != 3) {
                        cardNum = prompt("卡号长度是3位,请重新输入您IC卡上的3位卡号:", "");
                    }
                    //判定根据用户输入的卡号是否可以获取IC卡对象,如果能获取到说明经过验证后可以对卡进行重新初始化
                    IBusinessService.getICCardByNum.icNum = cardNum;
                    rock.AjaxRequest(IBusinessService.getICCardByNum, rock.exceptionFun);
                    if (IBusinessService.getICCardByNum.success) {
                        (function (e) {
                            iCCard = e;
                        }(IBusinessService.getICCardByNum.resultValue))
                    }
                    //如果可以获取IC卡对象,对IC卡进行身份验证后重新写入卡号,并更新是否重新验证标记
                    if (iCCard != null) {
                        if (!iCCard.available) {
                            alert("该身份卡已经被禁用,请联系发卡人进行启用!");
                            return;
                        }
                        if (iCCard.password == $("#txtICPassword").val()) {
                            //获取客户名称进行确认
                            ISystemService.executeScalar.sqlString = "select [CustomerCode] from [ICCard] where [ICCardNumber] = '" + cardNum + "'";
                            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                            if (ISystemService.executeScalar.success) {
                                (function (e) {
                                    customerCode = e.value;
                                }(ISystemService.executeScalar.resultValue));
                            }
                            else {
                                alert("获取IC卡的客户信息出错,请联系管理员处理!");
                                return;
                            }
                            //获取客户名称
                            ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerCode] = '" + customerCode + "'";
                            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                            if (ISystemService.executeScalar.success) {
                                (function (e) {
                                    customerName = e.value;
                                }(ISystemService.executeScalar.resultValue));
                            }
                            else {
                                alert("获取IC卡的客户信息出错,请联系管理员处理!");
                                return;
                            }

                            if (confirm("IC卡的客户是:" + customerName + ". 请确认")) {
                                //验证完毕,重写卡号更新是否重新验证标记
                                //参数说明：1.test 表明是测试服务是否可以调用。2.port 读卡器端口。3.sector IC卡扇区。4.whichblock 块
                                var executableFullPath = "C://Card//ICCard.exe write 3 1 0 " + cardNum;
                                try {
                                    var shellActiveXObject = new ActiveXObject("WScript.Shell");
                                    if (!shellActiveXObject) {
                                        alert('WScript.Shell');
                                        return;
                                    }
                                    shellActiveXObject.Run(executableFullPath, 1, false);
                                    shellActiveXObject = null;
                                }
                                catch (errorObject) {
                                }

                                //更新是否重新验证标记
                                iCCard.reInit = "1";
                                ISystemService.modifyDynObject.dynObject = measure;
                                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                                if (ISystemService.modifyDynObject.success) {
                                    $("#txtiCCardNumber").val(cardNum);
                                    $("#txtICCustomerCode").val(customerCode);
                                    $("#txtcustomer").val(customerName);
                                    if (audited()) {
                                        alert("客户身份验证通过!");
                                    }
                                }
                            }

                        } else {
                            alert("密码不正确,请重新进行验证");
                            return;
                        }
                    }
                }
            }
        }
        else {
            //根据客户编码获取客户IC卡
            if (parseInt(cardNum, 10) < 100) {
                cardNum = "0" + cardNum;
            }
            IBusinessService.getICCardByNum.icNum = cardNum;
            rock.AjaxRequest(IBusinessService.getICCardByNum, rock.exceptionFun);
            if (IBusinessService.getICCardByNum.success) {
                (function (e) {
                    iCCard = e;
                }(IBusinessService.getICCardByNum.resultValue))
            }
            //如果获取到IC卡对象说明IC卡已经重新初始化可以使用了
            if (iCCard != null) {
                if (!iCCard.available) {
                    alert("该身份卡已经被禁用,请联系发卡人进行启用!");
                    return;
                }
                if (iCCard.password == $("#txtICPassword").val()) {
                    //获取客户名称进行确认
                    ISystemService.executeScalar.sqlString = "select [CustomerCode] from [ICCard] where [ICCardNumber] = '" + cardNum + "'";
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            customerCode = e.value;
                        }(ISystemService.executeScalar.resultValue));
                    }
                    else {
                        alert("获取IC卡的客户信息出错,请联系管理员处理!");
                        return;
                    }
                    //获取客户名称
                    ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerCode] = '" + customerCode + "'";
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            customerName = e.value;
                        }(ISystemService.executeScalar.resultValue));
                    }
                    else {
                        alert("获取IC卡的客户信息出错,请联系管理员处理!");
                        return;
                    }
                    //判定是否已经重新初始化,已经重新初始化的不需要再进行初始化
                    if (iCCard.reInit == '1') {
                        $("#txtiCCardNumber").val(cardNum);
                        $("#txtICCustomerCode").val(customerCode);
                        $("#txtcustomer").val(customerName);
                        if (audited()) {
                            alert("客户身份验证通过!");
                        }
                    }
                    else {
                        if (confirm("IC卡的客户是:" + customerName + ". 请确认")) {
                            //验证完毕,重写卡号更新是否重新验证标记
                            //参数说明：1.test 表明是测试服务是否可以调用。2.port 读卡器端口。3.sector IC卡扇区。4.whichblock 块
                            var executableFullPath = "C://Card//ICCard.exe write 3 1 0 " + cardNum;
                            try {
                                var shellActiveXObject = new ActiveXObject("WScript.Shell");
                                if (!shellActiveXObject) {
                                    alert('WScript.Shell');
                                    return;
                                }
                                shellActiveXObject.Run(executableFullPath, 1, false);
                                shellActiveXObject = null;
                            }
                            catch (errorObject) {
                            }

                            //更新是否重新验证标记
                            iCCard.reInit = "1";
                            ISystemService.modifyDynObject.dynObject = measure;
                            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                            if (ISystemService.modifyDynObject.success) {
                                $("#txtiCCardNumber").val(cardNum);
                                $("#txtICCustomerCode").val(customerCode);
                                $("#txtcustomer").val(customerName);
                                if (audited()) {
                                    alert("客户身份验证通过!");
                                }
                            }
                        }
                    }                    
                }
                else {
                    alert("密码不正确,请重新进行验证!");
                    return;
                }
            } //如果获取不到IC卡对象说明IC卡不存在或者没有重新初始化
            else {
                cardNum = prompt("系统升级需要验证老卡,请输入您IC卡上的3位卡号:", "");
                if (cardNum != null) {
                    while (cardNum.length != 3) {
                        cardNum = prompt("卡号长度是3位,请重新输入您IC卡上的3位卡号:", "");
                    }

                    //判定根据用户输入的卡号是否可以获取IC卡对象,如果能获取到说明经过验证后可以对卡进行重新初始化
                    IBusinessService.getICCardByNum.icNum = cardNum;
                    rock.AjaxRequest(IBusinessService.getICCardByNum, rock.exceptionFun);
                    if (IBusinessService.getICCardByNum.success) {
                        (function (e) {
                            iCCard = e;
                        }(IBusinessService.getICCardByNum.resultValue))
                    }

                    //如果可以获取IC卡对象,对IC卡进行身份验证后重新写入卡号,并更新是否重新验证标记
                    if (iCCard != null) {
                        if (!iCCard.available) {
                            alert("该身份卡已经被禁用,请联系发卡人进行启用!");
                            return;
                        }
                        if (iCCard.password == $("#txtICPassword").val()) {
                            //获取客户名称进行确认
                            ISystemService.executeScalar.sqlString = "select [CustomerCode] from [ICCard] where [ICCardNumber] = '" + cardNum + "'";
                            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                            if (ISystemService.executeScalar.success) {
                                (function (e) {
                                    customerCode =e.value;
                                }(ISystemService.executeScalar.resultValue));
                            }
                            else {
                                alert("获取IC卡的客户信息出错,请联系管理员处理!");
                                return;
                            }
                            //获取客户名称
                            ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerCode] = '" + customerCode + "'";
                            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                            if (ISystemService.executeScalar.success) {
                                (function (e) {
                                    customerName = e.value;
                                }(ISystemService.executeScalar.resultValue));
                            }
                            else {
                                alert("获取IC卡的客户信息出错,请联系管理员处理!");
                                return;
                            }

                            if (confirm("IC卡的客户是:" + customerName + ". 请确认")) {
                                //验证完毕,重写卡号更新是否重新验证标记
                                //参数说明：1.test 表明是测试服务是否可以调用。2.port 读卡器端口。3.sector IC卡扇区。4.whichblock 块
                                var executableFullPath = "C://Card//ICCard.exe write 3 1 0 " + cardNum;
                                try {
                                    var shellActiveXObject = new ActiveXObject("WScript.Shell");
                                    if (!shellActiveXObject) {
                                        alert('WScript.Shell');
                                        return;
                                    }
                                    shellActiveXObject.Run(executableFullPath, 1, false);
                                    shellActiveXObject = null;
                                }
                                catch (errorObject) {
                                }

                                //更新是否重新验证标记
                                iCCard.reInit = "1";
                                ISystemService.modifyDynObject.dynObject = iCCard;
                                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                                if (ISystemService.modifyDynObject.success) {
                                    $("#txtiCCardNumber").val(cardNum);
                                    $("#txtICCustomerCode").val(customerCode);
                                    $("#txtcustomer").val(customerName);
                                    if (audited()) {
                                        alert("客户身份验证通过!");
                                    }
                                }
                            }

                        } else {
                            alert("密码不正确,请重新进行验证");
                            return;
                        }
                    }
                }
            }
        }      
    });

    //保存
    $("#btnsave").click(function () {

        if ($("#txtmeasureID").val() != "") {
            ISystemService.getDynObjectByID.dynObjectID = $("#txtmeasureID").val();
            ISystemService.getDynObjectByID.structName = "Measure";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    measure = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                alert("获取当前计量单出错,请检查!");
                return;
            }
        }

        if (measure != null) {
            measure.audit = "1";
            ISystemService.modifyDynObject.dynObject = measure;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                init();
                alert("车辆已放行");
            }
        }
    });

    //加载弹窗Div
    vehicleGrid = new dhtmlXGridObject("vehicleGrid");
    vehicleGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    vehicleGrid.setSkin("dhx_skyblue");
    vehicleGrid.setHeader("序号,,客户名称,车号,产品名称");
    vehicleGrid.setInitWidths("40,0,200,120,*");
    vehicleGrid.setColAlign("center,left,left,left,left");
    vehicleGrid.setColSorting("na,na,str,str,str");
    vehicleGrid.setColTypes("cntr,ro,ro,ro,ro");
    vehicleGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) { 
        var materialName = vehicleGrid.cells(rowID, 4).getValue();
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Measure";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                measure = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            alert("获取计量车辆出错!");
            return;
        }

        if (measure != null) {
            $("#txtmeasureID").val(rowID);
            $("#txtvehicle").val(measure.measureNum);

            $("#txtcustomerID").val(measure.customerID);
            $("#txtplatform").val(measure.platform);
            $("#txtcustomer").val(vehicleGrid.cells(rowID, 4).getValue());
            $("#txtmaterial").val(materialName + measure.materialLevel);
            $("#txtmeasureType").val(measure.measureType);
            $("#txtvehicleNum").val(measure.vehicleNum);
            $("#txtmaterialID").val(measure.materialID);
            $("#txtladeBillID").val(measure.ladeBillID);
            $("#txtplanQuantity").val(measure.planQuantity);
            if (measure.ladeBillID > 0) {
                ISystemService.getObjectProperty.objName = "LadeBill";
                ISystemService.getObjectProperty.property = "LadeBillNum";
                ISystemService.getObjectProperty.ojbID = measure.ladeBillID;
                rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                if (ISystemService.getObjectProperty.success) {
                    (function (e) {
                        $("#txtLadeBillNum").val(e.value);
                    }(ISystemService.getObjectProperty.resultValue));
                }
                ISystemService.getObjectProperty.objName = "LadeBill";
                ISystemService.getObjectProperty.property = "LadeDate";
                ISystemService.getObjectProperty.ojbID = measure.ladeBillID;
                rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                if (ISystemService.getObjectProperty.success) {
                    (function (e) {
                        $("#txtladeDate").val(e.value.split(' ')[0]);
                    }(ISystemService.getObjectProperty.resultValue));
                }

            }
            $("#txtcomment").val(measure.comment);
            $("#btnsave").attr("disabled", false);
        }
        hidevehiclePop();
    });
    vehicleGrid.init();
    vehiclePop = $("#vehiclePop")
    $('#txtvehicle').focus(function (e) {
        showvehiclePop();
    });

    function showvehiclePop() {
        var top = $("#txtvehicle").offset().top;
        var left = $("#txtvehicle").offset().left;
        vehiclePop.css({ top: top + 22, left: left }).show();
    }

    function hidevehiclePop() {
        vehiclePop.css({ top: 200, left: -1300 }).hide();
    }
    hidevehiclePop();


    $('#main').mousedown(function (e) {
        if (e.srcElement.id != "txtvehicle") {
            hidevehiclePop();
        }
    });
    //$(document.body).mousedown(function (e) {
    //    if (e.srcElement.id != "txtvehicle") {
    //        hidevehiclePop();
    //    }
    //});
   
    //初始化
    function init() {
        $("#txtmeasureID").val("");
        $("#txtICCustomerCode").val("");
        $("#txtmeasureID").val("");
        $("#txtcustomerID").val("");
        $("#txtmaterialID").val("");
        $("#txtladeBillID").val("");

        $("#txtvehicle").val("");
        $("#txtcustomer").val("");
        $("#txtplatform").val("");
        $("#txtmaterial").val("");
        $("#txtmeasureType").val("");
        $("#txtvehicleNum").val("");
        $("#txtplanQuantity").val("");
        $("#txtLadeBillNum").val("");
        $("#txtcomment").val("");
        $("#txtladeDate").val("");
        $("#txtICPassword").val("");
        $("#txtiCCardNumber").val("");

        $("#txtICPassword").attr("disabled", true);
        $("#btnReadCard").attr("disabled", false);
        $("#btnidentity").attr("disabled", true);
        $("#btnsave").attr("disabled", true);

        vehicleDataList = new rock.JsonList();
        vehicleGrid.clearAll();
    }

    function readed() {
        $("#btnReadCard").attr("disabled", true);
        $("#txtICPassword").attr("disabled", false);
        $("#btnidentity").attr("disabled", false);
    }

    function audited() {
        //获取待称重车辆
        if ($("#txtplatName").val() != "") {
            sqlStr = "select Measure.MeasureID, Customer.CustomerName, Measure.VehicleNum, Material.MaterialName from Measure, Customer, Material, LadeBill where Measure.CustomerID = Customer.CustomerID and Measure.MaterialID = Material.MaterialID and Measure.LadeBillID = LadeBill.LadeBillID and Measure.MeasureType = '销售称重' and Measure.Closed = '0' and LadeBill.LadeDate = convert(varchar(8),getdate(),112) ";
            sqlStr += " and Measure.Audit = '0' and Measure.State = '已提交' and Platform = '" + platName + "' and Customer.CustomerCode='" + $("#txtICCustomerCode").val() + "'";

            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, vehicleGrid, vehicleDataList);
                }(ISystemService.execQuery.resultValue));
            }
        }

        $("#btnReadCard").attr("disabled", true);
        $("#txtICPassword").attr("disabled", true);
        $("#btnidentity").attr("disabled", true);

        //清空IC卡编码信息
        try {
            var fso, file;
            fso = new ActiveXObject("Scripting.FileSystemObject");
            file = fso.OpenTextFile("C:\\card.cnp", 2, true);
            file.Write("empty");
            file.Close();
        }
        catch (e) {
            alert(e);
        }

        if (vehicleDataList.rows.length == 0) {
            alert("当前客户没有可以放行的车辆!");
            init();
            return false;
        }
        else {
           
            return true;
        }      
    }
   
    function selected() {
        $("#btnReadCard").attr("disabled", true);
        $("#txtICPassword").attr("disabled", true);
        $("#btnidentity").attr("disabled", true);
        $("#btnsave").attr("disabled", false);
    }
})