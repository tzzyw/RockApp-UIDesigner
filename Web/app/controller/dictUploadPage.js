
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, dhxLayout, pictureToolBar, pictureDataView, divUploadLayout, uploadFile, documentToolBar, documentGrid,
      user = null,
	  editItem = $("#editItem"),
	  pictureDataList = [],
	  documentDataList = new rock.JsonList(),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,User";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项
        //初始化通用参照
        //绑定控件失去焦点验证方法
        //UserClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });
    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("a").attachObject("mainPage");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();

    //上传文档布局页面
    divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
    divUploadLayout.cells("a").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("document", "文档", 80, 1);
    tabbar.addTab("picture", "图片", 80, 1);

    tabbar.tabs("document").setActive();
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("picture").attachObject("pictureDiv");


    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("userName", null, "用户名称");
    toolBar.addInput("txtuserNameSearch", null, "", 100);


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


                sqlStr = "select [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1 ";

                if (toolBar.getValue("txtuserNameSearch") != "") {
                    sqlStr += " and [User].[userName] like '%" + toolBar.getValue("txtuserNameSearch") + "%'";
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
                $("#formTitle").text("添加用户");

                $("#txtuserName").val("");


                $("#txttrueName").val("");



                user = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑用户");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
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


                        $("#txtuserName").val(user.userName);


                        $("#txttrueName").val(user.trueName);


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
                        ISystemService.deleteDynObjectByID.structName = "User";
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


    //初始化用户列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,用户名,显示名");
    listGrid.setInitWidths("40,0,50,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("ch,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑用户");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
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

        $("#txtuserName").val(user.userName);


        $("#txttrueName").val(user.trueName);


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        refreshPictureToolBarState();
        refreshDocumentToolBarState();
        return true;
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getUploadDocument(rowID);
        getUploadPicture(rowID);
        return true;
    });
    listGrid.init();

    //初始化上传文档工具栏
    documentToolBar = new dhtmlXToolbarObject("documentToolBar");
    documentToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    documentToolBar.setSkin("dhx_skyblue");
    documentToolBar.addButton("upload", 2, "上传", "add.png", "addDisabled.png");
    documentToolBar.addSeparator("001", 1);
    documentToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    documentToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "upload":
                var objectID = listGrid.getCheckedRows(0);
                divUploadLayout.cells("a").attachURL("../view/UploadFile.html?objectID=" + objectID + "&objectType=用户");
                showUploadFile();
                break;
            case "delete":
                var checked = documentGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    var userRoleRelateExist = false;
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteUploadFile.uploadFileID = rowids[i];
                        rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                        if (ISystemService.deleteUploadFile.success) {
                            (function (e) {
                                for (var j = 0; j < documentDataList.rows.length; j++) {
                                    if (documentDataList.rows[j].id == rowids[i]) {
                                        documentDataList.rows.splice(j, 1);
                                        documentGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteUploadFile.resultValue));
                        }
                    }
                    refreshDocumentToolBarState();
                }
                break;
        }
    });

    documentGrid = new dhtmlXGridObject("documentGrid");
    documentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    documentGrid.setSkin("dhx_skyblue");
    documentGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,");
    documentGrid.setInitWidths("45,0,*,100,120,100,80,0");
    documentGrid.setColAlign("center,left,left,left,left,left,left,left");
    documentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    documentGrid.setColSorting("na,na,str,str,str,str,str,na");
    documentGrid.enableDistributedParsing(true, 20);
    documentGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        if (documentGrid.cells(rowID, 5).getValue() == '.txt') {
            var winname = window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            winname.document.execCommand('Saveas', false, "\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            winname.close();
        } else {
            window.location.href = "\\Upload\\" + documentGrid.cells(rowID, 7).getValue();
        }
    });
    //单击选中取消
    documentGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDocumentToolBarState();
        return true;
    });
    documentGrid.init();

    //初始化上传图片工具栏
    pictureToolBar = new dhtmlXToolbarObject("pictureToolBar")
    pictureToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    pictureToolBar.setSkin("dhx_skyblue");
    pictureToolBar.addButton("upload", 2, "上传", "add.png", "addDisabled.png");
    pictureToolBar.addSeparator("001", 1);
    pictureToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    pictureToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "upload":
                var objectID = listGrid.getCheckedRows(0);
                divUploadLayout.cells("a").attachURL("../view/UploadPicture.html?objectID=" + objectID + "&objectType=用户");
                showUploadFile();
                break;
            case "delete":
                var checked = pictureDataView.getSelected();
                if (confirm("您确定要删除选定的记录吗?")) {
                    if (typeof (checked) == 'string') {
                        ISystemService.deleteUploadFile.uploadFileID = checked;
                        rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                        if (ISystemService.deleteUploadFile.success) {
                            (function (e) {
                                for (var j = 0; j < pictureDataList.length; j++) {
                                    if (pictureDataList[j].id == checked) {
                                        pictureDataList.splice(j, 1);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteUploadFile.resultValue));
                        }
                        pictureDataView.clearAll();
                        pictureDataView.parse(pictureDataList, "json");
                        refreshPictureToolBarState();
                        break;
                    }
                    else if (typeof (checked) == 'object') {
                        for (var i = 0; i < checked.length; i++) {
                            ISystemService.deleteUploadFile.uploadFileID = checked[i];
                            rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                            if (ISystemService.deleteUploadFile.success) {
                                (function (e) {
                                    for (var j = 0; j < pictureDataList.length; j++) {
                                        if (pictureDataList[j].id == checked[i]) {
                                            pictureDataList.splice(j, 1);
                                            pictureDataView.move(checked[i], 0);
                                            break;
                                        }
                                    }
                                }(ISystemService.deleteUploadFile.resultValue));
                            }
                        }
                        pictureDataView.clearAll();
                        pictureDataView.parse(pictureDataList, "json");
                        refreshPictureToolBarState();
                        break;
                    }
                }
                break;
        }
    });

    pictureDataView = new dhtmlXDataView({
        container: "pictureDataView",
        type: {
            template: "<img src='#filePath#' style='width:200px ;height:135px'> </img><br/>#fileName#",
            height: 140,
            width: 200
        }
    });
    //单击选中取消
    pictureDataView.attachEvent("onItemClick", function (id, ev, html) {
        pictureToolBar.enableItem("delete");
        return true;
    });
    //单击选中取消
    pictureDataView.attachEvent("onItemDblClick", function (id, ev, html) {
        pictureToolBar.enableItem("delete");
        window.open(pictureDataView.get(id).filePath);
        return true;
    });

    refreshPictureToolBarState();
    refreshDocumentToolBarState();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(175);
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

    tableString = '<table style="width: 98%"><tr> <td class="label">用户名称</td><td class="inputtd"><input id="txtuserName" class="smallInput" type="text" /></td></tr><tr> <td class="label">显示名</td><td class="inputtd"><input id="txttrueName" class="smallInput" type="text" /></td></tr></table>';
    editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (user == null) {
            user = UserClass.createInstance();
            ISystemService.getNextID.typeName = "User";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    user.userID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!user.ValidateValue()) {
            return;
        }

        user.userName = $("#txtuserName").val();


        if ($.trim($("#txttrueName").val()) != '') {
            user.trueName = $("#txttrueName").val();
        }
        else {
            user.trueName = null;
        }


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = user;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(user.userID);
                    dictData.data.push(0);
                    dictData.data.push(user.userID);

                    dictData.data.push($("#txtuserName").val());

                    dictData.data.push($("#txttrueName").val());

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
                        if (dictDataList.rows[i].id == user.userID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtuserName").val();

                            dictDataList.rows[i].data[3] = $("#txttrueName").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("用户修改成功!");
        }


        refreshToolBarState();
    });

    //加载弹窗Div










    //文档上传
    uploadFile = $("#uploadFile");
    uploadFile.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                uploadFile.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    uploadFile.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideUploadFile();
    function hideUploadFile() {
        uploadFile.hide();
        uploadFile.css("visibility", "visible");

    }
    function showUploadFile() {
        uploadFile.css({ top: 20, left: 30 }).show();
    }

    //文档上传界面关闭按钮
    $("#uploadFile_Close").click(function () {
        hideUploadFile();
        if (tabbar.getActiveTab() == "picture") {
            getUploadPicture(listGrid.getCheckedRows(0));
        }
        else if (tabbar.getActiveTab() == "document") {
            getUploadDocument(listGrid.getCheckedRows(0));
        }
    });

    function getUploadPicture(rowID) {
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and [ObjectID] = " + rowID + " order by UploadTime desc";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    pictureDataView.clearAll();
                    pictureDataList = [];
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.fileName = rowResult[1].value.split('.')[0];
                        listdata.filePath = "\\Upload\\" + rowResult[2].value;

                        pictureDataList.push(listdata);
                    }
                    pictureDataView.parse(pictureDataList, "json");
                }
            }(ISystemService.execQuery.resultValue));
        }
    }
    function getUploadDocument(rowID) {
        documentGrid.clearAll();
        documentDataList.rows = [];
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and [ObjectID] = " + rowID + "  order by UploadTime desc";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
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
                        documentDataList.rows.push(listdata);
                    }
                    documentGrid.parse(documentDataList, "json");
                }
            }(ISystemService.execQuery.resultValue));
        }
    }
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
    //文档上传按钮状态控制
    function refreshDocumentToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            documentToolBar.disableItem("upload");
            documentToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                documentToolBar.disableItem("upload");
            }
            else {
                documentToolBar.enableItem("upload");
            }
        }
        var checked = documentGrid.getCheckedRows(0);
        if (checked == "") {
            documentToolBar.disableItem("delete");
        }
        else {
            documentToolBar.enableItem("delete");
        }
    }
    //图片上传按钮状态控制
    function refreshPictureToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            pictureToolBar.disableItem("upload");
            pictureToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                pictureToolBar.disableItem("upload");
            }
            else {
                pictureToolBar.enableItem("upload");
            }
        }

        var checked = pictureDataView.getSelected();
        if (checked == "") {
            pictureToolBar.disableItem("delete");
        }
        else {
            pictureToolBar.enableItem("delete");
        }
    }


})