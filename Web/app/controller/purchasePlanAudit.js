$(function () {
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IEquipmentService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var toolBar, dhxLayout, purchasePlanGrid, purchasePlanDetailGrid, queryForm, auditForm, serverDate, beginDate, auditHistoryGrid, detailForm,
            planState = "",
        purchasePlanDataList = new rock.JsonList(),
        purchasePlanDetailDataList = new rock.JsonList(),
        auditHistoryDataList = new rock.JsonList();
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
        dhxLayout.cells("a").attachObject("purchasePlanDiv");
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();

        //初始化Tab页内容
        tabbar = dhxLayout.cells("b").attachTabbar();
        tabbar = dhxLayout.cells("b").attachTabbar();
        tabbar.addTab("detail", "采购计划明细", 100, 1);
        tabbar.addTab("auditHistory", "计划审批历史", 100, 2);
        tabbar.tabs("detail").setActive();

        tabbar.tabs("detail").attachObject("purchasePlanDetailDiv");
        tabbar.tabs("auditHistory").attachObject("auditHistoryDiv");

        //初始化参数页面工具条
        toolBar = new dhtmlXToolbarObject("toobar");
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
        toolBar.addText("起始日期", null, "起止日期");
        toolBar.addInput("beginDate", null, "", 75);
        toolBar.addText("截止日期", null, "-");
        toolBar.addInput("endDate", null, "", 75);
        toolBar.addText("提报人", null, "提报人");
        toolBar.addInput("handler", null, "", 75);
        toolBar.addButton("query", null, "", "search.gif", "search.gif");
        toolBar.addSeparator("001", null);
        toolBar.addButton("audit", null, "采购计划审批");
        toolBar.addSeparator("002", null);
        toolBar.addButton("unVerify", null, "采购计划弃审");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "query":
                    if ($.trim(toolBar.getValue("beginDate")) == "") {
                        alert("起始日期不能为空！");
                        return;
                    }
                    if ($.trim(toolBar.getValue("endDate")) == "") {
                        alert("截止日期不能为空！");
                        return;
                    }
                    if (!rock.chkdate(toolBar.getValue("beginDate"), "-")) {
                        alert("起始日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }
                    if (!rock.chkdate(toolBar.getValue("endDate"), "-")) {
                        alert("截止日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }
                    sql = "SELECT PurchasePlanID,convert(nvarchar(10),ApplyDate,120),Explain,ProjectNo,Handler,State,Comment from PurchasePlan where ApplyDate BETWEEN '" + toolBar.getValue("beginDate") + "' AND '" + toolBar.getValue("endDate") + "' AND State in ('已核实','已审核')";
                    if (toolBar.getValue("handler") != "") {
                        sql += " and Handler like  '%" + toolBar.getValue("handler") + "%'";
                    }
                    ISystemService.execQuery.sqlString = sql;
                    rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                    if (ISystemService.execQuery.success) {
                        (function (e) {
                            var rows = e.rows;
                            purchasePlanDataList.rows = [];
                            purchasePlanGrid.clearAll();
                            for (var i = 0; i < rows.length; i++) {
                                var rowResult = rows[i].values;
                                var listdata = new rock.JsonData(rowResult[0].value);
                                listdata.data[0] = 0;
                                listdata.data[1] = rowResult[0].value;
                                listdata.data[2] = rowResult[1].value;
                                listdata.data[3] = rowResult[2].value;
                                listdata.data[4] = rowResult[3].value;
                                listdata.data[5] = rowResult[4].value;
                                listdata.data[6] = rowResult[5].value;
                                listdata.data[7] = rowResult[6].value;
                                purchasePlanDataList.rows.push(listdata);
                            }
                            purchasePlanGrid.parse(purchasePlanDataList, "json");
                        }(ISystemService.execQuery.resultValue));
                    } break;
                case "audit":
                    $("#lblOpinion").text("审批意见");
                    $("#auditFormTitle").text("审批采购计划");
                    $("#txtOpinion").val("");
                    $("#txtType").val("审批");
                    showVerifyForm();
                    break;
                case "unVerify":
                    $("#lblOpinion").text("弃审说明");
                    $("#auditFormTitle").text("弃审采购计划");
                    $("#txtOpinion").val("");
                    $("#txtType").val("弃审");
                    showVerifyForm();
                    break;
            }
        });
        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                toolBar.setValue("beginDate", beginDate);
                toolBar.setValue("endDate", serverDate);
            }(ISystemService.getServerDate.resultValue));
        }
        //初始化采购计划表格
        purchasePlanGrid = new dhtmlXGridObject('purchasePlanGrid');
        purchasePlanGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        purchasePlanGrid.setHeader("序号,,提报日期,计划名称,项目编号,提报人,计划状态,备注");
        purchasePlanGrid.setInitWidths("40,0,80,200,70,60,80,*");
        purchasePlanGrid.setColAlign("center,center,left,left,left,left,left,left");
        purchasePlanGrid.setSkin("dhx_skyblue");
        purchasePlanGrid.setColSorting("na,na,str,str,str,str,str,str");
        purchasePlanGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro");
        purchasePlanGrid.enableDistributedParsing(true, 20);
        purchasePlanGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
            getPurchasePlanDetail(rowID);
            getauditHistory(rowID);
            planState = purchasePlanGrid.cells(rowID, 6).getValue();
            refreshToolBarState();
        });
        purchasePlanGrid.init();

        //初始化采购计划明细表格
        purchasePlanDetailGrid = new dhtmlXGridObject('purchasePlanDetailGrid');
        purchasePlanDetailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        purchasePlanDetailGrid.setHeader("序号,,物料名称,规格型号,单位,计划数量,单价,金额,生产厂商,需求日期,需求班组,计划来源,备注");
        purchasePlanDetailGrid.setInitWidths("40,0,120,160,40,80,50,70,120,70,70,60,*");
        purchasePlanDetailGrid.setColAlign("center,center,left,left,left,left,center,center,left,left,left,left,left");
        purchasePlanDetailGrid.setSkin("dhx_skyblue");
        purchasePlanDetailGrid.setColSorting("na,str,str,str,str,str,str,str,str,str,str,str,str");
        purchasePlanDetailGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        purchasePlanDetailGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            var selectedId = purchasePlanGrid.getSelectedRowId();
            if (purchasePlanGrid.cells(selectedId, 6).getValue() == "已核实") {
                $("#txtQuantity").val(purchasePlanDetailGrid.cells(rowID, 5).getValue());
                $("#txtPrice").val(purchasePlanDetailGrid.cells(rowID, 6).getValue());
                $("#txtAmount").val(purchasePlanDetailGrid.cells(rowID, 7).getValue());
                $("#txtDetailID").val(rowID);
                showDetailForm();
            }
        });
        purchasePlanDetailGrid.enableDistributedParsing(true, 20);
        purchasePlanDetailGrid.init();

        ISystemService.execQuery.sqlString = "SELECT PurchasePlanID,convert(nvarchar(10),ApplyDate,120),Explain,ProjectNo,Handler,State,Comment from PurchasePlan where ApplyDate BETWEEN '" + beginDate + "' AND '" + serverDate + "' AND State in ('已核实','已审核')";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                purchasePlanDataList.rows = [];
                purchasePlanGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;
                    listdata.data[3] = rowResult[2].value;
                    listdata.data[4] = rowResult[3].value;
                    listdata.data[5] = rowResult[4].value;
                    listdata.data[6] = rowResult[5].value;
                    listdata.data[7] = rowResult[6].value;
                    purchasePlanDataList.rows.push(listdata);
                }
                purchasePlanGrid.parse(purchasePlanDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }

        //初始化审批历史
        auditHistoryGrid = new dhtmlXGridObject('auditHistoryGrid');
        auditHistoryGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        auditHistoryGrid.setHeader("序号,,处理节点,处理状态,处理人,处理时间,处理意见");
        auditHistoryGrid.setInitWidths("40,0,100,80,70,120,*");
        auditHistoryGrid.setColAlign("center,center,left,left,left,left,left");
        auditHistoryGrid.setSkin("dhx_skyblue");
        auditHistoryGrid.setColSorting("na,str,str,str,str,str,str");
        auditHistoryGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
        auditHistoryGrid.enableDistributedParsing(true, 20);
        auditHistoryGrid.init();

        //审批弹窗
        auditForm = $("#auditForm");
        auditForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            var top = $("#auditForm").offset().top;
            var left = $("#auditForm").offset().left;

            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    auditForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        auditForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideVerifyForm();
        function hideVerifyForm() {
            auditForm.css({ top: 200, left: -1300 }).hide();
            auditForm.css("visibility", "visible");
        }
        function showVerifyForm() {
            auditForm.css({ top: 100, left: 180 }).show();
        }
        //审批弹窗确定
        $("#audit_Save").click(function () {
            var selectedId = purchasePlanGrid.getSelectedRowId();
            if ($("#txtType").val() == "审批") {
                if ($.trim($("#txtOpinion").val()) == "") {
                    alert("审批意见不能为空！");
                    return;
                }
                IEquipmentService.auditPurchasePlan.purchasePlanID = purchasePlanGrid.getSelectedRowId();
                IEquipmentService.auditPurchasePlan.handler = decodeURIComponent($.cookie('userTrueName'));
                IEquipmentService.auditPurchasePlan.opinion = $("#txtOpinion").val();
                rock.AjaxRequest(IEquipmentService.auditPurchasePlan, rock.exceptionFun);
                if (IEquipmentService.auditPurchasePlan.success) {
                    purchasePlanGrid.cells(selectedId, 6).setValue("已审核");
                    planState = "已审核";
                    refreshToolBarState();
                    hideVerifyForm();
                }
            }
            else {
                if ($.trim($("#txtOpinion").val()) == "") {
                    alert("弃审说明不能为空！");
                    return;
                }
                IEquipmentService.unAuditPurchasePlan.purchasePlanID = purchasePlanGrid.getSelectedRowId();
                IEquipmentService.unAuditPurchasePlan.handler = decodeURIComponent($.cookie('userTrueName'));
                IEquipmentService.unAuditPurchasePlan.opinion = $("#txtOpinion").val();
                rock.AjaxRequest(IEquipmentService.unAuditPurchasePlan, rock.exceptionFun);
                if (IEquipmentService.unAuditPurchasePlan.success) {
                    purchasePlanGrid.cells(selectedId, 6).setValue("已核实");
                    planState = "已核实";
                    refreshToolBarState();
                    hideVerifyForm();
                }
            }
        });
        //审批弹窗取消
        $("#audit_Cancle").click(function () {
            hideVerifyForm();
        });
        //审批弹窗关闭
        $("#audit_Close").click(function () {
            hideVerifyForm();
        });

        //明细调整弹窗
        detailForm = $("#detailForm");
        detailForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            var top = $("#detailForm").offset().top;
            var left = $("#detailForm").offset().left;

            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    detailForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        detailForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideDetailForm();
        function hideDetailForm() {
            detailForm.css({ top: 200, left: -1300 }).hide();
            detailForm.css("visibility", "visible");
        }
        function showDetailForm() {
            detailForm.css({ top: 100, left: 180 }).show();
        }
        //明细调整弹窗确定
        $("#detail_Save").click(function () {
            if ($.trim($("#txtQuantity").val()) == '') {
                alert('计划数量不能为空!');
                return false;
            }
            if (!rock.chknum($("#txtQuantity").val())) {
                alert('计划数量数据格式不正确!');
                return false;
            }
            if ($.trim($("#txtPrice").val()) == '') {
                alert('单价不能为空!');
                return false;
            }
            if (!rock.chknum($("#txtPrice").val())) {
                alert('单价数据格式不正确!');
                return false;
            }
            if ($.trim($("#txtAmount").val()) == '') {
                alert('金额不能为空!');
                return false;
            }
            if (!rock.chknum($("#txtAmount").val())) {
                alert('金额数据格式不正确!');
                return false;
            }

            IEquipmentService.changePurchasePlanDetail.purchasePlanDetailID = $("#txtDetailID").val();
            IEquipmentService.changePurchasePlanDetail.quantity = $("#txtQuantity").val();
            IEquipmentService.changePurchasePlanDetail.price = $("#txtPrice").val();
            IEquipmentService.changePurchasePlanDetail.handler = decodeURIComponent($.cookie('userTrueName'));
            rock.AjaxRequest(IEquipmentService.changePurchasePlanDetail, rock.exceptionFun);
            if (IEquipmentService.changePurchasePlanDetail.success) {
                purchasePlanDetailGrid.cells($("#txtDetailID").val(), 5).setValue($("#txtQuantity").val());
                purchasePlanDetailGrid.cells($("#txtDetailID").val(), 6).setValue($("#txtPrice").val());
                purchasePlanDetailGrid.cells($("#txtDetailID").val(), 7).setValue($("#txtAmount").val());
                hideDetailForm();
            }
        });
        //明细调整弹窗取消
        $("#detail_Cancle").click(function () {
            hideDetailForm();
        });
        //明细调整弹窗关闭
        $("#detail_Close").click(function () {
            hideDetailForm();
        });

        //金额计算
        $("#txtPrice").keyup(function () {
            if ($.trim($("#txtQuantity").val()) == '') {
                alert('请先输入计划数量!');
                return false;
            }
            if (!rock.chknum($("#txtQuantity").val())) {
                alert('计划数量数据格式不正确!');
                $("#txtPrice").val("");
                $("#txtAmount").val("");
                return false;
            }
            var price = parseFloat($("#txtPrice").val())
            var quantity = parseFloat($("#txtQuantity").val())
            var amount = quantity * price;
            $("#txtAmount").val(Number(amount).toFixed(2).toString());
        });

        $("#txtQuantity").keyup(function () {
            if ($.trim($("#txtPrice").val()) != '') {
                if (!rock.chknum($("#txtQuantity").val())) {
                    alert('单价据格式不正确!');
                    return false;
                }
            }
            if (rock.chknum($("#txtQuantity").val())) {
                var price = parseFloat($("#txtPrice").val())
                var quantity = parseFloat($("#txtQuantity").val())
                var amount = quantity * price;
                $("#txtAmount").val(Number(amount).toFixed(2).toString());
            }
        });

        function getPurchasePlanDetail(purchasePlanID) {
            ISystemService.execQuery.sqlString = "SELECT b.PurchasePlanDetailID,a.MaterialName,a.Specification,a.Measure,b.Quantity,b.Price,b.Amount,c.ProducerName,b.DemandDate,b.Department,b.Source,b.Comment from Material a inner join PurchasePlanDetail b on (a.MaterialID = b.MaterialID) join Producer c on b.ProducerID = c.ProducerID where b.PurchasePlanID = " + purchasePlanID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    purchasePlanDetailDataList.rows = [];
                    purchasePlanDetailGrid.clearAll();
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        listdata.data[1] = rowResult[0].value;
                        listdata.data[2] = rowResult[1].value;
                        listdata.data[3] = rowResult[2].value;
                        listdata.data[4] = rowResult[3].value;
                        listdata.data[5] = rowResult[4].value;
                        listdata.data[6] = rowResult[5].value;
                        listdata.data[7] = rowResult[6].value;
                        listdata.data[8] = rowResult[7].value;
                        listdata.data[9] = rowResult[8].value;
                        listdata.data[10] = rowResult[9].value;
                        listdata.data[11] = rowResult[10].value;
                        listdata.data[12] = rowResult[11].value;
                        purchasePlanDetailDataList.rows.push(listdata);
                    }
                    purchasePlanDetailGrid.parse(purchasePlanDetailDataList, "json");
                }(ISystemService.execQuery.resultValue));
            }
        }

        function getauditHistory(purchasePlanID) {
            ISystemService.execQuery.sqlString = "SELECT AuditHistoryID,AuditHistoryName,State,Handler,DateTime,Opinion from AuditHistory where ObjType = '采购计划' and ObjID = " + purchasePlanID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    auditHistoryDataList.rows = [];
                    auditHistoryGrid.clearAll();
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        listdata.data[1] = rowResult[0].value;
                        listdata.data[2] = rowResult[1].value;
                        listdata.data[3] = rowResult[2].value;
                        listdata.data[4] = rowResult[3].value;
                        listdata.data[5] = rowResult[4].value;
                        listdata.data[6] = rowResult[5].value;
                        auditHistoryDataList.rows.push(listdata);
                    }
                    auditHistoryGrid.parse(auditHistoryDataList, "json");
                }(ISystemService.execQuery.resultValue));
            }
        }
        //工具栏按钮状态处理
        function refreshToolBarState() {
            switch (planState) {
                case "已核实":
                    toolBar.enableItem("audit");
                    toolBar.disableItem("unVerify");
                    break;
                case "已审核":
                    toolBar.disableItem("audit");
                    toolBar.enableItem("unVerify");
                    break;
                default:
                    toolBar.disableItem("audit");
                    toolBar.disableItem("unVerify");
                    break;
            }
        }
        refreshToolBarState();
        //日期控件测试
        var dateboxArray = [];
        dateboxArray.push(toolBar.getInput("beginDate"));
        dateboxArray.push(toolBar.getInput("endDate"));
        myCalendar = new dhtmlXCalendarObject(dateboxArray);
        myCalendar.loadUserLanguage('cn');
    });
})
