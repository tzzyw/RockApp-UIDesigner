
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
        contract = null,
    contractID = $.getUrlParam("id"),
    BMFL = $.getUrlParam("BMFL"),
    type = $.getUrlParam("type"),
    act = $.getUrlParam("act");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,Contract";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        }
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
                    $('#txtqtbm').val(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }
        }
        else {
            $('#txtqtbm').val("其他部门");
        }
       
        $("#txtcontractNum").val(contract.contractNum);
        $("#txtsignDate").val(contract.signDate.split(' ')[0]);
        ISystemService.getObjectProperty.objName = "Customer";
        ISystemService.getObjectProperty.property = "CustomerName";
        ISystemService.getObjectProperty.ojbID = contract.customerID;
        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
        if (ISystemService.getObjectProperty.success) {
            (function (e) {
                if (type == "销售") {
                    $("#txtcustomerName").val("产品销售合同 　 " + e.value);
                    //this.HyperLink合同明细.NavigateUrl = "SalContractView.aspx?ID=" + o合同.合同ID;
                }
                else {
                    $("#txtcustomerName").val("采购合同 　 " + e.value);
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
        $("#txtnumber").val(contract.number);
        $("#txtcauses").val(contract.causes);

        if (act == "sensor") {
            var auditResult = null;
            switch (BMFL) {
                case "FGLD":
                    //分管领导部分
                    if (contract.state != "已提交") {
                        //$("#btnfgld").css("visibility", "visible");
                        $("#btnfgld").css("display", "none");
                        $("#btnfgldth").css("display", "none");
                        $("#txtfgldshyj").css("display", "none");
                        $("#txtfgldspqk").css("display", "none");
                        $("#imgfgld").css("display", "none");
                        //获取合同审批                        
                        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                        IBusinessService.getAvailableContractAudit.node = "分管领导";
                        IBusinessService.getAvailableContractAudit.result = "通过";
                        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                        if (IBusinessService.getAvailableContractAudit.success) {
                            (function (e) {
                                auditResult = e.value;
                                if (auditResult != "") {
                                    $("#txtfgldspqk").val(auditResult.split('|')[2]);
                                    $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                    $("#txtyxbshsj").val(auditResult.split('|')[1]);
                                }
                            }(IBusinessService.getAvailableContractAudit.resultValue))
                        }                                                      
                        alert("您的审批已经完成不可以重复审批!");
                        填充浏览界面();
                        return;
                    }
                    $("#btnfgld").css("display", "block");
                    $("#btnfgldth").css("display", "block");
                    $("#btnfgld").attr("disabled", false);
                    $("#btnfgldth").attr("disabled", false);
                    $("#imgfgld").css("display", "none");

                    //财务部分
                    IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                    IBusinessService.getAvailableContractAudit.node = "财务部";
                    IBusinessService.getAvailableContractAudit.result = "通过";
                    rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                    if (IBusinessService.getAvailableContractAudit.success) {
                        (function (e) {
                            auditResult = e.value;
                            if (auditResult != "") {
                                $("#cwspyj").css("visibility", "visible");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("visibility", "visible");
                                $("#txtcwbspqk").val(auditResult.split('|')[2]);
                                $("#imgcwb").css("visibility", "visible");
                                $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");                               
                            }
                            else {
                                $("#cwspyj").css("display", "none");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbspqk").css("display", "none");
                                $("#imgcwb").css("display", "none");
                                $("#txtcwbshyj").css("display", "none");
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
                                $("#rsxzbspyj").css("visibility", "visible");
                                $("#rsxzbspan").css("visibility", "visible");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#txtrsxzbshqk").css("visibility", "visible");
                                $("#txtrsxzbshqk").val(auditResult.split('|')[2]);
                                $("#imgrsxzb").css("visibility", "visible");
                                $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");                              
                            }
                            else {
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#rsxzbspan").css("display", "none");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshqk").css("display", "none");
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
                                $("#qtbmspyj").css("visibility", "visible");
                                $("#qtbmspan").css("visibility", "visible");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshyj").css("display", "none");
                                $("#txtqtbmshqk").css("visibility", "visible");
                                $("#txtqtbmshqk").val(auditResult.split('|')[2]);
                                $("#imgqtbm").css("visibility", "visible");
                                $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");                            
                            }
                            else {
                                $("#txtqtbmshyj").css("display", "none");
                                $("#qtbmspan").css("display", "none");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshqk").css("display", "none");
                                $("#imgqtbm").css("display", "none");
                            }

                        }(IBusinessService.getAvailableContractAudit.resultValue))
                    }                    

                    //主管领导部分
                    $("#zgldspyj").css("display", "none");
                    $("#zgldspan").css("display", "none");
                    $("#btnzgldsp").css("display", "none");
                    $("#btnzgldth").css("display", "none");
                    $("#btnzgldgb").css("display", "none");
                    $("#txtzgldshyj").css("display", "none");
                    $("#txtzgldshqk").css("display", "none");
                    $("#imgzgld").css("display", "none");
                    break;

                case "CWBM":
                    //分管领导部分
                    $("#btnfgld").css("display", "none");
                    $("#btnfgldth").css("display", "none");
                    $("#txtfgldshyj").css("display", "none");
                    $("#txtfgldspqk").css("visibility", "visible");
                    $("#imgfgld").css("visibility", "visible");                  

                    IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                    IBusinessService.getAvailableContractAudit.node = "分管领导";
                    IBusinessService.getAvailableContractAudit.result = "通过";
                    rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                    if (IBusinessService.getAvailableContractAudit.success) {
                        (function (e) {
                            auditResult = e.value;
                            if (auditResult != "") {
                                $("#txtfgldspqk").val(auditResult.split('|')[2]);
                                $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                $("#txtyxbshsj").val(auditResult.split('|')[1]);
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
                                $("#cwspyj").css("visibility", "visible");
                                $("#cwspan").css("visibility", "visible");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("visibility", "visible");
                                $("#txtcwbspqk").val(auditResult.split('|')[2]);
                                $("#imgcwb").css("visibility", "visible");
                                $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");                               
                                alert("您的审批已经完成不可以重复审批!");
                                填充浏览界面();
                            }
                            else {
                                $("#cwspyj").css("visibility", "visible");
                                $("#cwspan").css("visibility", "visible");
                                $("#btncwb").css("visibility", "visible");
                                $("#btncwbth").css("visibility", "visible");
                                $("#txtcwbshyj").css("visibility", "visible");
                                $("#txtcwbspqk").css("display", "none");
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
                                $("#rsxzbspyj").css("visibility", "visible");
                                $("#rsxzbspan").css("visibility", "visible");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#txtrsxzbshqk").css("visibility", "visible");
                                $("#txtrsxzbshqk").val(auditResult.split('|')[2]);
                                $("#imgrsxzb").css("visibility", "visible");
                                $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                            }
                            else {
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#rsxzbspan").css("display", "none");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshqk").css("display", "none");
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
                                $("#qtbmspyj").css("visibility", "visible");
                                $("#qtbmspan").css("visibility", "visible");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshyj").css("display", "none");
                                $("#txtqtbmshqk").css("visibility", "visible");
                                $("#txtqtbmshqk").val(auditResult.split('|')[2]);
                                $("#imgqtbm").css("visibility", "visible");
                                $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                            }
                            else {
                                $("#txtqtbmshyj").css("display", "none");
                                $("#qtbmspan").css("display", "none");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshqk").css("display", "none");
                                $("#imgqtbm").css("display", "none");
                            }
                        }(IBusinessService.getAvailableContractAudit.resultValue))
                    }
                   

                    //主管领导部分
                    $("#zgldspyj").css("display", "none");
                    $("#zgldspan").css("display", "none");
                    $("#btnzgldsp").css("display", "none");
                    $("#btnzgldth").css("display", "none");
                    $("#btnzgldgb").css("display", "none");
                    $("#txtzgldshyj").css("display", "none");
                    $("#txtzgldshqk").css("display", "none");
                    $("#imgzgld").css("display", "none");

                    break;

                case "RSXZB":
                    //分管领导部分
                    $("#btnfgld").css("display", "none");
                    $("#btnfgldth").css("display", "none");
                    $("#txtfgldshyj").css("display", "none");
                    $("#txtfgldspqk").css("visibility", "visible");
                    $("#imgfgld").css("visibility", "visible");

                    //获取合同审批                        
                    IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                    IBusinessService.getAvailableContractAudit.node = "分管领导";
                    IBusinessService.getAvailableContractAudit.result = "通过";
                    rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                    if (IBusinessService.getAvailableContractAudit.success) {
                        (function (e) {
                            auditResult = e.value;
                            if (auditResult != "") {
                                $("#txtfgldspqk").val(auditResult.split('|')[2]);
                                $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                $("#txtyxbshsj").val(auditResult.split('|')[1]);
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
                                $("#rsxzbspyj").css("visibility", "visible");
                                $("#rsxzbspan").css("visibility", "visible");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#txtrsxzbshqk").css("visibility", "visible");
                                $("#txtrsxzbshqk").val(auditResult.split('|')[2]);
                                $("#imgrsxzb").css("visibility", "visible");
                                $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                alert("您的审批已经完成不可以重复审批!");
                                填充浏览界面();
                            }
                            else {
                                $("#txtrsxzbshyj").css("visibility", "visible");
                                $("#rsxzbspan").css("visibility", "visible");
                                $("#btnrsxzbsp").css("visibility", "visible");
                                $("#btnrsxzbth").css("visibility", "visible");
                                $("#txtrsxzbshqk").css("display", "none");
                                $("#imgrsxzb").css("display", "none");
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
                                $("#cwspyj").css("visibility", "visible");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("visibility", "visible");
                                $("#txtcwbspqk").val(auditResult.split('|')[2]);
                                $("#imgcwb").css("visibility", "visible");
                                $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                            }
                            else {
                                $("#cwspyj").css("display", "none");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbshyj").css("display", "display");
                                $("#txtcwbspqk").css("display", "none");
                                $("#imgcwb").css("display", "none");
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
                                $("#qtbmspyj").css("visibility", "visible");
                                $("#qtbmspan").css("visibility", "visible");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshyj").css("display", "none");
                                $("#txtqtbmshqk").css("visibility", "visible");
                                $("#txtqtbmshqk").val(auditResult.split('|')[2]);
                                $("#imgqtbm").css("visibility", "visible");
                                $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                            }
                            else {
                                $("#txtqtbmshyj").css("display", "none");
                                $("#qtbmspan").css("display", "none");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshqk").css("display", "none");
                                $("#imgqtbm").css("display", "none");
                            }
                        }(IBusinessService.getAvailableContractAudit.resultValue))
                    }
                   

                    //主管领导部分
                    $("#zgldspyj").css("display", "none");
                    $("#zgldspan").css("display", "none");
                    $("#btnzgldsp").css("display", "none");
                    $("#btnzgldth").css("display", "none");
                    $("#btnzgldgb").css("display", "none");
                    $("#txtzgldshyj").css("display", "none");
                    $("#txtzgldshqk").css("display", "none");
                    $("#imgzgld").css("display", "none");                  
                    break;


                case "QTBM":
                    //分管领导部分
                    $("#btnfgld").css("display", "none");
                    $("#btnfgldth").css("display", "none");
                    $("#txtfgldshyj").css("display", "none");
                    $("#txtfgldspqk").css("visibility", "visible");
                    $("#imgfgld").css("visibility", "visible");                   

                    //获取合同审批                        
                    IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                    IBusinessService.getAvailableContractAudit.node = "分管领导";
                    IBusinessService.getAvailableContractAudit.result = "通过";
                    rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                    if (IBusinessService.getAvailableContractAudit.success) {
                        (function (e) {
                            auditResult = e.value;
                            if (auditResult != "") {
                                $("#txtfgldspqk").val(auditResult.split('|')[2]);
                                $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                $("#txtyxbshsj").val(auditResult.split('|')[1]);
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
                                $("#qtbmspyj").css("visibility", "visible");
                                $("#qtbmspan").css("visibility", "visible");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshyj").css("display", "none");
                                $("#txtqtbmshqk").css("visibility", "visible");
                                $("#txtqtbmshqk").val(auditResult.split('|')[2]);
                                $("#imgqtbm").css("visibility", "visible");
                                $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                alert("您的审批已经完成不可以重复审批!");
                                填充浏览界面();
                            }
                            $("#txtqtbmshyj").css("visibility", "visible");
                            $("#qtbmspan").css("visibility", "visible");
                            $("#btnqtbmsp").css("visibility", "visible");
                            $("#btnqtbmth").css("visibility", "visible");
                            $("#txtqtbmshqk").css("display", "none");
                            $("#imgqtbm").css("display", "none");                           
                           
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
                                $("#rsxzbspyj").css("visibility", "visible");
                                $("#rsxzbspan").css("visibility", "visible");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#txtrsxzbshqk").css("visibility", "visible");
                                $("#txtrsxzbshqk").val(auditResult.split('|')[2]);
                                $("#imgrsxzb").css("visibility", "visible");
                                $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");

                            }
                            else {
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#rsxzbspan").css("display", "none");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshqk").css("display", "none");
                                $("#imgrsxzb").css("display", "none");
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
                                $("#cwspyj").css("visibility", "visible");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("visibility", "visible");
                                $("#txtcwbspqk").val(auditResult.split('|')[2]);
                                $("#imgcwb").css("visibility", "visible");
                                $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");

                            }
                            else {
                                $("#cwspyj").css("display", "none");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");

                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("display", "none");
                                $("#imgcwb").css("display", "none");
                            }
                        }(IBusinessService.getAvailableContractAudit.resultValue))
                    }
                   
                    //主管领导部分
                    $("#zgldspyj").css("display", "none");
                    $("#zgldspan").css("display", "none");
                    $("#btnzgldsp").css("display", "none");
                    $("#btnzgldth").css("display", "none");
                    $("#btnzgldgb").css("display", "none");
                    $("#txtzgldshyj").css("display", "none");
                    $("#txtzgldshqk").css("display", "none");
                    $("#imgzgld").css("display", "none");
                
                    break;

                case "ZGLD":
                    //分管领导部分
                    $("#btnfgld").css("display", "none");
                    $("#btnfgldth").css("display", "none");
                    $("#txtfgldshyj").css("display", "none");
                    $("#txtfgldspqk").css("visibility", "visible");
                    $("#imgfgld").css("visibility", "visible");
         
                    //获取合同审批                        
                    IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                    IBusinessService.getAvailableContractAudit.node = "分管领导";
                    IBusinessService.getAvailableContractAudit.result = "通过";
                    rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                    if (IBusinessService.getAvailableContractAudit.success) {
                        (function (e) {
                            auditResult = e.value;
                            if (auditResult != "") {
                                $("#txtfgldspqk").val(auditResult.split('|')[2]);
                                $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                                $("#txtyxbshsj").val(auditResult.split('|')[1]);
                            }
                        }(IBusinessService.getAvailableContractAudit.resultValue))
                    }                
                                     
                    //主管领导部分
                    $("#zgldspyj").css("visibility", "visible");
                    $("#zgldspan").css("visibility", "visible");
                    $("#btnzgldsp").css("visibility", "visible");
                    $("#btnzgldth").css("visibility", "visible");
                    $("#btnzgldgb").css("visibility", "visible");
                    $("#txtzgldshyj").css("visibility", "visible");
                    $("#txtzgldshqk").css("display", "none");
                    $("#imgzgld").css("display", "none");
                 
                    //其他部门部分
                    IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
                    IBusinessService.getAvailableContractAudit.node = "其他部门";
                    IBusinessService.getAvailableContractAudit.result = "通过";
                    rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
                    if (IBusinessService.getAvailableContractAudit.success) {
                        (function (e) {
                            auditResult = e.value;
                            if (auditResult != "") {
                                $("#qtbmspyj").css("visibility", "visible");
                                $("#qtbmspan").css("visibility", "visible");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshyj").css("display", "none");
                                $("#txtqtbmshqk").css("visibility", "visible");
                                $("#txtqtbmshqk").val(auditResult.split('|')[2]);
                                $("#imgqtbm").css("visibility", "visible");
                                $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                            }
                            else {
                                $("#txtqtbmshyj").css("display", "none");
                                $("#qtbmspan").css("display", "none");
                                $("#btnqtbmsp").css("display", "none");
                                $("#btnqtbmth").css("display", "none");
                                $("#txtqtbmshqk").css("display", "none");
                                $("#imgqtbm").css("display", "none");
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
                                $("#rsxzbspyj").css("visibility", "visible");
                                $("#rsxzbspan").css("visibility", "visible");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#txtrsxzbshqk").css("visibility", "visible");
                                $("#txtrsxzbshqk").val(auditResult.split('|')[2]);
                                $("#imgrsxzb").css("visibility", "visible");
                                $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");

                            }
                            else {
                                $("#txtrsxzbshyj").css("display", "none");
                                $("#rsxzbspan").css("display", "none");
                                $("#btnrsxzbsp").css("display", "none");
                                $("#btnrsxzbth").css("display", "none");
                                $("#txtrsxzbshqk").css("display", "none");
                                $("#imgrsxzb").css("display", "none");
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
                                $("#cwspyj").css("visibility", "visible");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");
                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("visibility", "visible");
                                $("#txtcwbspqk").val(auditResult.split('|')[2]);
                                $("#imgcwb").css("visibility", "visible");
                                $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");

                            }
                            else {
                                $("#cwspyj").css("display", "none");
                                $("#cwspan").css("display", "none");
                                $("#btncwb").css("display", "none");
                                $("#btncwbth").css("display", "none");

                                $("#txtcwbshyj").css("display", "none");
                                $("#txtcwbspqk").css("display", "none");
                                $("#imgcwb").css("display", "none");
                            }
                        }(IBusinessService.getAvailableContractAudit.resultValue))
                    }                 

                    break;
            }
        }
        else {
            填充浏览界面();
        }

        $("#txtnumber").val(contract.number);
        $("#txtnumber").val(contract.number);
        $("#txtnumber").val(contract.number);


    }


    function 填充浏览界面()
    {
        //分管领导部分
        $("#btnfgld").css("display", "none");
        $("#btnfgldth").css("display", "none");
        $("#txtfgldshyj").css("display", "none");
        
        //this.btn分管领导审批.Visible = false;
        //this.btn分管领导退回.Visible = false;
        //this.txt分管领导审核意见.Visible = false;

        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "分管领导";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#txtfgldspqk").css("visibility", "visible");
                    $("#imgfgld").css("visibility", "visible");
                    $("#txtfgldspqk").val(auditResult.split('|')[2]);
                    $("#imgfgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                    $("#txtyxbshsj").val(auditResult.split('|')[1]);
                }
                else {
                    //    this.lbl分管领导审批情况.Visible = false;
                    //    this.img分管领导签名.Visible = false;
                    //    this.lblyxbshsj.Visible = false;
                    $("#txtfgldspqk").css("display", "none");
                    $("#imgfgld").css("display", "none");
                    $("#txtfgldshyj").css("display", "none");
                }
            }(IBusinessService.getAvailableContractAudit.resultValue))
        }

        //o合同审批 = _业务服务.获取可用合同审批(o合同.合同ID, "分管领导", "通过");
        //if (o合同审批 != null)
        //{
        //    this.lbl分管领导审批情况.Visible = true;
        //    this.img分管领导签名.Visible = true;
        //    this.lbl分管领导审批情况.Text = o合同审批.审批意见;
        //    this.img分管领导签名.ImageUrl = "../SignImages/" + o合同审批.审批人 + ".gif";
        //    this.lblyxbshsj.Text = o合同审批.审核日期.ToString();
        //}
        //else
        //{
        //    this.lbl分管领导审批情况.Visible = false;
        //    this.img分管领导签名.Visible = false;
        //    this.lblyxbshsj.Visible = false;
        //}
        
        //财务部分
        $("#cwspan").css("display", "none");
        $("#btncwb").css("display", "none");
        $("#btncwbth").css("display", "none");
        $("#txtcwbshyj").css("display", "none");
        //财务部分
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "财务部";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#cwspyj").css("visibility", "visible");
                    $("#txtcwbspqk").css("visibility", "visible");
                    $("#txtcwbspqk").val(auditResult.split('|')[2]);
                    $("#imgcwb").css("visibility", "visible");
                    $("#imgcwb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
                else {
                    $("#cwspyj").css("display", "none");
                    $("#txtcwbspqk").css("display", "none");
                    $("#imgcwb").css("display", "none");                   
                }

            }(IBusinessService.getAvailableContractAudit.resultValue))
        }

        //this.财务审批按钮.Visible = false;
        //this.btn财务部审批.Visible = false;
        //this.btn财务部退回.Visible = false;
        //this.txt财务部门审核意见.Visible = false;

        //o合同审批 = _业务服务.获取可用合同审批(o合同.合同ID, "财务部", "通过");
        //if (o合同审批 != null)
        //{
        //    this.财务审批意见.Visible = true;
        //    this.lbl财务部审批情况.Visible = true;
        //    this.lbl财务部审批情况.Text = o合同审批.审批意见;
        //    this.img财务部签名.Visible = true;
        //    this.img财务部签名.ImageUrl = "../SignImages/" + o合同审批.审批人 + ".gif";
        //}
        //else
        //{
        //    this.财务审批意见.Visible = false;
        //    this.lbl财务部审批情况.Visible = false;
        //    this.img财务部签名.Visible = false;
        //}

        //人事行政部部分
        $("#rsxzbspan").css("visibility", "visible");
        $("#btnrsxzbsp").css("display", "none");
        $("#btnrsxzbth").css("display", "none");
        $("#txtrsxzbshyj").css("display", "none");
        $("#txtrsxzbshyj").attr("readonly", "readonly");
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "人事行政部";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#rsxzbspyj").css("visibility", "visible");
                    $("#txtrsxzbshqk").css("visibility", "visible");
                    $("#txtrsxzbshqk").val(auditResult.split('|')[2]);
                    $("#imgrsxzb").css("visibility", "visible");
                    $("#imgrsxzb").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
                else {
                    $("#txtrsxzbshyj").css("display", "none");
                    $("#txtrsxzbshqk").css("display", "none");
                    $("#imgrsxzb").css("display", "none");
                }
            }(IBusinessService.getAvailableContractAudit.resultValue))
        }
        //this.人事行政部审批按钮.Visible = false;
        //this.btn人事行政部审批.Visible = false;
        //this.btn人事行政部退回.Visible = false;
        //this.txt人事行政部审核意见.Visible = false;

        //o合同审批 = _业务服务.获取可用合同审批(o合同.合同ID, "人事行政部", "通过");
        //if (o合同审批 != null)
        //{
        //    this.人事行政部审批意见.Visible = true;
        //    this.lbl人事行政部审批情况.Visible = true;
        //    this.lbl人事行政部审批情况.Text = o合同审批.审批意见;
        //    this.img人事行政部签名.Visible = true;
        //    this.img人事行政部签名.ImageUrl = "../SignImages/" + o合同审批.审批人 + ".gif";

        //}
        //else
        //{
        //    this.人事行政部审批意见.Visible = false;
        //    this.lbl人事行政部审批情况.Visible = false;
        //    this.img人事行政部签名.Visible = false;
        //}



        //其他部门部分
        $("#qtbmspan").css("display", "none");
        $("#btnqtbmsp").css("display", "none");
        $("#btnqtbmth").css("display", "none");
        $("#txtqtbmshyj").css("display", "none");
        $("#txtqtbmshyj").attr("readonly", "readonly");
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "其他部门";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#qtbmspyj").css("visibility", "visible");
                    $("#txtqtbmshqk").css("visibility", "visible");
                    $("#txtqtbmshqk").val(auditResult.split('|')[2]);
                    $("#imgqtbm").css("visibility", "visible");
                    $("#imgqtbm").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");
                }
                else {
                    $("#txtqtbmshyj").css("display", "none");
                    $("#txtqtbmshqk").css("display", "none");
                    $("#imgqtbm").css("display", "none");
                    $("#qtbmspan").css("display", "none");
                    $("#btnqtbmsp").css("display", "none");
                    $("#btnqtbmth").css("display", "none");
                }
            }(IBusinessService.getAvailableContractAudit.resultValue))
        }

        //this.其它部门审批按钮.Visible = false;
        //this.btn其它部门审批.Visible = false;
        //this.btn其他部门退回.Visible = false;
        //this.txt其它部门审核意见.Visible = false;

        //o合同审批 = _业务服务.获取可用合同审批(o合同.合同ID, "其他部门", "通过");
        //if (o合同审批 != null)
        //{
        //    this.其它部门审批意见.Visible = true;
        //    this.lbl其它部门审批情况.Visible = true;
        //    this.lbl其它部门审批情况.Text = o合同审批.审批意见;
        //    this.img其他部门签名.Visible = true;
        //    this.img其他部门签名.ImageUrl = "../SignImages/" + o合同审批.审批人 + ".gif";

        //}
        //else
        //{
        //    this.其它部门审批意见.Visible = false;
        //    this.lbl其它部门审批情况.Visible = false;
        //    this.img其他部门签名.Visible = false;
        //}

        //主管领导部分
        $("#zgldspan").css("display", "none");
        $("#btnzgldsp").css("display", "none");
        $("#btnzgldth").css("display", "none");
        $("#btnzgldgb").css("display", "none");
        $("#txtzgldshyj").css("display", "none");
        IBusinessService.getAvailableContractAudit.contractID = contract.contractID;
        IBusinessService.getAvailableContractAudit.node = "主管领导";
        IBusinessService.getAvailableContractAudit.result = "通过";
        rock.AjaxRequest(IBusinessService.getAvailableContractAudit, rock.exceptionFun);
        if (IBusinessService.getAvailableContractAudit.success) {
            (function (e) {
                auditResult = e.value;
                if (auditResult != "") {
                    $("#txtzgldshyj").css("visibility", "visible");
                    $("#txtzgldshqk").css("visibility", "visible");
                    $("#txtzgldshqk").val(auditResult.split('|')[2]);
                    $("#imgzgld").css("visibility", "visible");
                    $("#imgzgld").attr('src', "../../SignImages/" + auditResult.split('|')[0] + ".gif");                  
                }
                else {
                    $("#txtqtbmshyj").css("display", "none");
                    $("#txtqtbmshqk").css("display", "none");
                    $("#imgqtbm").css("display", "none");
                    $("#qtbmspan").css("display", "none");
                    $("#btnqtbmsp").css("display", "none");
                    $("#btnqtbmth").css("display", "none");
                }
            }(IBusinessService.getAvailableContractAudit.resultValue))
        }
        //$("#zgldspyj").css("display", "none");

        //this.主管领导审批按钮.Visible = false;
        //this.btn主管领导审批.Visible = false;
        //this.btn主管领导退回.Visible = false;
        //this.btn关闭合同.Visible = false;
        //this.txt主管领导审批意见.Visible = false;

        //o合同审批 = _业务服务.获取主管领导合同审批(o合同.合同ID);
        //if (o合同审批 != null)
        //{
        //    this.主管领导审批意见.Visible = true;
        //    this.lbl领导审批情况.Visible = true;
        //    this.lbl领导审批情况.Text = o合同审批.审批意见;
        //    this.img领导签名.Visible = true;
        //    this.img领导签名.ImageUrl = "../SignImages/" + o合同审批.审批人 + ".gif";
        //}
        //else
        //{
        //    this.主管领导审批意见.Visible = false;
        //    this.lbl领导审批情况.Visible = false;
        //    this.img领导签名.Visible = false;
        //}
    }

    //分管领导审批
    $("#btnfgld").click(function () {
        IBusinessService.auditContract.contractID = contract.contractID; 
        IBusinessService.auditContract.node = "分管领导";
        IBusinessService.auditContract.depart = "分管领导";
        IBusinessService.auditContract.opinion = $("#txtfgldshyj").val();
        IBusinessService.auditContract.result = "通过";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#txtyxbshsj").val(serverDate);
                $("#btnfgld").attr("disabled", true);
                $("#btnfgldth").attr("disabled", true);
                alert("您审批已经完成!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    $("#btnfgldth").click(function () {        
        if ($.trim($("#txtfgldshyj").val()) == "同意") {
            alert("退回的合同审批意见不能是:同意,请您写明退回原因!");
            return;
        }
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "分管领导";
        IBusinessService.auditContract.depart = "分管领导";
        IBusinessService.auditContract.opinion = $("#txtfgldshyj").val();
        IBusinessService.auditContract.result = "退回";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#txtyxbshsj").val(serverDate);
                $("#btnfgld").attr("disabled", true);
                $("#btnfgldth").attr("disabled", true);
                alert("您审批的合同已经退回!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    //财务部审批
    $("#btncwb").click(function () {
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "财务部";
        IBusinessService.auditContract.depart = "财务部";
        IBusinessService.auditContract.opinion = $("#txtcwbshyj").val();
        IBusinessService.auditContract.result = "通过";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btncwb").attr("disabled", true);
                $("#btncwbth").attr("disabled", true);
                alert("您的审批已经完成!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    $("#btncwbth").click(function () {
        if ($.trim($("#txtcwbshyj").val()) == "同意") {
            alert("退回的合同审批意见不能是:同意,请您写明退回原因!");
            return;
        }
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "财务部";
        IBusinessService.auditContract.depart = "财务部";
        IBusinessService.auditContract.opinion = $("#txtcwbshyj").val();
        IBusinessService.auditContract.result = "退回";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btncwb").attr("disabled", true);
                $("#btncwbth").attr("disabled", true);
                alert("您审批的合同已经退回!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    //人事行政部审批
    $("#btnrsxzbsp").click(function () {
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "人事行政部";
        IBusinessService.auditContract.depart = "人事行政部";
        IBusinessService.auditContract.opinion = $("#txtrsxzbshyj").val();
        IBusinessService.auditContract.result = "通过";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnrsxzbsp").attr("disabled", true);
                $("#btnrsxzbth").attr("disabled", true);
                alert("您的审批已经完成!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    $("#btnrsxzbth").click(function () {
        if ($.trim($("#txtrsxzbshyj").val()) == "同意") {
            alert("退回的合同审批意见不能是:同意,请您写明退回原因!");
            return;
        }
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "人事行政部";
        IBusinessService.auditContract.depart = "人事行政部";
        IBusinessService.auditContract.opinion = $("#txtrsxzbshyj").val();
        IBusinessService.auditContract.result = "退回";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnrsxzbsp").attr("disabled", true);
                $("#btnrsxzbth").attr("disabled", true);
                alert("您审批的合同已经退回!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    //其它部门审批
    $("#btnqtbmsp").click(function () {
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "其他部门"; 
        IBusinessService.auditContract.depart = $("#txtqtbm").val();
        IBusinessService.auditContract.opinion = $("#txtqtbmshyj").val();
        IBusinessService.auditContract.result = "通过";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnqtbmsp").attr("disabled", true);
                $("#btnqtbmth").attr("disabled", true);
                alert("您的审批已经完成!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    $("#btnqtbmth").click(function () {
        if ($.trim($("#txtqtbmshyj").val()) == "同意") {
            alert("退回的合同审批意见不能是:同意,请您写明退回原因!");
            return;
        }
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "其他部门";
        IBusinessService.auditContract.depart = $("#txtqtbm").val();
        IBusinessService.auditContract.opinion = $("#txtqtbmshyj").val();
        IBusinessService.auditContract.result = "退回";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnqtbmsp").attr("disabled", true);
                $("#btnqtbmth").attr("disabled", true);
                alert("您审批的合同已经退回!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    //主管领导审批
    $("#btnzgldsp").click(function () {
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "主管领导";
        IBusinessService.auditContract.depart = "主管领导";
        IBusinessService.auditContract.opinion = $("#txtzgldshyj").val();
        IBusinessService.auditContract.result = "通过";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnzgldsp").attr("disabled", true);
                $("#btnzgldth").attr("disabled", true);
                $("#btnzgldgb").attr("disabled", true);
                alert("您的审批已经完成!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    $("#btnzgldth").click(function () {
        if ($.trim($("#txtzgldshyj").val()) == "同意") {
            alert("退回的合同审批意见不能是:同意,请您写明退回原因!");
            return;
        }
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "主管领导";
        IBusinessService.auditContract.depart = "主管领导";
        IBusinessService.auditContract.opinion = $("#txtzgldshyj").val();
        IBusinessService.auditContract.result = "退回";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnzgldsp").attr("disabled", true);
                $("#btnzgldth").attr("disabled", true);
                $("#btnzgldgb").attr("disabled", true);
                alert("您审批的合同已经退回!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

    $("#btnzgldgb").click(function () {
        if ($.trim($("#txtzgldshyj").val()) == "同意") {
            alert("退回的合同审批意见不能是:同意,请您写明退回原因!");
            return;
        }
        IBusinessService.auditContract.contractID = contract.contractID;
        IBusinessService.auditContract.node = "主管领导";
        IBusinessService.auditContract.depart = "主管领导";
        IBusinessService.auditContract.opinion = $("#txtzgldshyj").val();
        IBusinessService.auditContract.result = "关闭";
        IBusinessService.auditContract.user = decodeURIComponent($.cookie('userTrueName'));
        rock.AjaxRequest(IBusinessService.auditContract, rock.exceptionFun);
        if (IBusinessService.auditContract.success) {
            (function (e) {
                $("#btnzgldsp").attr("disabled", true);
                $("#btnzgldth").attr("disabled", true);
                $("#btnzgldgb").attr("disabled", true);
                alert("您审批的合同已经关闭!");
            }(IBusinessService.auditContract.resultValue))
        }
    });

})