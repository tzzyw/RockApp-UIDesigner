
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
      contract = null;
    contractID = $.getUrlParam("id");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,Contract";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        if (contractID != null) {
            ISystemService.getDynObjectByID.dynObjectID = contractID;
            ISystemService.getDynObjectByID.structName = "Contract";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    contract = e;
                    fillPage();
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
        else {
           
        }

    });

    function fillPage() {
        if (contract.otherDepart) {
            //获取其他部门名称
            ISystemService.getObjectProperty.objName = "Department";
            ISystemService.getObjectProperty.property = "DepartmentName";
            ISystemService.getObjectProperty.ojbID = contract.otherDepartID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $('#qtbm').html(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }
            $("#table2").css("background-image", "url(../../Images/hthq.JPG)");            
        }
        else {
            $('#qtbm').html("其他部门");
            $("#table2").css("background-image", "url(../../Images/hthq1.JPG)");
        }

        $("#txtcontractNum").val(contract.contractNum);
        $("#txtsignDate").val(contract.signDate.split(' ')[0]);
        ISystemService.getObjectProperty.objName = "Customer";
        ISystemService.getObjectProperty.property = "CustomerName";
        ISystemService.getObjectProperty.ojbID = contract.customerID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                if (contract.contractType == "销售") {
                    $("#txtbddw").val("产品销售合同 　 " + e.value);
                    //this.HyperLink合同明细.NavigateUrl = "SalContractView.aspx?ID=" + o合同.合同ID;
                }
                else {
                    $("#txtbddw").val("采购合同 　 " + e.value);
                    //this.HyperLink合同明细.NavigateUrl = "PurchaseContractView.aspx?ID=" + o合同.合同ID;
                }

            }(ISystemService.getObjectProperty.resultValue));
        }

        ISystemService.getObjectProperty.objName = "Material";
        ISystemService.getObjectProperty.property = "MaterialName";
        ISystemService.getObjectProperty.ojbID = contract.materialID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                if (contract.materialGrade != null) {
                    $("#txtbdje").val(e.value + contract.materialGrade + contract.number + contract.measure + "，价格为" + contract.price + "元/" + contract.measure + "，总金额为" + Number(contract.total).toFixed(2).toString()) + "元。";
                }
                else {
                    $("#txtbdje").val(e.value + contract.number + contract.measure + "，价格为" + contract.price + "元/" + contract.measure + "，总金额为" + Number(contract.total).toFixed(2).toString()) + "元。";
                }

            }(ISystemService.getObjectProperty.resultValue));
        }

        $("#txtagent").val(contract.agent);
        $("#number").html(contract.number);
        $("#txtcauses").val(contract.causes);
        

        //分管领导部分
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "分管领导";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#imgfgld").css("visibility", "visible");
                    $("#fgldspqk").html(auditResult.split('|')[2]);
                    $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                    $("#txtyxbshsj").html(auditResult.split('|')[1]);
                }
                else {
                    $("#imgfgld").css("display", "none");
                }
            }(IBusinessService.getAvailableContractAudit.resultValue))
        }    

        //财务部分
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "财务部";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#cwbspqk").html(auditResult.split('|')[2]);
                    $("#imgcwb").css("visibility", "visible");
                    $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
                else {
                    $("#imgcwb").css("display", "none");
                }

            }(IBusinessService.getAvailableContractAudit.resultValue))
        }

        //人事行政部部分
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "人事行政部";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#rsxzbshqk").html(auditResult.split('|')[2]);
                    $("#imgrsxzb").css("visibility", "visible");
                    $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
                else {
                    $("#imgrsxzb").css("display", "none");
                }

            }(IBusinessService.getAvailableContractAudit.resultValue))
        }

        //其他部门部分
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "其他部门";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#qtbmshqk").html(auditResult.split('|')[2]);
                    $("#imgqtbm").css("visibility", "visible");
                    $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
                else {
                    $("#imgqtbm").css("display", "none");
                }

            }(IBusinessService.getAvailableContractAudit.resultValue))
        }

        //主管领导部分
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "主管领导";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#zgldshqk").html(auditResult.split('|')[2]);
                    $("#imgzgld").css("visibility", "visible");
                    $("#imgzgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
            }(IBusinessService.getAvailableContractAudit.resultValue))
        }
    }
})