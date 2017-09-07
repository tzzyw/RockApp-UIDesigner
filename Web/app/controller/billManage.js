$(function () {
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Bill";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var toolBar, listGrid, editState, editForm, queryTableString, dictDataList, sqlStr, sqlQueryStr,
        isSameNameExist = false,
        dictDataList = new rock.JsonList();
        window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
        userList = new rock.JsonList();
        toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        toolBar.addButton("add", 1, "添加", "add.png", "addDisabled.png");
        toolBar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
        toolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    editState = "add";
                    $("#editFormTitle").text("添加单据");
                    showEditForm();
                    $("#txtBillID").val("");
                    $("#txtBillType").val("");
                    $("#txtPrefix").val("");
                    ISystemService.getNextID.typeName = 'Bill';
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#txtBillID").val(e.value);
                        }(ISystemService.getNextID.resultValue))
                    }
                    break;
                case "modify":
                    var checked = listGrid.getCheckedRows(0);
                    if (checked != "") {
                        if (checked.indexOf(',') == -1) {
                            var dictDataID = listGrid.cells(checked, 1).getValue();
                            for (var i = 0; i < dictDataList.rows.length; i++) {
                                if (dictDataList.rows[i].id.toString() === dictDataID.toString()) {
                                    $("#txtBillID").val(dictDataList.rows[i].data[1]);
                                    $("#txtBillType").val(dictDataList.rows[i].data[2]);
                                    $("#txtPrefix").val(dictDataList.rows[i].data[3]);
                                    editState = "modify";
                                    break;
                                }
                            }
                            $("#editFormTitle").text("编辑单据信息");
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
                        var userRoleRelateExist = false;
                        for (var i = 0; i < rowids.length; i++) {
                            ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                            ISystemService.deleteDynObjectByID.structName = "Bill";
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
        //动态设置Gird高度
        //$("#gridlist").css("height", $("#divMainPage").innerHeight() - 45 + "px")
        listGrid = new dhtmlXGridObject("gridlist");
        listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        listGrid.setSkin("dhx_skyblue");
        listGrid.setHeader("选择,,单据类型,编号前缀,可用单据号,最后获取日期");
        listGrid.setInitWidths("45,0,*,*,100,*");
        listGrid.setColAlign("center,left,left,left,left,left");
        listGrid.setColTypes("ch,ro,ro,ro,ro,ro");
        listGrid.setColSorting("na,na,str,str,str,str");
        listGrid.enableDistributedParsing(true, 20);
        listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            for (var i = 0; i < dictDataList.rows.length; i++) {
                if (dictDataList.rows[i].id.toString() === rowID.toString()) {
                    $("#txtBillID").val(dictDataList.rows[i].data[1]);
                    $("#txtBillType").val(dictDataList.rows[i].data[2]);
                    $("#txtPrefix").val(dictDataList.rows[i].data[3]);
                    editState = "modify";
                    $("#editFormTitle").text("编辑单据信息");
                    showEditForm();
                    break;
                }
            }
        });
        listGrid.setPagingSkin("toolBar", "dhx_skyblue");
        //单击选中取消
        listGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshToolBarState();
            return true;
        });
        listGrid.init();

        sqlStr = "SELECT [BillID],[BillType],[Prefix],[AvailableBillNO],convert(nvarchar(10),[LastDate],120) as [LastDate] FROM [Bill]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                fillDictDataList(e)
            }(ISystemService.execQuery.resultValue));
        }

        //初始化工具栏状态
        refreshToolBarState();
        //保存
        $("#btn_Save").click(function () {
            var bill = null;
            isSameNameExist = false;
            if (!rock.chknum($("#txtBillID").val())) {
                alert('流水号输入格式错误');
                return false;
            }
            if (editState == "add") {
                bill = BillClass.createInstance();
            }
            else {
                ISystemService.getDynObjectByID.dynObjectID = $("#txtBillID").val();
                ISystemService.getDynObjectByID.structName = "Bill";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        bill = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                else {
                    return;
                }
            }

            if ($.trim($("#txtBillType").val()) == '') {
                alert('单据类型不能为空!');
                return false;
            }
            if ($.trim($("#txtPrefix").val()) == '') {
                alert('编号前缀不能为空!');
                return false;
            }
            if (editState == "add") {
                var referSql = "select [BillType] from [Bill] where BillType='" + $.trim($("#txtBillType").val()) + "'";
                ISystemService.execQuery.sqlString = referSql;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var rowLength = rows.length;
                            if (rows.length > 0) {
                                isSameNameExist = true;
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            else {
                var referSql = "select [BillID] from [Bill] where BillType='" + $.trim($("#txtBillType").val()) + "'";
                ISystemService.execQuery.sqlString = referSql;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var rowLength = rows.length;
                            if (rowLength > 0) {
                                var rowResult = rows[0].values;
                                if (rowResult[0].value != $("#txtBillID").val()) {
                                    isSameNameExist = true;
                                }
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            if (isSameNameExist) {
                alert("单据类型不能重复，请检查！");
                return;
            }
            bill.billID = $("#txtBillID").val();
            bill.billType = $("#txtBillType").val();
            bill.prefix = $("#txtPrefix").val();

            if (editState == "add") {
                bill.availableBillNO = "1";
                bill.lastDate = "2001-1-1";
                ISystemService.addDynObject.dynObject = bill;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        var dictData = new rock.JsonData($("#txtBillID").val());
                        dictData.data.push(0);
                        dictData.data.push($("#txtBillID").val());
                        dictData.data.push($("#txtBillType").val());
                        dictData.data.push($("#txtPrefix").val());
                        dictData.data.push("1");
                        dictData.data.push("2001-1-1");
                        dictDataList.rows.push(dictData);
                        listGrid.clearAll();
                        listGrid.parse(dictDataList, "json");
                        hideEditForm();
                    }(ISystemService.addDynObject.resultValue));
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = bill;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        for (var i = 0; i < dictDataList.rows.length; i++) {
                            if (dictDataList.rows[i].id.toString() == $("#txtBillID").val()) {
                                dictDataList.rows[i].data[0] = 0;
                                dictDataList.rows[i].data[1] = $("#txtBillID").val();
                                dictDataList.rows[i].data[2] = $("#txtBillType").val();
                                dictDataList.rows[i].data[3] = $("#txtPrefix").val();
                            }
                        }
                    }(ISystemService.modifyDynObject.resultValue));
                }
                listGrid.clearAll();
                listGrid.parse(dictDataList, "json");
                hideEditForm();
            }
            refreshToolBarState();
        });
        //取消
        $("#btn_Cancle").click(function () {
            hideEditForm();
        });
        //关闭
        $("#img_Close").click(function () {
            hideEditForm();
        });

        editForm = $("#editForm");
        editForm.height(220);
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
        function fillDictDataList(e) {
            if (e != null) {
                listGrid.clearAll();
                dictDataList.rows = [];
                var rows = e.rows;
                var colLength = e.columns.length;
                var rowLength = rows.length;
                for (var i = 0; i < rowLength; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    for (var j = 0; j < colLength; j++) {
                        listdata.data[j + 1] = rowResult[j].value;
                    }
                    dictDataList.rows.push(listdata);
                }
                listGrid.parse(dictDataList, "json");
            }
        }
        //添加按钮状态控制
        function addEnabled() {
            return true;
        }
        //修改按钮状态控制
        function modifyEnabled() {
            var checked = listGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                if (rowids.length != 1) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        //删除按钮状态控制
        function deleteEnabled() {
            var checked = listGrid.getCheckedRows(0);
            if (checked == "") {
                return false;
            }
            else {
                return true;
            }
        }
        //工具栏按钮状态控制
        function refreshToolBarState() {
            if (addEnabled()) {
                toolBar.enableItem("add");
            }
            else {
                toolBar.disableItem("add");
            }

            if (modifyEnabled()) {
                toolBar.enableItem("modify");
            }
            else {
                toolBar.disableItem("modify");
            }
            if (deleteEnabled()) {
                toolBar.enableItem("delete");
            }
            else {
                toolBar.disableItem("delete");
            }
        }
    });
})