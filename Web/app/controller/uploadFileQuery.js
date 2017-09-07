$(function () {
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Material,IEquipmentService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var toolBar, listGrid, dictDataList, sqlStr, uploadFileType, uploadFile, dhxLayout, equipmentRelationGrid, queryForm,
        equipmentRelationGridDataList = new rock.JsonList(),
        dictDataList = new rock.JsonList();
        window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
        var opts = [];
        var fileFormatOpts = [];
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
        dhxLayout.cells("a").attachObject("divMainPage");
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").attachObject("equipmentDiv");
        dhxLayout.cells("b").setHeight(280);
        dhxLayout.cells("b").hideHeader();

        //初始化文档分类参照
        ISystemService.execQuery.sqlString = "SELECT ReferName from Refer where ReferType = '文档分类'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                var optsSub = [];
                optsSub.push("fileType全部");
                optsSub.push('obj');
                optsSub.push("全部");
                opts.push(optsSub);
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var optsSub = [];
                    optsSub.push("fileType"+rowResult[0].value);
                    optsSub.push('obj');
                    optsSub.push(rowResult[0].value);
                    opts.push(optsSub);
                }
            }(ISystemService.execQuery.resultValue));
        }

        //初始化文档格式参照
        ISystemService.execQuery.sqlString = "SELECT distinct [FileFormat] FROM [UploadFile]";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                var optsSub = [];
                optsSub.push("fileFormat.全部");
                optsSub.push('obj');
                optsSub.push("全部");
                fileFormatOpts.push(optsSub);
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var optsSub = [];
                    optsSub.push("fileFormat" + rowResult[0].value);
                    optsSub.push('obj');
                    optsSub.push(rowResult[0].value.substr(1));
                    fileFormatOpts.push(optsSub);
                }
            }(ISystemService.execQuery.resultValue));
        }       

        toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");

        toolBar.addText("上传起始日期", null, "上传起止日期");
        toolBar.addInput("beginDate", null, "", 75);
        toolBar.addText("上传截止日期", null, "-");
        toolBar.addInput("endDate", null, "", 75);
        toolBar.addText("文档名称", null, "文档名称");
        toolBar.addInput("localFileName", null, "", 75);
        toolBar.addText("上传人", null, "上传人");
        toolBar.addInput("uploader", null, "", 75);
        toolBar.addText("文档类型", null, "文档类型");
        toolBar.addSeparator("4", null);
        toolBar.addButtonSelect("fileType", null, "全部", opts);
        toolBar.addSeparator("4", null);
        toolBar.addText("文档格式", null, "文档格式");
        toolBar.addSeparator("4", null);
        toolBar.addButtonSelect("fileFormat", null, "全部", fileFormatOpts);
        toolBar.addSeparator("4", null);
        toolBar.addButton("query", null, "", "search.gif", "search.gif");
        toolBar.addSeparator("4", null);
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "fileType":
                    break;
                case "fileFormat":
                    break;
                case "query":
                    if ($.trim(toolBar.getValue("beginDate")) == "") {
                        alert("起始日期不能为空！");
                        return;
                    }
                    if ($.trim(toolBar.getValue("endDate")) == "") {
                        alert("截止日期不能为空！");
                        return;
                    }
                    if (!rock.chkdate(toolBar.getValue("beginDate"), "-")) {
                        alert("起始日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }
                    if (!rock.chkdate(toolBar.getValue("endDate"), "-")) {
                        alert("截止日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }

                    sqlStr = "SELECT [UploadFileID],[LocalFileName],FileType,convert(nvarchar(10),UploadTime,120),FileFormat,Uploader,ServerFileName,EquipmentIDs,EquipmentID FROM [UploadFile]  where UploadTime BETWEEN '" + toolBar.getValue("beginDate") + "' AND '" + toolBar.getValue("endDate") + "'";
                    if (toolBar.getItemText("fileType") != "全部") {
                        sqlStr += " and FileType = '" + toolBar.getItemText("fileType") + "'";
                    }
                    if (toolBar.getItemText("fileFormat") != "全部") {
                        sqlStr += " and FileFormat = '." + toolBar.getItemText("fileFormat") + "'";
                    }
                    if (toolBar.getValue("localFileName") != "") {
                        sqlStr += " and LocalFileName like  '%" + toolBar.getValue("localFileName") + "%'";
                    }
                    if (toolBar.getValue("uploader") != "") {
                        sqlStr += " and Uploader like  '%" + toolBar.getValue("uploader") + "%'";
                    }

                    ISystemService.execQuery.sqlString = sqlStr + " order by UploadTime desc";
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
                    break;
                default:
                    if (id.indexOf('fileType') > -1) {
                        toolBar.setItemText("fileType", id.replace("fileType",""));
                    }
                    else if (id.indexOf('fileFormat') > -1) {
                        toolBar.setItemText("fileFormat", id.replace("fileFormat.", ""));
                    }
                    break;
            }
        });

        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                toolBar.setValue("beginDate", beginDate);
                toolBar.setValue("endDate", serverDate);
            }(ISystemService.getServerDate.resultValue));
        }

        //动态设置Gird高度
        listGrid = new dhtmlXGridObject("gridlist");
        listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        listGrid.setSkin("dhx_skyblue");
        listGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,,,");
        listGrid.setInitWidths("45,0,350,150,200,150,*,0,0,0");
        listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
        listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
        listGrid.setColSorting("na,na,str,str,str,str,str,na,na,na");
        listGrid.enableDistributedParsing(true, 20);
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
                ISystemService.execQuery.sqlString = "SELECT Equipment.EquipmentID,FunctionPositionName,TagNumber,EquipmentName,Specification,dbo.GetControlLoopByEquipmentId(Equipment.EquipmentID) as ControlLoopName,Comment FROM Equipment where Equipment.State in ('在用','仪表停','工艺停') and Equipment.EquipmentID =" + listGrid.cells(rowID, 9).getValue();
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
                document.location.href = "\\Upload\\" + listGrid.cells(rowID, 7).getValue();
            }
            //}
        });
        listGrid.init();

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

        sqlStr = "SELECT [UploadFileID],[LocalFileName],FileType,convert(nvarchar(10),UploadTime,120),FileFormat,Uploader,ServerFileName,EquipmentIDs,EquipmentID FROM [UploadFile] order by UploadTime desc";
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

        //查询弹窗
        queryForm = $("#queryForm");
        queryForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            var top = $("#queryForm").offset().top;
            var left = $("#queryForm").offset().left;

            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    queryForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        queryForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hidequeryForm();
        function hidequeryForm() {
            queryForm.css({ top: 200, left: -1300 }).hide();
            queryForm.css("visibility", "visible");
        }
        function showqueryForm() {
            queryForm.css({ top: 100, left: 180 }).show();
        }
        //查询弹窗确定
        $("#btn_Save").click(function () {
            if ($.trim($("#txtBeginDate").val()) == "") {
                alert("起始日期不能为空！");
                return;
            }
            if ($.trim($("#txtEndDate").val()) == "") {
                alert("截止日期不能为空！");
                return;
            }

            if (!rock.chkdate($("#txtBeginDate").val(), "-")) {
                alert("起始日期格式不正确,正确格式为 2010-10-10！");
                return false;
            }
            if (!rock.chkdate($("#txtEndDate").val(), "-")) {
                alert("截止日期格式不正确,正确格式为 2010-10-10！");
                return false;
            }

            sqlStr = "SELECT [UploadFileID],[LocalFileName],FileType,convert(nvarchar(10),UploadTime,120),FileFormat,Uploader,ServerFileName,EquipmentIDs,EquipmentID FROM [UploadFile]  where UploadTime BETWEEN '" + $("#txtBeginDate").val() + "' AND '" + $("#txtEndDate").val() + "'";
            if ($.trim($("#cbxFileType").val()) != "全部") {
                sqlStr += " and FileType = '" + $.trim($("#cbxFileType").val()) + "'";
            }
            if ($.trim($("#txtLocalFileName").val()) != "") {
                sqlStr += " and LocalFileName like  '%" + $.trim($("#txtMaterialID").val()) + "%'";
            }
            if ($.trim($("#txtUploader").val()) != "") {
                sqlStr += " and Uploader like  '%" + $.trim($("#txtUploader").val()) + "%'";
            }
            ISystemService.execQuery.sqlString = sqlStr
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
            hidequeryForm();
        });
        //查询弹窗取消
        $("#btn_Cancle").click(function () {
            hidequeryForm();
        });
        //查询弹窗关闭
        $("#img_Close").click(function () {
            hidequeryForm();
        });

        //日期控件测试
        var dateboxArray = [];
        dateboxArray.push(toolBar.getInput("beginDate"));
        dateboxArray.push(toolBar.getInput("endDate"));
        myCalendar = new dhtmlXCalendarObject(dateboxArray);
        myCalendar.loadUserLanguage('cn');
    });
})