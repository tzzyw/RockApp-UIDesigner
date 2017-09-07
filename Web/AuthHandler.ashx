<%@ WebHandler Language="C#" Class="AuthHandler" %>

using System;
using System.Web;
using Rock.Dyn.Core;
using Rock.RunCommon;
using Rock.StaticEntities;
public class AuthHandler : IHttpHandler, System.Web.SessionState.IRequiresSessionState
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
            User user = authService.UserLogin(userName, passWord);
            if (user != null)
            {
                HttpContext.Current.Response.Cookies.Clear();
                HttpCookie userIDCookie = new HttpCookie("userID", user.UserID.ToString());
                userIDCookie.Expires = DateTime.Now.AddHours(12);
                HttpContext.Current.Response.Cookies.Add(userIDCookie);

                HttpCookie userNameCookie = new HttpCookie("userName", HttpUtility.UrlEncode(user.UserName));
                userNameCookie.Expires = DateTime.Now.AddHours(12);
                HttpContext.Current.Response.Cookies.Add(userNameCookie);

                HttpCookie userTrueNameCookie = new HttpCookie("userTrueName", HttpUtility.UrlEncode(user.TrueName));
                userTrueNameCookie.Expires = DateTime.Now.AddHours(12);
                HttpContext.Current.Response.Cookies.Add(userTrueNameCookie);
                System.Web.SessionState.HttpSessionState st = context.Session;

                string s = st.SessionID;

                //添加日志
                Log log = new Log();
                log.Comment = "用户登录";
                log.LogType = "用户登录";
                log.OperaterID = user.UserID;
                log.OperaterName = user.TrueName;
                log.OperateTime = DateTime.Now;
                log.ObjType = HttpContext.Current.Request.UserHostAddress;
                authService.AddLog(log);
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