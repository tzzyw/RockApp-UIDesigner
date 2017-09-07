$(function () {
    var customerService = null,
        customerServiceID = $.getUrlParam("ID");
    var jsTypes = "ISystemService,DataTable,DataColumn,DataRow,CustomerService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        ISystemService.getDynObjectByID.dynObjectID = customerServiceID;
        ISystemService.getDynObjectByID.structName = "CustomerService";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customerService = e;

                $("#txtcustomerServiceNum").val(customerService.customerServiceNum);
                $('#disposalInstructions').html(customerService.disposalInstructions);
                if (customerService.disposal == "受理") {
                    $("#chksl").attr("checked", true);
                }
                if (customerService.disposal == "不受理") {
                    $("#chkbsl").attr("checked", true);
                }

                if (customerService.serviceType == "咨询") {
                    $("#chkzx").attr("checked", true);
                }
                if (customerService.serviceType == "投诉") {
                    $("#chkts").attr("checked", true);
                }              
                $("#txttelphone").val(customerService.telphone);
                $("#txtcontacts").val(customerService.contacts);
                $("#txtregisterDate").val(customerService.registerDate.split(' ')[0]);
                $("#feedback").val(customerService.feedback);
                $("#disposalInstructions").val(customerService.disposalInstructions);
            }(ISystemService.getDynObjectByID.resultValue));
        }
    });
})