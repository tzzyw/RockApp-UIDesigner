using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Services;

/// <summary>
/// GetJLD 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
public class GetJLD : System.Web.Services.WebService {

    public GetJLD () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    [WebMethod]
    public string HelloWorld() {
        return "Hello World";
    }
    
}
