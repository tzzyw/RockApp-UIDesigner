
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid, vehiclePop, vehicleQuickGrid,
      ladeBill = null,
	  customer = null,
      planSale = null,
      customerPlanQuantity = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,LadeBill,Customer,Material,Measure,CustomerPlanApply,PlanSale,CustomerPlanQuantity,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginbillingTime", beginDate);


                toolBar.setValue("endbillingTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //处理初始化加载数据
        sqlStr = "select top 100 [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], [LadeBill].[quotedPrice], Convert(decimal(18,2),[PlanQuantity]), [LadeBill].[actualQuantity], [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[ContractID] < 0 and [LadeBill].[state] = '已提交' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }

        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] join [ProductMarketing] on [MaterialID] = [ProductID] and [Available] = '1' and [ForSale] = '1' and [PersonName] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("combomaterialSearch", "产品", 1, "button", "产品")
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
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("billingTimeBegin", null, "开票日期");
    toolBar.addInput("beginbillingTime", null, "", 60);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 60);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 80);
    toolBar.addButtonSelect("combomaterialSearch", null, "产品", [], null, null, true, true, 15, "select")
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if ($.trim(toolBar.getValue("beginbillingTime")) == "") {
                    alert("起始开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginbillingTime"), "-")) {
                    alert("起始开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endbillingTime")) == "") {
                    alert("截止开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endbillingTime"), "-")) {
                    alert("截止开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                sqlStr = "select [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], [LadeBill].[quotedPrice], [LadeBill].[planQuantity], [LadeBill].[actualQuantity], [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[ContractID] < 0 and [LadeBill].[state] = '已提交' ";

                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }

                if (toolBar.getItemText("combomaterialSearch") != "产品") {
                    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
        }
    });

    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,客户名称,产品名称,挂牌单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");
    listGrid.setInitWidths("40,0,180,100,80,100,100,120,80,80,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#formTitle").text("调整提货单");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "LadeBill";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                ladeBill = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtladeBillNum").val(ladeBill.ladeBillNum);
        $("#txtbillingTime").val(ladeBill.billingTime.split(' ')[0]);
        $("#txtcontractNum").val(ladeBill.contractNum);
        $("#txtcustomerID").val(ladeBill.customerID);
        $("#txtcustomer").val(listGrid.cells(rowID, 2).getValue());
        $("#txtmaterial").val(listGrid.cells(rowID, 3).getValue());
        $("#txtmaterial").val(listGrid.cells(rowID, 3).getValue());
        $("#txtmaterialGrade").val(ladeBill.materialLevel);
        $("#txtpicker").val(ladeBill.picker);
        $("#txtplanQuantity").val(ladeBill.planQuantity);
        $("#txtactualQuantity").val(ladeBill.actualQuantity);
        $("#txtquotedPrice").val(ladeBill.quotedPrice);
        $("#txtpipePrice").val(ladeBill.pipePrice);
        $("#txtplanTotal").val(ladeBill.planTotal);
        $("#txtactualTotal").val(ladeBill.actualTotal);
        $("#txtladeDate").val(ladeBill.ladeDate.split(' ')[0]);
        $("#txtladenPlace").val(ladeBill.ladenPlace);
        $("#txtshipType").val(ladeBill.shipType);
        $("#txtvehicle").val(ladeBill.plateNumber);
        $("#txtdestination").val(ladeBill.destination);
        $("#txtpacking").val(ladeBill.packing);
        $("#chkweight").attr("checked", ladeBill.weight);
        $("#txtagent").val(ladeBill.agent);
        $("#txtcomment").val(ladeBill.comment);
        $("#txtsettleTotal").val(ladeBill.settleTotal);
        $("#txtmeasure").val(ladeBill.measure);
        //获取客户可用余额
        IBusinessService.getCustomerBalance.customerID = ladeBill.customerID;
        rock.AjaxRequest(IBusinessService.getCustomerBalance, rock.exceptionFun);
        if (IBusinessService.getCustomerBalance.success) {
            (function (e) {
                $("#txtcustomerBalance").val(e.value);
            }(IBusinessService.getCustomerBalance.resultValue))
        }
        //获取运输单位
        ISystemService.getObjectProperty.objName = "Measure";
        ISystemService.getObjectProperty.property = "Shiper";
        ISystemService.getObjectProperty.ojbID = ladeBill.measureID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                $("#txtcarrier").val(e.value);
            }(ISystemService.getObjectProperty.resultValue));
        }
        //获取净重
        ISystemService.getObjectProperty.objName = "Measure";
        ISystemService.getObjectProperty.property = "NetWeight";
        ISystemService.getObjectProperty.ojbID = ladeBill.measureID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                $("#txtnetWeight").val(e.value);
            }(ISystemService.getObjectProperty.resultValue));
        }
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(390);
    editForm.width(650);
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

    //保存
    $("#btn_Save").click(function () {
        if (!$("#txtquotedPrice").validate("number", "挂牌单价")) {
            return false;
        }
        ladeBill.quotedPrice = parseFloat($("#txtquotedPrice").val());

        ladeBill.planTotal = parseFloat($("#txtplanTotal").val());

        if ($.trim($("#txtcomment").val()) != '') {
            ladeBill.comment = $("#txtcomment").val();
        }
        else {
            ladeBill.comment = null;
        }

        ISystemService.modifyDynObject.dynObject = ladeBill;
        rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
        if (ISystemService.modifyDynObject.success) {
            for (var i = 0; i < dictDataList.rows.length; i++) {
                if (dictDataList.rows[i].id == ladeBill.ladeBillID) {

                    dictDataList.rows[i].data[9] = $("#txtdestination").val();

                }
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("提货单调整完成!");
        }
    });
    $("#txtquotedPrice").blur(CalcJE);
    function CalcJE() {
        var txt计划提货数量 = $("#txtplanQuantity").val();
        var txt挂牌单价 = $("#txtquotedPrice").val();
        var txt管输单价 = $("#txtpipePrice").val();
        var txt计划量总金额 = $("#txtplanTotal").val();
        var 挂牌单价 = 0;
        var 管输单价 = 0;
        var 单价 = 0;
        var 数量 = 0;
        var 金额 = 0;

        if (txt计划提货数量 != "") {

            if (rock.chknum(txt计划提货数量)) {
                数量 = parseFloat(txt计划提货数量);
            }
        }
        if (txt挂牌单价 != "") {
            if (rock.chknum(txt挂牌单价)) {
                挂牌单价 = parseFloat(txt挂牌单价);
            }
        }

        if (txt管输单价 != "") {
            if (rock.chknum(txt管输单价)) {
                管输单价 = parseFloat(txt管输单价);
            }
        }

        单价 = 挂牌单价 + 管输单价;
        金额 = 单价 * 数量;

        $("#txtplanTotal").val(Number(金额).toFixed(2).toString());
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})