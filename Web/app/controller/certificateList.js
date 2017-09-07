
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      examination = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Examination";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [Examination].[ExaminationID], [Examination].[examinationNun], [Examination].[productName], [Examination].[storageBatch], convert(nvarchar(10),[Examination].[examineDate],120) asexamineDate from [Examination] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }


        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginexamineDate", beginDate);


                toolBar.setValue("endexamineDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("examineDateBegin", null, "检验日期");
    toolBar.addInput("beginexamineDate", null, "", 75);
    toolBar.addText("检验日期End", null, "-");
    toolBar.addInput("endexamineDate", null, "", 75);


    toolBar.addText("productName", null, "产品名称");
    toolBar.addInput("txtproductNameSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("beginexamineDate")) == "") {
                    alert("起始检验日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginexamineDate"), "-")) {
                    alert("起始检验日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endexamineDate")) == "") {
                    alert("截止检验日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endexamineDate"), "-")) {
                    alert("截止检验日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }



                sqlStr = "select [Examination].[ExaminationID], [Examination].[examinationNun], [Examination].[productName], [Examination].[storageBatch], convert(nvarchar(10),[Examination].[examineDate],120) asexamineDate from [Examination] where 1=1 ";

                sqlStr += " and [Examination].[examineDate] between '" + toolBar.getValue("beginexamineDate") + " 0:0:0' AND '" + toolBar.getValue("endexamineDate") + " 23:59:59' ";


                if (toolBar.getValue("txtproductNameSearch") != "") {
                    sqlStr += " and [Examination].[productName] like '%" + toolBar.getValue("txtproductNameSearch") + "%'";
                }



                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;

        }
    });




    //初始化产品检验列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,检验结果编号,产品名称,贮存批号,检验日期");
    listGrid.setInitWidths("40,0,130,150,100,*");
    listGrid.setColAlign("center,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        var productName = listGrid.cells(rowID, 3).getValue();
        switch (productName) {
            case "丁烯1":
                window.open("Certificate1DX.html?id=" + rowID);
                break;
            case "丁烯2":
                window.open("Certificate2DX.html?id=" + rowID);
                break;
            case "工业己烷":
                window.open("CertificateGYJW.html?id=" + rowID);
                break;
            case "工业己烷(外采)":
                window.open("CertificateGYJW_WC.html?id=" + rowID);
                break;
            case "甲基叔丁基醚":
                window.open("CertificateMTBE.html?id=" + rowID);
                break;
            case "食品工业己烷":
                window.open("CertificateSPGYJW.html?id=" + rowID);
                break;
            case "碳三碳四混合烃":
                window.open("CertificateC3C4.html?id=" + rowID);
                break;
            case "橡胶工业用溶剂油":
                window.open("CertificateXJGYYRJY.html?id=" + rowID);
                break;
            case "植物油提取溶剂":
                window.open("CertificateZWCT.html?id=" + rowID);
                break;

        }
    });
    listGrid.init();




    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginexamineDate"));

    dateboxArray.push(toolBar.getInput("endexamineDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})