
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, auditHistoryGrid, sqlStr, editForm,
        customerEnableApply = null,
	auditImg = "/resource/dhtmlx/codebase/imgs/own/audit.png^审批",
    BMFL = decodeURI($.getUrlParam("BMFL")),
    masterDataList = new rock.JsonList(),
    auditHistoryDataList = new rock.JsonList();

    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IBusinessService,CustomerEnableApply";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //处理初始化加载数据
        initTodoList();
    });

    if (BMFL == "BMJL") {
        var height = $('#mainbody').width();
        $("#masterGrid").height(height);
        masterGrid = new dhtmlXGridObject("masterGrid");
    }
    else {
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
        dhxLayout.cells("a").attachObject("masterDiv");
        dhxLayout.cells("a").hideHeader();
        //dhxLayout.cells("b").attachObject("auditHistoryDiv");
        dhxLayout.cells("b").setHeight(280);
        dhxLayout.cells("b").hideHeader();


        tabbar = dhxLayout.cells("b").attachTabbar();
        tabbar.addTab("history", "客户启用审批历史", 100, 1);

        tabbar.tabs("history").setActive();
        tabbar.tabs("history").attachObject("auditHistoryDiv");
        masterGrid = new dhtmlXGridObject("masterGrid1");
    }
   
    //初始化主表列表
    //masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");


    masterGrid.setHeader("序号,,审批,客户名称,申请日期,业务员,状态,启用原因");
    masterGrid.setInitWidths("40,0,40,200,80,55,85,*");
    masterGrid.setColAlign("center,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getauditHistoryList(rowID);
        if (cIndex == 2) {
            ISystemService.getDynObjectByID.dynObjectID = rowID;
            ISystemService.getDynObjectByID.structName = "CustomerEnableApply";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerEnableApply = e;
                    $('#reasion').html(customerEnableApply.enableReason);
                    $('#chkleadership').attr('checked', customerEnableApply.needLeadership);
                    $('#chkcompany').attr('checked', customerEnableApply.needCompany);
                    if (BMFL == "BMJL") {
                        $("#option").css("visibility", "visible");
                    }
                    else {
                        $("#option").css("visibility", "hidden");
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
        if (customerEnableApply != null) {
            var dataState = null;
            var opinion = $('#txtopinion').val();
            ISystemService.getObjectProperty.objName = "customerEnableApply";
            ISystemService.getObjectProperty.property = "State";
            ISystemService.getObjectProperty.ojbID = customerEnableApply.customerEnableApplyID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    dataState = e.value;
                }(ISystemService.getObjectProperty.resultValue));
            }
            if (customerEnableApply.state == dataState) {               

                IBusinessService.auditCustomerEnableApply.customerEnableApplyID = customerEnableApply.customerEnableApplyID;
                IBusinessService.auditCustomerEnableApply.depart = BMFL;
                IBusinessService.auditCustomerEnableApply.opinion = opinion;
                IBusinessService.auditCustomerEnableApply.user = decodeURIComponent($.cookie('userTrueName'));

                switch (BMFL) {                    
                    case "BMJL":
                        if ($('#chkleadership').attr('checked')) {
                            IBusinessService.auditCustomerEnableApply.fgld = true;
                        }
                        else {
                            IBusinessService.auditCustomerEnableApply.fgld = false;
                        }
                        if ($('#chkcompany').attr('checked')) {
                            IBusinessService.auditCustomerEnableApply.gsld = true;
                        }
                        else {
                            IBusinessService.auditCustomerEnableApply.gsld = false;
                        }
                        break;                    
                    case "FGLD":
                        break;
                    case "GSLD":
                        break;
                }

                rock.AjaxRequest(IBusinessService.auditCustomerEnableApply, rock.exceptionFun);
                if (IBusinessService.auditCustomerEnableApply.success) {
                    $("#btn_Save").attr("disabled", true);
                    initTodoList();
                    hideEditForm();
                    getauditHistoryList();
                    alert("您的审批已经完成!");
                }
            }
            else {
                alert("当前客户启用审批的数据库状态不正确,请刷新页面后重新审核!");
            }
        }       
    });


    //加载流程处理信息数据
    function getauditHistoryList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'CustomerEnableApply' and [ObjID] = " + rowID;
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
            case "BMJL":
                sqlStr = "select [CustomerEnableApply].[CustomerEnableApplyID], [Customer].[CustomerName], convert(nvarchar(10),[CustomerEnableApply].[applyDate],120) as applyDate, [CustomerEnableApply].[Applicant], [CustomerEnableApply].[State], [CustomerEnableApply].[enableReason] from [CustomerEnableApply] join [Customer] on [CustomerEnableApply].[customerID] = [Customer].[customerID] where [CustomerEnableApply].[State] = '已提交'";
                break;
            case "FGLD":
                sqlStr = "select [CustomerEnableApply].[CustomerEnableApplyID], [Customer].[CustomerName], convert(nvarchar(10),[CustomerEnableApply].[applyDate],120) as applyDate, [CustomerEnableApply].[Applicant], [CustomerEnableApply].[State], [CustomerEnableApply].[enableReason] from [CustomerEnableApply] join [Customer] on [CustomerEnableApply].[customerID] = [Customer].[customerID] where [CustomerEnableApply].[State] = '部门经理已审' and [NeedLeadership] = '1' ";
                break;
            case "GSLD":
                sqlStr = "select [CustomerEnableApply].[CustomerEnableApplyID], [Customer].[CustomerName], convert(nvarchar(10),[CustomerEnableApply].[applyDate],120) as applyDate, [CustomerEnableApply].[Applicant], [CustomerEnableApply].[State], [CustomerEnableApply].[enableReason] from [CustomerEnableApply] join [Customer] on [CustomerEnableApply].[customerID] = [Customer].[customerID] where ([CustomerEnableApply].[State] = '分管领导已审' and [NeedLeadership] = '1' and [NeedCompany] = '1') or ([CustomerEnableApply].[State] = '部门经理已审' and [NeedLeadership] = '0' and [NeedCompany] = '1')";
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