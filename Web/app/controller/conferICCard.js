
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      iCCard = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,ICCard";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        }

        //处理初始化加载数据
        sqlStr = "select top 50 [ICCard].[ICCardID], [ICCard].[customerCode], [Customer].[CustomerName], [ICCard].[iCCardNumber], convert(nvarchar(10),[ICCard].[releaseDate],120) as releaseDate, [ICCard].[sender], case [ICCard].[available] WHEN '1' THEN '是' WHEN '0' THEN '否' END  from [ICCard] join [Customer] on [ICCard].[CustomerCode] = [Customer].[CustomerCode]  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项


        customerComplete("");

        //绑定控件失去焦点验证方法
        //ICCardClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("customerCode", null, "客户名称");
    toolBar.addInput("txtcustomerCodeSearch", null, "", 100);
    toolBar.addText("iCCardNumber", null, "IC身份卡编号");
    toolBar.addInput("txtiCCardNumberSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    //toolBar.addButton("modify", null, "修改");
    //toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                sqlStr = "select [ICCard].[ICCardID], [ICCard].[customerCode], [Customer].[CustomerName], [ICCard].[iCCardNumber], convert(nvarchar(10),[ICCard].[releaseDate],120) as releaseDate, [ICCard].[sender], case [ICCard].[available] WHEN '1' THEN '是' WHEN '0' THEN '否' END  from [ICCard] join [Customer] on [ICCard].[CustomerCode] = [Customer].[CustomerCode] ";
                if (toolBar.getValue("txtcustomerCodeSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerCodeSearch") + "%'";
                }
                
                if (toolBar.getValue("txtiCCardNumberSearch") != "") {
                    sqlStr += " and [ICCard].[iCCardNumber] like '%" + toolBar.getValue("txtiCCardNumberSearch") + "%'";
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
                $("#formTitle").text("添加IC卡");

                $("#txtcustomer").val("");
                $("#txtcustomerCode").val("");
                $("#txtiCCardNumber").val("");

                $("#chkavailable").attr("checked", true);

                $("#txtsender").val("宋新华");

                $("#txtreleaseDate").val(serverDate);

                $("#txtcomment").val("");

                iCCard = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑IC卡");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "ICCard";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                iCCard = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }


                        $("#txtcustomerCode").val(iCCard.customerCode);


                        $("#txtiCCardNumber").val(iCCard.iCCardNumber);


                        $("#chkavailable").attr("checked", iCCard.available);

                        $("#txtsender").val(iCCard.sender);


                        $("#txtreleaseDate").val(iCCard.releaseDate.split(' ')[0]);

                        $("#txtcomment").val(iCCard.comment);


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
                        ISystemService.deleteDynObjectByID.structName = "ICCard";
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

    //初始化IC卡列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户编码,客户名称,IC身份卡编号,发放日期,发卡人,是否可用");
    listGrid.setInitWidths("40,0,80,200,100,80,70,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        return;
        editState = "modify";
        $("#formTitle").text("编辑IC卡");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "ICCard";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                iCCard = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtcustomerCode").val(iCCard.customerCode);

        $("#txtcustomer").val(listGrid.cells(rowID, 3).getValue());

        $("#txtiCCardNumber").val(iCCard.iCCardNumber);


        $("#chkavailable").attr("checked", iCCard.available);
       
        $("#txtsender").val(iCCard.sender);


        $("#txtreleaseDate").val(iCCard.releaseDate.split(' ')[0]);

        $("#txtcomment").val(iCCard.comment);


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(275);
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

    $("#btn_Read").click(function () {

        clearData();
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
        }
        setTimeout("getData()", 1000);

        //var activeX = document.getElementById("cSharpActiveX");
        //$("#txtiCCardNumber").val(activeX.ReadNum(3, 1, 0));
        //var time = new Date().getTime();
        //var url = 'test.html?' + time;
        //window.open(url, '_blank', 'width=1,height=1,left=-200,top=-200');
    });  

 
    //保存
    $("#btn_Save").click(function () {

        if (!$("#txtiCCardNumber").validate("required", "IC身份卡编号")) {
            return false;
        }
       
        if (!$("#txtreleaseDate").validate("date", "发卡日期")) {
            return false;
        }       

        if (iCCard == null) {
            iCCard = ICCardClass.createInstance();
            ISystemService.getNextID.typeName = "ICCard";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    iCCard.iCCardID = e.value;
                    iCCard.iCCardCate = "身份卡";
                    iCCard.password = "888888";
                }(ISystemService.getNextID.resultValue))
            }
        }
        var count = 0;
        ISystemService.executeScalar.sqlString = "select COUNT(*) from [ICCard] where [ICCardNumber] = '" + $("#txtiCCardNumber").val() + "'";
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                count = parseInt((e.value),10);
            }(ISystemService.executeScalar.resultValue));
        }
       
        if (count > 0) {
            alert("该IC卡已绑定客户，请检查!");
            return;
        }

        iCCard.customerCode = $("#txtcustomerCode").val();


        iCCard.iCCardNumber = $("#txtiCCardNumber").val();

        iCCard.available = $("#chkavailable").attr("checked");
        iCCard.customerCode = $("#txtcustomerCode").val();

        iCCard.sender = $("#txtsender").val();
        iCCard.releaseDate = $("#txtreleaseDate").val();       
      

        if ($.trim($("#txtcomment").val()) != '') {
            iCCard.comment = $("#txtcomment").val();
        }
        else {
            iCCard.comment = null;
        }

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = iCCard;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(iCCard.iCCardID);
                    dictData.data.push(0);
                    dictData.data.push(iCCard.iCCardID);

                    dictData.data.push($("#txtcustomerCode").val());

                    dictData.data.push($("#txtcustomer").val());

                    dictData.data.push($("#txtiCCardNumber").val());

                    dictData.data.push($("#txtreleaseDate").val());

                    dictData.data.push($("#txtsender").val());
                   
                    if ($("#chkavailable").attr("checked")) {
                        dictData.data.push("是");
                    }
                    else {
                        dictData.data.push("否");
                    }

                    $("#chkavailable").attr("checked", iCCard.available);
                    iCCard.available = $("#chkavailable").attr("checked");
                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = iCCard;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == iCCard.iCCardID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtcustomerCode").val();

                            dictDataList.rows[i].data[3] = $("#txtpassword").val();

                            dictDataList.rows[i].data[4] = $("#txtiCCardNumber").val();

                            dictDataList.rows[i].data[5] = $("#txtreleaseDate").val();

                            dictDataList.rows[i].data[6] = $("#txtsender").val();

                            if ($("#chkavailable").attr("checked")) {
                                dictDataList.rows[i].data[7] = "是";
                            }
                            else {
                                dictDataList.rows[i].data[7] = "否";
                            }                           
                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("IC卡修改成功!");
        }
        refreshToolBarState();
    });
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

        ISystemService.getObjectProperty.objName = "Customer";
        ISystemService.getObjectProperty.property = "CustomerCode";
        ISystemService.getObjectProperty.ojbID = rowID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                $("#txtcustomerCode").val(e.value);
            }(ISystemService.getObjectProperty.resultValue));
        }
        
        $("#txtcustomer").val(customerQuickGrid.cells(rowID, 2).getValue())
        //获取客户可用余额
     
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
        ISystemService.execQuery.sqlString = "select top 16 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [Available] = '1' and [ForSale] = '1' and [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
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
            //toolBar.disableItem("modify");
            toolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                //toolBar.disableItem("modify");
            }
            else {
                //toolBar.enableItem("modify");
            }
            toolBar.enableItem("delete");
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtreleaseDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');



})

// 获取数据
function getData() {
    try {
        var fso, file, data;
        fso = new ActiveXObject("Scripting.FileSystemObject");
        file = fso.OpenTextFile("C:\\card.cnp", 1)
        data = file.ReadLine();
        document.getElementById("txtiCCardNumber").value = data;
        file.Close();
    }
    catch (e) {
        alert(e);
    }
    clearData();
}
//清空数据
function clearData() {
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
}
