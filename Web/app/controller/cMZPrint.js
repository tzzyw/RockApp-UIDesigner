
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
    ladebill = null,
    measure = null,
    measureID = $.getUrlParam("id");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,LadeBill,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        if (measureID != null) {
            //获取服务器端日期
            rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
            if (ISystemService.getServerDate.success) {
                (function (e) {
                    serverDate = e.value;
                    var temp = serverDate.split('-');
                    $("#txtDate").val(temp[0] + "年" + temp[1] + "月" + temp[2] + "日");
                }(ISystemService.getServerDate.resultValue));
            }

            ISystemService.getDynObjectByID.dynObjectID = measureID;
            ISystemService.getDynObjectByID.structName = "Measure";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    measure = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                alert("获取计量单出错!");
                return;
            }

            ISystemService.getDynObjectByID.dynObjectID = measure.ladeBillID;
            ISystemService.getDynObjectByID.structName = "LadeBill";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    ladebill = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                alert("获取提货单出错!");
                return;
            }
           
            $("#txtmeasureNum").val(measure.measureNum);
            $("#txtladeBillNum").val(ladebill.ladeBillNum);
            $("#txtladeDate").val(ladebill.ladeDate.split(' ')[0]);

            ISystemService.getObjectProperty.objName = "Material";
            ISystemService.getObjectProperty.property = "MaterialName";
            ISystemService.getObjectProperty.ojbID = ladebill.materialID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtmaterialName").val(e.value + ladebill.materialLevel);
                }(ISystemService.getObjectProperty.resultValue));
            }          

            ISystemService.getObjectProperty.objName = "Customer";
            ISystemService.getObjectProperty.property = "CustomerName";
            ISystemService.getObjectProperty.ojbID = ladebill.customerID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtcustomerName").val(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }
            $("#txtnetWeight").val(measure.netWeight);
            $("#txtvehicleNum").val(measure.vehicleNum);
            $("#txtpicker").val(ladebill.picker);
            $("#txtagent").val(decodeURIComponent($.cookie('userTrueName')));
        }
        window.print();
    });
})




