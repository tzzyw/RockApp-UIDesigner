$(function () {
    //var fileName = decodeURI($.getUrlParam("fileName"));
    //var filePath = decodeURI($.getUrlParam("filePath"));
    var videoname = "Wildlife.flv"; //视频文件名 
    var floder = "../../Movies"; //存放Flash视频的文件夹,注意是相对flvplayer.swf文件的位置（images/flvplayer.swf） 
    var result = "<object type='application/x-shockwave-flash' width='600px' height='420px' ";
    result += "data='../../FlexPaper/flvplayer.swf?file=" + floder + "/" + videoname + "'>";
    result += "<param name='movie' value='../../FlexPaper/flvplayer.swf?file=" + floder + "/" + videoname + "&autostart=true' />";
    result += "<param name='wmode' value='transparent' />";
    result += "<param name='quality' value='high' />";
    result += "<param name='allowfullscreen' value='true' />";
    result += "</object>";
    $("#flvPlaydiv").html(result);
})