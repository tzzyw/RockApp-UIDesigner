
$(function () {
    //初始化系统通用变量  
    var refer = null;
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Refer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        ISystemService.getDynObjectByID.dynObjectID = 16;
        ISystemService.getDynObjectByID.structName = "Refer";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                refer = e;
                $("#txtplansadjustpoint").val(refer.referName);
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            alert("客户计划调整点在数据库中已经不存在,请联系管理员处理!");
        }

        $("#btn_Save").click(function () {
            if (refer == null) {
                alert("客户计划调整点在数据库中已经不存在,请联系管理员处理!");
            }
            else {
                refer.referName = $("#txtplansadjustpoint").val();
                ISystemService.modifyDynObject.dynObject = refer;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    alert("客户计划调整点修改成功!");
                }
            }                      
        });
    
    });
})