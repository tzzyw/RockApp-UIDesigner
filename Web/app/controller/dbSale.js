
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

        //getVehicle();       
        platName = "己烷站台";
        editState = "新单";
        reFresh();
        getWeightData();
        clearPage();
        var ctrl1 = document.getElementById("MFRC500Ctrl1");

    });

    //读卡
    $("#btnReadCard").click(function () {
        vbs()
        return;
        if (platName == "己烷站台") {
            ReadICCardNum(5, 1, 0, 0);
            ReadCustomerNum(5, 2, 0, 0);
        }
        if (platName == "1-丁烯站台") {
            ReadICCardNum(5, 1, 0, 0);
            ReadCustomerNum(5, 2, 0, 0);
        }
        $("#txtICPassword").val("");
        $("#txtICPassword").attr("disabled", true);
    });

    //身份验证
    $("#btnidentity").click(function () {
        vehicleDataList = new rock.JsonList();
        vehicleGrid.clearAll();
        clearPage();
        $("#txtICCustomerCode").val("0002");
        $("#txtICNum").val("011");
        $("#txtICPassword").val("123");
        alert("有测试代码,记得删除");

        if ($("#txtICNum").val() == "") {
            alert("IC卡芯片编号为空,请重新读卡!");
            $("#txtICPassword").val("");
            return;
        }
        if ($("#txtICCustomerCode").val() == "") {
            alert("IC卡客户编号为空,请重新读卡!");
            $("#txtICPassword").val("");
            return;
        }

        //根据客户编码获取客户IC卡
        IBusinessService.getICCardByNum.icNum = $("#txtICNum").val();
        rock.AjaxRequest(IBusinessService.getICCardByNum, rock.exceptionFun);
        if (IBusinessService.getICCardByNum.success) {
            (function (e) {
                iCCard = e;
            }(IBusinessService.getICCardByNum.resultValue))
        }
        if (iCCard != null) {
            if (iCCard.customerCode == $("#txtICCustomerCode").val()) {
                if (iCCard.password == $("#txtICPassword").val()) {
                    //验证通过
                    getVehicle();
                    //this.txtVehicle.Enabled = true;
                    $("#txtICPassword").val("");
                }
                else {
                    alert("密码错误!");
                    $("#txtICPassword").val("");
                    return;
                }
            }
            else {
                alert("IC卡客户编号和服务器客户信息不匹配,请联系管理员!");
                return;
            }
        }
        else {
            alert("IC卡未经发卡!");
            $("#txtICPassword").val("");
            return;
        }
    });
    //读数
    $("#btnreadNum").click(function () {
        if ($("#repeat").val() == "saved") {
            alert("当前车辆已经读数保存,请更换车辆后再读数!");
            return;
        }

        if ($("#txtmeasureID").val() == "") {
            alert("请先选择车辆!");
            $("#txtvehicle").focus()
            return;
        }
        if ($('#pizhong').attr('checked')) {
            if ($("#txtreadNum").val() != "") {
                if (parseFloat($("#txtreadNum").val()) < 0.5) {
                    alert("实际称重数据太小请刷新后重新称重");
                    return;
                }
                else {
                    $("#txttare").val($("#txtreadNum").val());
                }
            }
            else {
                return;
            }

            rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
            if (ISystemService.getServerDateTime.success) {
                (function (e) {
                    $("#txttareTime").val(e.value);
                }(ISystemService.getServerDateTime.resultValue));
            }
            $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
        }

        if ($('#maozhong').attr('checked')) {
            $("#txtgross").val($("#txtreadNum").val());
            $("#txtnetWeight").val(parseFloat($("#txtgross").val()) - parseFloat($("#txttare").val()));
            //this.txt净重.Text = Convert.ToString(Convert.ToDecimal(this.txt毛重.Text.Trim()) - Convert.ToDecimal(txt皮重.Text.Trim()));
            rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
            if (ISystemService.getServerDateTime.success) {
                (function (e) {
                    $("#txtgrossTime").val(e.value);
                }(ISystemService.getServerDateTime.resultValue));
            }
            $("#txtheavyOperator").val(decodeURIComponent($.cookie('userTrueName')));
        }
        editState = "已读数";
        reFresh();
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
            if ($('#pizhong').attr('checked')) {
                measure.tare = parseFloat($("#txttare").val());
                measure.tareTime = $("#txttareTime").val();
                measure.lightOperator = $("#txtlightOperator").val();
                measure.deliveryTank = $("#txtdeliveryTank").val();
                measure.state = "已过皮重";

                ISystemService.modifyDynObject.dynObject = measure;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                }

                ////处理大屏
                //try
                //{
                //    if (HD站台名称.Value == "己烷站台")
                //    {
                //        Gateways.BASEJW.Db.ExecuteNonQuery(CommandType.Text, "update Vehicle set 排序状态='已发货' where 计量单ID='" + HD计量单ID.Value + "' ");
                //    }
                //    if (HD站台名称.Value == "1-丁烯站台")
                //    {
                //        Gateways.BASEDX.Db.ExecuteNonQuery(CommandType.Text, "update Vehicle set 排序状态='已发货' where 计量单ID='" + HD计量单ID.Value + "' ");
                //    }
                //}
                //catch (Exception ex)
                //{
                //}

            }
            if ($('#maozhong').attr('checked')) {
                measure.gross = parseFloat($("#txtgross").val());
                measure.grossTime = $("#txtgrossTime").val();
                measure.heavyOperator = $("#txtheavyOperator").val();
                measure.netWeight = parseFloat($("#txtnetWeight").val());
                measure.sealNum = $("#txtsealNum").val();
                measure.deliveryTank = $("#txtdeliveryTank").val();
                measure.state = "已过毛重";

                ISystemService.modifyDynObject.dynObject = measure;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    $("#printExit").click(function () {
                        window.open("CMZPrint.html?id=" + measure.measureID);
                    });
                    //this.HyperLink打印出门证.NavigateUrl = "CMZPrint.aspx?ID=" + o计量单.计量单ID;
                    //if (o计量单.销售提货ID.HasValue)
                    //{
                    //    this.HyperLink打印提货单.NavigateUrl = "LadeBillPrint.aspx?ID=" + o计量单.销售提货ID.Value;
                    //}
                    $("#printLadeBill").click(function () {
                        window.open("LadeBillPrint.html?id=" + measure.ladeBillID);
                    });
                }
            }
            $("#printMeasure").click(function () {
                window.open("WeightPrint.html?id=" + measure.measureID);
            });
            //$('#printMeasure').attr('href', 'WeightPrint.html');
            //this.HyperLink打印磅单.NavigateUrl = "WeightPrint.aspx?ID=" + o计量单.计量单ID;
        }

        editState = "已保存";
        reFresh();

        $("#txtICCustomerCode").val("");
        $("#txtICNum").val("");
        $("#txtcustomerID").val("");
        $("#repeat").val("saved");
        vehicleDataList = new rock.JsonList();
        vehicleGrid.clearAll();
    });

    //继续
    $("#btncontinue").click(function () {
        vehicleDataList = new rock.JsonList();
        vehicleGrid.clearAll();
        $("#txtICCustomerCode").val("");
        $("#txtICNum").val("");
        $("#txtcustomerID").val("");
        $("#repeat").val("");
        clearPage();
        editState = "新单";
        reFresh();
    });

    $("#pizhong").change(function () {
        if ($('#pizhong').attr('checked')) {
            vehicleDataList = new rock.JsonList();
            vehicleGrid.clearAll();
            clearPage();
            editState = "新单";
            reFresh();
        }
    });
    $("#maozhong").change(function () {
        if ($('#maozhong').attr('checked')) {
            vehicleDataList = new rock.JsonList();
            vehicleGrid.clearAll();
            clearPage();
            editState = "新单";
            reFresh();
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
                        $("#txtladeDate").val(e.value);
                    }(ISystemService.getObjectProperty.resultValue));
                }

            }
            $("#txttareTime").val(measure.tareTime);
            $("#txtlightOperator").val(measure.lightOperator);
            $("#txttare").val(measure.tare);
            $("#txtgrossTime").val(measure.grossTime);
            $("#txtheavyOperator").val(measure.heavyOperator);
            $("#txtgross").val(measure.gross);
            $("#txtnetWeight").val(measure.netWeight);
            $("#txtdeliveryTank").val(measure.deliveryTank);
            $("#txtsealNum").val(measure.sealNum);
            $("#txtcomment").val(measure.comment);
        }
        $("#repeat").val("");
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
            sqlStr = "select Measure.MeasureID, Customer.CustomerName, Measure.VehicleNum, Material.MaterialName from Measure, Customer, Material, LadeBill where Measure.CustomerID = Customer.CustomerID and Measure.MaterialID = Material.MaterialID and Measure.LadeBillID = LadeBill.LadeBillID and Measure.MeasureType = '销售称重' and Measure.Closed = '0' and LadeBill.LadeDate = convert(varchar(8),getdate(),112) ";
            if ($('#maozhong').attr('checked')) {
                sqlStr += " and Measure.State = '已过皮重' ", " and Platform = '" + platName + "' and Customer.CustomerCode='" + $("#txtICCustomerCode").val() + "'";
            }
            if ($('#pizhong').attr('checked')) {
                sqlStr += " and Measure.State = '已提交' ", " and Platform = '" + platName + "' and Customer.CustomerCode='" + $("#txtICCustomerCode").val() + "'";
            }

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
        $("#txttareTime").val("");
        $("#txtlightOperator").val("");
        $("#txttare").val("");
        $("#txtgrossTime").val("");
        $("#txtheavyOperator").val("");
        $("#txtgross").val("");
        $("#txtnetWeight").val("");
        $("#txtdeliveryTank").val("");
        $("#txtsealNum").val("");
        $("#txtcomment").val("");
        $("#txtladeDate").val("");
        $("#repeat").val("");
    }

    function reFresh() {
        $("#btnreadNum").attr("disabled", true);
        $("#btnsave").attr("disabled", true);
        $("#btncontinue").attr("disabled", true);
        $("#txtsealNum").attr("disabled", true);
        $("#printMeasure").attr("disabled", true);
        $("#printMeasure").css('cursor', 'default');
        $("#printExit").attr("disabled", true);
        $("#printExit").css('cursor', 'default');
        $("#printLadeBill").attr("disabled", true);
        $("#printLadeBill").css('cursor', 'default');
        switch (editState) {
            case "新单":
                if ($('#maozhong').attr('checked')) {
                    $("#txtsealNum").attr("disabled", false);
                }
                break;
            case "已创建":
                if ($('#maozhong').attr('checked')) {
                    $("#txtsealNum").attr("disabled", false);
                }
                //this.btn读数.Enabled = true;
                break;
            case "已读数":
                $("#btnsave").attr("disabled", false);
                if ($('#maozhong').attr('checked')) {
                    $("#txtsealNum").attr("disabled", false);
                }
                break;
            case "已保存":
                $("#btncontinue").attr("disabled", false);
                $("#printMeasure").attr("disabled", false);
                $("#printMeasure").css('cursor', 'pointer');
                if ($('#maozhong').attr('checked')) {
                    $("#printExit").attr("disabled", false);
                    $("#printExit").css('cursor', 'pointer');
                    $("#printLadeBill").attr("disabled", false);
                    $("#printLadeBill").css('cursor', 'pointer');
                }
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