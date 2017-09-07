<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ConferICCard.aspx.cs" Inherits="app_view_ConferICCard" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>扬子石化炼化公司远程营销系统</title>
      
   <%-- <script type="text/vbscript">
        Function WriteCard(sector,whichblock,cardaddr,str)
            Dim ctrl1
            Dim Len1
            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
            Call ctrl1.WriteString(2, sector, whichblock, cardaddr, str, Len1)
            //msgbox(sector&","&str&","&Len1)
        End Function

        Function Button1_onclick()
            Dim ctrl1
            Dim Len1
         
            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
         
            Call ctrl1.WriteString(3, 1, 1, 1, "已创建", Len1)
             
        End Function

        Function Button2_onclick()
            Dim ctrl1
            Dim Val1
            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
            call ctrl1.ReadString(3, 1, 1, 1, Val1)
            msgbox(Val1)
        End Function

        Function ReadCard()
            Dim ctrl1
            Dim Val1
            Dim ctrl2
            Dim ctrl3
            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
            Set ctrl2 = document.getElementById("txtiCCardNumber")            
            call ctrl1.ReadString(2, 1,0,0, Val1)
            ctrl2.value=Val1            
        End Function

        Function ReadCardxxx(sector,whichblock,cardaddr)
            Dim ctrl1
            Dim Val1
            Dim ctrl2
            Dim ctrl3
           // Set ctrl1 = document.getElementById("MFRC500Ctrl1")
            Set ctrl2 = document.getElementById("txtiCCardNumber")
            //Set ctrl3 = document.getElementById("txtIC卡芯片编号")
           // call ctrl1.ReadString(2, sector,whichblock,cardaddr, Val1)
            ctrl2.value="Val1"
            //ctrl3.value=Val1    
        End Function

        Function ReadCardAll()
            Dim ctrl2
            Set ctrl2 = document.getElementById("HDICCardData")
            msgbox(ctrl2.value)
            ctrl2.value=""
        End Function

        Function ReadWeightNum(sector,whichblock,cardaddr,str)
            Dim ctrl1
            Dim Val1
            Dim ctrl2
            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
            Set ctrl2 = document.getElementById("HDICCardWeightNum")
            call ctrl1.ReadString(2, sector,whichblock,cardaddr, Val1)
            ctrl2.value=Val1
        End Function

        Function ReadCardType(sector,whichblock,cardaddr)
            Dim ctrl1
            Dim Val1
            Dim ctrl2
            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
            Set ctrl2 = document.getElementById("HDIC卡类别")
            call ctrl1.ReadString(2, sector,whichblock,cardaddr, Val1)
            ctrl2.value=Val1

         
        End Function

    </script>--%>
</head>
<body>
        <form id="form1" runat="server">
    <div>
        <a href="JavaScript:void(0)" onclick="window.open('test.html?123','_blank','width=1,height=1,left=-200,top=-200');">打开子窗口</a>
       <%-- <object id="MFRC500Ctrl1" data="DATA:application/x-oleobject;BASE64,vAK+NmEJrkyosf0rraGIAwAJAADYEwAA2BMAAA=="
                classid="clsid:36BE02BC-0961-4CAE-A8B1-FD2BADA18803"></object>
        <!--<input type="button" name="btn1" id="btn1" value="写" onclick="f1()" />-->
        <input type="button" name="btn2" id="btn2" value="读 卡" onclick="ReadCard()" />--%>
        <input id="txtiCCardNumber" type="text"/>
        <div id="div1" style="width:1000px; height:1000px"></div>
    </div>
    </form>
    <script type="text/javascript">
        (function () {
           // ReadCard();
        })()
</script>
</body>
</html>
