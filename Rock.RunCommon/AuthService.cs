using Rock.Orm.Common;
using Rock.Orm.Data;
using Rock.StaticEntities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rock.RunCommon
{
    public class AuthService
    {
        public User UserLogin(string userName, string password)
        {
            return GatewayFactory.Default.Find<User>(User._.UserName == userName & User._.Password == password);
        }

        public CustomerUser CustomerUserLogin(string userName, string password)
        {
            return GatewayFactory.Default.Find<CustomerUser>(CustomerUser._.CustomerUserName == userName & CustomerUser._.Password == password);
        }

        private int GetNextID(string typeName)
        {
            DynEntity dbEntity = GatewayFactory.Default.Find("ObjType", _.P("ObjType", "Name") == typeName.Trim());
            int nextID = (int)dbEntity["NextID"];
            dbEntity["NextID"] = nextID + 1;
            GatewayFactory.Default.Save(dbEntity);
            return nextID;
        }

        //添加日志
        public void AddLog(Log log)
        {
            log.LogID = GetNextID("Log");
            GatewayFactory.Default.Save<Log>(log);
        }
        public DataTable ExecQueryToDataTable(string sqlString)
        {
            DataTable dt = GatewayFactory.Default.Db.ExecuteDataSet(CommandType.Text, sqlString).Tables[0];
            return dt;
        }
        public string ExecuteScalar(string sqlString)
        {
            Check.Require(!string.IsNullOrEmpty(sqlString), "获取Scalar要执行的sql语句不允许为空!");
            object result = GatewayFactory.Default.Db.ExecuteScalar(CommandType.Text, sqlString);
            if (result != null && result != DBNull.Value)
            {
                return result.ToString();
            }
            else
            {
                return "";
            }
        }
        public void ExcuteNoneReturnQuery(string sqlString)
        {
            Check.Require(sqlString != null, "执行的sql语句不允许为空!");
            GatewayFactory.Default.Db.ExecuteNonQuery(CommandType.Text, sqlString);
        }
    }
}
