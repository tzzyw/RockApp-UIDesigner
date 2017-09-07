var closeUpload = null;
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, tabbar,  
      dataCategory = decodeURI($.getUrlParam("LB"));
    dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,User";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("begincreateTime", beginDate);


                toolBar.setValue("endcreateTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }
        //处理初始化加载数据
        getUploadDocument(dataCategory);
       
    });


    toolBar = new dhtmlXToolbarObject("toolBar");
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    toolBar.setSkin("dhx_skyblue");
    toolBar.addText("createTimeBegin", 1, "上传日期");
    toolBar.addInput("begincreateTime", 2, "", 75);
    toolBar.addText("创建时间End", 3, "-");
    toolBar.addInput("endcreateTime", 4, "", 75);
    toolBar.addText("nameSearch", 5, "资料名称");
    toolBar.addInput("txtnameSearch", 6, "", 100);
    toolBar.addButton("query", 7, "查询");
     
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getUploadDocument(dataCategory);
                break;
        }
    });


    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,文档名称,上传时间,上传人,");
    listGrid.setInitWidths("45,0,*,120,100,0");
    listGrid.setColAlign("center,left,left,left,left,left");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str,str,str,str,na");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        window.open("\\Upload\\" + listGrid.cells(rowID, 5).getValue());
    });
    //单击选中取消
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDocumentToolBarState();
        return true;
    });
    listGrid.init();
     

    function getUploadDocument(dataCategory) {
        if ($.trim(toolBar.getValue("begincreateTime")) == "") {
            alert("起始上传日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("begincreateTime"), "-")) {
            alert("起始上传日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        if ($.trim(toolBar.getValue("endcreateTime")) == "") {
            alert("截止上传日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("endcreateTime"), "-")) {
            alert("截止上传日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        listGrid.clearAll();
        listGrid.rows = [];
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[UploadTime],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and [ObjectType] = '" + dataCategory + "'";
        sqlStr += " and [UploadTime] between '" + toolBar.getValue("begincreateTime") + " 0:0:0' AND '" + toolBar.getValue("endcreateTime") + " 23:59:59' ";
        if (toolBar.getValue("txtnameSearch") != "") {
            sqlStr += " and [LocalFileName] like '%" + toolBar.getValue("txtnameSearch") + "%'";
        }
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

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateTime"));

    dateboxArray.push(toolBar.getInput("endcreateTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})