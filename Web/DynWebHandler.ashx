<%@ WebHandler Language="C#" Class="DynWebHandler" %>

using System;
using System.Web;
using System.Text;
using System.Collections.Generic;
using Rock.Dyn.Msg;
using Rock.Dyn.Core;
using Rock.Dyn.Comm;
public class DynWebHandler : IHttpHandler
{

    /// <summary>
    /// 处理请求
    /// </summary>
    /// <param name="context"></param>
    public void ProcessRequest(HttpContext context)
    {
        string reqJson = context.Request["RequestStr"];
        string respJson = DirectCall(reqJson);
        context.Response.ContentType = "text/plain";
        context.Response.Write(respJson);
    }

    /// <summary>
    /// 直通方法调用
    /// </summary>
    /// <param name="reqJson"></param>
    /// <returns></returns>
    private string DirectCall(string reqJson)
    {
        string msgID = "1";
        try
        {
            TSerializer serializerJsonReq = new TJSONSerializer();
            byte[] jsonBytes = Encoding.UTF8.GetBytes(reqJson);
            serializerJsonReq.FromBytes(jsonBytes);

            // 获取消息
            TMessage msg = serializerJsonReq.ReadMessageBegin();
            msg.MsgID = msgID;

            // 构造Method
            string[] temp = msg.Name.Split('_');

            DynMethodInstance dynMethodInstance = DynSerialize.ReadDynMethodInstance(serializerJsonReq, temp[0], temp[1]);

            serializerJsonReq.ReadMessageEnd();
            serializerJsonReq.Flush();

            Dictionary<string, object> paramValues = new Dictionary<string, object>();

            foreach (string paramName in dynMethodInstance.DynMethod.GetParameterNames())
            {
                paramValues[paramName] = dynMethodInstance[paramName];
            }
            string className = InterfaceImplementMap.InterfaceAndImplementMap[temp[0]];
            object ret = DynTypeManager.MethodHandler(null, className + "_" + temp[1], paramValues);

            if (dynMethodInstance.DynMethod.Result.DynType != DynType.Void)
            {
                dynMethodInstance.Result = ret;
            }

            // 准备返回
            if (msg.Type != TMessageType.RpcOneway)
            {
                TSerializer serializerJsonResp = new TJSONSerializer();
                TMessage respMsg = new TMessage(msg.Name, TMessageType.RpcReply, msg.MsgID, msg.LiveLife, msg.Receiver, msg.Sender, msg.ReceiverQueueName, msg.SenderQueueName);
                serializerJsonResp.WriteMessageBegin(respMsg);

                DynSerialize.WriteResult(serializerJsonResp, dynMethodInstance);

                serializerJsonResp.WriteMessageEnd();
                byte[] respData = serializerJsonResp.ToBytes();
                serializerJsonResp.Flush();

                string respJson = Encoding.UTF8.GetString(respData);
                return respJson;
            }
            else
            {
                return "";
            }
        }
        catch (Exception ex)
        {
            string exceptionMsg = "";
            if (ex.InnerException != null)
            {
                exceptionMsg = ex.InnerException.Message;
            }
            else
            {
                exceptionMsg = ex.Message;
            }

            //编写返异常的返回消息                  
            TSerializer serializerJsonResp = new TJSONSerializer();
            TMessage exceptMsg = new TMessage("Exception", TMessageType.Exception, msgID, -1, "local", "local", "local", "local");
            serializerJsonResp.WriteMessageBegin(exceptMsg);
            TApplicationException tAppException = new TApplicationException(TApplicationException.ExceptionType.Unknown, "调用发生了错误:" + exceptionMsg);
            tAppException.Write(serializerJsonResp);
            serializerJsonResp.WriteMessageEnd();
            byte[] jsonBytes = serializerJsonResp.ToBytes();
            serializerJsonResp.Flush();
            string respJson = Encoding.UTF8.GetString(jsonBytes);
            return respJson;
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}