$(function () {
    fileType = "";
    ticketID = null;
    userTrueName = decodeURI($.cookie('userTrueName'));
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Material,IEquipmentService,UploadFile";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var toolBar, dhxLayout, listGrid, dictDataList, sqlStr, uploadFileType, uploadFile, equipmentLayout, equipmentForm, equipmentGrid, equipmentRelationToolbar, equipmentRelationGrid, ticketForm,
        isEquipmentFile = false, divUploadLayout,
        equipmentGridDataList = new rock.JsonList(),
        equipmentRelationGridDataList = new rock.JsonList(),
        dictDataList = new rock.JsonList();
        window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
        var opts = [];
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
        dhxLayout.cells("a").attachObject("divMainPage");
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").attachObject("equipmentDiv");
        dhxLayout.cells("b").setHeight(280);
        dhxLayout.cells("b").hideHeader();
        equipmentLayout = new dhtmlXLayoutObject("equipmentLayout", "2U");
        equipmentLayout.cells("a").setWidth(160);
        equipmentLayout.cells("a").hideHeader();
        equipmentLayout.cells("b").hideHeader();
        equipmentLayout.cells("b").attachObject("equipmentSelect");
        //上传文档布局页面
        divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
        divUploadLayout.cells("a").hideHeader();

        ISystemService.execQuery.sqlString = "SELECT ReferName from Refer where ReferType = '文档分类'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var optsSub = [];
                    optsSub.push(rowResult[0].value);
                    optsSub.push('obj');
                    optsSub.push(rowResult[0].value);
                    opts.push(optsSub);
                }
            }(ISystemService.execQuery.resultValue));
        }

        toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        toolBar.addButtonSelect("upload", 1, "上传文档", opts, "add.png", "addDisabled.png");
        toolBar.addSeparator("4", 2);
        toolBar.addButton("relation", 3, "关联设备", "edit.png", "editDisabled.png");
        toolBar.addSeparator("5", 4);
        toolBar.addButton("delete", 5, "删除", "delete.png", "deleteDisabled.png");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "upload":
                    break;
                case "relation":
                    showEquipmentForm();
                    break;
                case "delete":
                    var checked = listGrid.getCheckedRows(0);
                    if (confirm("您确定要删除选定的记录吗?")) {
                        var rowids = checked.split(',');
                        var userRoleRelateExist = false;
                        for (var i = 0; i < rowids.length; i++) {
                            IEquipmentService.deleteUploadFile.uploadFileID = rowids[i];
                            rock.AjaxRequest(IEquipmentService.deleteUploadFile, rock.exceptionFun);
                            if (IEquipmentService.deleteUploadFile.success) {
                                (function (e) {
                                    for (var j = 0; j < dictDataList.rows.length; j++) {
                                        if (dictDataList.rows[j].id == rowids[i]) {
                                            dictDataList.rows.splice(j, 1);
                                            listGrid.deleteRow(rowids[i]);
                                            break;
                                        }
                                    }
                                }(IEquipmentService.deleteUploadFile.resultValue));
                            }
                        }
                        refreshToolBarState();
                    }
                    break;
                case "工作票":
                    $("#txtTicketCode").val("");
                    fileType = id;
                    showTicketForm();
                    break;
                case "图片":
                    fileType = id;
                    divUploadLayout.cells("a").attachURL("../view/UploadPicture.html");
                    showUploadFile();
                    break;
                default:
                    fileType = id;
                    divUploadLayout.cells("a").attachURL("../view/UploadFile.html");
                    showUploadFile();
                    break;
            }
        });
        //动态设置Gird高度
        //$("#gridlist").css("height", $("#divMainPage").innerHeight() - 45 + "px")
        listGrid = new dhtmlXGridObject("gridlist");
        listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        listGrid.setSkin("dhx_skyblue");
        listGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,,,");
        listGrid.setInitWidths("45,0,350,150,200,150,*,0,0,0");
        listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
        listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        listGrid.setColSorting("na,na,str,str,str,str,str,na,na,na");
        listGrid.enableDistributedParsing(true, 20);
        //单击选中取消
        listGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshToolBarState();
            refreshEquipmentRelationToolbar();
            return true;
        });
        listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
            equipmentRelationGridDataList.rows = [];
            equipmentRelationGrid.clearAll();
            if (listGrid.cells(rowID, 8).getValue() != "") {
                isEquipmentFile = false;
                ISystemService.execQuery.sqlString = "SELECT Equipment.EquipmentID,FunctionPositionName,TagNumber,EquipmentName,Specification,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName,Comment FROM Equipment where Equipment.State in ('在用','仪表停','工艺停') and Equipment.EquipmentID in(" + listGrid.cells(rowID, 8).getValue() + ")";
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;

                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            var listdata = new rock.JsonData(rowResult[0].value);
                            listdata.data[0] = 0;
                            listdata.data[1] = rowResult[0].value;
                            listdata.data[2] = rowResult[1].value;
                            listdata.data[3] = rowResult[2].value;
                            listdata.data[4] = rowResult[3].value;
                            listdata.data[5] = rowResult[4].value;
                            listdata.data[6] = rowResult[5].value;
                            listdata.data[7] = rowResult[6].value;
                            equipmentRelationGridDataList.rows.push(listdata);
                        }
                        equipmentRelationGrid.parse(equipmentRelationGridDataList, "json");
                    }(ISystemService.execQuery.resultValue));
                }
            }
            else if (listGrid.cells(rowID, 9).getValue() != "") {
                isEquipmentFile = true;
                ISystemService.execQuery.sqlString = "SELECT Equipment.EquipmentID,FunctionPositionName,TagNumber,EquipmentName,Specification,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName, Comment FROM Equipment where Equipment.State in ('在用','仪表停','工艺停') and Equipment.EquipmentID =" + listGrid.cells(rowID, 9).getValue();
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            var listdata = new rock.JsonData(rowResult[0].value);
                            listdata.data[0] = 0;
                            listdata.data[1] = rowResult[0].value;
                            listdata.data[2] = rowResult[1].value;
                            listdata.data[3] = rowResult[2].value;
                            listdata.data[4] = rowResult[3].value;
                            listdata.data[5] = rowResult[4].value;
                            listdata.data[6] = rowResult[5].value;
                            listdata.data[7] = rowResult[6].value;
                            equipmentRelationGridDataList.rows.push(listdata);
                        }
                        equipmentRelationGrid.parse(equipmentRelationGridDataList, "json");
                    }(ISystemService.execQuery.resultValue));
                }
            }
            else {
                equipmentRelationGridDataList.rows = [];
                equipmentRelationGrid.clearAll();
            }
            refreshEquipmentRelationToolbar();
        });
        listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            //if (cIndex == 2) {
            if (listGrid.cells(rowID, 5).getValue() == '.txt') {
                var winname = window.open("\\Upload\\" + listGrid.cells(rowID, 7).getValue());
                winname.document.execCommand('Saveas', false, "\\Upload\\" + listGrid.cells(rowID, 7).getValue());
                winname.close();
            }
            else if (listGrid.cells(rowID, 5).getValue() == '.jpeg' || listGrid.cells(rowID, 5).getValue() == '.bmp' || listGrid.cells(rowID, 5).getValue() == '.gif' || listGrid.cells(rowID, 5).getValue() == '.png' || listGrid.cells(rowID, 5).getValue() == '.jpg') {
                var winname = window.open("\\Upload\\" + listGrid.cells(rowID, 7).getValue());
            }
            else {
                window.location.href = "\\Upload\\" + listGrid.cells(rowID, 7).getValue();
            }
            //}
        });
        listGrid.init();

        equipmentRelationToolbar = new dhtmlXToolbarObject("equipmentRelationToolbar", 'dhx_skyblue');
        equipmentRelationToolbar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        equipmentRelationToolbar.addButton("delete", 1, "删除", "delete.png", "deleteDisabled.png");
        equipmentRelationToolbar.attachEvent("onClick", function (id) {
            switch (id) {
                case "delete":
                    var checked = equipmentRelationGrid.getCheckedRows(0);
                    if (confirm("您确定要删除选定的记录吗?")) {
                        var rowids = checked.split(',');
                        for (var i = 0; i < rowids.length; i++) {
                            for (var j = 0; j < equipmentRelationGridDataList.rows.length; j++) {
                                if (equipmentRelationGridDataList.rows[j].id == rowids[i]) {
                                    equipmentRelationGridDataList.rows.splice(j, 1);
                                    equipmentRelationGrid.deleteRow(rowids[i]);
                                    break;
                                }
                            }
                        }
                        //updateRelationEquipmentIDs();
                        var equipmentIDStr = updateRelationEquipmentIDs();
                        for (var i = 0; i < dictDataList.rows.length; i++) {
                            if (dictDataList.rows[i].id == listGrid.getCheckedRows(0)) {
                                dictDataList.rows[i].data[8] = equipmentIDStr;
                                break;
                            }
                        }
                        listGrid.clearAll();
                        listGrid.parse(dictDataList, "json");
                        refreshEquipmentRelationToolbar();
                    }
                    break;
                default:
                    break;
            }
        });

        //初始化文档关联设备表格
        equipmentRelationGrid = new dhtmlXGridObject('equipmentRelationGrid');
        equipmentRelationGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        equipmentRelationGrid.setHeader("{#master_checkbox},,功能位置,设备编号,出厂编号,规格型号,回路名称,备注");
        equipmentRelationGrid.setInitWidths("40,0,100,100,100,150,200,*");
        equipmentRelationGrid.setColAlign("center,left,center,center,left,left,left,left");
        equipmentRelationGrid.setSkin("dhx_skyblue");
        equipmentRelationGrid.setColSorting("na,na,str,str,str,str,str,str");
        equipmentRelationGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
        equipmentRelationGrid.enableDistributedParsing(true, 20);
        //单击选中取消
        equipmentRelationGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshEquipmentRelationToolbar();
            return true;
        });
        equipmentRelationGrid.init();

        //初始化设备表格
        equipmentGrid = new dhtmlXGridObject('equipmentGrid');
        equipmentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        equipmentGrid.setHeader("{#master_checkbox},,设备编号,出厂编号,规格型号,生成厂商,回路名称,备注");
        equipmentGrid.setInitWidths("40,0,90,100,130,100,120,*");
        equipmentGrid.setColAlign("center,left,center,center,left,left,left,left");
        equipmentGrid.setSkin("dhx_skyblue");
        equipmentGrid.setColSorting("na,na,str,str,str,str,str,str");
        equipmentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
        equipmentGrid.enableDistributedParsing(true, 20);
        equipmentGrid.attachEvent("onCheck", function (rowID, cIndex) {
            var checked = equipmentGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked != "" && rowids.length > 0) {
                $("#equipment_Save").attr("disabled", false);
            }
            else {
                $("#equipment_Save").attr("disabled", true);
            }
            return true;
        });
        equipmentGrid.init();

        //给列表全选CheckBox添加单击事件
        $("#equipmentGrid input[type=checkbox]").click(function () {
            var checked = equipmentGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked != "" && rowids.length > 0) {
                $("#equipment_Save").attr("disabled", false);
            }
            else {
                $("#equipment_Save").attr("disabled", true);
            }
        });

        //初始化设备选择树
        equipmentTree = equipmentLayout.cells("a").attachTree();
        equipmentTree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        equipmentTree.enableTreeLines(true);
        equipmentTree.setStdImages("folderClosed.gif", "folderOpen.gif", "folderClosed.gif");
        equipmentTree.attachEvent("onSelect", treeSelect);

        //获取一级设备功能位置列表
        ISystemService.execQuery.sqlString = "select FunctionPositionID,FunctionPositionName from FunctionPosition where ParentID is null";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    equipmentTree.insertNewChild(0, rowResult[0].value, rowResult[1].value);
                }
                equipmentTree.selectItem(1, true, false);
            }(ISystemService.execQuery.resultValue));
        }
        else {
            return;
        }


        sqlStr = "SELECT [UploadFileID],[LocalFileName],FileType,convert(nvarchar(10),UploadTime,120),FileFormat,Uploader,ServerFileName,EquipmentIDs,EquipmentID FROM [UploadFile] where Uploader = '" + decodeURIComponent($.cookie('userTrueName')) + "' order by UploadTime desc";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
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
            }(ISystemService.execQuery.resultValue));
        }

        refreshToolBarState();
        refreshEquipmentRelationToolbar();

        //设备查询处理
        $("#query").click(function () {
            if (!rock.chknum($.trim($("#txtCount").val()))) {
                alert('查询行数据格式不正确!');
                return false;
            }
            if (selectedTreeNodeLevel > 1) {
                var sqlCount = "SELECT count(*) FROM Equipment join Producer on Equipment.ProducerID = Producer.ProducerID where Equipment.State in ('在用','仪表停','工艺停') and FunctionPositionID = " + selectedTreeNodeID;
                var sqlString = "SELECT top " + $("#txtCount").val() + " Equipment.EquipmentID,TagNumber,EquipmentName,Specification, Producer.ProducerName,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName,Equipment.Comment FROM Equipment join Producer on Equipment.ProducerID = Producer.ProducerID and Equipment.State in ('在用','仪表停','工艺停') and FunctionPositionID = " + selectedTreeNodeID;
                if ($("#txtEquipmentSearch").val() != "") {
                    sqlCount += " and (SearchCode like '%" + $("#txtEquipmentSearch").val() + "%' or EquipmentName like '%" + $("#txtEquipmentSearch").val() + "%' or TagNumber like '%" + $("#txtEquipmentSearch").val() + "%' or Specification like '%" + $("#txtEquipmentSearch").val() + "%')";
                    sqlString += " and (SearchCode like '%" + $("#txtEquipmentSearch").val() + "%' or EquipmentName like '%" + $("#txtEquipmentSearch").val() + "%' or TagNumber like '%" + $("#txtEquipmentSearch").val() + "%' or Specification like '%" + $("#txtEquipmentSearch").val() + "%')";
                }
                if ($("#txtProducerSearch").val() != "") {
                    sqlCount += " and ProducerName like '%" + $("#txtProducerSearch").val() + "%'";
                    sqlString += " and ProducerName like '%" + $("#txtProducerSearch").val() + "%'";
                }
                if ($("#txtSerialNumberSearch").val() != "") {
                    sqlCount += " and Equipment.Comment like '%" + $("#txtSerialNumberSearch").val() + "%'";
                    sqlString += " and Equipment.Comment like '%" + $("#txtSerialNumberSearch").val() + "%'";
                }
                if ($("#txtControlLoopName").val() != "") {
                    sqlCount += " and dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) like '%" + $("#txtControlLoopName").val() + "%'";
                    sqlString += " and dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) like '%" + $("#txtControlLoopName").val() + "%'";
                }

                ISystemService.executeScalar.sqlString = sqlCount;
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        $("#txtQueryCount").val(e.value);
                    }(ISystemService.executeScalar.resultValue));
                }
                ISystemService.execQuery.sqlString = sqlString;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        equipmentGridDataList.rows = [];
                        equipmentGrid.clearAll();
                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            var listdata = new rock.JsonData(rowResult[0].value);
                            listdata.data[0] = 0;
                            listdata.data[1] = rowResult[0].value;
                            listdata.data[2] = rowResult[1].value;
                            listdata.data[3] = rowResult[2].value;
                            listdata.data[4] = rowResult[3].value;
                            listdata.data[5] = rowResult[4].value;
                            equipmentGridDataList.rows.push(listdata);
                        }
                        equipmentGrid.parse(equipmentGridDataList, "json");
                    }(ISystemService.execQuery.resultValue));
                    //按钮状态
                    var checked = equipmentGrid.getCheckedRows(0);
                    var rowids = checked.split(',');
                    if (checked != "" && rowids.length > 0) {
                        $("#equipment_Save").attr("disabled", false);
                    }
                    else {
                        $("#equipment_Save").attr("disabled", true);
                    }
                }
            }
        });



        ////设备快查处理
        //$("#txtEquipmentSearch").keyup(QuickSearch);
        //$("#txtControlLoopName").keyup(QuickSearch);

        //function QuickSearch() {
        //    if (selectedTreeNodeLevel > 1) {
        //        var sqlString = "SELECT top 20 Equipment.EquipmentID,FunctionPositionName,TagNumber,EquipmentName,Specification,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName FROM Equipment where and FunctionPositionID = " + selectedTreeNodeID;
        //        if ($("#txtEquipmentSearch").val() != "") {
        //            sqlString += " and (SearchCode like '%" + $("#txtEquipmentSearch").val() + "%' or EquipmentName like '%" + $("#txtEquipmentSearch").val() + "%' or TagNumber like '%" + $("#txtEquipmentSearch").val() + "%' or Specification like '%" + $("#txtEquipmentSearch").val() + "%')";
        //        }
        //        if ($("#txtControlLoopName").val() != "") {
        //            sqlString += " and dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) like '%" + $("#txtControlLoopName").val() + "%'";
        //        }
        //        ISystemService.execQuery.sqlString = sqlString;
        //        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        //        if (ISystemService.execQuery.success) {
        //            (function (e) {
        //                var rows = e.rows;
        //                equipmentGridDataList.rows = [];
        //                equipmentGrid.clearAll();
        //                for (var i = 0; i < rows.length; i++) {
        //                    var rowResult = rows[i].values;
        //                    var listdata = new rock.JsonData(rowResult[0].value);
        //                    listdata.data[0] = 0;
        //                    listdata.data[1] = rowResult[0].value;
        //                    listdata.data[2] = rowResult[1].value;
        //                    listdata.data[3] = rowResult[2].value;
        //                    listdata.data[4] = rowResult[3].value;
        //                    listdata.data[5] = rowResult[4].value;
        //                    listdata.data[6] = rowResult[5].value;
        //                    equipmentGridDataList.rows.push(listdata);
        //                }
        //                equipmentGrid.parse(equipmentGridDataList, "json");
        //            }(ISystemService.execQuery.resultValue));
        //        }
        //    }
        //}

        //设备选择弹窗
        equipmentForm = $("#equipmentForm");
        equipmentForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            var top = $("#equipmentForm").offset().top;
            var left = $("#equipmentForm").offset().left;

            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    equipmentForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        equipmentForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideEquipmentForm();
        function hideEquipmentForm() {
            equipmentForm.css({ top: 200, left: -1300 }).hide();
            equipmentForm.css("visibility", "visible");
        }
        function showEquipmentForm() {
            equipmentForm.css({ top: 100, left: 180 }).show();
        }
        //设备选择弹窗确定
        $("#equipment_Save").click(function () {
            var checked = equipmentGrid.getCheckedRows(0);
            if (checked != "") {
                var rowids = checked.split(',');
                if (rowids.length > 1) {
                    equipmentRelationGridDataList.rows = [];
                    for (var i = 0; i < rowids.length; i++) {

                        for (var j = 0; j < equipmentGridDataList.rows.length; j++) {
                            if (equipmentGridDataList.rows[j].id == rowids[i]) {
                                equipmentRelationGridDataList.rows.push(equipmentGridDataList.rows[j]);
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < rowids.length; i++) {
                        for (var j = 0; j < equipmentGridDataList.rows.length; j++) {
                            if (equipmentGridDataList.rows[j].id == rowids[i]) {
                                equipmentRelationGridDataList.rows.push(equipmentGridDataList.rows[j]);
                                equipmentGrid.deleteRow(equipmentGridDataList.rows[j].id);
                            }
                        }
                    }
                }
                equipmentRelationGrid.clearAll();
                equipmentRelationGrid.parse(equipmentRelationGridDataList, "json");
            }
            var equipmentIDStr = updateRelationEquipmentIDs();
            for (var i = 0; i < listGrid.getCheckedRows(0).split(',').length; i++) {
                for (var j = 0; j < dictDataList.rows.length; j++) {
                    if (dictDataList.rows[j].id == listGrid.getCheckedRows(0).split(',')[i]) {
                        dictDataList.rows[j].data[8] = equipmentIDStr;
                        break;
                    }
                }
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEquipmentForm();
        });
        //设备选择弹窗取消
        $("#equipment_Cancle").click(function () {
            hideEquipmentForm();
        });

        //设备选择弹窗关闭
        $("#imgEquipment_Close").click(function () {
            hideEquipmentForm();
        });

        //更新文档关联设备ID集合
        function updateRelationEquipmentIDs() {
            var uploadFileobj;
            var equipmentIDsStr = "";
            for (var i = 0; i < listGrid.getCheckedRows(0).split(',').length; i++) {
                equipmentIDsStr = "";
                ISystemService.getDynObjectByID.dynObjectID = listGrid.getCheckedRows(0).split(',')[i];
                ISystemService.getDynObjectByID.structName = "UploadFile";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        if (e != null) {
                            uploadFileobj = e;
                        }
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                if (equipmentRelationGridDataList.rows.length == 0) {
                    uploadFileobj.equipmentIDs = null;
                }
                else {
                    for (var j = 0; j < equipmentRelationGridDataList.rows.length; j++) {
                        if (j == equipmentRelationGridDataList.rows.length - 1) {
                            equipmentIDsStr += equipmentRelationGridDataList.rows[j].id;
                        }
                        else {
                            equipmentIDsStr += equipmentRelationGridDataList.rows[j].id + ",";
                        }
                    }
                    uploadFileobj.equipmentIDs = equipmentIDsStr;
                }
                ISystemService.modifyDynObject.dynObject = uploadFileobj;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                    }(ISystemService.modifyDynObject.resultValue));
                }
            }
            alert("修改成功！");
            return equipmentIDsStr;
        }

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
            getAttachmentList();
        });

        //条码扫描弹窗
        ticketForm = $("#ticketForm");
        ticketForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    ticketForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        ticketForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideTicketForm();
        function hideTicketForm() {
            ticketForm.css({ top: 200, left: -1300 }).hide();
            ticketForm.css("visibility", "visible");
        }
        function showTicketForm() {
            ticketForm.css({ top: 100, left: 180 }).show();
        }
        //条码扫描弹窗确定
        $("#ticket_Save").click(function () {
            ISystemService.execQuery.sqlString = "SELECT TicketID from Ticket where TicketCode = '" + $("#txtTicketCode").val() + "'";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    if (rows.length != 1) {
                        alert("获取数据失败，请检查！");
                    }
                    else {
                        var rowResult = rows[0].values;
                        ticketID = rowResult[0].value;
                        hideTicketForm();
                        divUploadLayout.cells("a").attachURL("../view/UploadFile.html");
                        showUploadFile();
                    }
                }(ISystemService.execQuery.resultValue));
            }
        });
        //条码扫描弹窗取消
        $("#ticket_Cancle").click(function () {
            hideTicketForm();
        });
        //条码扫描弹窗关闭
        $("#ticket_Close").click(function () {
            hideTicketForm();
        });

        //参照树选中事件
        function treeSelect(itemid) {
            selectedTreeNodeID = itemid;
            selectedTreeNodeLevel = equipmentTree.getLevel(itemid);
            $("#txtEquipmentSearch").val("");
            $("#txtControlLoopName").val("");
            //获取functionPosition子节点并填充
            if (!equipmentTree.hasChildren(itemid)) {
                ISystemService.execQuery.sqlString = "select FunctionPositionID,FunctionPositionName from FunctionPosition where ParentID = " + itemid;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        var rowsLngth = rows.length;
                        for (var i = 0; i < rowsLngth; i++) {
                            var rowResult = rows[i].values;
                            equipmentTree.insertNewChild(itemid, rowResult[0].value, rowResult[1].value);
                        }
                        //查询是否有对应的设备
                        if (selectedTreeNodeLevel > 1) {
                            if (rowsLngth == 0) {
                                ISystemService.executeScalar.sqlString = "SELECT count(*) FROM Equipment join Producer on Equipment.ProducerID = Producer.ProducerID and Equipment.State in ('在用','仪表停','工艺停') and FunctionPositionID = " + itemid;
                                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                                if (ISystemService.executeScalar.success) {
                                    (function (e) {
                                        $("#txtQueryCount").val(e.value);
                                    }(ISystemService.executeScalar.resultValue));
                                }
                                ISystemService.execQuery.sqlString = "SELECT top " + $("#txtCount").val() + " Equipment.EquipmentID,TagNumber,EquipmentName,Specification, Producer.ProducerName,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName,Equipment.Comment FROM Equipment join Producer on Equipment.ProducerID = Producer.ProducerID and Equipment.State in ('在用','仪表停','工艺停') where FunctionPositionID = " + itemid;
                                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                                if (ISystemService.execQuery.success) {
                                    (function (e) {
                                        var rows = e.rows;
                                        equipmentGridDataList.rows = [];
                                        equipmentGrid.clearAll();
                                        for (var i = 0; i < rows.length; i++) {
                                            var rowResult = rows[i].values;
                                            var listdata = new rock.JsonData(rowResult[0].value);
                                            listdata.data[0] = 0;
                                            listdata.data[1] = rowResult[0].value;
                                            listdata.data[2] = rowResult[1].value;
                                            listdata.data[3] = rowResult[2].value;
                                            listdata.data[4] = rowResult[3].value;
                                            listdata.data[5] = rowResult[4].value;
                                            listdata.data[6] = rowResult[5].value;
                                            listdata.data[7] = rowResult[6].value;
                                            equipmentGridDataList.rows.push(listdata);
                                        }
                                        equipmentGrid.parse(equipmentGridDataList, "json");
                                    }(ISystemService.execQuery.resultValue));
                                    //按钮状态
                                    var checked = equipmentGrid.getCheckedRows(0);
                                    var rowids = checked.split(',');
                                    if (checked != "" && rowids.length > 0) {
                                        $("#equipment_Save").attr("disabled", false);
                                    }
                                    else {
                                        $("#equipment_Save").attr("disabled", true);
                                    }
                                }
                                //if (listGrid.getCheckedRows(0).split(",").length == 1 && listGrid.cells(listGrid.getCheckedRows(0), 8).getValue() != "") {
                                //    ISystemService.execQuery.sqlString = "SELECT top 20 Equipment.EquipmentID,FunctionPositionName,TagNumber,EquipmentName,Specification,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName FROM Equipment where Equipment.State  and Equipment.EquipmentID not in (" + listGrid.cells(listGrid.getCheckedRows(0), 8).getValue() + ") and FunctionPositionID = " + itemid;
                                //}
                                //else {
                                //    ISystemService.execQuery.sqlString = "SELECT top 20 Equipment.EquipmentID,FunctionPositionName,TagNumber,EquipmentName,Specification,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName FROM Equipment where Equipment.State  and FunctionPositionID = " + itemid;
                                //}
                                //rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                                //if (ISystemService.execQuery.success) {
                                //    (function (e) {
                                //        var rows = e.rows;
                                //        equipmentGridDataList.rows = [];
                                //        equipmentGrid.clearAll();
                                //        for (var i = 0; i < rows.length; i++) {
                                //            var rowResult = rows[i].values;
                                //            var listdata = new rock.JsonData(rowResult[0].value);
                                //            listdata.data[0] = 0;
                                //            listdata.data[1] = rowResult[0].value;
                                //            listdata.data[2] = rowResult[1].value;
                                //            listdata.data[3] = rowResult[2].value;
                                //            listdata.data[4] = rowResult[3].value;
                                //            listdata.data[5] = rowResult[4].value;
                                //            listdata.data[6] = rowResult[5].value;
                                //            equipmentGridDataList.rows.push(listdata);
                                //        }
                                //        equipmentGrid.parse(equipmentGridDataList, "json");
                                //    }(ISystemService.execQuery.resultValue));
                                //}
                            }
                        }
                        else {
                            equipmentGridDataList.rows = [];
                            equipmentGrid.clearAll();
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
        }

        function getAttachmentList() {
            sqlStr = "SELECT [UploadFileID],[LocalFileName],FileType,convert(nvarchar(10),UploadTime,120),FileFormat,Uploader,ServerFileName,EquipmentIDs,EquipmentID FROM [UploadFile] where Uploader = '" + decodeURIComponent($.cookie('userTrueName')) + "' order by UploadTime desc";
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
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
                }(ISystemService.execQuery.resultValue));
            }
        }

        //关联按钮状态控制
        function relationEnabled() {
            var checked = listGrid.getCheckedRows(0);
            if (checked == "") {
                return false;
            }
            else {
                //if (checked.split(",").length > 1) {
                //    return false;
                //}
                //else {
                //    if (isEquipmentFile) {
                //        return false;
                //    }
                //    else {
                return true;
                //    }
                //}
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
            if (deleteEnabled()) {
                toolBar.enableItem("delete");
            }
            else {
                toolBar.disableItem("delete");
            }
            if (relationEnabled()) {
                toolBar.enableItem("relation");
            }
            else {
                toolBar.disableItem("relation");
            }
        }

        //删除关联设备按钮状态控制
        function relationDeleteEnabled() {
            var checkedUploadFile = listGrid.getCheckedRows(0);
            var checked = equipmentRelationGrid.getCheckedRows(0);
            if (checked != "" && checkedUploadFile != "") {
                if (checkedUploadFile.split(",").length > 1 || isEquipmentFile) {
                    return false;
                }
                else {
                    if (isEquipmentFile) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            }
            else {
                return false;
            }
        }
        //关联设备工具栏按钮状态控制
        function refreshEquipmentRelationToolbar() {
            if (relationDeleteEnabled()) {
                equipmentRelationToolbar.enableItem("delete");
            }
            else {
                equipmentRelationToolbar.disableItem("delete");
            }
        }
    });
})