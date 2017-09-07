
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      receivecash = null,
      customer = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,Receivecash,Customer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginreceiveDate", beginDate);
                toolBar.setValue("endreceiveDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }
       
                     

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

        //初始化通用参照
        $("#combopayment").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '付款方式'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combopayment").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        customerComplete("");

       
        //处理初始化加载数据
        getDataList();
        //绑定控件失去焦点验证方法
        //ReceivecashClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("receiveDateBegin", null, "收款时间");
    toolBar.addInput("beginreceiveDate", null, "", 75);
    toolBar.addText("收款时间End", null, "-");
    toolBar.addInput("endreceiveDate", null, "", 75);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加客户收款");

                $("#txtcustomer").val("");
                $("#txtcustomerID").val("");

                $("#txtreceiveDate").val(serverDate);

                $("#combopayment").get(0).selectedIndex = 0;

                $("#txtbillNumber").val("");

                $("#txtquantity").val("");

                $("#txtagent").val(decodeURIComponent($.cookie('userTrueName')));

                $("#txtpayer").val("");

                $("#txtcomment").val("");

                receivecash = null;
                showEditForm();
                break;          
            case "delete":
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        IBusinessService.deleteReceivecash.receivecashID = rowids[i];
                        rock.AjaxRequest(IBusinessService.deleteReceivecash, rock.exceptionFun);
                        rock.AjaxRequest(IBusinessService.deleteReceivecash, rock.exceptionFun);
                        if (IBusinessService.deleteReceivecash.success) {
                            (function (e) {
                                for (var j = 0; j < dictDataList.rows.length; j++) {
                                    if (dictDataList.rows[j].id == rowids[i]) {
                                        dictDataList.rows.splice(j, 1);
                                        listGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(IBusinessService.deleteReceivecash.resultValue));
                        }
                    }
                    refreshToolBarState();
                }
                break;
        }
    });




    //初始化客户收款列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,客户名称,收款金额,交款方式,票据号,收款时间,经办人");
    listGrid.setInitWidths("40,0,200,90,80,80,70,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        //editState = "modify";
        //$("#formTitle").text("编辑客户收款");
        //ISystemService.getDynObjectByID.dynObjectID = rowID;
        //ISystemService.getDynObjectByID.structName = "Receivecash";
        //rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        //if (ISystemService.getDynObjectByID.success) {
        //    (function (e) {
        //        receivecash = e;
        //    }(ISystemService.getDynObjectByID.resultValue));
        //}
        //else {
        //    return;
        //}

        //$("#txtcustomerID").val(receivecash.customerID);
        //ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + receivecash.customerID;
        //rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        //var warehouseName = null;
        //if (ISystemService.executeScalar.success) {
        //    (function (e) {
        //        $("#txtcustomer").val(e.value);
        //    }(ISystemService.executeScalar.resultValue));
        //}

        //$("#txtreceiveDate").val(receivecash.receiveDate.split(' ')[0]);

        //rock.setSelectItem("combopayment", receivecash.payment, "text");

        //$("#txtbillNumber").val(receivecash.billNumber);

        //$("#txtquantity").val(receivecash.quantity);

        //$("#txtagent").val(receivecash.agent);

        //$("#txtpayer").val(receivecash.payer);

        //$("#txtcomment").val(receivecash.comment);

        //showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(225);
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

    //处理编辑项

    //tableString = '';
    //editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {

        if (!$("#txtcustomerID").validate("required", "客户")) {
            $("#txtcustomer").focus();
            return false;
        }
        if (!$("#txtreceiveDate").validate("date", "收款时间")) {
            return false;
        }
        if (!$("#txtquantity").validate("number", "收款金额")) {
            return false;
        }
        receivecash = ReceivecashClass.createInstance();
        ISystemService.getNextID.typeName = "Receivecash";
        rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
        if (ISystemService.getNextID.success) {
            (function (e) {
                receivecash.receivecashID = e.value;
            }(ISystemService.getNextID.resultValue))
        }

        receivecash.customerID = $("#txtcustomerID").val();
        receivecash.payment = $("#txtpayment").val();
        if ($.trim($("#txtbillNumber").val()) != '') {
            receivecash.billNumber = $("#txtbillNumber").val();
        }
        else {
            receivecash.billNumber = null;
        }
        receivecash.quantity = $("#txtquantity").val();
        receivecash.receiveDate = $("#txtreceiveDate").val();
        if ($.trim($("#txtpayer").val()) != '') {
            receivecash.payer = $("#txtpayer").val();
        }
        else {
            receivecash.payer = null;
        }

        if ($.trim($("#txtagent").val()) != '') {
            receivecash.agent = $("#txtagent").val();
        }
        else {
            receivecash.agent = null;
        }

        if ($.trim($("#txtcomment").val()) != '') {
            receivecash.comment = $("#txtcomment").val();
        }
        else {
            receivecash.comment = null;
        }

        IBusinessService.addReceivecash.receivecash = receivecash;
        rock.AjaxRequest(IBusinessService.addReceivecash, rock.exceptionFun);
        if (IBusinessService.addReceivecash.success) {
            (function (e) {
                var dictData = new rock.JsonData(receivecash.receivecashID);
                dictData.data.push(0);
                dictData.data.push(receivecash.receivecashID);

                dictData.data.push($("#txtcustomer").val());

                dictData.data.push($("#txtquantity").val());

                dictData.data.push($("#combopayment").find("option:selected").text());

                dictData.data.push($("#txtbillNumber").val());

                dictData.data.push($("#txtreceiveDate").val());

                dictData.data.push($("#txtagent").val());

                dictDataList.rows.push(dictData);
                listGrid.clearAll();
                listGrid.parse(dictDataList, "json");
                hideEditForm();
            }(IBusinessService.addReceivecash.resultValue));
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("客户收款添加成功!");
            refreshToolBarState();
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
    $('#txtcustomer').focus(function (e) {
        showcustomerPop();
    });

    function showcustomerPop() {
        var top = $("#txtcustomer").offset().top;
        var left = $("#txtcustomer").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();

    $("#txtcustomer").keyup(function () {
        customerComplete($("#txtcustomer").val());
    });
    var customerDataList = new rock.JsonList();
    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 20 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    $('#editForm').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomer") {
            hidecustomerPop();
        }

    });

    function getDataList() {
        if ($.trim(toolBar.getValue("beginreceiveDate")) == "") {
            alert("起始收款时间不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("beginreceiveDate"), "-")) {
            alert("起始收款时间格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        if ($.trim(toolBar.getValue("endreceiveDate")) == "") {
            alert("截止收款时间不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("endreceiveDate"), "-")) {
            alert("截止收款时间格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        sqlStr = "select [Receivecash].[ReceivecashID], [Customer].[CustomerName], [Receivecash].[quantity], [Receivecash].[payment], [Receivecash].[billNumber], convert(nvarchar(10),[Receivecash].[receiveDate],120) as receiveDate, [Receivecash].[agent] from [Receivecash] join [Customer] on [Receivecash].[customerID] = [Customer].[customerID]";

        sqlStr += " and [Receivecash].[receiveDate] between '" + toolBar.getValue("beginreceiveDate") + " 0:0:0' AND '" + toolBar.getValue("endreceiveDate") + " 23:59:59' ";

        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }


    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("delete");
        }
        else {
            toolBar.enableItem("delete");
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginreceiveDate"));

    dateboxArray.push(toolBar.getInput("endreceiveDate"));

    dateboxArray.push("txtreceiveDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})