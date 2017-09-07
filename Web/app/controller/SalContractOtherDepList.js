
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, contractType, departList, departLength,
      contract = null,
      auditImg = "/resource/dhtmlx/codebase/imgs/own/audit.png^分配",
	  editItem = $("#editItem"),
      type = $.getUrlParam("type"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";

    if (type == 'xs') {
        contractType = "销售";
    }
    else {
        contractType = "采购";
    }

    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Contract";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("begincreateDate", beginDate);


                toolBar.setValue("endcreateDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //获取部门列表
        sqlStr = "SELECT [DepartmentID],[DepartmentName] FROM [Department] where [DepartmentID] > 1 ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    departList = e.rows;
                    departLength = departList.length;
                    //var rowLength = rows.length;
                    //for (var i = 0; i < rowLength; i++) {
                    //    var rowResult = rows[i].values;
                    //    $("#combopriceType").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    //}
                }
            }(ISystemService.execQuery.resultValue));
        }
        //处理初始化加载数据

        sqlStr = "select top 100 [Contract].[ContractID], [Contract].[contractNum], case [OtherDepart] when  1 then '是' when 0 then '否' end as 是否分配, [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] in ('已提交', '分管领导已审') and [Contract].[ContractType] = '" + contractType + "' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, listGrid, dictDataList, 3, auditImg, auditImg);

            }(ISystemService.execQuery.resultValue));
        }     

    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);


    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("begincreateDate")) == "") {
                    alert("起始创建日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begincreateDate"), "-")) {
                    alert("起始创建日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endcreateDate")) == "") {
                    alert("截止创建日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endcreateDate"), "-")) {
                    alert("截止创建日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }



                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], case [OtherDepart] when  1 then '是' when 0 then '否' end as 是否分配, [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[ContractType] = '" + contractType + "' ";

                sqlStr += " and [Contract].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";


                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }


                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillGrid(e, listGrid, dictDataList, 3, printImg, printImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;

        }
    });




    //初始化销售合同列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,分配,合同编号,是否分配,客户名称,签定日期,产品名称,产品单价,合同数量");
    listGrid.setInitWidths("40,0,40,80,65,150,80,100,80,*");
    listGrid.setColAlign("center,left,center,left,center,left,left,left,left,left");
    listGrid.setColSorting("na,na,na,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        //alert("尚未设定查看明细弹窗!");
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        if (cIndex == 2) {
            ISystemService.getDynObjectByID.dynObjectID = rowID;
            ISystemService.getDynObjectByID.structName = "Contract";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    contract = e;
                    $("#ListN").empty();
                    $("#ListY").empty();
                    if (contract.otherDepart) {                       
                        for (var i = 0; i < departLength; i++) {
                            var rowResult = departList[i].values;
                            if (contract.otherDepartID != rowResult[0].value) {
                                $("#ListN").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                            }
                            else {
                                $("#ListY").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                            }                            
                        }                        
                    }
                    else {
                        for (var i = 0; i < departLength; i++) {
                            var rowResult = departList[i].values;
                            $("#ListN").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                        }
                    }
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                return;
            }
            showEditForm();
            //IBusinessService.getPriceApplyByID.priceApplyID = rowID;
            //rock.AjaxRequest(IBusinessService.getPriceApplyByID, rock.exceptionFun);
            //if (IBusinessService.getPriceApplyByID.success) {
            //    (function (e) {
            //        priceApply = e;
            //        $('#reasion').html(priceApply.reason);
            //        $('#txtagent').val(priceApply.agent);
            //        $('#chkover50').attr('checked', priceApply.over50);
            //        $('#chkleadership').attr('checked', priceApply.needLeadership);
            //        $('#chkcompany').attr('checked', priceApply.needCompany);
            //        if (BMFL == "BMJL") {
            //            $("#chkleadership").attr("disabled", false);
            //            $("#chkcompany").attr("disabled", false);
            //        }
                   
            //    }(IBusinessService.getPriceApplyByID.resultValue));
            //}
        }
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    //editForm.height(175);
    //editForm.width(450);
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
        $("#btn_Save").attr("disabled", false);
        $("#btn_Cancle").attr("disabled", false);
        editForm.css({ top: 100, left: 180 }).show();
    }
    //取消
    $("#btn_Cancle").click(function () {
        auditPriceApply("未通过");
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //保存
    $("#btn_Save").click(function () {
        var dataState = null;
        ISystemService.getObjectProperty.objName = "Contract";
        ISystemService.getObjectProperty.property = "State";
        ISystemService.getObjectProperty.ojbID = contract.contractID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                dataState = e.value;
            }(ISystemService.getObjectProperty.resultValue));
        }
        if (contract.state == dataState) {
            switch ($('#ListY option').length) {
                case 1:
                    //判定是否已经存在
                    var otherDepartID = null;
                    ISystemService.getObjectProperty.objName = "Contract";
                    ISystemService.getObjectProperty.property = "OtherDepartID";
                    ISystemService.getObjectProperty.ojbID = contract.contractID;
                    rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                    if (ISystemService.getObjectProperty.success) {
                        (function (e) {
                            otherDepartID = e.value;
                        }(ISystemService.getObjectProperty.resultValue));
                    }
                    if (otherDepartID != $("#ListY").get(0).options[0].value) {
                        contract.signNum = contract.signNum + 1;
                        contract.otherDepart = true;
                        contract.otherDepartID = parseInt($("#ListY").get(0).options[0].value, 10);
                        ISystemService.modifyDynObject.dynObject = contract;
                        rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                        if (ISystemService.modifyDynObject.success) {
                            (function (e) {
                                $("#btn_Save").attr("disabled", true);
                                hideEditForm();
                                alert("合同其他部门分配完毕");
                            }(ISystemService.modifyDynObject.resultValue));
                        }
                    }
                    else {
                        $("#btn_Save").attr("disabled", true);
                        hideEditForm();
                        alert("合同其他部门分配完毕");
                    }                   
                    break;
                case 0:
                    contract.signNum = contract.signNum - 1;
                    contract.otherDepart = false;
                    contract.otherDepartID = null;
                    ISystemService.modifyDynObject.dynObject = contract;
                    rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                    if (ISystemService.modifyDynObject.success) {
                        (function (e) {
                            $("#btn_Save").attr("disabled", true);
                            hideEditForm();
                            alert("合同其他部门取消完毕");
                        }(ISystemService.modifyDynObject.resultValue));
                    }
                    break;
                default:
                    alert("目前只允许选择一个其它部门审批");
                    break;
            }
        }
        else {
            alert("该合同状态不合适，不允许添加其他审批部门!");
        }
        
    });

    function auditPriceApply(result) {
        if (priceApply != null) {
            var dataState = null;
            var opinion = $('#txtopinion').val();
            ISystemService.getObjectProperty.objName = "PriceApply";
            ISystemService.getObjectProperty.property = "State";
            ISystemService.getObjectProperty.ojbID = priceApply.priceApplyID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    dataState = e.value;
                }(ISystemService.getObjectProperty.resultValue));
            }
            if (priceApply.state == dataState) {

                if (result == "未通过") {
                    if (opinion == "同意") {
                        opinion = "不同意";
                    }
                }

                IBusinessService.auditPriceApply.priceApplyID = priceApply.priceApplyID;
                IBusinessService.auditPriceApply.depart = BMFL;
                IBusinessService.auditPriceApply.result = result;
                IBusinessService.auditPriceApply.opinion = opinion;
                IBusinessService.auditPriceApply.user = decodeURIComponent($.cookie('userTrueName'));

                switch (BMFL) {
                    case "YWY":
                        break;
                    case "BMJL":
                        if ($('#chkleadership').attr('checked')) {
                            IBusinessService.auditPriceApply.fgld = "T";
                        }
                        else {
                            IBusinessService.auditPriceApply.fgld = "F";
                        }
                        if ($('#chkcompany').attr('checked')) {
                            IBusinessService.auditPriceApply.gsld = "T";
                        }
                        else {
                            IBusinessService.auditPriceApply.gsld = "F";
                        }
                        break;
                    case "CWBM":
                        break;
                    case "FGLD":
                        break;
                    case "GSLD":
                        break;
                }

                rock.AjaxRequest(IBusinessService.auditPriceApply, rock.exceptionFun);
                if (IBusinessService.auditPriceApply.success) {
                    $("#btn_Save").attr("disabled", true);
                    $("#btn_Cancle").attr("disabled", true);
                    initTodoList();
                    getauditHistoryList();
                    hideEditForm();
                    alert("您的审批已经完成!");
                }
            }
            else {
                alert("当前产品调价审批的数据库状态不正确,请刷新页面后重新审核!");
            }
        }
    }

    $("#btnUnSelectAll").click(function () {
        $("#ListN").empty();
        $("#ListY").empty();
        for (var i = 0; i < departLength; i++) {
            var rowResult = departList[i].values;
            $("#ListY").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
        }        
    });
    $("#btnUnSelect").click(function () {
        if ($('#ListN option:selected').val()) {
            $("#ListY").append("<option value='" + $('#ListN option:selected').val() + "'>" + $('#ListN option:selected').text() + "</option>");
            $('#ListN option:selected').remove();
        }       
    });
    $("#btnSelect").click(function () {
        if ($('#ListY option:selected').val()) {
            $("#ListN").append("<option value='" + $('#ListY option:selected').val() + "'>" + $('#ListY option:selected').text() + "</option>");
            $('#ListY option:selected').remove();
        }
    });
    $("#btnSelectAll").click(function () {
        $("#ListN").empty();
        $("#ListY").empty();
        for (var i = 0; i < departLength; i++) {
            var rowResult = departList[i].values;
            $("#ListN").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
        }
    });
    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})