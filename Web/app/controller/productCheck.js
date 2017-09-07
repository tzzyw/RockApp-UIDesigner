$(function () {
    var jsTypes = "ISystemService,DataTable,DataColumn,DataRow";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        $("#ProductCheckGYJW_WC").click(function () {
            window.open("ProductCheckGYJW_WC.html");
        });
        $("#ProductCheckGYJW").click(function () {
            window.open("ProductCheckGYJW.html");
        });
        $("#ProductCheckSPGYJW").click(function () {
            window.open("ProductCheckSPGYJW.html");
        });
        $("#ProductCheckXJGYYRJY").click(function () {
            window.open("ProductCheckXJGYYRJY.html");
        });
        $("#ProductCheckZWCT").click(function () {
            window.open("ProductCheckZWCT.html");
        });
        $("#ProductCheckMTBE").click(function () {
            window.open("ProductCheckMTBE.html");
        });
        $("#ProductCheck2DX").click(function () {
            window.open("ProductCheck2DX.html");
        });
        $("#ProductCheckC3C4").click(function () {
            window.open("ProductCheckC3C4.html");
        });
        $("#ProductCheck1DX").click(function () {
            window.open("ProductCheck1DX.html");
        });
        $("#ProductCheckZJW").click(function () {
            window.open("ProductCheckZJW.html");
        });
    });
})