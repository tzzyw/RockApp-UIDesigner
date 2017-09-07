
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
    statementIDs = $.getUrlParam("ids");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,LadeBill,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        if (statementIDs != null) {
            sqlStr = "select [Statement].[CustomerID],[LadeBill].[LadeDate], [Material].[MaterialName] + [LadeBill].[MaterialLevel], [Statement].[NetWeight], [Statement].[Price], [Statement].[Amount], [LadeBill].[LadeBillNum], [Statement].[Comment] from [LadeBill] join [Statement] on [Statement].[LadeBillID] = [LadeBill].[LadeBillID] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [Statement].[state] ='已审核' and [Statement].[StatementID] in(" + statementIDs + ")";
            tableString = '<table class="bordertable" style="width: 700px"><thead><tr><th style="width: 35px">序号</th><th style="width: 80px">提货日期</th><th style="width: 150px">产品名称</th><th style="width: 60px">数量</th><th style="width: 60px">单价</th><th style="width: 80px">应付金额</th><th style="width: 150px">提货票号</th><th style="width: 60px">备注</th></tr></thead><tbody>';
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var colLength = e.columns.length;
                        var rowLength = rows.length;                        
                        ISystemService.getObjectProperty.objName = "Customer";
                        ISystemService.getObjectProperty.property = "CustomerName";
                        ISystemService.getObjectProperty.ojbID = parseInt(rows[0].values[0].value,10);
                        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                        if (ISystemService.getObjectProperty.success) {
                            (function (e) {
                                $("#txtcustomerName").val(e.value);
                            }(ISystemService.getObjectProperty.resultValue));
                        }
                        for (var i = 0; i < rowLength; i++) {
                            var rowResult = rows[i].values;
                            tableString += '<tr><td>' + (i + 1) + '</td><td>' + rowResult[1].value.split(' ')[0] + '</td><td>' + rowResult[2].value + '</td><td>' + rowResult[3].value + '</td><td>' + rowResult[4].value + '</td><td>' + rowResult[5].value + '</td><td>' + rowResult[6].value + '</td><td>' + rowResult[7].value + '</td></tr>';
                        }
                        tableString += '</tbody></table>'
                        $("#detail").html(tableString);
                    }
                }(ISystemService.execQuery.resultValue));
            }
        }
    });
})