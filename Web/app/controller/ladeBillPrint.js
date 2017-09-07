
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
    ladebill = null,
    measure = null,
    ladebillID = $.getUrlParam("id");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,LadeBill,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

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
            $("#txtladeDate").val(ladebill.ladeDate.split(' ')[0]);
            ISystemService.getObjectProperty.objName = "Material";
            ISystemService.getObjectProperty.property = "MaterialName";
            ISystemService.getObjectProperty.ojbID = ladebill.materialID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtmaterialName").val(e.value + ladebill.MaterialLevel);
                }(ISystemService.getObjectProperty.resultValue));
            }

            switch (ladebill.materialID) {
                case 47:                //工业己烷(食品工业用 挂牌)特殊处理
                    $("#txtmaterialName").val("工业己烷");
                    $("#txtcomment").val("食品工业用");
                    if (ladebill.comment) {
                        $("#txtcomment").val("食品工业用" + ladebill.comment);
                    }
                    break;
                case 51:                //工业己烷(植物油萃取用)特殊处理
                    $("#txtmaterialName").val("工业己烷");
                    $("#txtcomment").val("植物油萃取用"); 
                    if (ladebill.comment) {
                        $("#txtcomment").val("食品工业用" + ladebill.comment);
                    }
                    break;
                case 3:                //橡胶工业用溶剂油(挂牌)特殊处理
                    $("#txtmaterialName").val("橡胶工业用溶剂油(挂牌)");
                    $("#txtcomment").val(ladebill.MaterialLevel);
                    if (ladebill.comment) {
                        $("#txtcomment").val(ladebill.MaterialLevel + ladebill.comment);
                    }
                    break;
                default:
                    $("#txtcomment").val(ladebill.comment);
                    break;
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

            $("#qrCode").attr('src', "../../GenerateQRCode.ashx?Content=https://www.baidu.com/");
        }

    });
})