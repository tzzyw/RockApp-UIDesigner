
$(function () {
    //初始化系统通用变量
    var sqlStr, customerGrid, customerForm,
   customerDataList = new rock.JsonList();
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

       
    });

    //初始化客户选择表格
    customerGrid = new dhtmlXGridObject('customerGrid');
    customerGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerGrid.setSkin("dhx_skyblue");
    customerGrid.setHeader("序号,,客户编码,类别,客户名称");
    customerGrid.setInitWidths("40,0,70,40,*");
    customerGrid.setColAlign("center,left,left,left,left");
    customerGrid.setColTypes("cntr,ro,ro,ro,ro");
    customerGrid.setColSorting("na,na,str,str,str");
    customerGrid.enableDistributedParsing(true, 20);
    customerGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
      
        $("#txtcustomerID").val(rowID);
        $("#txtcustomerSearch").val(customerGrid.cells(rowID, 4).getValue()); 
        hidcustomerForm();
    });
    customerGrid.init();

    customerForm = $("#customerForm");

    var mark = true;
    $('#txtcustomerSearch').mousedown(function (e) {
        if (mark) {
            ISystemService.execQuery.sqlString = "select top 15  [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer]";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, customerGrid, customerDataList);
                }(ISystemService.execQuery.resultValue));
            }
            mark = false;
        }
        showcustomerForm();
    });

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 15 [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer] where CustomerName like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    function showcustomerForm() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerForm.css({ top: top + 22, left: left }).show();
    }
    function hidcustomerForm() {
        customerForm.css({ top: 200, left: -1300 }).hide();
    }

    hidcustomerForm();
    $('#form1').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidcustomerForm();
        }
    });
    

})