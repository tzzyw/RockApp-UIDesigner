
$(function () {
    //初始化系统通用变量
    var listGrid, editState, sqlStr, serverDate, vehiclePop, vehicleGrid, platName,
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

        $("#combomaterial").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] WHERE [Available] = '1' and [ForPurchase] = '1' order by [MaterialName]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterial").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }


        $("#combocustomer").empty();
        sqlStr = "SELECT [CustomerID],[CustomerName] FROM [Customer] WHERE [Available] = '1' and [ForPurchase] = '1' order by [CustomerName]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combocustomer").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }
        clearPage();
        platName = "己烷站台";
        $("#txtplatform").val(platName);
        editState = "新单";
        reFresh();
        if ($('#pizhong').attr('checked')) {
            getVehicle();
        }
        else {
            $("#txtheavyOperator").val(decodeURIComponent($.cookie('userTrueName')));
        }
    });
  
    //保存
    $("#btnsave").click(function () {

        if ($("#txtvehicleNum").val() == "") {
            alert("请输入车号!");
            $("#txtvehicleNum").focus()
            return;
        }

        if ($('#maozhong').attr('checked')) {
            if (!$("#txtgross").validate("number", "毛重")) {
                return false;
            }
           
            IBusinessService.getBillNO.objectType = "采购计量单";
            rock.AjaxRequest(IBusinessService.getBillNO, rock.exceptionFun);
            if (IBusinessService.getBillNO.success) {
                (function (e) {
                    $("#txtmeasureNum").val(e.value);
                }(IBusinessService.getBillNO.resultValue))
            }

            rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
            if (ISystemService.getServerDateTime.success) {
                (function (e) {
                    $("#txtgrossTime").val(e.value);
                }(ISystemService.getServerDateTime.resultValue));
            }
        }

        if ($('#pizhong').attr('checked')) {
            if ($("#txtmeasureID").val() == "") {
                alert("请先选择车辆!");
                $("#txtvehicle").focus()
                return;
            }
            if (!$("#txttare").validate("number", "皮重")) {
                return false;
            }
            if (!$("#txtnetWeight").validate("number", "净重")) {
                return false;
            }
            
            rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
            if (ISystemService.getServerDateTime.success) {
                (function (e) {
                    $("#txttareTime").val(e.value);
                }(ISystemService.getServerDateTime.resultValue));
            }
            $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
        }
        //editState = "已读数";
        //reFresh();


        if ($('#maozhong').attr('checked')) {
            measure = MeasureClass.createInstance();
            ISystemService.getNextID.typeName = "Measure";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    measure.measureID = e.value;
                    measure.measureNum = $("#txtmeasureNum").val();
                    measure.measureType = "采购称重";
                    measure.state = "已过毛重";
                    measure.closed = false;
                    measure.ladeBillIDID = -1;
                    measure.platform = platName;
                    measure.measureUnit = "吨";
                    measure.planQuantity = 0;
                    measure.materialID = $("#combomaterial").val();
                    measure.customerID = $("#combocustomer").val();
                    measure.agent = decodeURIComponent($.cookie('userTrueName'));
                    measure.vehicleNum = $("#txtvehicleNum").val();
                    measure.heavyOperator = $("#txtheavyOperator").val();
                    measure.working = false;
                    measure.gross = parseFloat($("#txtgross").val());
                    measure.deliveryTank = $("#txtdeliveryTank").val();
                    measure.comment = $("#txtcomment").val();
                    rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
                    if (ISystemService.getServerDateTime.success) {
                        (function (e) {
                            measure.createTime = e.value;
                            measure.grossTime = e.value;
                        }(ISystemService.getServerDateTime.resultValue));
                    }

                    ISystemService.addDynObject.dynObject = measure;
                    rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                    if (ISystemService.addDynObject.success) {
                        (function (e) {
                            //hideEditForm();
                        }(ISystemService.addDynObject.resultValue));
                    }

                }(ISystemService.getNextID.resultValue))
            }
            else {
                return;
            }
        }

        if ($('#pizhong').attr('checked')) {
            measure.tare = parseFloat($("#txttare").val());
            measure.tareTime = $("#txttareTime").val();
            measure.lightOperator = $("#txtlightOperator").val();
            measure.deliveryTank = $("#txtdeliveryTank").val();
            measure.netWeight = parseFloat($("#txtnetWeight").val());
            measure.state = "已过皮重";
            measure.comment = $("#txtcomment").val();
            ISystemService.modifyDynObject.dynObject = measure;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {

            }

        }
        editState = "已保存";
        reFresh();
        vehicleDataList = new rock.JsonList();
        vehicleGrid.clearAll();
    });

    //继续
    $("#btncontinue").click(function () {
        vehicleDataList = new rock.JsonList();
        vehicleGrid.clearAll();
        if ($('#pizhong').attr('checked')) {
            getVehicle();
        }
        clearPage();
        editState = "新单";
        reFresh();
    });

    $("#pizhong").change(function () {
        if ($('#pizhong').attr('checked')) {
            vehicleDataList = new rock.JsonList();
            vehicleGrid.clearAll();
            getVehicle();
            clearPage();
            editState = "新单";
            reFresh();
            $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
            $("#txtplatform").val(platName);
        }
    });
    $("#maozhong").change(function () {
        if ($('#maozhong').attr('checked')) {
            vehicleDataList = new rock.JsonList();
            vehicleGrid.clearAll();
            clearPage();
            editState = "新单";
            reFresh();
            $("#txtheavyOperator").val(decodeURIComponent($.cookie('userTrueName')));
            $("#txtplatform").val(platName);
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
        clearPage();
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
            rock.setSelectItem("combocustomer", measure.customerID, "value");
            rock.setSelectItem("combomaterial", measure.materialID, "value");
            $("#txtmeasureNum").val(measure.measureNum);
            $("#txtplatform").val(measure.platform);
            $("#txtvehicleNum").val(measure.vehicleNum);
            $("#txtplanQuantity").val(measure.planQuantity);
            $("#txttareTime").val(measure.tareTime);
            $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
            $("#txttare").val(measure.tare);
            $("#txtgrossTime").val(measure.grossTime);
            $("#txtheavyOperator").val(measure.heavyOperator);
            $("#txtgross").val(measure.gross);
            $("#txtnetWeight").val(measure.netWeight);
            $("#txtdeliveryTank").val(measure.deliveryTank);
            $("#txtsealNum").val(measure.sealNum);
            $("#txtcomment").val(measure.comment);
        }
        
        hidevehiclePop();
    });
    vehicleGrid.init();
    //vehicleGrid.detachHeader(0);
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

    function getVehicle() {
        //获取待称重车辆
        if ($("#txtplatName").val() != "") {
            sqlStr = "select Measure.MeasureID, Customer.CustomerName, Measure.VehicleNum, Material.MaterialName from Measure, Customer, Material where Measure.CustomerID = Customer.CustomerID and Measure.MaterialID = Material.MaterialID and Measure.MeasureType = '采购称重' and Measure.Closed = '0' ";
            sqlStr += " and Measure.State = '已过毛重' ", " and Platform = '" + platName + "'";

            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, vehicleGrid, vehicleDataList);
                }(ISystemService.execQuery.resultValue));
            }
        }
    }

    function clearPage() {
        $("#combocustomer").get(0).selectedIndex = 0;
        $("#combomaterial").get(0).selectedIndex = 0;
        $("#txtmeasureID").val("");
        $("#txtvehicle").val("");
        $("#txtmeasureNum").val("");
        $("#txtplatform").val("");
        $("#txtvehicleNum").val("");
        $("#txttareTime").val("");
        $("#txtlightOperator").val("");
        $("#txttare").val("");
        $("#txtgrossTime").val("");
        $("#txtheavyOperator").val("");
        $("#txtgross").val("");
        $("#txtnetWeight").val("");
        $("#txtdeliveryTank").val("");
        $("#txtcomment").val("");
    }

    function reFresh() {
        $("#txtvehicle").attr("disabled", true);
        $("#combocustomer").attr("disabled", true);
        $("#combomaterial").attr("disabled", true);
        $("#btnsave").attr("disabled", true);
        $("#btncontinue").attr("disabled", true);
        $("#txtsealNum").attr("disabled", true);
        $("#printMeasure").attr("disabled", true);
        $("#txtvehicleNum").attr("disabled", true);
        switch (editState) {
            case "新单":
                if ($('#maozhong').attr('checked')) {
                    $("#combocustomer").attr("disabled", false);
                    $("#combomaterial").attr("disabled", false);
                    $("#txtvehicleNum").attr("disabled", false);
                }
                if ($('#pizhong').attr('checked')) {
                    $("#txtvehicle").attr("disabled", false);
                }
                $("#btnsave").attr("disabled", false);
                break;
            case "已创建":
                if ($('#pizhong').attr('checked')) {
                    $("#txtvehicle").attr("disabled", false);
                }
                break;
            case "已读数":
                $("#btnsave").attr("disabled", false);
                if ($('#maozhong').attr('checked')) {
                    $("#combocustomer").attr("disabled", false);
                    $("#combomaterial").attr("disabled", false);
                    $("#txtvehicleNum").attr("disabled", false);

                } else {
                    $("#txtvehicle").attr("disabled", false);
                }
                break;
            case "已保存":
                $("#btncontinue").attr("disabled", false);
                $("#printMeasure").attr("disabled", false);
                $("#btnsave").attr("disabled", true);
                break;
        }
    }

    ////日期控件处理 
    //var dateboxArray = [];

    //dateboxArray.push("txtcreateTime");

    //dateboxArray.push("txttareTime");

    //dateboxArray.push("txtgrossTime");

    //myCalendar = new dhtmlXCalendarObject(dateboxArray);
    //myCalendar.loadUserLanguage('cn');

})