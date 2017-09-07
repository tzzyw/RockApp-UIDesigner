var closeUpload = null;
$(function () {
    var jsTypes = "UploadFile,ISystemService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var order = $.getUrlParam("order");
        $("#uploadify").uploadify({
            'swf': '../../resource/uploadify/uploadify.swf',
            'uploader': '../../UploadQualityFile.ashx',
            'buttonText': '选择文件',
            'width': 60,
            'height': 23,
            'uploadLimit': 9999999999,
            'fileSizeLimit': 0,
            'queueID': 'fileQueue',
            'queueSizeLimit': 9999999999,
            'progressData': 'speed',
            'auto': false,
            'multi': true,
            'successTimeout': 1200,
            'fileTypeDesc': '*.*',
            'fileTypeExts': '*.*',
            'onUploadSuccess': function (fileObj, data, response) {
                if (response == false) {
                    alert("上传失败");
                    return;
                }
                parent.closeUpload(data.split('&&')[1],order);
                return;
            },
            'onUploadError': function (file, errorCode, errorMsg, errorString) {
                alert(errorString);
            },
            'onQueueComplete': function (queueData) {
                alert("文件上传成功！");
                return;
            }
        });
    });
})