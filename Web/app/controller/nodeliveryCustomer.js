
$(function () {
    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtbegin");
    dateboxArray.push("txtend"); 

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})