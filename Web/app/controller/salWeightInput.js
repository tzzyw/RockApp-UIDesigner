
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      measure = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,ICommonService,IBusinessService,DataTable,DataRow,DataColumn,Measure";
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

        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("begintareTime", beginDate);


                toolBar.setValue("endtareTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        $('#llj').attr('checked', true);       
        $('#pizhong').attr('checked', false);
        $('#maozhong').attr('checked', false);
        $("#btn_Save").attr("disabled", true);
        //初始化实体参照及查询项
        sqlStr = "SELECT [CustomerID],[CustomerName] FROM [Customer] order by CustomerName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where ForSale = '1' order by MaterialName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("combomaterialSearch", "物料", 1, "button", "物料")
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        toolBar.addListOption("combomaterialSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        customerComplete("");

        getDataList();    

        //绑定控件失去焦点验证方法
        //MeasureClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("tareTimeBegin", null, "提货日期");
    toolBar.addInput("begintareTime", null, "", 55);
    toolBar.addText("提货日期End", null, "-");
    toolBar.addInput("endtareTime", null, "", 55);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addButtonSelect("combomaterialSearch", null, "物料", [], null, null, true, true, 15, "select")
    toolBar.addText("vehicleNum", null, "车号");
    toolBar.addInput("txtvehicleNumSearch", null, "", 50);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addInput("input1", null, "");   
    toolBar.addSeparator("sepAdd", null);
    toolBar.addInput("input2", null, "");
    toolBar.addSeparator("sepinput", null);
    toolBar.addButton("input", null, "录入计量数据");  
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                hideEditForm();
                if ($.trim(toolBar.getValue("begintareTime")) == "") {
                    alert("起始皮重时间不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begintareTime"), "-")) {
                    alert("起始皮重时间格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endtareTime")) == "") {
                    alert("截止皮重时间不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endtareTime"), "-")) {
                    alert("截止皮重时间格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                getDataList();             
                break;
            case "input":          
                editState = "modify";
                $("#formTitle").text("编辑计量单");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        ISystemService.getDynObjectByID.dynObjectID = checked;
                        ISystemService.getDynObjectByID.structName = "Measure";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                measure = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        if ($('#llj').attr('checked')) {
                            $("#formTitle").text("流量计计量单录入");
                            $("#dbcz1").css("display", "none");
                            $("#dbcz2").css("display", "none");
                            $("#pzsj").text("发货时间");
                            $("#pz").text("实际量");
                            $("#sby").text("司磅员");
                            $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
                            editForm.height(250);
                        }
                        else {
                            $("#formTitle").text("地磅计量单录入");
                            $('#dbcz1').removeAttr("style");
                            $('#dbcz2').removeAttr("style");
                            $("#pzsj").text("皮重时间");
                            $("#pz").text("皮重(吨)");
                            $("#sby").text("轻车司磅员");
                            if ($('#pizhong').attr('checked')) {
                                $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
                                $("#txtheavyOperator").val("");
                            }
                            else {
                                $("#txtlightOperator").val(measure.lightOperator);
                                $("#txtheavyOperator").val(decodeURIComponent($.cookie('userTrueName')));
                            }
                            editForm.height(310);
                        }
                      

                        $("#txtmeasureNum").val(measure.measureNum);
                        ISystemService.getObjectProperty.objName = "LadeBill";
                        ISystemService.getObjectProperty.property = "LadeBillNum";
                        ISystemService.getObjectProperty.ojbID = measure.ladeBillID;
                        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                        if (ISystemService.getObjectProperty.success) {
                            (function (e) {
                                $("#txtladeBillNo").val(e.value);
                            }(ISystemService.getObjectProperty.resultValue));
                        }

                        $("#txtcustomerID").val(measure.customerID);
                        $("#txtcustomer").val(listGrid.cells(checked, 3).getValue());
                        $("#txtmaterial").val(listGrid.cells(checked, 4).getValue() + measure.materialLevel);
                        $("#txtvehicleNum").val(measure.vehicleNum);
                        $("#txtplanQuantity").val(measure.planQuantity);
                        $("#txttare").val(measure.tare);
                        $("#txttareTime").val(measure.tareTime);
                        
                        $("#txtgross").val(measure.gross);
                        $("#txtgrossTime").val(measure.grossTime);
                        
                        $("#txtnetWeight").val(measure.netWeight);
                        $("#txtdeliveryTank").val(measure.deliveryTank);
                        $("#txtsealNum").val(measure.sealNum);
                        $("#txtcomment").val(measure.comment);
                        $("#btn_Save").attr("disabled", false);
                        showEditForm();
                    }
                    else {
                        alert("请仅选择一条要录入计量数据的行!");
                    }
                }
                else {
                    alert("请选择要录入计量数据的行!");
                }
                break;
        }
    });

    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";
    toolBar.getInput("input1").id = "input1";
    $("#input1").css("display", "none");
    $("#input1").after("<input id='llj' type='radio' name='sex' checked='checked'/>流量计<input id='db' type='radio' name='sex' style='margin-left:5px;margin-top:3px'/>地磅");

    toolBar.getInput("input2").id = "input2";
    $("#input2").css("display", "none");
    $("#input2").after("<input id='pizhong' type='radio' name='type' checked='checked'/>皮重<input id='maozhong' type='radio' name='type' style='margin-left:5px;margin-top:3px'/>毛重");


    //初始化计量单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,计量单编号,客户名称,物料名称,产品等级,车号,提货日期");
    listGrid.setInitWidths("40,0,110,200,150,70,120,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Measure";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                measure = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        if ($('#llj').attr('checked')) {
            $("#formTitle").text("流量计计量单录入");
            $("#dbcz1").css("display", "none");
            $("#dbcz2").css("display", "none");
            $("#pzsj").text("发货时间");
            $("#pz").text("实际量(吨)");
            $("#sby").text("司磅员");
            $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
            editForm.height(250);
        }
        else {
            $("#formTitle").text("地磅计量单录入");
            $('#dbcz1').removeAttr("style");
            $('#dbcz2').removeAttr("style");
            $("#pzsj").text("皮重时间");
            $("#pz").text("皮重(吨)");
            $("#sby").text("轻车司磅员");
            if ($('#pizhong').attr('checked')) {
                $("#txtlightOperator").val(decodeURIComponent($.cookie('userTrueName')));
                $("#txtheavyOperator").val("");
            }
            else {
                $("#txtlightOperator").val(measure.lightOperator);
                $("#txtheavyOperator").val(decodeURIComponent($.cookie('userTrueName')));
            }
            editForm.height(310);
        }     

        $("#txtmeasureNum").val(measure.measureNum);
        ISystemService.getObjectProperty.objName = "LadeBill";
        ISystemService.getObjectProperty.property = "LadeBillNum";
        ISystemService.getObjectProperty.ojbID = measure.ladeBillID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                $("#txtladeBillNo").val(e.value);
            }(ISystemService.getObjectProperty.resultValue));
        }

        $("#txtcustomerID").val(measure.customerID);
        $("#txtcustomer").val(listGrid.cells(rowID, 3).getValue());
        $("#txtmaterial").val(listGrid.cells(rowID, 4).getValue() + measure.materialLevel);
        $("#txtvehicleNum").val(measure.vehicleNum);
        $("#txtplanQuantity").val(measure.planQuantity);
        $("#txttare").val(measure.tare);
        $("#txttareTime").val(measure.tareTime);
       
        $("#txtgross").val(measure.gross);
        $("#txtgrossTime").val(measure.grossTime);
        $("#txtnetWeight").val(measure.netWeight);
        $("#txtdeliveryTank").val(measure.deliveryTank);
        $("#txtsealNum").val(measure.sealNum);
        $("#txtcomment").val(measure.comment);
        $("#btn_Save").attr("disabled", false);
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(350);
    editForm.width(750);
    editForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;

        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                editForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    editForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideEditForm();
    function hideEditForm() {
        editForm.css({ top: 200, left: -1300 }).hide();
        editForm.css("visibility", "visible");
    }
    function showEditForm() {
        editForm.css({ top: 100, left: 180 }).show();
    }
    //取消
    $("#btn_Cancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //处理编辑项

    $("#llj").change(function () {
        if ($('#llj').attr('checked')) {         
            $('#pizhong').attr('checked', false);
            $('#maozhong').attr('checked', false);           
        }
        getDataList();
        hideEditForm();
    });
    $("#db").change(function () {
        if ($('#db').attr('checked')) {
            $('#pizhong').attr('checked', true);
            $('#maozhong').attr('checked', false);
        }
        getDataList();
        hideEditForm();
    });

    $("#pizhong").change(function () {
        if ($('#llj').attr('checked')) {
            $('#pizhong').attr('checked', false);
            $('#maozhong').attr('checked', false);
        }
        else {
            getDataList();
        }
        hideEditForm();
    });
    $("#maozhong").change(function () {
        if ($('#llj').attr('checked')) {
            $('#pizhong').attr('checked', false);
            $('#maozhong').attr('checked', false);
        }
        else {
            getDataList();
        }
        hideEditForm();
    });

    function getDataList() {
        sqlStr = "select [Measure].[MeasureID], [Measure].[measureNum], [Customer].[CustomerName], [Material].[MaterialName], [Measure].[materialLevel], [Measure].[vehicleNum], convert(nvarchar(10),[LadeBill].[LadeDate],120) ascreateTime from [Measure] join [Customer] on [Measure].[customerID] = [Customer].[customerID] join [Material] on [Measure].[materialID] = [Material].[materialID] join LadeBill on Measure.LadeBillID = LadeBill.LadeBillID and Measure.MeasureType='销售称重' and Measure.Closed='0' and Measure.Platform='" + platName + "'";

        if ($('#llj').attr('checked')) {
            sqlStr += " and Measure.State='已提交'";
        }

        if ($('#db').attr('checked')) {
            if ($('#pizhong').attr('checked')) {
                sqlStr += " and Measure.State='已提交'";
            }
            if ($('#maozhong').attr('checked')) {
                sqlStr += " and Measure.State='已过皮重' and Measure.Tare > 0";
            }
        }

        sqlStr += " and [LadeBill].[LadeDate] between '" + toolBar.getValue("begintareTime") + " 0:0:0' AND '" + toolBar.getValue("endtareTime") + " 23:59:59' ";

        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }

        if (toolBar.getItemText("combomaterialSearch") != "物料") {
            sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
        }

        if (toolBar.getValue("txtvehicleNumSearch") != "") {
            sqlStr += " and [Measure].[vehicleNum] like '%" + toolBar.getValue("txtvehicleNumSearch") + "%'";
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    //保存
    $("#btn_Save").click(function () {

        if ($('#llj').attr('checked')) {
            if (!$("#txttare").validate("number", "实际量")) {
                return false;
            }
            measure.tare = 0;
            measure.gross = parseFloat($("#txttare").val());
            measure.lightOperator = $("#txtlightOperator").val();
            measure.heavyOperator = $("#txtlightOperator").val();
            measure.netWeight = measure.gross;
            measure.state = "已过毛重";
            IBusinessService.inputMeasure.type = "流量计";
            rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
            if (ISystemService.getServerDateTime.success) {
                (function (e) {                   
                    measure.tareTime = e.value;
                    measure.grossTime = e.value;
                }(ISystemService.getServerDateTime.resultValue));
            }
        }

        if ($('#db').attr('checked')) {
            if ($('#pizhong').attr('checked')) {
                if (!$("#txttare").validate("number", "皮重")) {
                    return false;
                }
                measure.tare = parseFloat($("#txttare").val());
                measure.lightOperator = $("#txtlightOperator").val();
                measure.state = "已过皮重";
                IBusinessService.inputMeasure.type = "皮重";
                rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
                if (ISystemService.getServerDateTime.success) {
                    (function (e) {
                        measure.tareTime = e.value;
                    }(ISystemService.getServerDateTime.resultValue));
                }
            }
            if ($('#maozhong').attr('checked')) {
                if (!$("#txtgross").validate("number", "毛重")) {
                    return false;
                }
                if (!$("#txtnetWeight").validate("number", "净重")) {
                    return false;
                }
                measure.gross = parseFloat($("#txtgross").val());
                measure.heavyOperator = $("#txtheavyOperator").val(); 
                measure.state = "已过毛重";
                measure.netWeight = parseFloat($("#txtnetWeight").val());
                IBusinessService.inputMeasure.type = "毛重";
                rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
                if (ISystemService.getServerDateTime.success) {
                    (function (e) {
                        measure.grossTime = e.value;
                    }(ISystemService.getServerDateTime.resultValue));
                }
            }
        }

        measure.deliveryTank = $("#txtdeliveryTank").val();
        measure.sealNum = $("#txtsealNum").val();
        measure.comment = $("#txtcomment").val();

        IBusinessService.inputMeasure.measure = measure;

        
        rock.AjaxRequest(IBusinessService.inputMeasure, rock.exceptionFun);
        if (IBusinessService.inputMeasure.success) {
            (function (e) {
                $("#btn_Save").attr("disabled", true);
                getDataList();
                refreshToolBarState();
                hideEditForm();
                alert("计量数据录入成功!");
            }(IBusinessService.inputMeasure.resultValue))
        }
    });

    //加载弹窗Div

    $(document.body).append('<div id="customerPop" style="width: 260px; height: 400px; position: absolute; background-color: White;display: none;z-index:9"><div id="customerQuickGrid" style="width: 260px; height: 400px; float: left; border: 1px solid #E3E3E3;"></div></div>');
    customerQuickGrid = new dhtmlXGridObject("customerQuickGrid");
    customerQuickGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerQuickGrid.setSkin("dhx_skyblue");
    customerQuickGrid.setHeader(",,");
    customerQuickGrid.setInitWidths("0,0,*");
    customerQuickGrid.setColAlign("center,center,left");
    customerQuickGrid.setColSorting("na,na,str");
    customerQuickGrid.setColTypes("ro,ro,ro");
    customerQuickGrid.enableDistributedParsing(true, 20);
    customerQuickGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#txtcustomerID").val(rowID)
        $("#txtcustomer").val(customerQuickGrid.cells(rowID, 2).getValue())
        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);
    customerPop = $("#customerPop")
    $('#txtcustomerSearch').focus(function (e) {
        showcustomerPop();
    });

    function showcustomerPop() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });
    var customerDataList = new rock.JsonList();
    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 20 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + $("#txtcustomerSearch").val() + "%' or [SearchCode] like  '%" + $("#txtcustomerSearch").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    $('#mainPage').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }

    });


    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("input");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("input");
            }
            else {
                toolBar.enableItem("input");
            }
        }
    }

    ////日期控件处理 
    //var dateboxArray = [];

    //dateboxArray.push(toolBar.getInput("begintareTime"));

    //dateboxArray.push(toolBar.getInput("endtareTime"));

    //dateboxArray.push("txttareTime");

    //dateboxArray.push("txtgrossTime");

    //myCalendar = new dhtmlXCalendarObject(dateboxArray);
    //myCalendar.loadUserLanguage('cn');

})