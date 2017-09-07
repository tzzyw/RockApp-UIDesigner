
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, auditHistoryGrid, sqlStr, editForm,
        customerPlanApply = null,
	auditImg = "/resource/dhtmlx/codebase/imgs/own/audit.png^审批",
    BMFL = decodeURI($.getUrlParam("BMFL")),
    masterDataList = new rock.JsonList(),
    auditHistoryDataList = new rock.JsonList();

    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IBusinessService,CustomerPlanApply";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //处理初始化加载数据
        initTodoList();
    });

    if (BMFL == "GSLD") {        
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
        dhxLayout.cells("a").attachObject("masterDiv");
        dhxLayout.cells("a").hideHeader();
        //dhxLayout.cells("b").attachObject("auditHistoryDiv");
        dhxLayout.cells("b").setHeight(280);
        dhxLayout.cells("b").hideHeader();


        tabbar = dhxLayout.cells("b").attachTabbar();
        tabbar.addTab("history", "客户计划调整审批历史", 100, 1);

        tabbar.tabs("history").setActive();
        tabbar.tabs("history").attachObject("auditHistoryDiv");
        masterGrid = new dhtmlXGridObject("masterGrid1");
    }
    else {
        var height = $('#mainbody').width();
        $("#masterGrid").height(height);
        masterGrid = new dhtmlXGridObject("masterGrid");
    }      

    //初始化主表列表  
    
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");

    masterGrid.setHeader("序号,,审批,客户名称,产品名称,原计划量,调整计划量,申请日期,经办人,状态,调整原因 ");
    masterGrid.setInitWidths("40,0,40,200,120,80,100,80,60,60,*");
    masterGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro,ro");
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getauditHistoryList(rowID);
        if (cIndex == 2) {
            ISystemService.getDynObjectByID.dynObjectID = rowID;
            ISystemService.getDynObjectByID.structName = "CustomerPlanApply";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerPlanApply = e;
                    $('#reasion').html(customerPlanApply.reason);
                    $("#txtquantity").val(customerPlanApply.quantity);
                    if (BMFL == "FGLD") {
                        $("#company").css("visibility", "visible");
                    }
                    else {
                        $("#company").css("visibility", "hidden");
                    }                   
                    showEditForm();
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
    });
    masterGrid.init();


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
        editForm.css({ top: 100, left: 180 }).show();
    }
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //保存
    $("#btn_Save").click(function () {
        if (customerPlanApply != null) {
            var dataState = null;
            var opinion = $('#txtopinion').val();
            ISystemService.getObjectProperty.objName = "CustomerPlanApply";
            ISystemService.getObjectProperty.property = "State";
            ISystemService.getObjectProperty.ojbID = customerPlanApply.customerPlanApplyID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    dataState = e.value;
                }(ISystemService.getObjectProperty.resultValue));
            }
            if (customerPlanApply.state == dataState) {

                IBusinessService.auditCustomerPlanApply.customerPlanApplyID = customerPlanApply.customerPlanApplyID;
                IBusinessService.auditCustomerPlanApply.depart = BMFL;
                IBusinessService.auditCustomerPlanApply.opinion = opinion;                
                IBusinessService.auditCustomerPlanApply.quantity = $("#txtquantity").val();
                IBusinessService.auditCustomerPlanApply.gsld = $('#chkcompany').attr('checked');
                IBusinessService.auditCustomerPlanApply.user = decodeURIComponent($.cookie('userTrueName'));              
                rock.AjaxRequest(IBusinessService.auditCustomerPlanApply, rock.exceptionFun);
                if (IBusinessService.auditCustomerPlanApply.success) {
                    $("#btn_Save").attr("disabled", true);
                    initTodoList();
                    hideEditForm();
                    getauditHistoryList();
                    alert("您的审批已经完成!");
                }
            }
            else {
                alert("当前客户计划调整审批的数据库状态不正确,请刷新页面后重新审核!");
            }
        }
    });


    //加载流程处理信息数据
    function getauditHistoryList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'CustomerPlanApply' and [ObjID] = " + rowID;
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
            case "FGLD":
                sqlStr = "select [CustomerPlanApply].[CustomerPlanApplyID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanApply].[Quantity], convert(nvarchar(10),[CustomerPlanApply].[CreateDate],120), [CustomerPlanApply].[Salesman], [CustomerPlanApply].[State], [CustomerPlanApply].[Reason] from [CustomerPlanApply] join [CustomerPlanQuantity] on [CustomerPlanApply].[CustomerPlanQuantityID] = [CustomerPlanQuantity].[CustomerPlanQuantityID] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID] and [CustomerPlanApply].[State] = '已提交'";
                break;
            case "GSLD":
                sqlStr = "select [CustomerPlanApply].[CustomerPlanApplyID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanApply].[Quantity], convert(nvarchar(10),[CustomerPlanApply].[CreateDate],120), [CustomerPlanApply].[Salesman], [CustomerPlanApply].[State], [CustomerPlanApply].[Reason] from [CustomerPlanApply] join [CustomerPlanQuantity] on [CustomerPlanApply].[CustomerPlanQuantityID] = [CustomerPlanQuantity].[CustomerPlanQuantityID] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID] and [CustomerPlanApply].[State] = '分管领导已审'";
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