$(function () {
    var jsTypes = "ISystemService,DataTable,DataColumn,DataRow";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        $("#CertificateGYJW_WC").click(function () {
            window.open("CertificateGYJW_WC.html");
        });
        $("#CertificateGYJW").click(function () {
            window.open("CertificateGYJW.html");
        });
        $("#CertificateSPGYJW").click(function () {
            window.open("CertificateSPGYJW.html");
        });
        $("#CertificateXJGYYRJY").click(function () {
            window.open("CertificateXJGYYRJY.html");
        });
        $("#CertificateZWCT").click(function () {
            window.open("CertificateZWCT.html");
        });
        $("#CertificateMTBE").click(function () {
            window.open("CertificateMTBE.html");
        });
        $("#Certificate2DX").click(function () {
            window.open("Certificate2DX.html");
        });
        $("#CertificateC3C4").click(function () {
            window.open("CertificateC3C4.html");
        });
        $("#Certificate1DX").click(function () {
            window.open("Certificate1DX.html");
        });
        $("#CertificateZJW").click(function () {
            window.open("CertificateZJW.html");
        });
    });
})