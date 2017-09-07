$(function () {
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,User,IAPIManageService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        var toolBar, listGrid, editState, editForm, queryTableString, dictDataList, sqlStr, sqlQueryStr, addMember,
        isSameNameExist = false,
        order = "order by a.[UserID] desc",
        dictDataList = new rock.JsonList();
        window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
        userList = new rock.JsonList();
        toolBar = new dhtmlXToolbarObject("toolbar", 'dhx_skyblue');
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        toolBar.addButton("add", 1, "添加", "add.png", "addDisabled.png");
        toolBar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
        toolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    //toolBarEdit.enableItem("save");                      // 禁用保存按钮
                    addMember = false;
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    editState = "add";
                    $("#editFormTitle").text("添加用户");
                    showEditForm();
                    $("#txtuserID").val("");
                    $("#txtuserName").val("");
                    $("#txttrueName").val("");
                    ISystemService.getNextID.typeName = 'User';
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#txtuserID").val(e.value);
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
                                    $("#txtuserID").val(dictDataList.rows[i].data[1]);
                                    $("#txtuserName").val(dictDataList.rows[i].data[2]);
                                    $("#txttrueName").val(dictDataList.rows[i].data[3]);
                                    editState = "modify";
                                    break;
                                }
                            }
                            $("#editFormTitle").text("编辑用户");
                            showEditForm();
                            $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
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
                    if (confirm("您确定要删除选定的用户吗?")) {
                        var rowids = checked.split(',');
                        var userRoleRelateExist = false;
                        for (var i = 0; i < rowids.length; i++) {
                            sqlStr = "SELECT [UserID],[RoleID] FROM [UserRole] where UserID =" + rowids[i];
                            ISystemService.execQuery.sqlString = sqlStr;
                            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                            if (ISystemService.execQuery.success) {
                                (function (e) {
                                    if (e != null) {
                                        if (e.rows.length > 0) {
                                            alert("该用户和角色存在关联关系，不能删除！");
                                        }
                                        else {
                                            deleteCheckUser(rowids[i]);
                                        }
                                    }
                                }(ISystemService.execQuery.resultValue));
                            }
                        }
                        refreshToolBarState();
                    }
                    break;
                case "query":
                    break;
            }
        });
        function deleteCheckUser(rowid) {
            ISystemService.deleteDynObjectByID.dynObjectID = rowid;
            ISystemService.deleteDynObjectByID.structName = "User";
            rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
            if (ISystemService.deleteDynObjectByID.success) {
                (function (e) {
                    for (var j = 0; j < dictDataList.rows.length; j++) {
                        if (dictDataList.rows[j].id == rowid) {
                            dictDataList.rows.splice(j, 1);
                            listGrid.deleteRow(rowid);
                            break;
                        }
                    }
                }(ISystemService.deleteDynObjectByID.resultValue));
            }
        }
        //动态设置Gird高度
        //$("#gridlist").css("height", $("#divMainPage").innerHeight() - 50 + "px")
        listGrid = new dhtmlXGridObject("gridlist");
        listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        listGrid.setSkin("dhx_skyblue");
        listGrid.setHeader("{#master_checkbox},,用户名,显示名称,创建时间");
        listGrid.setInitWidths("40,0,150,150,*");
        listGrid.setColAlign("center,left,left,left,left");
        listGrid.setColTypes("ch,ro,ro,ro,ro");
        listGrid.setColSorting("na,na,str,str,str");
        listGrid.enableDistributedParsing(true, 20);
        listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            for (var i = 0; i < dictDataList.rows.length; i++) {
                if (dictDataList.rows[i].id.toString() === rowID.toString()) {
                    $("#txtuserID").val(dictDataList.rows[i].data[1]);
                    $("#txtuserName").val(dictDataList.rows[i].data[2]);
                    $("#txttrueName").val(dictDataList.rows[i].data[3]);
                    editState = "modify";
                    $("#editFormTitle").text("编辑用户");
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

        sqlStr = "select [userID], [userName], [trueName], [CreateTime] from [User]";

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
            var user = null;
            isSameNameExist = false;
            var userID = $("#txtuserID").val();
            if (!rock.chknum(userID)) {
                alert('流水号输入格式错误');
                return false;
            }
            if (editState == "add") {
                user = UserClass.createInstance();
            }
            else {
                ISystemService.getDynObjectByID.dynObjectID = userID;
                ISystemService.getDynObjectByID.structName = "User";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        user = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                else {
                    return;
                }
            }

            var userName = $("#txtuserName").val();
            if (userName == '') {
                alert('用户名不能为空!');
                return false;
            }
            //验证用户名称是否合法
            if (window.rock.chkString($("#txtuserName").val()) == false) {
                alert("用户名只能输入字母和数字！");
                return;
            }
            if (editState == "add") {
                //根据用户名获取用户ID
                var referSql = "select [UserID] from [User] where UserName='" + userName + "'";
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

                //根据用户名获取用户ID
                var referSql = "select [UserID] from [User] where UserName='" + userName + "'";
                ISystemService.execQuery.sqlString = referSql;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var rowLength = rows.length;
                            if (rowLength > 0) {
                                var rowResult = rows[0].values;
                                if (rowResult[0].value != userID) {
                                    isSameNameExist = true;
                                }
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            if (isSameNameExist) {
                alert("用户名不能重复，请检查！");
                return;
            }
            var trueName = $("#txttrueName").val();
            if (trueName == '') {
                alert('显示名称不能为空!');
                return false;
            }
            //验证用户显示名称字符串是否合法
            if (window.rock.chkChar($("#txttrueName").val()) == false) {
                alert("显示名称只能输入字母、数字和中文字符！");
                return;
            }

            if ($.trim(userID) != "") {
                user.userID = userID;
            }

            if ($.trim(userName) != "") {
                user.userName = userName;
            }

            if ($.trim(trueName) != "") {
                user.trueName = trueName;
            }

            user.state = 1;

            if (editState == "add") {

                user.password = hex_md5("123456").toUpperCase();
                user.createTime = rock.getCurrentDate();
                ISystemService.addDynObject.dynObject = user;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        var dictData = new rock.JsonData(userID);
                        dictData.data.push(0);
                        dictData.data.push($("#txtuserID").val());
                        dictData.data.push($("#txtuserName").val());
                        dictData.data.push($("#txttrueName").val());
                        dictData.data.push(user.createTime);
                        dictDataList.rows.push(dictData);
                        listGrid.clearAll();
                        listGrid.parse(dictDataList, "json");
                        hideEditForm();
                    }(ISystemService.addDynObject.resultValue));
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = user;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        for (var i = 0; i < dictDataList.rows.length; i++) {
                            if (dictDataList.rows[i].id.toString() == userID) {
                                dictDataList.rows[i].data[0] = 0;
                                dictDataList.rows[i].data[1] = $("#txtuserID").val();
                                dictDataList.rows[i].data[2] = $("#txtuserName").val();
                                dictDataList.rows[i].data[3] = $("#txttrueName").val();
                                dictDataList.rows[i].data[4] = user.createTime;

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

        //初始化查询输入框
        $("#queryuserName").val("请输入用户名");
        $("#queryuserName").css('color', 'gray');
        //获取焦点
        $(function () {
            $("#queryuserName").focus(function () {//#input换成你的input的ID
                if ($("#queryuserName").val() == "请输入用户名") {
                    $("#queryuserName").val("");
                    $("#queryuserName").css('color', 'black');
                }
            })
        })
        //失去焦点
        $(function () {
            $("#queryuserName").focusout(function () {//#input换成你的input的ID
                if ($("#queryuserName").val() == "") {
                    $("#queryuserName").val("请输入用户名");
                    $("#queryuserName").css('color', 'gray');
                }
            })
        })

        //查询
        $("#btn_Query").click(function () {
            var where = "";
            var firstClause = true;

            if ($.trim($("#queryuserName").val()) != "" && $.trim($("#queryuserName").val()) != "请输入用户名") {
                //验证查询关键字是否合法
                if (window.rock.chkString($("#queryuserName").val()) == false) {
                    alert("查询关键字只能输入字母和数字！");
                    return;
                }
                if (firstClause) {
                    firstWhereClause = false;
                    if (window.rock.userInfo.userName == "admin") {
                        where += " and a.[userName] like '%" + $("#queryuserName").val() + "%'";
                    }
                    else {
                        where += " and a.[userName] like '%" + $("#queryuserName").val() + "%'";
                    }
                }
                else {
                    if (window.rock.userInfo.userName == "admin") {
                        where += " and a.[userName] like '%" + $("#queryuserName").val() + "%'";
                    }
                    else {
                        where += " and a.[userName] like '%" + $("#queryuserName").val() + "%'";
                    }
                }
            }
            sqlQueryStr = sqlStr + where + order;
            ISystemService.execQuery.sqlString = sqlQueryStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    fillDictDataList(e)
                }(ISystemService.execQuery.resultValue));
            }
            $("#queryuserName").focus();
        });

        var referClauseSql = "";

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
                        if (rowResult[j].value === "True") {
                            listdata.data[j + 1] = true;
                        }
                        else
                            if (rowResult[j].value === "False") {
                                listdata.data[j + 1] = false;
                            }
                            else {
                                listdata.data[j + 1] = rowResult[j].value;
                            }
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