
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,customerID,
    ladebill = null,
    measure = null,
    ladebillID = $.getUrlParam("id");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,LadeBill,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //ladebillID = 10008;
        getData();
    });

    $("#check").click(function () {
        if ($("#txtladeBillNum").val() != "") {
            ISystemService.executeScalar.sqlString = "select [CustomerID] from [LadeBill] where [LadeBillNum] = '" + $("#txtladeBillNum").val() + "'";
            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
            var warehouseName = null;
            if (ISystemService.executeScalar.success) {
                (function (e) {
                    customerID = e.value;
                }(ISystemService.executeScalar.resultValue));
            }
            if ($.cookie('CustomerID') == customerID) {
                ISystemService.executeScalar.sqlString = "select [LadeBillID] from [LadeBill] where [LadeBillNum] = '" + $("#txtladeBillNum").val() + "'";
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                var warehouseName = null;
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        ladebillID = e.value;
                        getData();
                    }(ISystemService.executeScalar.resultValue));
                }
            }
            else {
                alert("您只能查询本公司的提货单信息!");
            }
        }
        else {
            alert("请输入提货单编号!");
        }
    });

    function getData() {
        if (ladebillID != null) {
            ISystemService.getDynObjectByID.dynObjectID = ladebillID;
            ISystemService.getDynObjectByID.structName = "LadeBill";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    ladebill = e;
                    //fillPage(ladebill);
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                alert("获取提货单出错!");
                return;
            }
            ISystemService.getDynObjectByID.dynObjectID = ladebill.measureID;
            ISystemService.getDynObjectByID.structName = "Measure";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    measure = e;
                    //fillPage(ladebill);
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                alert("获取计量单出错!");
                return;
            }

            $("#txtladeBillNum").val(ladebill.ladeBillNum);
            //$("#txtladeDate").val(ladebill.ladeDate.split(' ')[0]);
            ISystemService.getObjectProperty.objName = "Material";
            ISystemService.getObjectProperty.property = "MaterialName";
            ISystemService.getObjectProperty.ojbID = ladebill.materialID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtmaterialName").val(e.value + ladebill.MaterialLevel);
                }(ISystemService.getObjectProperty.resultValue));
            }


            ISystemService.getObjectProperty.objName = "Customer";
            ISystemService.getObjectProperty.property = "CustomerName";
            ISystemService.getObjectProperty.ojbID = ladebill.customerID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtreceiver").val(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }

            $("#txtbillingTime").val(ladebill.billingTime.split(' ')[0]);
            $("#txtshipType").val(ladebill.shipType);
            $("#txtvehicleNum").val(measure.vehicleNum);
            $("#txtkaipiao").val(ladebill.agent);
            $("#txtpicker").val(ladebill.picker);
            $("#txtdestination").val(ladebill.destination);
            $("#txtactualQuantityx").val(ladebill.actualQuantity);
            IBusinessService.numToChn.num = $("#txtactualQuantityx").val();
            rock.AjaxRequest(IBusinessService.numToChn, rock.exceptionFun);
            if (IBusinessService.numToChn.success) {
                (function (e) {
                    $("#txtactualQuantityd").val(e.value);
                }(IBusinessService.numToChn.resultValue))
            }

            $("#txtactualQuantityx").val(ladebill.actualQuantity);
            $("#txtsealNum").val(measure.sealNum);
        }
    }
})