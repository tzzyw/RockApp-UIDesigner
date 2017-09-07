using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Rock.RunCommon
{
    /// <summary>
    /// 反射方法
    /// </summary>
    public class ReflectMethod
    {
        #region 私有变量

        private Object _instance;
        private MethodInfo _method;

        #endregion

        #region 只读属性

        /// <summary>
        /// 动态方法关联的对象
        /// </summary>
        public Object Instance
        {
            get
            {
                return _instance;
            }
        }

        /// <summary>
        /// 动态方法实际对应的方法
        /// </summary>
        public MethodInfo Method
        {
            get
            {
                return _method;
            }
        }


        #endregion

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="instance">动态方法关联的对象</param>
        /// <param name="method">动态方法实际对应的方法</param>
        public ReflectMethod(Object instance, MethodInfo method)
        {
            this._instance = instance;
            this._method = method;
        }
    }
}
