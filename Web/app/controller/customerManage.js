
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      customer = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    var customerID = decodeURI($.getUrlParam("ID"));
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Customer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [Customer].[CustomerID], [Customer].[customerCode], [Customer].[customerName], [Customer].[category], [Customer].[address], [Customer].[telephone], [Customer].[fax], [Customer].[nature], [Customer].[bank], [Customer].[postCode] from [Customer] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        
        if (customerID != "null") {
            $("#formTitle").text("编辑客户信息");
            fillPage(customerID);
            showEditForm();           
        }
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("customerName", null, "客户名称");
    toolBar.addInput("txtcustomerNameSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":
                sqlStr = "select [Customer].[CustomerID], [Customer].[customerCode], [Customer].[customerName], [Customer].[category], [Customer].[address], [Customer].[telephone], [Customer].[fax], [Customer].[nature], [Customer].[bank], [Customer].[postCode] from [Customer] where 1=1 ";
                if (toolBar.getValue("txtcustomerNameSearch") != "") {
                    sqlStr += " and [Customer].[customerName] like '%" + toolBar.getValue("txtcustomerNameSearch") + "%'";
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
                $("#formTitle").text("添加客户信息");
                $("#txtcustomerCode").val("");
                $("#txtcustomerName").val("");
                $("#txtcategory").val("");
                $("#txtaddress").val("");
                $("#txttelephone").val("");
                $("#txtfax").val("");
                $("#txtnature").val("");
                $("#txtbank").val("");
                $("#txtpostCode").val("");
                $("#txtscope").val("");
                $("#txtbusinessArea").val("");
                $("#txtbankAccount").val("");
                $("#txtapprovalBusinessLicense").val("");
                $("#txtlicenseNumber").val("");
                $("#txtlegalPerson").val("");
                $("#txtlegalPersonTelephone").val("");
                $("#txthead").val("");
                $("#txtheadTelephone").val("");
                $("#txtoperator").val("");
                $("#txtoperatorTelephone").val("");
                $("#txttransport").val("");
                $("#txtdestination").val("");
                $("#txtassetValue").val("");
                $("#txtestablishTime").val("");
                $("#chkkeepPromises").prop("checked", false);
                $("#chkcontractUser").prop("checked", false);
                $("#chkforSale").prop("checked", false);
                $("#chkforPurchase").prop("checked", false);
                $("#chkavailable").prop("checked", false);
                $("#txtsearchCode").val("");
                $("#txtcomment").val("");
                $("#txtbasicSituation").val("");

                customer = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑客户信息");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        fillPage(dictDataID);                       
                        showEditForm();
                    }
                    else {
                        alert("请仅选择一条要修改的行!");
                    }
                }
                else {
                    alert("请选择要修改的行!");
                }
                break;
            case "delete":
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "Customer";
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



    //初始化客户信息列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,客户编码,客户名称,客户类别,地址,联系电话,传真,企业性质,开户银行,邮编");
    listGrid.setInitWidths("40,0,70,150,80,120,80,70,80,80,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑客户信息");
        fillPage(rowID);       
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(600);
    //editForm.width(650);
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
        editForm.css({ top: 50, left: 180 }).show();
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

    function fillPage(customerID) {
        ISystemService.getDynObjectByID.dynObjectID = customerID;
        ISystemService.getDynObjectByID.structName = "Customer";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customer = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtcustomerCode").val(customer.customerCode);
        $("#txtcustomerName").val(customer.customerName);
        $("#txtcategory").val(customer.category);
        $("#txtaddress").val(customer.address);
        $("#txttelephone").val(customer.telephone);
        $("#txtfax").val(customer.fax);
        $("#txtnature").val(customer.nature);
        $("#txtbank").val(customer.bank);
        $("#txtpostCode").val(customer.postCode);
        $("#txtscope").val(customer.scope);
        $("#txtbusinessArea").val(customer.businessArea);
        $("#txtbankAccount").val(customer.bankAccount);
        $("#txtapprovalBusinessLicense").val(customer.approvalBusinessLicense);
        $("#txtlicenseNumber").val(customer.licenseNumber);
        $("#txtlegalPerson").val(customer.legalPerson);
        $("#txtlegalPersonTelephone").val(customer.legalPersonTelephone);
        $("#txthead").val(customer.head);
        $("#txtheadTelephone").val(customer.headTelephone);
        $("#txtoperator").val(customer.operator);
        $("#txtoperatorTelephone").val(customer.operatorTelephone);
        $("#txttransport").val(customer.transport);
        $("#txtdestination").val(customer.destination);
        $("#txtassetValue").val(customer.assetValue);
        $("#txtestablishTime").val(customer.establishTime);
        $("#chkkeepPromises").prop("checked", customer.keepPromises);
        $("#chkcontractUser").prop("checked", customer.contractUser);
        $("#chkforSale").prop("checked", customer.forSale);
        $("#chkforPurchase").prop("checked", customer.forPurchase);
        $("#chkavailable").prop("checked", customer.available);
        $("#txtsearchCode").val(customer.searchCode);
        $("#txtcomment").val(customer.comment);
        $("#txtbasicSituation").val(customer.basicSituation);
    }


    //保存
    $("#btn_Save").click(function () {
        if (!$("#txtcustomerCode").validate("required", "客户编码")) {
            return false;
        }
        if (!$("#txtcustomerName").validate("required", "客户名称")) {
            return false;
        }      

        if (customer == null) {
            customer = CustomerClass.createInstance();
            ISystemService.getNextID.typeName = "Customer";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customer.customerID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }

        customer.customerCode = $("#txtcustomerCode").val();


        customer.customerName = $("#txtcustomerName").val();


        if ($.trim($("#txtcategory").val()) != '') {
            customer.category = $("#txtcategory").val();
        }
        else {
            customer.category = null;
        }


        if ($.trim($("#txtaddress").val()) != '') {
            customer.address = $("#txtaddress").val();
        }
        else {
            customer.address = null;
        }


        if ($.trim($("#txttelephone").val()) != '') {
            customer.telephone = $("#txttelephone").val();
        }
        else {
            customer.telephone = null;
        }


        if ($.trim($("#txtfax").val()) != '') {
            customer.fax = $("#txtfax").val();
        }
        else {
            customer.fax = null;
        }


        if ($.trim($("#txtnature").val()) != '') {
            customer.nature = $("#txtnature").val();
        }
        else {
            customer.nature = null;
        }


        if ($.trim($("#txtbank").val()) != '') {
            customer.bank = $("#txtbank").val();
        }
        else {
            customer.bank = null;
        }


        if ($.trim($("#txtpostCode").val()) != '') {
            customer.postCode = $("#txtpostCode").val();
        }
        else {
            customer.postCode = null;
        }


        if ($.trim($("#txtscope").val()) != '') {
            customer.scope = $("#txtscope").val();
        }
        else {
            customer.scope = null;
        }


        if ($.trim($("#txtbusinessArea").val()) != '') {
            customer.businessArea = $("#txtbusinessArea").val();
        }
        else {
            customer.businessArea = null;
        }


        if ($.trim($("#txtbankAccount").val()) != '') {
            customer.bankAccount = $("#txtbankAccount").val();
        }
        else {
            customer.bankAccount = null;
        }


        if ($.trim($("#txtapprovalBusinessLicense").val()) != '') {
            customer.approvalBusinessLicense = $("#txtapprovalBusinessLicense").val();
        }
        else {
            customer.approvalBusinessLicense = null;
        }


        if ($.trim($("#txtlicenseNumber").val()) != '') {
            customer.licenseNumber = $("#txtlicenseNumber").val();
        }
        else {
            customer.licenseNumber = null;
        }


        if ($.trim($("#txtlegalPerson").val()) != '') {
            customer.legalPerson = $("#txtlegalPerson").val();
        }
        else {
            customer.legalPerson = null;
        }


        if ($.trim($("#txtlegalPersonTelephone").val()) != '') {
            customer.legalPersonTelephone = $("#txtlegalPersonTelephone").val();
        }
        else {
            customer.legalPersonTelephone = null;
        }


        if ($.trim($("#txthead").val()) != '') {
            customer.head = $("#txthead").val();
        }
        else {
            customer.head = null;
        }


        if ($.trim($("#txtheadTelephone").val()) != '') {
            customer.headTelephone = $("#txtheadTelephone").val();
        }
        else {
            customer.headTelephone = null;
        }


        if ($.trim($("#txtoperator").val()) != '') {
            customer.operator = $("#txtoperator").val();
        }
        else {
            customer.operator = null;
        }


        if ($.trim($("#txtoperatorTelephone").val()) != '') {
            customer.operatorTelephone = $("#txtoperatorTelephone").val();
        }
        else {
            customer.operatorTelephone = null;
        }


        if ($.trim($("#txttransport").val()) != '') {
            customer.transport = $("#txttransport").val();
        }
        else {
            customer.transport = null;
        }


        if ($.trim($("#txtdestination").val()) != '') {
            customer.destination = $("#txtdestination").val();
        }
        else {
            customer.destination = null;
        }


        if ($.trim($("#txtassetValue").val()) != '') {
            customer.assetValue = $("#txtassetValue").val();
        }
        else {
            customer.assetValue = null;
        }


        if ($.trim($("#txtestablishTime").val()) != '') {
            customer.establishTime = $("#txtestablishTime").val();
        }
        else {
            customer.establishTime = null;
        }        

        customer.forSale = $("#chkforSale").prop("checked");
        customer.forPurchase = $("#chkforPurchase").prop("checked");
        customer.available = $("#chkavailable").prop("checked");
        customer.contractUser = $("#chkcontractUser").prop("checked");
        customer.keepPromises = $("#chkkeepPromises").prop("checked");

        if ($.trim($("#txtsearchCode").val()) != '') {
            customer.searchCode = $("#txtsearchCode").val();
        }
        else {
            customer.searchCode = null;
        }


        if ($.trim($("#txtcomment").val()) != '') {
            customer.comment = $("#txtcomment").val();
        }
        else {
            customer.comment = null;
        }


        if ($.trim($("#txtbasicSituation").val()) != '') {
            customer.basicSituation = $("#txtbasicSituation").val();
        }
        else {
            customer.basicSituation = null;
        }


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customer;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customer.customerID);
                    dictData.data.push(0);
                    dictData.data.push(customer.customerID);

                    dictData.data.push($("#txtcustomerCode").val());

                    dictData.data.push($("#txtcustomerName").val());

                    dictData.data.push($("#txtcategory").val());

                    dictData.data.push($("#txtaddress").val());

                    dictData.data.push($("#txttelephone").val());

                    dictData.data.push($("#txtfax").val());

                    dictData.data.push($("#txtnature").val());

                    dictData.data.push($("#txtbank").val());

                    dictData.data.push($("#txtpostCode").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customer;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customer.customerID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtcustomerCode").val();

                            dictDataList.rows[i].data[3] = $("#txtcustomerName").val();

                            dictDataList.rows[i].data[4] = $("#txtcategory").val();

                            dictDataList.rows[i].data[5] = $("#txtaddress").val();

                            dictDataList.rows[i].data[6] = $("#txttelephone").val();

                            dictDataList.rows[i].data[7] = $("#txtfax").val();

                            dictDataList.rows[i].data[8] = $("#txtnature").val();

                            dictDataList.rows[i].data[9] = $("#txtbank").val();

                            dictDataList.rows[i].data[10] = $("#txtpostCode").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("客户信息修改成功!");
        }


        refreshToolBarState();
    });

    //加载弹窗Div
    //生成拼音首字母
    //$('#txtcustomerName').keydown(function () {
    //    $('#txtsearchCode').val(makePy($('#txtcustomerName').val()));
    //});


    //生成拼音首字母
    $('#txtcustomerName').on("keyup", function () {
        $('#txtsearchCode').val(makePy($('#txtcustomerName').val()));
    })

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
            }
            else {
                toolBar.enableItem("modify");
            }
            toolBar.enableItem("delete");
        }
    }

})