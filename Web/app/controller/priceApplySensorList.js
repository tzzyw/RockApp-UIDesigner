
$(function () {
    //初始化系统通用变量
    var tabbar, toolBar, dhxLayout, masterGrid, detailGrid, sqlStr, editForm, detailGrid, auditHistoryGrid,
        priceApply = null,
	auditImg = "/resource/dhtmlx/codebase/imgs/own/audit.png^审批",
    BMFL = decodeURI($.getUrlParam("BMFL")),
    masterDataList = new rock.JsonList(),
    detailDataList = new rock.JsonList(),
    auditHistoryDataList = new rock.JsonList();

    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IBusinessService,PriceApply,PriceApplyDetal";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {       

        //处理初始化加载数据
        initTodoList(); 
    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    //dhxLayout.cells("b").attachObject("detailDiv");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("detail", "产品调价申请明细", 100, 1);
    tabbar.addTab("history", "产品调价审批历史", 100, 2);

    tabbar.tabs("detail").setActive();
    tabbar.tabs("detail").attachObject("detailDiv");
    tabbar.tabs("history").attachObject("auditHistoryDiv");

    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");


    masterGrid.setHeader("序号,,审批,申请单编号,产品名称,申请日期,累计幅度大于50元,状态");
    masterGrid.setInitWidths("40,0,40,100,100,80,120,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        getauditHistoryList(rowID);
        if (cIndex == 2) {
            IBusinessService.getPriceApplyByID.priceApplyID = rowID;
            rock.AjaxRequest(IBusinessService.getPriceApplyByID, rock.exceptionFun);
            if (IBusinessService.getPriceApplyByID.success) {
                (function (e) {
                    priceApply = e;
                    $('#reasion').html(priceApply.reason);
                    $('#txtagent').val(priceApply.agent);
                    $('#chkover50').attr('checked', priceApply.over50);
                    $('#chkleadership').attr('checked', priceApply.needLeadership);
                    $('#chkcompany').attr('checked', priceApply.needCompany);
                    if (BMFL == "BMJL") {
                        $("#chkleadership").attr("disabled", false);
                        $("#chkcompany").attr("disabled", false);
                    }
                    showEditForm();
                }(IBusinessService.getPriceApplyByID.resultValue));
            }
        }
    });
    masterGrid.init();


    //初始化明细表表列表
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");


    detailGrid.setHeader("序号,,价格类别,调整前价格,申请调整价格,价格调整幅度");
    detailGrid.setInitWidths("40,0,80,100,100,*");
    detailGrid.setColAlign("center,left,left,left,left,left");
    detailGrid.setColSorting("na,na,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.init();

    //初始化流程处理信息列表
    auditHistoryGrid = new dhtmlXGridObject("auditHistoryGrid");
    auditHistoryGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    auditHistoryGrid.setSkin("dhx_skyblue");
    auditHistoryGrid.setHeader("序号,,审批部门,审批意见,审批人,审批结果,审批时间");
    auditHistoryGrid.setInitWidths("40,0,100,100,100,100,*");
    auditHistoryGrid.setColAlign("center,left,left,left,left,left,left");
    auditHistoryGrid.setColSorting("na,na,str,str,str,str,str");
    auditHistoryGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    auditHistoryGrid.enableDistributedParsing(true, 20);
    auditHistoryGrid.init();


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
        auditPriceApply("通过");       
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
    //加载明细数据    

    function getDetail(masterID) {
        if (masterID) {
            ISystemService.execQuery.sqlString = "select [PriceApplyDetal].[PriceApplyDetalID], [PriceApplyDetal].[priceCategory], [PriceApplyDetal].[beforePrice], [PriceApplyDetal].[applyPrice], [PriceApplyDetal].[priceRange] from [PriceApplyDetal] where [PriceApplyDetal].[PriceApplyID] = " + masterID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, detailGrid, detailDataList)
                }(ISystemService.execQuery.resultValue));
            }
        }
        else {
            detailGrid.clearAll();
        }
    }

    //加载流程处理信息数据
    function getauditHistoryList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'PriceApply' and [ObjID] = " + rowID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, auditHistoryGrid, auditHistoryDataList)
                }(ISystemService.execQuery.resultValue));
            }
        }
        else {
            auditHistoryGrid.clearAll();
        }
    }

    function initTodoList() {
        switch (BMFL) {
            case "YWY":
                sqlStr = "select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '已提交'";
                break;
            case "BMJL":
                sqlStr = "select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '销售员已确认'";
                break;

            case "CWBM":
                sqlStr = "select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '部门经理已审' and [Over50] = '1' ";
                break;

            case "FGLD":
                sqlStr = "select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '部门经理已审' and [Over50] = '0' and [NeedLeadership] = '1' ";
                sqlStr += " union select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '财务部已审' and [Over50] = '1' and [NeedLeadership] = '1' ";
                break;

            case "GSLD":
                sqlStr = "select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '分管领导已审' and [NeedCompany] = '1' ";
                sqlStr += " union select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '财务部已审' and [Over50] = '1' and [NeedLeadership] = '0' and [NeedCompany] = '1' ";
                sqlStr += " union select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] where state = '部门经理已审' and [Over50] = '0' and [NeedLeadership] = '0' and [NeedCompany] = '1' ";
                break;
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, masterGrid, masterDataList, 3, auditImg, auditImg);
            }(ISystemService.execQuery.resultValue));
        }
    }

})