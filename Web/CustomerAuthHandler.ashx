<%@ WebHandler Language="C#" Class="CustomerAuthHandler" %>

using System;
using System.Web;
using Rock.Dyn.Core;
using Rock.RunCommon;
using Rock.StaticEntities;
public class CustomerAuthHandler : IHttpHandler, System.Web.SessionState.IRequiresSessionState
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string userName = context.Request["userName"];
        string passWord = context.Request["passWord"];
        string result = "";
        try
        {
            AuthService authService = new AuthService();
            CustomerUser user = authService.CustomerUserLogin(userName, passWord);
            if (user != null)
            {
                HttpContext.Current.Response.Cookies.Clear();
                HttpCookie userIDCookie = new HttpCookie("CustomerID", user.CustomerID.ToString());
                userIDCookie.Expires = DateTime.Now.AddHours(12);
                HttpContext.Current.Response.Cookies.Add(userIDCookie);

                HttpCookie customerUserIDCookie = new HttpCookie("CustomerUserID", user.CustomerUserID.ToString());
                customerUserIDCookie.Expires = DateTime.Now.AddHours(12);
                HttpContext.Current.Response.Cookies.Add(customerUserIDCookie);

                HttpCookie userTrueNameCookie = new HttpCookie("userTrueName", HttpUtility.UrlEncode(user.CompanyName));
                userTrueNameCookie.Expires = DateTime.Now.AddHours(12);
                HttpContext.Current.Response.Cookies.Add(userTrueNameCookie);
                System.Web.SessionState.HttpSessionState st = context.Session;

                string s = st.SessionID;

                result = "Success";
            }
            else
            {
                result = "Error";
            }
        }
        catch (Exception ex)
        {
            result = "Error:" + ex.Message;
        }
        context.Response.Write(result);
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}