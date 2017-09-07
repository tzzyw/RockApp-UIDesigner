$(function () {
    var jsTypes = "UploadFile,ISystemService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var uploadFile = UploadFileClass.createInstance();
        var objectID = decodeURI($.getUrlParam("objectID"));
        var objectType = decodeURI($.getUrlParam("objectType"));
        var classify = decodeURI($.getUrlParam("classify"));
        if (classify == "null") {
            $("#divClassify").css("display", "none");
        }
        else {
            $("#divClassify").css("display", "block");
        }
        $("#uploadify").uploadify({
            'swf': '../../resource/uploadify/uploadify.swf',
            'uploader': '../../UploadFile.ashx',
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
                ISystemService.getNextID.typeName = 'UploadFile';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        uploadFile.uploadFileID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }
                rock.AjaxRequest(ISystemService.getServerDateTime, rock.exceptionFun);
                if (ISystemService.getServerDateTime.success) {
                    (function (e) {
                        var date = new Date(e.value.replace('-', '/'));
                        uploadFile.uploadTime = date.getFullYear() + '-' + (parseInt(date.getMonth(), 10) + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                    }(ISystemService.getServerDateTime.resultValue));
                }

                uploadFile.localFileName = fileObj.name;

                uploadFile.serverFilePath = data.split('&&')[0];
                uploadFile.serverFileName = data.split('&&')[1];

                uploadFile.uploader = decodeURIComponent($.cookie('userTrueName'));
                uploadFile.fileType = '文档';
                uploadFile.fileFormat = fileObj.type;

                uploadFile.objectID = objectID;
                if (classify != "null") {
                    uploadFile.classify = $("#comboClassify").val();
                }
                if (objectType != 'null') {
                    uploadFile.objectType = objectType;
                }
                ISystemService.addDynObject.dynObject = uploadFile;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                    }(ISystemService.addDynObject.resultValue));
                }

                parent.closeUpload();

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