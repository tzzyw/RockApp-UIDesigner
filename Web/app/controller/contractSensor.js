
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, auditHistoryGrid, sqlStr, editForm,contractType,
        customerEnableApply = null,
	auditImg = "/resource/dhtmlx/codebase/imgs/own/audit.png^审批",
    BMFL = $.getUrlParam("BMFL"),
    type = $.getUrlParam("type"),
    masterDataList = new rock.JsonList(),
    auditHistoryDataList = new rock.JsonList();

    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IBusinessService,CustomerEnableApply";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //处理初始化加载数据
        initTodoList();
    });

    if (type == 'xs') {
        contractType = "销售";
    }
    else {
        contractType = "采购";
    }

    if (BMFL == "FGLD") {
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
    masterGrid.setHeader("序号,,审批,合同编号,客户名称,签定日期,产品名称,产品单价,合同数量,货款合计");
    masterGrid.setInitWidths("40,0,40,80,150,80,100,80,80,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro");
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getauditHistoryList(rowID);
        if (cIndex == 2) {
            window.open("ContractSensorPage.html?id=" + rowID + "&BMFL=" + BMFL + "&type=" + type + "&act=sensor");
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
            case "FGLD":
                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Total] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '已提交' and [Contract].[Closed] = '0' ";
                break;
            case "CWBM":
                //Sql = "select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                    from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                                                                                          and 合同.状态 = '分管领导已审'            and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '0'                                                                                   and 合同.合同ID not in (select 合同ID from 合同审批 where 合同审批.审批结果 = '通过' and 审批节点名称 = '财务部') union select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                   from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                         and 合同.状态 = '分管领导已审'        and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '1'";
                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Total] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '0' and [Contract].[ContractID] not in (select [ObjID] from [WorkflowActivityInstance] where [ObjType]='Contract' and [WorkflowActivityInstance].[Result] = '通过' and [WorkflowActivityInstanceName] = '财务部') union select [Contract].[ContractID],[ContractNum], [CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Price], [Quantity], [Total] from [Contract] join [Customer] on [Contract].[CustomerID] = [Customer].[CustomerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '1'";
                break;
            case "RSXZB":
                //Sql = "select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                    from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                                                                                          and 合同.状态 = '分管领导已审'                and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '0' and 合同.合同ID not in                                                   (select 合同ID from 合同审批 where 合同审批.审批结果 = '通过'                   and 审批节点名称 = '人事行政部') union select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                  from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                          and 合同.状态 = '分管领导已审' and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '1'";
                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Total] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '0' and [Contract].[ContractID] not in (select [ObjID] from [WorkflowActivityInstance] where [ObjType]='Contract' and [WorkflowActivityInstance].[Result] = '通过' and [WorkflowActivityInstanceName] = '人事行政部') union select [Contract].[ContractID],[ContractNum], [CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Price], [Quantity], [Total] from [Contract] join [Customer] on [Contract].[CustomerID] = [Customer].[CustomerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '1'";
                break;
            case "AQSCB":
                //Sql = "select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                    from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                                                                                           and 合同.状态 = '分管领导已审'               and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '0' and 合同.是否其他部门审批 = '1' and 合同.其他部门ID = 2                        and 合同.合同ID not in (select 合同ID                                           from 合同审批 where 合同审批.审批结果 = '通过'                    and 审批节点名称 = '其他部门') union select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                         from 合同 join 客户 on 合同.客户ID = 客户.客户ID and 合同.状态 = '分管领导已审' and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '1' and 合同.是否其他部门审批 = '1' and 合同.其他部门ID = 2 ";
                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Total] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '0'  and [Contract].[OtherDepart] = '1' and [Contract].[OtherDepartID] = 2 and [Contract].[ContractID] not in (select [ObjID] from [WorkflowActivityInstance] where [ObjType]='Contract' and [WorkflowActivityInstance].[Result] = '通过' and [WorkflowActivityInstanceName] = '其他部门') union select [Contract].[ContractID],[ContractNum], [CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName],[Price], [Quantity], [Total] from [Contract] join [Customer] on [Contract].[CustomerID] = [Customer].[CustomerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '1' and [Contract].[OtherDepart] = '1' and [Contract].[OtherDepartID] = 2 ";
                break;
            case "QTBM":
                //Sql = "select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                    from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                                                                                                          and 合同.状态 = '分管领导已审' and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '0' and 合同.是否其他部门审批 = '1' and 合同.其他部门ID <> 2 and 合同.合同ID                not in (select 合同ID from 合同审批 where 合同审批.审批结果 = '通过' and 审批节点名称 = '其他部门') union select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                              from 合同 join 客户 on 合同.客户ID = 客户.客户ID and 合同.状态 = '分管领导已审' and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '1' and 合同.是否其他部门审批 = '1' and 合同.其他部门ID <> 2 ";
                //Sql = "select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                    from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                                                                                                          and 合同.状态 = '分管领导已审' and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '0' and 合同.是否其他部门审批 = '1' and 合同.其他部门ID <> 2 and 合同.合同ID                not in (select 合同ID from 合同审批 where 合同审批.审批结果 = '通过' and 审批节点名称 = '其他部门') union select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                              from 合同 join 客户 on 合同.客户ID = 客户.客户ID and 合同.状态 = '分管领导已审' and 合同.是否关闭 = '0' and 合同.是否主管领导退回 = '1' and 合同.是否其他部门审批 = '1' and 合同.其他部门ID <> 2 ";
                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Total] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '0' and [Contract].[OtherDepart] = '1' and [Contract].[OtherDepartID] <> 2 and [Contract].[ContractID] not in (select [ObjID] from [WorkflowActivityInstance] where [ObjType]='Contract' and [WorkflowActivityInstance].[Result] = '通过' and [WorkflowActivityInstanceName] = '其他部门') union select [Contract].[ContractID],[ContractNum], [CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName],[Price], [Quantity], [Total] from [Contract] join [Customer] on [Contract].[CustomerID] = [Customer].[CustomerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '分管领导已审' and [Contract].[Closed] = '0' and [Contract].[Back] = '1' and [Contract].[OtherDepart] = '1' and [Contract].[OtherDepartID] <> 2 ";
                break;
            case "ZGLD":
                //Sql = "select 合同.合同ID,合同编号, 客户名称, 签定时间,产品单价, 合同数量, 管输单价, 货款合计                                                                                                                                    from 合同 join 客户 on 合同.客户ID = 客户.客户ID                                                                                                                         and 合同.状态 = '已会签' and 合同.是否关闭 = '0' ";
                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Total] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[State] = '已会签' and [Contract].[Closed] = '0' ";
                break;

        }

        sqlStr += "and [Contract].[ContractType] = '" + contractType + "'"

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, masterGrid, masterDataList, 3, auditImg, auditImg);
            }(ISystemService.execQuery.resultValue));
        }
    }

})