$(function () {
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,ElectricalRecord,ElectricalDepartment,IMotorMaintenanceService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        var toolBar, listGrid, editState, editForm, workloadForm, electricalRecord, queryTableString, divUploadLayout, uploadFile, documentToolBar, documentGrid, pictureToolBar, pictureDataView, dictDataList, dhxLayout, sqlStr, sqlQueryStr, addMember, motorMaintenanceRecord,
        isSameNameExist = false,
	    pictureDataList = [],
	    documentDataList = new rock.JsonList(),
        order = "order by a.[UserID] desc",
        dictDataList = new rock.JsonList();
        window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
        userList = new rock.JsonList();

        //界面布局
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("a").attachObject("divMainPage");
        dhxLayout.cells("b").setHeight(280);
        dhxLayout.cells("b").hideHeader();
        //上传文档布局页面
        divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
        divUploadLayout.cells("a").hideHeader();
        tabbar = dhxLayout.cells("b").attachTabbar();
        tabbar.addTab("document", "文档", 80, 1);
        //tabbar.addTab("picture", "图片", 80, 1);
        tabbar.tabs("document").setActive();
        tabbar.tabs("document").attachObject("documentDiv");
        //tabbar.tabs("picture").attachObject("pictureDiv");

        toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        toolBar.addButton("workload", null, "填写工作量", "edit.png", "editDisabled.png");
        toolBar.addSeparator("1", null);
        toolBar.addButton("submit", null, "提交", "countersign.png", "countersignDisable.png");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "workload":
                    ISystemService.getDynObjectByID.dynObjectID = listGrid.getCheckedRows(0);
                    ISystemService.getDynObjectByID.structName = "ElectricalRecord";
                    rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                    if (ISystemService.getDynObjectByID.success) {
                        (function (e) {
                            electricalRecord = e;
                            $("#txtWorkload").val(electricalRecord.workload);
                        }(ISystemService.getDynObjectByID.resultValue));
                    }
                    showDetailForm();
                    break;
                case "submit":
                    var checked = listGrid.getCheckedRows(0);
                    IMotorMaintenanceService.checkMaintenanceRecordState.recordID = listGrid.getCheckedRows(0);
                    IMotorMaintenanceService.checkMaintenanceRecordState.recordType = "ElectricalRecord";
                    IMotorMaintenanceService.checkMaintenanceRecordState.state = listGrid.cells(checked, 13).getValue();
                    rock.AjaxRequest(IMotorMaintenanceService.checkMaintenanceRecordState, rock.exceptionFun);
                    if (IMotorMaintenanceService.checkMaintenanceRecordState.success) {
                        (function (e) {
                            if (e.value) {
                                //ResumeBookmark:提交检修资料(真正的提交)
                                var equistr = [];
                                equistr[0] = "Handler^" + decodeURI($.cookie('userTrueName'));
                                equistr[1] = "ObjType^ElectricalRecord";
                                equistr[2] = "ObjID^" + checked;
                                equistr[3] = "StateField^" + "State";
                                equistr[4] = "StateValue^" + "班组已提交";

                                //接收检修报告，触发工作流书签
                                ISystemService.resumeBookmark.workflowToDoListID = listGrid.cells(checked, 2).getValue();
                                ISystemService.resumeBookmark.userID = $.cookie('userID');
                                ISystemService.resumeBookmark.exchangeParamLists = equistr;
                                rock.AjaxRequest(ISystemService.resumeBookmark, rock.exceptionFun);
                                if (ISystemService.resumeBookmark.success) {
                                    (function (e) {
                                        alert("提交成功！");
                                        initDataList();
                                        refreshToolBarState();
                                    }(ISystemService.resumeBookmark.resultValue));
                                }
                            }
                            else {
                                alert("电气检修流程已发生变化，请检查！");
                                return false;
                            }
                        }(IMotorMaintenanceService.checkMaintenanceRecordState.resultValue));
                    }
                    break;
            }
        });
        listGrid = new dhtmlXGridObject("gridlist");
        listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        listGrid.setSkin("dhx_skyblue");

        listGrid.setHeader("选择,,,业主,用户,所在装置,工作令号,项目名称,数量,计划工时,计划工期开始,计划工期结束,检修班组,状态,检修方式");
        listGrid.setInitWidths("40,0,0,68,68,68,68,116,68,68,90,90,68,68,*");
        listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,left,left,left,left");
        listGrid.setColSorting("na,na,na,na,str,str,str,str,str,str,str,str,str,str,str");
        listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        listGrid.enableDistributedParsing(true, 20);
        //单击选中取消
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
                    divUploadLayout.cells("a").attachURL("../view/UploadFile.html?objectID=" + objectID + "&objectType=ElectricalRecord&classify=classify");
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
        documentGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,,文档分类");
        documentGrid.setInitWidths("45,0,*,100,100,100,100,0,80");
        documentGrid.setColAlign("center,left,left,left,left,left,left,left,left");
        documentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro");
        documentGrid.setColSorting("na,na,str,str,str,str,str,na,na");
        documentGrid.enableDistributedParsing(true, 20);
        documentGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            //if (documentGrid.cells(rowID, 5).getValue() == '.txt') {
            //    var winname = window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            //    winname.document.execCommand('Saveas', false, "\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            //    winname.close();
            //} else {
            //    window.location.href = "\\Upload\\" + documentGrid.cells(rowID, 7).getValue();
            //}
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
                    divUploadLayout.cells("a").attachURL("../view/UploadPicture.html?objectID=" + objectID + "&objectType=ElectricalRecord");
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


        initDataList();

        //初始化数据列表
        function initDataList() {
            if ($.cookie('userName') == "admin") {
                sqlStr = "select [ElectricalRecord].[ElectricalRecordID],WorkflowToDoList.WorkflowToDoListID, [ElectricalRecord].[yezhuName], [ElectricalRecord].[yonghuName], [ElectricalRecord].[PositionName], [ElectricalRecord].[gongzuolinghao], [ElectricalRecord].[projectName], [ElectricalRecord].[number], [ElectricalRecord].[PlanWorkingHours], convert(nvarchar(10),[ElectricalRecord].[PlanWorkingBegin],120), convert(nvarchar(10),[ElectricalRecord].[PlanWorkingEnd],120), [Department].[DepartmentName], [ElectricalRecord].[State],ElectricalRecord.ExamineType from [ElectricalRecord] join [Department] on [ElectricalRecord].[departmentID] = [Department].[departmentID] inner join WorkflowToDoList on (ElectricalRecord.ElectricalRecordID=WorkflowToDoList.ObjID) where ElectricalRecord.State in ('已分配','技术员审核不合格','已接收','班组已提交') and ExamineType = '自修'";
            }
            else {
                sqlStr = "select [ElectricalRecord].[ElectricalRecordID],WorkflowToDoList.WorkflowToDoListID, [ElectricalRecord].[yezhuName], [ElectricalRecord].[yonghuName], [ElectricalRecord].[PositionName], [ElectricalRecord].[gongzuolinghao], [ElectricalRecord].[projectName], [ElectricalRecord].[number], [ElectricalRecord].[PlanWorkingHours], convert(nvarchar(10),[ElectricalRecord].[PlanWorkingBegin],120), convert(nvarchar(10),[ElectricalRecord].[PlanWorkingEnd],120), [Department].[DepartmentName], [ElectricalRecord].[State],ElectricalRecord.ExamineType from [ElectricalRecord] join [Department] on [ElectricalRecord].[departmentID] = [Department].[departmentID] inner join WorkflowToDoList on (ElectricalRecord.ElectricalRecordID=WorkflowToDoList.ObjID) inner join UserDepartment on ([ElectricalRecord].[DepartmentID] = UserDepartment.DepartmentID) where ElectricalRecord.State in ('已分配','技术员审核不合格','已接收','班组已提交')  and ExamineType = '自修' and UserDepartment.UserID = " + $.cookie('userID');
            }
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    fillDictDataList(e)
                }(ISystemService.execQuery.resultValue));
            }
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

        //委托单明细弹窗
        workloadForm = $("#workloadForm");
        workloadForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            var top = $("#workloadForm").offset().top;
            var left = $("#workloadForm").offset().left;

            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    workloadForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        workloadForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideDetailForm();
        function hideDetailForm() {
            workloadForm.css({ top: 200, left: -1300 }).hide();
        }
        function showDetailForm() {
            workloadForm.css({ top: 100, left: 180 }).show();
        }

        $("#btnWorkload_Cancle").click(function () {
            hideDetailForm();

        });
        $("#imgWorkload_Close").click(function () {
            hideDetailForm();

        });
        $("#btnWorkload_Save").click(function () {
            electricalRecord.workload = $("#txtWorkload").val();
            ISystemService.modifyDynObject.dynObject = electricalRecord;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    alert("填写工作量完成！");
                }(ISystemService.modifyDynObject.resultValue));
            }
            hideDetailForm();
        });

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
            sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and [ObjectType] ='ElectricalRecord' and [ObjectID] = " + rowID + " order by UploadTime desc";
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
            sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName],Classify FROM [UploadFile] where [FileType] = '文档' and [ObjectType] ='ElectricalRecord' and [ObjectID] = " + rowID + "  order by UploadTime desc";
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

        //初始化工具栏状态
        refreshToolBarState();

        //其他按钮状态控制
        function uploadEnabled() {
            var checked = listGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                if (rowids.length != 1) {
                    return false;
                }
                else {
                    if (listGrid.cells(checked, 13).getValue() == "已接收" || listGrid.cells(checked, 13).getValue() == "技术员审核不合格") {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
        }
        //工具栏按钮状态控制
        function refreshToolBarState() {
            if (uploadEnabled()) {
                toolBar.enableItem("workload");
                toolBar.enableItem("submit");
            }
            else {
                toolBar.disableItem("workload");
                toolBar.disableItem("submit");
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
                if (rowids.length == 1 && (listGrid.cells(checked, 13).getValue() == "已接收" || listGrid.cells(checked, 13).getValue() == "技术员审核不合格")) {
                    documentToolBar.enableItem("upload");
                }
                else {
                    documentToolBar.disableItem("upload");
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
                if (rowids.length == 1 && (listGrid.cells(checked, 13).getValue() == "已接收" || listGrid.cells(checked, 13).getValue() == "技术员审核不合格")) {
                    pictureToolBar.enableItem("upload");
                }
                else {
                    pictureToolBar.disableItem("upload");
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
    });
})