
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid, checktype,
        statement = null,
        ladeBill = null,
        customerDataList = new rock.JsonList(),
        dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,LadeBill,Statement,IBusinessService";
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

        $("#combomaterialSearch").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] join [ProductMarketing] on [MaterialID] = [ProductID] and [Available] = '1' and [ForSale] = '1' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterialSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }
        $("#txtcustomerID").val("");
        customerComplete("");
        clearPage();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addInput("input1", null, "");
    toolBar.addInput("beginbillingTime", null, "", 60);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 60);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 120);
    toolBar.addText("material", null, "产品");
    toolBar.addInput("txtmateriaSearch", null, "", 0);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("checkout", null, "结算");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("fdcheckout", null, "分单结算");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;            
            case "checkout":
                checktype = "js";
                $("#formTitle").text("销售结算");
                $('#js').removeAttr("style");
                $('#js').css("width","98%");
                $("#fdjs").css("display", "none");
                editForm.height(139);

                showEditForm();          
                break;
            case "fdcheckout":
                checktype = "fd";
                $("#formTitle").text("销售分单结算");
                $('#fdjs').removeAttr("style");
                $('#fdjs').css("width", "98%");
                $("#js").css("display", "none");
                editForm.height(220);
                showEditForm();              
                break;
        }
    });

    toolBar.getInput("input1").id = "input1";
    $("#input1").css("display", "none");
    $("#input1").after("<input id='th' type='radio' name='sex' checked='checked'/>提货日期<input id='kp' type='radio' name='sex' style='margin-left:5px;margin-top:3px'/>创建日期");

    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";
    toolBar.getInput("txtmateriaSearch").id = "txtmateriaSearch";
    $("#txtmateriaSearch").css("display", "none");
    $("#txtmateriaSearch").after("<select id='combomaterialSearch' style=\"width:120px\"></select>");
    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,产品名称,提货单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");
    listGrid.setInitWidths("40,0,200,130,80,100,100,120,80,80,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

   
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
        var 结算单价 = 0;
        var 第一单数量 = 0;
        var 第一单单价 = 0;
        var 第一单总金额 = 0;
        var 第二单数量 = 0;
        var 第二单单价 = 0;
        var 第二单总金额 = 0;
        var 实际提货数量 = 0;
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checktype == "js") {
            if ($.trim($("#txtprice").val()) != '') {
                if (!rock.chknum($("#txtprice").val())) {
                    alert('单价输入格式错误');
                    $("#txtprice").focus();
                    return false;
                }
                结算单价 = parseFloat($("#txtprice").val());
            }
            else {
                alert('单价不可以为空');
                $("#txtprice").focus();
                return;
            }
            
            if (confirm("您确定要结算选定的结算单吗?")) {
                for (var i = 0; i < rowids.length; i++) {
                    statement = StatementClass.createInstance();
                    ISystemService.getNextID.typeName = "Statement";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            statement.statementID = e.value;
                        }(ISystemService.getNextID.resultValue))
                    }
                    else {
                        alert("获取结算单ID出错!");
                        return;
                    }

                    IBusinessService.getBillNO.objectType = "结算单";
                    rock.AjaxRequest(IBusinessService.getBillNO, rock.exceptionFun);
                    if (IBusinessService.getBillNO.success) {
                        (function (e) {
                            statement.statementNun = e.value;
                        }(IBusinessService.getBillNO.resultValue))
                    }
                    else {
                        alert("获取结算单编码出错!");
                        return;
                    }

                    statement.materialID = $("#combomaterialSearch").val();

                    ISystemService.getObjectProperty.objName = "LadeBill";
                    ISystemService.getObjectProperty.property = "MaterialLevel";
                    ISystemService.getObjectProperty.ojbID = parseInt(rowids[i], 10);
                    rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                    if (ISystemService.getObjectProperty.success) {
                        (function (e) {
                            statement.materialLevel = e.value;
                        }(ISystemService.getObjectProperty.resultValue));
                    }
                    else {
                        alert("获取产品等级出错!");
                        return;
                    }
                    statement.customerID = $("#txtcustomerID").val();

                    statement.ladeBillID = parseInt(rowids[i], 10);
                    statement.netWeight = parseFloat(listGrid.cells(rowids[i], 6).getValue());
                    statement.price = parseFloat($("#txtprice").val());

                    rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
                    if (ISystemService.getServerDateTime.success) {
                        (function (e) {
                            statement.settleTime = e.value;
                        }(ISystemService.getServerDateTime.resultValue));
                    }
                    else {
                        alert("获取服务器端时间出错!");
                        return;
                    }

                    statement.amount = statement.netWeight * statement.price;
                    statement.agent = decodeURIComponent($.cookie('userTrueName'));
                    statement.multiple = "未分单";
                    statement.state = "已创建";
                    statement.comment = $("#txtcomment").val();

                    IBusinessService.settleSingle.statement = statement;
                    rock.AjaxRequest(IBusinessService.settleSingle, rock.exceptionFun);
                    if (!IBusinessService.settleSingle.success) {
                        alert("添加结算单出错!");
                        getDataList();
                        return;
                    }
                }
                alert("所选提货单结算单完成!");
                getDataList();
                refreshToolBarState();
                clearPage();
                hideEditForm();
            }
        }
        else {
            if ($.trim($("#txtquantity1").val()) != '') {
                if (!rock.chknum($("#txtquantity1").val())) {
                    alert('第一单数量输入格式错误');
                    $("#txtquantity1").focus();
                    return false;
                }
                第一单数量 = parseFloat($("#txtquantity1").val());
            }
            else {
                alert('第一单数量不可以为空');
                $("#txtquantity1").focus();
                return;
            }

            if ($.trim($("#txtprice1").val()) != '') {
                if (!rock.chknum($("#txtprice1").val())) {
                    alert('第一单单价输入格式错误');
                    $("#txtprice1").focus();
                    return false;
                }
                第一单单价 = parseFloat($("#txtprice1").val());
            }
            else {
                alert('第一单单价不可以为空');
                $("#txtprice1").focus();
                return;
            }

            if ($.trim($("#txttotal1").val()) != '') {
                if (!rock.chknum($("#txttotal1").val())) {
                    alert('第一单总金额输入格式错误');
                    $("#txttotal1").focus();
                    return false;
                }
                第一单总金额 = parseFloat($("#txttotal1").val());
            }
            else {
                alert('第一单总金额不可以为空');
                $("#txttotal1").focus();
                return;
            }

            if ($.trim($("#txtquantity2").val()) != '') {
                if (!rock.chknum($("#txtquantity2").val())) {
                    alert('第二单数量输入格式错误');
                    $("#txtquantity2").focus();
                    return false;
                }
                第二单数量 = parseFloat($("#txtquantity2").val());
            }
            else {
                alert('第二单数量不可以为空');
                $("#txtquantity2").focus();
                return;
            }

            if ($.trim($("#txtprice2").val()) != '') {
                if (!rock.chknum($("#txtprice2").val())) {
                    alert('第二单单价输入格式错误');
                    $("#txtprice2").focus();
                    return false;
                }
                第二单单价 = parseFloat($("#txtprice2").val());
            }
            else {
                alert('第二单单价不可以为空');
                $("#txtprice2").focus();
                return;
            }

            if ($.trim($("#txttotal2").val()) != '') {
                if (!rock.chknum($("#txttotal2").val())) {
                    alert('第二单总金额输入格式错误');
                    $("#txttotal2").focus();
                    return false;
                }
                第二单总金额 = parseFloat($("#txttotal2").val());
            }
            else {
                alert('第二单总金额不可以为空');
                $("#txttotal2").focus();
                return;
            }
            实际提货数量 = parseFloat(listGrid.cells(rowids[0], 6).getValue());
            if (Math.abs((第一单数量 + 第二单数量) - 实际提货数量) > 0.0001) {
                alert("分单数量和总单数量不一致请检查,请检查!");
                return;
            }

            //分单结算
            var statement1 = StatementClass.createInstance();
           
            ISystemService.getNextID.typeName = "Statement";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    statement1.statementID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
            else {
                alert("获取结算单ID出错!");
                return;
            }

            IBusinessService.getBillNO.objectType = "结算单";
            rock.AjaxRequest(IBusinessService.getBillNO, rock.exceptionFun);
            if (IBusinessService.getBillNO.success) {
                (function (e) {
                    statement1.statementNun = e.value;
                }(IBusinessService.getBillNO.resultValue))
            }
            else {
                alert("获取结算单编码出错!");
                return;
            }

            statement1.materialID = $("#combomaterialSearch").val();

            ISystemService.getObjectProperty.objName = "LadeBill";
            ISystemService.getObjectProperty.property = "MaterialLevel";
            ISystemService.getObjectProperty.ojbID = parseInt(rowids[0], 10);
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    statement1.materialLevel = e.value;
                }(ISystemService.getObjectProperty.resultValue));
            }
            else {
                alert("获取产品等级出错!");
                return;
            }
            statement1.customerID = $("#txtcustomerID").val();
            statement1.ladeBillID = parseInt(rowids[0], 10);
            statement1.netWeight = parseFloat($("#txtquantity1").val());
            statement1.price = parseFloat($("#txtprice1").val());

            rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
            if (ISystemService.getServerDateTime.success) {
                (function (e) {
                    statement1.settleTime = e.value;
                }(ISystemService.getServerDateTime.resultValue));
            }
            else {
                alert("获取服务器端时间出错!");
                return;
            }

            statement1.amount = parseFloat($("#txttotal1").val());
            statement1.agent = decodeURIComponent($.cookie('userTrueName'));
            statement1.multiple = "分单一";
            statement1.state = "已创建";
            statement1.comment = $("#txtcomment1").val();

            var statement2 = StatementClass.createInstance();
            ISystemService.getNextID.typeName = "Statement";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    statement2.statementID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
            else {
                alert("获取结算单ID出错!");
                return;
            }

            IBusinessService.getBillNO.objectType = "结算单";
            rock.AjaxRequest(IBusinessService.getBillNO, rock.exceptionFun);
            if (IBusinessService.getBillNO.success) {
                (function (e) {
                    statement2.statementNun = e.value;
                }(IBusinessService.getBillNO.resultValue))
            }
            else {
                alert("获取结算单编码出错!");
                return;
            }

            statement2.materialID = $("#combomaterialSearch").val();
            statement2.materialLevel = statement1.materialLevel;
            
            statement2.customerID = $("#txtcustomerID").val();
            statement2.ladeBillID = parseInt(rowids[0], 10);
            statement2.netWeight = parseFloat($("#txtquantity2").val());
            statement2.price = parseFloat($("#txtprice2").val());

            statement2.settleTime = statement1.settleTime;

            statement2.amount = parseFloat($("#txttotal2").val());
            statement2.agent = statement1.agent;
            statement2.multiple = "分单二";
            statement2.state = "已创建";
            statement2.comment = $("#txtcomment2").val();
           
            IBusinessService.settleMulti.statement1 = statement1;
            IBusinessService.settleMulti.statement2 = statement2;
            rock.AjaxRequest(IBusinessService.settleMulti, rock.exceptionFun);
            if (IBusinessService.settleMulti.success) {
                alert("所选提货单结算单完成!");
                getDataList();
                refreshToolBarState();
                clearPage();
                hideEditForm();
            }
            else {
                alert("添加分单结算单出错!");
                getDataList();
                refreshToolBarState();
            }
        }
    });

    customerQuickGrid = new dhtmlXGridObject("customerQuickGrid");
    customerQuickGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerQuickGrid.setSkin("dhx_skyblue");
    customerQuickGrid.setHeader("序号,,客户编码,类别,客户名称");
    customerQuickGrid.setInitWidths("40,0,70,40,*");
    customerQuickGrid.setColAlign("center,left,left,left,left");
    customerQuickGrid.setColTypes("cntr,ro,ro,ro,ro");
    customerQuickGrid.setColSorting("na,na,str,str,str");
    customerQuickGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        clearPage();
        $("#txtcustomerID").val(rowID);
        $("#txtcustomerSearch").val(customerQuickGrid.cells(rowID, 4).getValue());       
        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);

    customerPop = $("#customerPop");
    var mark = true;

    $('#txtcustomerSearch').mousedown(function (e) {
        if (mark) {
            ISystemService.execQuery.sqlString = "select top 15  [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer]";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, customerQuickGrid, customerDataList);
                }(ISystemService.execQuery.resultValue));
            }
            mark = false;
        }
        showcustomerPop();
    });

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 15 [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer] where CustomerName like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    function showcustomerPop() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }
    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    $('#mainPage').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }
    });

    hidecustomerPop();
    function clearPage() {
        $("#txtcustomerID").val("");
        $("#txtcustomerSearch").val("");
        $("#txtprice").val("");
        $("#txtcomment").val("");
        $("#txtquantity1").val("");
        $("#txtprice1").val("");
        $("#txttotal1").val("");
        $("#txtquantity2").val("");
        $("#txtprice2").val("");
        $("#txttotal2").val("");
        $("#txtcomment1").val("");
        $("#txtcomment2").val("");
        
    }

    function getDataList() {
        if ($.trim($("#txtcustomerID").val()) == '') {
            alert("请先选择客户!");
            $("#txtcustomerSearch").focus();
            return;
        }

        if ($.trim(toolBar.getValue("beginbillingTime")) == "") {
            alert("起始日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("beginbillingTime"), "-")) {
            alert("起始日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        if ($.trim(toolBar.getValue("endbillingTime")) == "") {
            alert("截止日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("endbillingTime"), "-")) {
            alert("截止日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        sqlStr = "select [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName] + [LadeBill].[MaterialLevel], case when [LadeBill].[ContractID] > 0 then Convert(decimal(18,2),[LadeBill].[ContractPrice]) else Convert(decimal(18,2),[LadeBill].[quotedPrice]) end, Convert(decimal(18,2),[PlanQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[state] = '已确认'";
        sqlStr += " and [LadeBill].[CustomerID] = " + $("#txtcustomerID").val();
        sqlStr += " and [LadeBill].[MaterialID] = " + $("#combomaterialSearch").val();

        if ($('#kp').attr('checked')) {
            sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
        }
        else {
            sqlStr += " and [LadeBill].[ladeDate] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                //rock.tableToListGrid(e, listGrid, dictDataList);
                listGrid.clearAll();
                dictDataList.rows = [];
                var rows = e.rows;
                var colLength = e.columns.length;
                var rowLength = rows.length;
                var planquantity = 0;
                var actquantity = 0;
                for (var i = 0; i < rowLength; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    if (rowResult[4].value) {
                        planquantity += parseFloat(rowResult[4].value);
                    }
                    if (rowResult[5].value) {
                        actquantity += parseFloat(rowResult[5].value);
                    }

                    for (var j = 1; j < colLength; j++) {
                        listdata.data[j + 1] = rowResult[j].value;
                    }
                    dictDataList.rows.push(listdata);
                }
                listdata = new rock.JsonData("footer");
                listdata.data[0] = 0;
                listdata.data[1] = "0";
                listdata.data[2] = "数量合计： ";
                listdata.data[3] = "";
                listdata.data[4] = "";
                listdata.data[5] = Number(planquantity).toFixed(2).toString();
                if (actquantity > 0) {
                    listdata.data[6] = Number(actquantity).toFixed(3).toString();
                }
                dictDataList.rows.push(listdata);
                listGrid.parse(dictDataList, "json");
                listGrid.setColspan("footer", 2, 2);
            }(ISystemService.execQuery.resultValue));
        }
    }

    $('#masterDiv').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }
       
    });   
    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("checkout");
            toolBar.disableItem("fdcheckout");
        }
        else {
            if (rowids.length != 1) {
                toolBar.enableItem("checkout");
                toolBar.disableItem("fdcheckout");
            }
            else {
                toolBar.enableItem("checkout");
                toolBar.enableItem("fdcheckout");
            }
        }
    }   

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

    function CalcJE() {
        var txt第一单数量 = $("#txtquantity1").val();
        var txt第一单单价 = $("#txtprice1").val();
        var txt第一单总金额 = $("#txttotal1").val();
        var txt第二单数量 = $("#txtquantity2").val();
        var txt第二单单价 = $("#txtprice2").val();
        var txt第二单总金额 = $("#txttotal2").val();

        var 第一单数量 = 0;
        var 第一单单价 = 0;
        var 第一单总金额 = 0;
        var 第二单数量 = 0;
        var 第二单单价 = 0;
        var 第二单总金额 = 0;

        if (txt第一单数量 != "") {
            if (rock.chknum($("#txtquantity1").val())) {
                第一单数量 = parseFloat($("#txtquantity1").val());
            }
        }

        if (txt第一单单价 != "") {
            if (rock.chknum($("#txtprice1").val())) {
                第一单单价 = parseFloat($("#txtprice1").val());
            }
        }

        第一单总金额 = 第一单数量 * 第一单单价;

        $("#txttotal1").val(Number(第一单总金额).toFixed(2).toString());

        if (txt第二单数量 != "") {
            if (rock.chknum($("#txtquantity2").val())) {
                第二单数量 = parseFloat($("#txtquantity2").val());
            }
        }
        if (txt第二单单价 != "") {
            if (rock.chknum($("#txtprice2").val())) {
                第二单单价 = parseFloat($("#txtprice2").val());
            }
        }

        第二单总金额 = 第二单数量 * 第二单单价;
        $("#txttotal2").val(Number(第二单总金额).toFixed(2).toString());
    }

    $("#txtquantity1").blur(CalcJE);
    $("#txtprice1").blur(CalcJE);
    $("#txttotal1").blur(CalcJE);
    $("#txtquantity2").blur(CalcJE);
    $("#txtprice2").blur(CalcJE);
    $("#txttotal2").blur(CalcJE);
})