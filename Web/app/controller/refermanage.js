$(function () {
    var toolBar, toolBarEdit, listGrid, state, editForm, formItem, queryTableString, dictDataList, sqlStr, sqlQueryStr,
        isReferExist = false,
    dictDataList = new rock.JsonList(),
    referList = new rock.JsonList(),
    editForm = $("#editForm"),
    formItem = $("#formItem"),
    referType = decodeURI($.getUrlParam("referType")),
    dataType = $.getUrlParam("dataType"),
    order = " order by Refer.referID desc";
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";

    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Refer,Employee";
    $.getScript('../../LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        sqlStr = "select top 50 Refer.referID, Refer.referNo, Refer.referName from Refer";
        ISystemService.execQuery.sqlString = sqlStr + " where ReferType = '" + referType + "'" + order;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                fillDictDataList(e);
            }(ISystemService.execQuery.resultValue));
        }
       
        //初始化工具栏状态
        refreshToolBarState();
    });
    //初始化页面对象
    toolBar = new dhtmlXToolbarObject("toolBar");
    toolBar.setSkin("dhx_skyblue");
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    toolBar.addButton("add", 1, "添加", "add.png", "addDisabled.png");
    toolBar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
    toolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                state = "add";
                $("#editFormTitle").text("添加" + referType);
                showEditForm();
                $("#txtreferID").val("");
                $("#txtreferName").val("");
                ISystemService.getNextID.typeName = 'Refer';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        $("#txtreferID").val(e.value);
                    }(ISystemService.getNextID.resultValue));
                }
                break;
            case "modify":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        for (var i = 0; i < dictDataList.rows.length; i++) {
                            if (dictDataList.rows[i].id.toString() === dictDataID.toString()) {
                                $("#txtreferID").val(dictDataList.rows[i].data[1]);
                                //$("#txtreferNo").val(dictDataList.rows[i].data[2]);
                                $("#txtreferName").val(dictDataList.rows[i].data[3]);
                                state = "modify";
                                break;
                            }
                        }
                        $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                        $("#editFormTitle").text("编辑" + referType);
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
                if (checked != "") {
                    if (confirm("您确定要删除选定的行吗?")) {
                        var rowids = checked.split(',');
                        for (var i = 0; i < rowids.length; i++) {
                            ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                            ISystemService.deleteDynObjectByID.structName = "Refer";
                            rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                            if (ISystemService.deleteDynObjectByID.success) {
                                (function (e) {
                                    var dictDataID = rowids[i];
                                    for (var j = 0; j < dictDataList.rows.length; j++) {
                                        if (dictDataList.rows[j].id == dictDataID) {
                                            dictDataList.rows.splice(j, 1);
                                            listGrid.deleteRow(dictDataID);
                                            break;
                                        }
                                    }
                                }(ISystemService.deleteDynObjectByID.resultValue));
                            }
                        }
                    }
                }
                else {
                    alert("请选择要删除的行!");
                }
                break;
            case "query":
                break;
        }
    });
    //动态设置Gird高度
    //$("#gridlist").css("height", $("#divMainPage").innerHeight() - 85 + "px")
    listGrid = new dhtmlXGridObject("gridlist");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,," + referType);
    listGrid.setInitWidths("45,0,0,*");
    listGrid.setColAlign("center,center,left,left");
    listGrid.setColTypes("ch,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        for (var i = 0; i < dictDataList.rows.length; i++) {
            if (dictDataList.rows[i].id.toString() === rowID.toString()) {
                $("#txtreferID").val(dictDataList.rows[i].data[1]);
                //$("#txtreferNo").val(dictDataList.rows[i].data[2]);
                $("#txtreferName").val(dictDataList.rows[i].data[3]);
                state = "modify";
                $("#editFormTitle").text("编辑" + referType);
                showEditForm();
                break;
            }
        }
    });
    //单击选中取消
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    tableString = '<div style="width: 100%; height: 30px"><div id="editFormTitle" style="width:85%; float:left;padding:6px 5px 5px 5px;font-size:13px;font-weight:700">添加角色</div><div style="width:25px; float:right; padding:5px"><img alt="关闭" src="../../resource/dhtmlx/codebase/imgs/own/close.png" style="width:9px;height:8px"id="img_Close" /></div></div><hr /><table style="width: 98%; margin-top: 15px"><tr><td class="label">' + referType + '</td><td class="inputtd"><input id="txtreferName" class="smallInput" type="text" /><input id="txtreferID" class="smallInput" type="hidden" /></td></tr></table><div style="height:10px"></div><div style="text-align:right"><button class="btn" id="btn_Save" style="margin-right: 15px; margin-top: 5px; height: 28px">保存</button><button class="btn" id="btn_Cancle" style="margin-right: 30px; margin-top: 5px; height: 28px">取消</button></div></div>';
    formItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        var refer = ReferClass.createInstance();
        var referID = $("#txtreferID").val();
        if (!rock.chknum(referID)) {
            alert('流水号输入格式错误');
            return false;
        }
        if ($.trim(referID) != "") {
            refer.referID = referID;
        }
        var referNo = referID;// $.trim($("#txtreferNo").val());
        if ($.trim(referNo) == "") {
            alert(referType + '编码不能为空!');
            return;
        }
        //验证编码是否合法
        if (window.rock.chkString(referNo) == false) {
            alert(referType + "编码只能输入字母和数字！");
            return;
        }
        refer.referNo = referNo;
        var referName = $("#txtreferName").val();
        if ($.trim(referName) == '') {
            alert(referType + '不能为空!');
            return;
        }
        //验证编码是否合法
        if (window.rock.chkChar(referNo) == false) {
            alert(referType + "只能输入字母、数字和中文！");
            return;
        }
        if (dataType === "Num") {
            if (!rock.chknum(referName)) {
                alert(referType + '数字输入格式错误');
                return false;
            }
        }

        if ($.trim(referName) != "") {
            refer.referName = referName;
        }

        refer.referType = referType;
        refer.isAvailable = true;

        if (state == "add") {
            //验证是否已经存在相同的记录
            isReferExist = false;
            var sqlString = "select Refer.referID from Refer where (Refer.referNo = '" + refer.referNo + "' or Refer.referName = '" + refer.referName + "') and Refer.referType = '" + refer.referType + "'";
            ISystemService.execQuery.sqlString = sqlString;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var rowLength = rows.length;
                        if (rowLength > 0) {
                            isReferExist = true;
                        }
                    }
                }(ISystemService.execQuery.resultValue));
            }
            if (isReferExist) {
                alert("已经存在相同的记录，请检查！");
                return;
            }
            ISystemService.addDynObject.dynObject = refer;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(referID);
                    dictData.data.push(0);
                    dictData.data.push($("#txtreferID").val());
                    dictData.data.push($("#txtreferID").val());
                    dictData.data.push($("#txtreferName").val());
                    dictDataList.rows.unshift(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            //验证是否已经存在相同的记录
            isReferExist = false;
            var sqlString = "select Refer.referID from Refer where (Refer.referNo = " + refer.referNo + " or Refer.referName = '" + refer.referName + "') and Refer.referType = '" + refer.referType + "'";
            ISystemService.execQuery.sqlString = sqlString;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var rowLength = rows.length;
                        for (var i = 0; i < rowLength; i++) {
                            var rowResult = rows[i].values;
                            if (refer.referID != rowResult[0].value) {
                                isReferExist = true;
                                break;
                            }
                        }
                    }
                }(ISystemService.execQuery.resultValue));
            }
            if (isReferExist) {
                alert("已经存在相同的记录，请检查！");
                return;
            }

            ISystemService.modifyDynObject.dynObject = refer;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id.toString() == referID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[1] = $("#txtreferID").val();
                            dictDataList.rows[i].data[2] = $("#txtreferID").val();
                            dictDataList.rows[i].data[3] = $("#txtreferName").val();
                            break;
                        }
                    }
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.modifyDynObject.resultValue));
            }
        }
    });

    //取消
    $("#btn_Cancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //初始化查询输入框
    $("#queryreferName").val("请输入" + referType + "名称");
    $("#queryreferName").css('color', 'gray');
    //获取焦点
    $(function () {
        $("#queryreferName").focus(function () {//#input换成你的input的ID
            if ($("#queryreferName").val() == "请输入" + referType + "名称") {
                $("#queryreferName").val("");
                $("#queryreferName").css('color', 'black');
            }
        })
    })
    //失去焦点
    $(function () {
        $("#queryreferName").focusout(function () {//#input换成你的input的ID
            if ($("#queryreferName").val() == "") {
                $("#queryreferName").val("请输入" + referType + "名称");
                $("#queryreferName").css('color', 'gray');
            }
        })
    })
    //查询
    $("#btn_Query").click(function () {
        queryParamList();
    });
    //单击回车执行查询操作
    $("#queryreferName").keydown(function () {
        if (event.keyCode == 13) {
            queryParamList();
        }
    });
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
        editForm.css({ top: 80, left: 50 }).show();
    }
    function fillDictDataList(e) {
        if (e != null) {
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
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
        }
    }
    //根据条件查询参数列表
    function queryParamList() {
        var where = "";
        var firstClause = true;
        if ($("#queryreferName").val() != "" && $("#queryreferName").val() != "请输入" + referType + "名称") {
            //验证查询关键字是否合法
            if (window.rock.chkChar($("#queryreferName").val()) == false) {
                alert("查询关键字只能输入字母、数字和中文！");
                return;
            }
            if (firstClause) {
                firstWhereClause = false;
                where += " where Refer.referName like '%" + $("#queryreferName").val() + "%'";
            }
            else {
                where += " and Refer.referName like '%" + $("#queryreferName").val() + "%'";
            }
            sqlQueryStr = sqlStr + where + " and ReferType = '" + referType + "'";
        }
        else {
            sqlQueryStr = sqlStr + " where ReferType = '" + referType + "'";
        }

        ISystemService.execQuery.sqlString = sqlQueryStr + order;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                fillDictDataList(e);
            }(ISystemService.execQuery.resultValue));
        }
    } 
   
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