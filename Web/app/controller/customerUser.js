
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      customerUser = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerUser,Customer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [CustomerUser].[CustomerUserID], [CustomerUser].[customerUserName], [CustomerUser].[companyName] from [CustomerUser] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项

        customerComplete("");

        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("companyName", null, "显示名");
    toolBar.addInput("txtcompanyNameSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                sqlStr = "select [CustomerUser].[CustomerUserID], [CustomerUser].[customerUserName], [CustomerUser].[companyName] from [CustomerUser] where 1=1 ";

                if (toolBar.getValue("txtcompanyNameSearch") != "") {
                    sqlStr += " and [CustomerUser].[companyName] like '%" + toolBar.getValue("txtcompanyNameSearch") + "%'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("注册客户用户");
                $("#txtcustomerID").val("");
                $("#txtcustomer").val("");
                $("#txtcustomerUserName").val("");
                $("#txtcompanyName").val("");
                $("#txtpassword").val("");
                $("#txtpassword1").val("");                
                customerUser = null;
                showEditForm();
                break;           
            case "delete":
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "CustomerUser";
                        rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                        if (ISystemService.deleteDynObjectByID.success) {
                            (function (e) {
                                for (var j = 0; j < dictDataList.rows.length; j++) {
                                    if (dictDataList.rows[j].id == rowids[i]) {
                                        dictDataList.rows.splice(j, 1);
                                        listGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteDynObjectByID.resultValue));
                        }
                    }
                    refreshToolBarState();
                }
                break;
        }
    });



    //初始化客户用户注册列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,用户名,显示名");
    listGrid.setInitWidths("40,0,60,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("ch,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        return;
        editState = "modify";
        $("#formTitle").text("编辑客户用户");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "CustomerUser";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customerUser = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtcustomerID").val(customerUser.customerID);


        $("#txtcustomerUserName").val(customerUser.customerUserName);


        $("#txtcompanyName").val(customerUser.companyName);


        $("#txtpassword").val(customerUser.password);


        $("#txtcustomerNum").val(customerUser.customerNum);


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(250);
    editForm.width(450);
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
  
    //保存
    $("#btn_Save").click(function () {
        
        if (!$("#txtcustomerID").validate("required", "关联客户")) {
            return false;
        }

        if (!$("#txtcustomerUserName").validate("required", "用户名")) {
            return false;
        }
        if (!$("#txtcompanyName").validate("required", "显示名")) {
            return false;
        }

        if (!$("#txtpassword").validate("required", "密码")) {
            return false;
        }

        if ($("#txtpassword").val() != $("#txtpassword1").val()) {
            alert("两次输入的密码不一致！");
            return false;
        }

        //判定客户是否已经注册
        var count = 0;
        ISystemService.executeScalar.sqlString = "select count(*) from [CustomerUser] where [CustomerID] = " + $("#txtcustomerID").val();
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                count = e.value;
            }(ISystemService.executeScalar.resultValue));
        }

        if (parseInt(count, 10) > 0) {
            alert("客户已经注册,不可重复注册!");
            return;
        }
        count = 0;
        ISystemService.executeScalar.sqlString = "select count(*) from [CustomerUser] where [CustomerUserName] = '" + $("#txtcustomerUserName").val() + "'";
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                count = e.value;
            }(ISystemService.executeScalar.resultValue));
        }

        if (parseInt(count, 10) > 0) {
            alert("客户用户名重复,请检查!");
            return;
        }

        if (customerUser == null) {
            customerUser = CustomerUserClass.createInstance();
            ISystemService.getNextID.typeName = "CustomerUser";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerUser.customerUserID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        //if (!customerUser.ValidateValue()) {
        //    return;
        //}

        customerUser.customerID = $("#txtcustomerID").val();
        customerUser.customerUserName = $("#txtcustomerUserName").val();
        customerUser.companyName = $("#txtcompanyName").val();
        customerUser.password = $("#txtpassword").val();
        //获取客户编号
        ISystemService.getObjectProperty.objName = "CustomerUser";
        ISystemService.getObjectProperty.property = "CustomerNum";
        ISystemService.getObjectProperty.ojbID = $("#txtcustomerID").val();
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                 customerUser.customerNum = e.value;
            }(ISystemService.getObjectProperty.resultValue));
        }
        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerUser;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customerUser.customerUserID);
                    dictData.data.push(0);
                    dictData.data.push(customerUser.customerUserID);

                    dictData.data.push($("#txtcustomerUserName").val());

                    dictData.data.push($("#txtcompanyName").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                    alert("客户用户注册成功!");
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerUser;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customerUser.customerUserID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtcustomerUserName").val();

                            dictDataList.rows[i].data[3] = $("#txtcompanyName").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("客户用户注册修改成功!");
        }

        refreshToolBarState();
    });

    //加载弹窗Div

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
        $("#txtcustomer").val(customerQuickGrid.cells(rowID, 2).getValue());
        $("#txtcompanyName").val(customerQuickGrid.cells(rowID, 2).getValue());
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
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
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

})