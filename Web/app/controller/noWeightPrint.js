
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
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
          
            ISystemService.getObjectProperty.objName = "Customer";
            ISystemService.getObjectProperty.property = "CustomerName";
            ISystemService.getObjectProperty.ojbID = measure.customerID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtcustomerName").val(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }

            ISystemService.getObjectProperty.objName = "Material";
            ISystemService.getObjectProperty.property = "MaterialName";
            ISystemService.getObjectProperty.ojbID = measure.materialID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtmaterialName").val(e.value + measure.materialLevel);
                }(ISystemService.getObjectProperty.resultValue));
            }

            $("#txtmeasureNum").val(measure.measureNum);
            $("#txtcomment").val(measure.comment);
            $("#txtnetWeight").val(measure.netWeight);
            $("#txtvehicleNum").val(measure.vehicleNum);
            if (measure.createTime) {
                $("#senddate").text(measure.createTime.split(' ')[0]);
            }

            IBusinessService.numToChn.num = $("#txtnetWeight").val();
            rock.AjaxRequest(IBusinessService.numToChn, rock.exceptionFun);
            if (IBusinessService.numToChn.success) {
                (function (e) {
                    $("#txtnetWeightd").val(e.value);
                }(IBusinessService.numToChn.resultValue))
            }

           
            $("#txtlightOperator").val(measure.lightOperator);
            $("#txtgross").val(measure.gross);
            $("#txtshiper").val(measure.shiper);
            $("#txtheavyOperator").val(measure.heavyOperator);
            $("#txtcomment").val(measure.comment);
            $("#txtagent").val(measure.agent);
           

            var right = $("#txtcomment").offset().left + 400;

            $("#pic").css("margin-top", "-130px").css("margin-left", right + "px");

            $("#qrCode").attr('src', "../../GenerateQRCode.ashx?Content=https://www.baidu.com/");
        }
        //window.print();
    });
})




