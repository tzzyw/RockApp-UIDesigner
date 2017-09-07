(function (window) {
    var rock = {};
    rock.core = {};

    rock.AuthRequest = function (authObj) {
        var requestObj = {
            // 加载进度条
            loading: function (_msg) {
            },
            // 隐藏进度条
            hideload: function () {
                if (!authObj.loading || !authObj.loading.id) return;
                $('#' + authObj.loading.id).hide();
            },
            // 成功返回处理
            success: function (data, textStatus) {
                authObj.success(data);
            },
            // 失败返回处理
            error: function (xmlhttp, textStatus, errorThrown, errFrom) {
                if (xmlhttp && xmlhttp.status == '200') {
                    // 表示成功
                } else if (xmlhttp && xmlhttp.status == '403') {
                    if (top != self) {
                        window.top.openWindow('请登录', 'login.htm');
                    } else {
                        location.href = "login.html";
                    }
                } else {
                    alert("对不起，网络连接出错，请联系管理员！原因:" + errorThrown + "-" + textStatus);
                }
            },
            // 提交动作
            submit: function () {
                var r = {};
                var param = null;
                if (authObj.model) {
                    if (typeof authObj.model == "function") {
                        param = authObj.model();
                    } else {
                        param = authObj.model;
                    }
                }
                if (authObj.check && !authObj.check(param))
                    return;
                if (authObj.urlType) {
                    r.Type = authObj.urlType;
                    r.Param = param;
                } else {
                    r = param;
                }
                var url = authObj.url;
                var option = {
                    type: 'POST',
                    async: false,
                    url: url,
                    data: param,
                    success: requestObj.success,
                    error: requestObj.error
                };

                $.ajax(option);
            }
        };
        requestObj.loading();
        requestObj.submit();
    };

    rock.AjaxRequest = function (method, exceptionFun) {
        if (parent.rock.userInfo) {
            if ($.cookie('userID') === "" || $.cookie('userID') === null || $.cookie('userID') === undefined) {
                //此处未考虑Cookies过期时间是固定值的因素//
                //alert("登陆已超时请重新登陆!");
                parent.location.href = '/login.html';
                return;
            }
        }
        method.success = false;
        method.resultValue = null;
        var serializerReq = new Thrift.Protocol();

        //本地应用端口随机获取，目标端口确定
        serializerReq.writeMessageBegin(method.fullName, Thrift.MessageType.RPCCALL, "1", 30, "Ajax@Net1", "AjaxClient" + Math.ceil(Math.random() * 100000), "IIS@Net1", "Rpc");
        DynSerialize.writeParameters(serializerReq, method);
        var reqData = fixJqText(serializerReq.writeMessageEnd());
        $.ajax({
            type: "POST",
            url: "/DynWebHandler.ashx",
            data: 'RequestStr=' + reqData,
            async: false,
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (data) {
                var responseText = data;
                var serializerResp = new Thrift.Protocol();
                var respMsg = serializerResp.readMessageBegin(responseText);
                if (respMsg.mtype == Thrift.MessageType.EXCEPTION) {
                    var appException = new Thrift.TApplicationException();
                    appException.read(serializerResp);
                    serializerResp.readMessageEnd();
                    if (exceptionFun != null) {
                        exceptionFun(appException);
                    }
                }
                else {
                    DynSerialize.readResult(serializerResp, method);
                    serializerResp.readMessageEnd();
                    method.success = true;
                }
            }
        });
    };
    //=============rock.
    rock.authorityControl = function () {
        var userDynRoleList = "";
        var userStaRoleList = "";
        IAuthService.getUserDynRoleList.userID = userInfo.userID; //获得用户ID
        rock.AjaxRequest(IAuthService.getUserDynRoleList, rock.exceptionFun);
        if (IAuthService.getUserDynRoleList.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    userDynRoleList += rowResult[0].value;
                    if (i < (rows.length - 1)) {
                        userDynRoleList += ",";
                    }
                }
            }(IAuthService.getUserDynRoleList.resultValue));
        }

        var staRoleArray = userStaRoleList.split(',');
        var dynRoleArray = userDynRoleList.split(',');
        var staticActionName = ""
        var dynActionName = ""
        for (var i = 0; i < staRoleArray.length; i++) {
            if (!rock.chknum(staRoleArray[i])) {
                continue;
            }
            IAuthService.getActionNameList.roleID = staRoleArray[i];
            rock.AjaxRequest(IAuthService.getActionNameList, rock.exceptionFun);
            if (IAuthService.getActionNameList.success) {
                (function (e) {
                    staticActionName += e.value + ",";
                }(IAuthService.getUserDynRoleList.resultValue));
            }
        }

        for (var i = 0; i < dynRoleArray.length; i++) {
            if (!rock.chknum(dynRoleArray[i])) {
                continue;
            }
            IAuthService.getActionNameList.roleID = dynRoleArray[i];
            rock.AjaxRequest(IAuthService.getActionNameList, rock.exceptionFun);
            if (IAuthService.getActionNameList.success) {
                (function (e) {
                    dynActionName += e.value + ",";
                }(IAuthService.getUserDynRoleList.resultValue));
            }
        }

        userActionNameList = ""; //获取用户所在角色所有可操作名集合
        var staActionArray = staticActionName.split(",");
        var dynActionArray = dynActionName.split(",");
        for (var i = 0; i < staActionArray.length; i++) {
            for (var j = 0; j < dynActionArray.length; j++) {
                if (staActionArray[i] == dynActionArray[j]) {
                    userActionNameList = userActionNameList + "," + dynActionArray[j];
                    break;
                }
            }
        }
        if (userActionNameList.length > 0) {
            return userActionNameList;
        }
    };

   

    (function (e) {        
        if (document.title != '扬子石化炼化公司远程营销系统' && document.title != '扬子石化炼化公司客户服务系统') {
            if ($.cookie('userID')) {
                
            }
            else {
                window.location.href = "\\login.html";
            }          
        }       
     }("aaa"));

    //===================

    rock.GetObject = function (objectID, structName) {
        if (objectID == null) {
            return null;
        }
        ISystemService.getDynObjectByID.dynObjectID = objectID;
        ISystemService.getDynObjectByID.structName = structName;
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            return ISystemService.getDynObjectByID.resultValue;
        }
        else {
            return null;
        }
    };

    //异常处理函数
    rock.exceptionFun = function (err) {

        alert(err.message.replace("调用发生了错误:", ""));
        //alert("错误名:  " + err.name + "  \r\n代码号:  " + err.code + "  \r\n错误内容:  " + err.message);
    }

    rock.getCurrentDate = function () {
        var date = new Date();
        return date.getFullYear() + '-' + (parseInt(date.getMonth(), 10) + 1) + '-' + date.getDate();
    }
    rock.getCurrentDateTime = function () {
        var date = new Date();
        return date.getFullYear() + '-' + (parseInt(date.getMonth(), 10) + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }


    rock.formatCurrency = function(num) {
        num = num.toString().replace(/\$|\,/g, '');
        if (isNaN(num))
            num = "0";
        sign = (num == (num = Math.abs(num)));
        num = Math.floor(num * 100 + 0.50000000001);
        cents = num % 100;
        num = Math.floor(num / 100).toString();
        if (cents < 10)
            cents = "0" + cents;
        for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3) ; i++)
            num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
        return (((sign) ? '' : '-') + num + '.' + cents);
    }

    //动态对象转换成表格绑定列表
    rock.dynobjtogridlist = function (gridlist, ObjList, propertyNames) {
        gridlist.rows = [];
        for (var i = 0; i < ObjList.length; i++) {
            var Obj = ObjList[i];
            var listdata = new rock.JsonData(Obj[propertyNames[0]]);
            for (var j = 0; j < propertyNames.length + 1; j++) {
                if (j == propertyNames.length) {
                    listdata.data[j] = 0;
                    break;
                }
                var value = Obj[propertyNames[j]];
                if (value != null) {
                    listdata.data[j] = value;
                }
                else {
                    listdata.data[j] = null;
                }
            }

            gridlist.rows.push(listdata);
        }

        return gridlist;
    }

    //动态Table填充数据表格
    rock.tableToListGrid = function (table, listGrid, dictDataList) {
        if (table != null) {
            listGrid.clearAll();
            dictDataList.rows = [];
            var rows = table.rows;
            var colLength = table.columns.length;
            var rowLength = rows.length;
            for (var i = 0; i < rowLength; i++) {
                var rowResult = rows[i].values;
                var listdata = new rock.JsonData(rowResult[0].value);
                listdata.data[0] = 0;
                for (var j = 0; j < colLength; j++) {
                    listdata.data[j + 1] = rowResult[j].value;
                }
                dictDataList.rows.push(listdata);
            }
            listGrid.parse(dictDataList, "json");
        }
    }

    //动态Table填充单据表格
    rock.tableToBillGrid = function (table, listGrid, dictDataList, stateIndex, editImg, disEditImg) {
        if (table != null) {
            listGrid.clearAll();
            dictDataList.rows = [];
            var rows = table.rows;
            var colLength = table.columns.length;
            var rowLength = rows.length;
            for (var i = 0; i < rowLength; i++) {
                var rowResult = rows[i].values;
                var listdata = new rock.JsonData(rowResult[0].value);
                listdata.data[0] = 0;
                listdata.data[1] = rowResult[0].value;
                //状态列的索引
                if (stateIndex > 0) {
                    if (rowResult[stateIndex + 1].value == "已创建" || rowResult[stateIndex + 1].value == "已提交" || rowResult[stateIndex + 1].value == "已分配") {
                        listdata.data[2] = editImg;
                    }
                    else {
                        listdata.data[2] = disEditImg;
                    }
                }
                else {
                    listdata.data[2] = editImg;
                }
                for (var j = 1; j < colLength; j++) {
                    listdata.data[j + 2] = rowResult[j].value;
                }
                dictDataList.rows.push(listdata);
            }
            listGrid.parse(dictDataList, "json");
        }
    }
    //填充重置点击检修流程表
    rock.tableToBillGridReset = function (table, listGrid, dictDataList, stateIndex, editImg, disEditImg) {
        if (table != null) {
            listGrid.clearAll();
            dictDataList.rows = [];
            var rows = table.rows;
            var colLength = table.columns.length;
            var rowLength = rows.length;
            for (var i = 0; i < rowLength; i++) {
                var rowResult = rows[i].values;
                var listdata = new rock.JsonData(rowResult[0].value);
                listdata.data[0] = 0;
                listdata.data[1] = rowResult[0].value;
                //状态列的索引
                if (stateIndex > 0) {
                    if (rowResult[stateIndex + 1].value != "已结算") {
                        listdata.data[2] = editImg;
                    }
                    else {
                        listdata.data[2] = disEditImg;
                    }
                }
                else {
                    listdata.data[2] = editImg;
                }
                for (var j = 1; j < colLength; j++) {
                    listdata.data[j + 2] = rowResult[j].value;
                }
                dictDataList.rows.push(listdata);
            }
            listGrid.parse(dictDataList, "json");
        }
    }
    //动态Table填充单据查看表格
    rock.tableToBillViewGrid = function (table, listGrid, dictDataList, viewImg) {
        if (table != null) {
            listGrid.clearAll();
            dictDataList.rows = [];
            var rows = table.rows;
            var colLength = table.columns.length;
            var rowLength = rows.length;
            for (var i = 0; i < rowLength; i++) {
                var rowResult = rows[i].values;
                var listdata = new rock.JsonData(rowResult[0].value);
                listdata.data[0] = 0;
                listdata.data[1] = rowResult[0].value;
                listdata.data[2] = viewImg;
                for (var j = 1; j < colLength; j++) {
                    listdata.data[j + 2] = rowResult[j].value;
                }
                dictDataList.rows.push(listdata);
            }
            listGrid.parse(dictDataList, "json");
        }
    }


    rock.core.DynType = {
        Void: 1,
        Bool: 2,
        Byte: 3,
        Double: 4,
        I16: 6,
        I32: 8,
        I64: 10,
        String: 11,
        Struct: 12,
        DateTime: 18,
        Binary: 19,
        Decimal: 20
    };

    rock.core.CollectionType = {
        None: 0,
        List: 15,
        Set: 14,
        Map: 13
    };

    rock.core.Property = function (id, name, collectionType, propertyType, structName) {
        this.id = id;
        this.name = name;
        this.dynType = propertyType;
        this.isArray = false;
        this.isInherited = false;
        this.dynClass = null;
        this.currentDynClass = null;
        this.inheritEntityName = null;
        this.isQueryProperty = false;
        this.collectionType = collectionType;
        this.structName = structName;
    };

    //rock.InitCommonObject = function (currentWindow, fromWindow) {
    //    reg = new RegExp("(^| )userID=([^;]*)(;|$)");
    //    arr = document.cookie.match(reg)
    //    if (arr == null) {
    //        //if (fromWindow.rock.userInfo.userID === "" || fromWindow.rock.userInfo.userName === null || fromWindow.decodeURIComponent($.cookie('userTrueName')) === undefined) {
    //        //此处未考虑Cookies过期时间是固定值的因素//
    //        alert("登陆已超时请重新登陆!");
    //        window.location.href = '/login.html';
    //    }
    //    setCookie("userID", fromWindow.rock.userInfo.userID);
    //    setCookie("userName", fromWindow.rock.userInfo.userName);
    //    //setCookie("userTrueName", fromWindow.decodeURIComponent($.cookie('userTrueName')));
    //    currentWindow.ISystemService = fromWindow.ISystemService;
    //    currentWindow.DataTableClass = fromWindow.DataTableClass;
    //    currentWindow.DataRowClass = fromWindow.DataRowClass;
    //    currentWindow.DataColumnClass = fromWindow.DataColumnClass;
    //}
    //JS操作cookies方法!
    //写cookies
    //function setCookie(name, value) {
    //    var exp = new Date();
    //    exp.setTime(exp.getTime() + 1 * 30 * 60 * 1000);
    //    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    //}

    rock.Dictionary = function () {
        var _objs = {};
        this.count = 0;

        this.add = function (key, value) {
            if (typeof (_objs[key]) != "undefined") {
                throw new Error("关键字[" + key + "]已存在！");
            }
            _objs[key] = value
            this.count += 1;
        };

        this.remove = function (key) {
            if (typeof (_objs[key]) == "undefined") {
                throw new Error("关键字[" + key + "]不存在！");
            }
            delete _objs[key];
            this.count -= 1;
        };

        this.removeAll = function () {
            _objs = {};
            this.count = 0;
        };

        this.exists = function (key) {
            if (typeof (_objs[key]) == "undefined") {
                return false;
            }
            return true;
        };

        this.setItem = function (key, value) {
            if (typeof (_objs[key]) == "undefined") {
                throw new Error("关键字[" + key + "]不存在！");
            }
            _objs[key] = value;
        };

        this.item = function (key) {
            if (typeof (_objs[key]) == "undefined") {
                throw new Error("关键字[" + key + "]不存在！");
            }
            return _objs[key];
        };

        this.keys = function () {
            var keys = new Array();
            for (var p in _objs) {
                if (_objs.hasOwnProperty(p)) {
                    keys[keys.length] = p;
                }
            }
            return keys;
        };

        this.values = function () {
            var values = new Array();
            for (var p in _objs) {
                if (_objs.hasOwnProperty(p)) {
                    values[values.length] = _objs[p];
                }
            }
            return values;
        };
    }

    rock.RockList = function () {
        var _objs = new Array();
        this.length = 0;

        this.items = function () {
            return _objs;
        };

        this.add = function (value) {

            _objs.push(value);
            this[this.length] = value;
            this.length += 1;
        };

        this.remove = function (value) {
            var nobj = new Array();
            var isDelete = false;
            for (var i = 0; i < this.length; i++) {
                if (_objs.hasOwnProperty(i)) {
                    if (_objs[i] != value) {
                        nobj.push(_objs[i]);
                        if (isDelete) {
                            this[i - 1] = this[i];
                        }
                    }
                    else {
                        isDelete = true;
                    }
                }
            }
            delete this[this.length - 1];
            _objs = nobj;
            this.length -= 1;
        };

        this.removeAll = function () {
            for (var i = 0; i < _objs.length; i++) {
                delete this[i];
            }
            _objs = new Array();
            this.length = 0;
        };

        this.exists = function (value) {
            for (var i in _objs) {
                if (_objs.hasOwnProperty(i)) {
                    if (_objs[i] == value) {
                        return true;
                    }
                }
            }
            return false;
        };

        this.item = function (index) {
            return _objs[index];
        };

        this.setItem = function (index, value) {
            if (typeof (_objs[index]) == "undefined") {
                throw new Error("索引[" + key + "]不存在！");
            }
            _objs[index] = value;
            this[index] = value;
        };

        //非常规方法
        this.insertItem = function (index, value) {
            _objs[index] = value;
            this[index] = value;
        };

        this.addRange = function (array) {
            for (var i in array) {
                this.add(array[i]);
            }
        };
    }

    rock.RockMap = function () {
        var struct = function (key, value) {
            this.key = key;
            this.value = value;
        }

        var put = function (key, value) {
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].key === key) {
                    this.arr[i].value = value;
                    return;
                }
            }
            this.arr[this.arr.length] = new struct(key, value);
        }

        var get = function (key) {
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].key === key) {
                    return this.arr[i].value;
                }
            }
            return null;
        }

        var remove = function (key) {
            var v;
            for (var i = 0; i < this.arr.length; i++) {
                v = this.arr.pop();
                if (v.key === key) {
                    continue;
                }
                this.arr.unshift(v);
            }
        }

        var size = function () {
            return this.arr.length;
        }

        var isEmpty = function () {
            return this.arr.length <= 0;
        }
        this.arr = new Array();
        this.get = get;
        this.put = put;
        this.remove = remove;
        this.size = size;
        this.isEmpty = isEmpty;
    }

    rock.JsonList = function () {
        this.rows = [];
    }

    rock.JsonData = function (rowid) {
        this.id = rowid;
        this.data = [];
        this.userData = null;
    }

    rock.DateTimeCompare = function (dateTimeBegin, dateTimeEnd) {
        var dateBegin = new Date(dateTimeBegin.replace('-', '/'));
        var dateEnd = new Date(dateTimeEnd.replace('-', '/'));
        if (dateBegin > dateEnd) {
            return false;
        }
        else {
            return true;
        }
    }

    rock.chknum = function (num) {
        if (num == undefined) {
            return false;
        }
        if (num === "") {
            return false;
        }
        numstring = "0123456789.-"
        for (iii = 0; iii < num.length; iii++) {
            if (numstring.indexOf(num.charAt(iii)) == -1) {
                return false;
            }
        }
        return true;
    }
    rock.chkDateTime = function (num) {
        var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        var r = num.match(reg);
        if (r == null) {
            return false;
        }
        else {
            return true;
        }
    }
    //函数名：chkdate
    //功能介绍：检查是否为日期
    //参数说明：datestr 要检查的字符串
    //参数说明：separator 要检查的日期分割符
    //返回值：false：不是日期  true：是日期
    rock.chkdate = function (datestr, separator) {
        if (datestr == undefined) {
            return false;
        }
        var lthdatestr
        if (datestr != "")
            lthdatestr = datestr.length;
        else
            lthdatestr = 0;

        var tmpy = "";
        var tmpm = "";
        var tmpd = "";
        //var datestr;
        var status;
        status = 0;
        if (lthdatestr == 0)
            return false;

        separator = !separator ? "-" : separator;
        for (kk = 0; kk < lthdatestr; kk++) {
            if (datestr.charAt(kk) == separator) {
                status++;
            }
            if (status > 2) {
                //alert("Invalid format of date!");
                return false;
            }
            if ((status == 0) && (datestr.charAt(kk) != separator)) {
                tmpy = tmpy + datestr.charAt(kk)
            }
            if ((status == 1) && (datestr.charAt(kk) != separator)) {
                tmpm = tmpm + datestr.charAt(kk)
            }
            if ((status == 2) && (datestr.charAt(kk) != separator)) {
                tmpd = tmpd + datestr.charAt(kk)
            }

        }
        year = new String(tmpy);
        month = new String(tmpm);
        day = new String(tmpd)
        //tempdate= new String (year+month+day);
        //alert(tempdate);
        if ((tmpy.length != 4) || (tmpm.length > 2) || (tmpd.length > 2)) {
            //alert("Invalid format of date!");
            return false;
        }
        if (!((1 <= month) && (12 >= month) && (31 >= day) && (1 <= day))) {
            //alert ("Invalid month or day!");
            return false;
        }
        if (!((year % 4) == 0) && (month == 2) && (day == 29)) {
            //alert ("This is not a leap year!");
            return false;
        }
        if ((month <= 7) && ((month % 2) == 0) && (day >= 31)) {
            //alert ("This month is a small month!");
            return false;
        }
        if ((month >= 8) && ((month % 2) == 1) && (day >= 31)) {
            //alert ("This month is a small month!");
            return false;
        }
        if ((month == 2) && (day == 30)) {
            //alert("The Febryary never has this day!");
            return false;
        }
        return true;
    }

    //函数名：chkChar
    //功能介绍：检查输入字符串是否为字母、数字和中文组合
    rock.chkChar = function (char) {
        var regu = "^[0-9a-zA-Z\u4e00-\u9fa5()（）]+$";
        var re = new RegExp(regu);
        if (re.test(char)) {
            return true;
        }
        return false;
    }
    //函数名：chkString
    //功能介绍：检查输入字符串是否为字母、数字
    rock.chkString = function (char) {
        var regu = "^[0-9a-zA-Z-_]+$";
        var re = new RegExp(regu);
        if (re.test(char)) {
            return true;
        }
        return false;
    }
    //函数名：chkEMail
    //功能介绍：检查输入字符串是否为合法的电子邮件地址
    rock.chkEMail = function (eMail) {
        if (eMail == null || eMail.length < 2) {
            return false;
        }
        // 需出现'@',且不在首字符.
        var aPos = eMail.indexOf("@", 1);
        if (aPos < 0) {
            return false;
        }
        // '@'后出现'.',且不紧跟其后.
        if (eMail.indexOf(".", aPos + 2) < 0) {
            return false;
        }
        return true;
    }
    //函数名：chkTelephone
    //功能介绍：检查输入字符串是否为合法的电话号码
    rock.chkTelephone = function (telephone) {
        var regu = "^\\(?\\d{3,4}[-\\)]?\\d{7,8}$";
        var re = new RegExp(regu);
        if (re.test(telephone)) {
            return true;
        }
        return false;
    }
    //函数名：chkTelephone
    //功能介绍：检查输入字符串是否为合法的电话号码
    rock.chkMobilePhone = function (mobilePhone) {
        var regu = "^0?\\d{11}$";
        var re = new RegExp(regu);
        if (re.test(mobilePhone)) {
            return true;
        }
        return false;
    }

    //设置下拉列表的选择项
    rock.setSelectItem = function (selectID, value, valueType) {
        var count = $("#" + selectID + " option").length;
        if (valueType == "text") {
            for (var j = 0; j < count; j++) {
                if ($("#" + selectID + "").get(0).options[j].text == value) {
                    $("#" + selectID + "").get(0).selectedIndex = j;
                    break;
                }
            }
        }
        else {
            for (var j = 0; j < count; j++) {
                if ($("#" + selectID + "").get(0).options[j].value == value) {
                    $("#" + selectID + "").get(0).selectedIndex = j;
                    break;
                }
            }
        }
    }

    //初始化日历控件的汉化
    dhtmlXCalendarObject.prototype.langData["cn"] = {
        dateformat: '%Y-%m-%d',
        monthesFNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthesSNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        daysFNames: ["日", "一", "二", "三", "四", "五", "六"],
        daysSNames: ["日", "一", "二", "三", "四", "五", "六"],
        weekstart: 1
    }



    var ParameterDirection = {
        Input: 1,
        Output: 2,
        InputOutput: 3,
        ReturnValue: 6
    };

    var Parameter = function (id, name, collectionType, parameterType, structName) {
        this.id = id;
        this.name = name;
        this.dynType = parameterType;
        this.direction = ParameterDirection.Input;
        this.isNullable = true;
        this.defaultValue = null;
        this.collectionType = collectionType;
        this.structName = structName;
    };
    rock.core.Method = function (name, paramaterInfos, resultType, resultcollectionType, resultstructName, serviceName) {
        this.name = name;
        this.fullName = serviceName + "_" + name;
        this.resultValue = null;
        var resultPara = new Parameter(0, "result", resultcollectionType, resultType, resultstructName);
        var parameters = {};

        this.addParameter = function (parameter) {
            var parameterNameForAdd = parameter.name.substr(0, 1).toLowerCase() + parameter.name.substr(1);
            parameters[parameterNameForAdd] = parameter;
        }

        this.removeParameter = function (parameterName) {
            if (typeof (parameters[key]) == "undefined") {
                throw new Error("关键字[" + key + "]不存在！");
            }
            delete parameters[key];
        }

        this.getParameter = function (parameterName) {
            return parameters[parameterName];
        }

        this.getParameters = function () {
            return parameters;
        }

        this.getResultPara = function () {
            return resultPara;
        }

        for (var j = 0; j < paramaterInfos.length; j++) {
            var paramater = new Parameter(paramaterInfos[j][0], paramaterInfos[j][1], paramaterInfos[j][2], paramaterInfos[j][3], paramaterInfos[j][4]);
            if (paramaterInfos[j][1]) {
                var parameterNameForNew = paramaterInfos[j][1].substr(0, 1).toLowerCase() + paramaterInfos[j][1].substr(1);
                this[parameterNameForNew] = null;
                this.addParameter(paramater);
            }
        }
    };



    var Thrift = {
        Version: '0.8.0',
        Type: {
            'Stop': 0,
            'Void': 1,
            'Bool': 2,
            'Byte': 3,
            'I08': 3,
            'Double': 4,
            'I16': 6,
            'I32': 8,
            'I64': 10,
            'String': 11,
            'Utf7': 11,
            'Struct': 12,
            'Map': 13,
            'Set': 14,
            'List': 15,
            'Utf8': 16,
            'Utf16': 17,
            'DateTime': 18,
            'Binary': 19,
            'Decimal': 20
        },

        MessageType: {
            'RPCCALL': 1,
            'REPLY': 2,
            'EXCEPTION': 3
        },

        objectLength: function (obj) {
            var length = 0;
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    length++;
                }
            }

            return length;
        },

        inherits: function (constructor, superConstructor) {
            function F() { }
            F.prototype = superConstructor.prototype;
            constructor.prototype = new F();
        }
    };

    Thrift.TException = function (message) {
        this.message = message;
    };
    Thrift.inherits(Thrift.TException, Error);
    Thrift.TException.prototype.name = 'TException';

    Thrift.TApplicationExceptionType = {
        'UNKNOWN': 0,
        'UNKNOWN_METHOD': 1,
        'INVALID_MESSAGE_TYPE': 2,
        'WRONG_METHOD_NAME': 3,
        'BAD_SEQUENCE_ID': 4,
        'MISSING_RESULT': 5,
        'INTERNAL_ERROR': 6,
        'PROTOCOL_ERROR': 7
    };

    Thrift.TApplicationException = function (message, code) {
        this.message = message;
        this.code = (code === null) ? 0 : code;
    };
    Thrift.inherits(Thrift.TApplicationException, Thrift.TException);
    Thrift.TApplicationException.prototype.name = 'TApplicationException';

    Thrift.TApplicationException.prototype.read = function (input) {
        while (1) {
            input.rstack[input.rstack.length - 1] = input.rstack[input.rstack.length - 1][1];
            var ret = input.readFieldBegin();

            if (ret.ftype == Thrift.Type.Stop) {
                break;
            }

            var fid = ret.fid;

            switch (fid) {
                case 1:
                    if (ret.ftype == Thrift.Type.String) {
                        ret = input.readString();
                        this.message = ret.value;
                    } else {
                        ret = input.skip(ret.ftype);
                    }
                    break;
                case 2:
                    if (ret.ftype == Thrift.Type.I32) {
                        ret = input.readI32();
                        this.code = ret.value;
                    } else {
                        ret = input.skip(ret.ftype);
                    }
                    break;
                default:
                    ret = input.skip(ret.ftype);
                    break;
            }

            input.readFieldEnd();
        }

        input.readStructEnd();
    };

    Thrift.TApplicationException.prototype.write = function (output) {
        var xfer = 0;

        output.writeStructBegin('TApplicationException');

        if (this.message) {
            output.writeFieldBegin('message', Thrift.Type.String, 1);
            output.writeString(this.getMessage());
            output.writeFieldEnd();
        }

        if (this.code) {
            output.writeFieldBegin('type', Thrift.Type.I32, 2);
            output.writeI32(this.code);
            output.writeFieldEnd();
        }

        output.writeFieldStop();
        output.writeStructEnd();
    };

    Thrift.TApplicationException.prototype.getCode = function () {
        return this.code;
    };

    Thrift.TApplicationException.prototype.getMessage = function () {
        return this.message;
    };

    /**
    *If you do not specify a url then you must handle ajax on your own.
    *This is how to use js bindings in a async fashion.
    */
    Thrift.Transport = function (url) {
        this.url = url;
        this.wpos = 0;
        this.rpos = 0;

        this.send_buf = '';
        this.recv_buf = '';
    };

    Thrift.Transport.prototype = {

        //Gets the browser specific XmlHttpRequest Object
        getXmlHttpRequestObject: function () {
            try { return new XMLHttpRequest(); } catch (e1) { }
            try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e2) { }
            try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e3) { }

            throw "Your browser doesn't support the XmlHttpRequest object.";
        },

        flush_data: function () {

            return this.send_buf;
        },

        flush: function (async) {

            //async mode
            if (async || this.url === undefined || this.url === '') {
                return this.send_buf;
            }

            var xreq = this.getXmlHttpRequestObject();

            if (xreq.overrideMimeType) {
                xreq.overrideMimeType('application/json');
            }

            xreq.open('POST', this.url, false);
            xreq.send(this.send_buf);

            if (xreq.readyState != 4) {
                throw 'encountered an unknown ajax ready state: ' + xreq.readyState;
            }

            if (xreq.status != 200) {
                throw 'encountered a unknown request status: ' + xreq.status;
            }

            this.recv_buf = xreq.responseText;
            this.recv_buf_sz = this.recv_buf.length;
            this.wpos = this.recv_buf.length;
            this.rpos = 0;
        },

        jqRequest: function (client, postData, args, recv_method) {
            if (typeof jQuery === 'undefined' ||
            typeof jQuery.Deferred === 'undefined') {
                throw 'Thrift.js requires jQuery 1.5+ to use asynchronous requests';
            }

            // Deferreds
            var deferred = jQuery.Deferred();
            var completeDfd = jQuery._Deferred();
            var dfd = deferred.promise();
            dfd.success = dfd.done;
            dfd.error = dfd.fail;
            dfd.complete = completeDfd.done;

            var jqXHR = jQuery.ajax({
                url: this.url,
                data: postData,
                type: 'POST',
                cache: false,
                dataType: 'text',
                context: this,
                success: this.jqResponse,
                error: function (xhr, status, e) {
                    deferred.rejectWith(client, jQuery.merge([e], xhr.tArgs));
                },
                complete: function (xhr, status) {
                    completeDfd.resolveWith(client, [xhr, status]);
                }
            });

            deferred.done(jQuery.makeArray(args).pop()); //pop callback from args
            jqXHR.tArgs = args;
            jqXHR.tClient = client;
            jqXHR.tRecvFn = recv_method;
            jqXHR.tDfd = deferred;
            return dfd;
        },

        jqResponse: function (responseData, textStatus, jqXHR) {
            this.setRecvBuffer(responseData);
            try {
                var value = jqXHR.tRecvFn.call(jqXHR.tClient);
                jqXHR.tDfd.resolveWith(jqXHR, jQuery.merge([value], jqXHR.tArgs));
            } catch (ex) {
                jqXHR.tDfd.rejectWith(jqXHR, jQuery.merge([ex], jqXHR.tArgs));
            }
        },

        setRecvBuffer: function (buf) {
            this.recv_buf = buf;
            this.recv_buf_sz = this.recv_buf.length;
            this.wpos = this.recv_buf.length;
            this.rpos = 0;
        },

        isOpen: function () {
            return true;
        },

        open: function () { },

        close: function () { },

        read: function (len) {
            var avail = this.wpos - this.rpos;

            if (avail === 0) {
                return '';
            }

            var give = len;

            if (avail < len) {
                give = avail;
            }

            var ret = this.read_buf.substr(this.rpos, give);
            this.rpos += give;

            //clear buf when complete?
            return ret;
        },

        readAll: function () {
            return this.recv_buf;
        },

        write: function (buf) {
            this.send_buf = buf;
        },

        getSendBuffer: function () {
            return this.send_buf;
        }

    };

    //Thrift.Protocol = function (transport) {
    //    this.transport = transport;
    //};

    Thrift.Protocol = function () {
        this.transport = new Thrift.Transport("/service")
    };

    var getType = function (object) {
        var _t;
        return ((_t = typeof (object)) == "object" ? object == null && "null" || Object.prototype.toString.call(object).slice(8, -1) : _t).toLowerCase();
    };

    Thrift.Protocol.Type = {};
    Thrift.Protocol.Type[Thrift.Type.Bool] = '"tf"';
    Thrift.Protocol.Type[Thrift.Type.Byte] = '"i8"';
    Thrift.Protocol.Type[Thrift.Type.I16] = '"i16"';
    Thrift.Protocol.Type[Thrift.Type.I32] = '"i32"';
    Thrift.Protocol.Type[Thrift.Type.I64] = '"i64"';
    Thrift.Protocol.Type[Thrift.Type.Double] = '"dbl"';
    Thrift.Protocol.Type[Thrift.Type.Struct] = '"rec"';
    Thrift.Protocol.Type[Thrift.Type.String] = '"str"';
    Thrift.Protocol.Type[Thrift.Type.Map] = '"map"';
    Thrift.Protocol.Type[Thrift.Type.List] = '"lst"';
    Thrift.Protocol.Type[Thrift.Type.Set] = '"set"';
    Thrift.Protocol.Type[Thrift.Type.DateTime] = '"dat"';
    Thrift.Protocol.Type[Thrift.Type.Binary] = '"bin"';
    Thrift.Protocol.Type[Thrift.Type.Decimal] = '"dec"';

    Thrift.Protocol.RType = {};
    Thrift.Protocol.RType.tf = Thrift.Type.Bool;
    Thrift.Protocol.RType.i8 = Thrift.Type.Byte;
    Thrift.Protocol.RType.i16 = Thrift.Type.I16;
    Thrift.Protocol.RType.i32 = Thrift.Type.I32;
    Thrift.Protocol.RType.i64 = Thrift.Type.I64;
    Thrift.Protocol.RType.dbl = Thrift.Type.Double;
    Thrift.Protocol.RType.rec = Thrift.Type.Struct;
    Thrift.Protocol.RType.str = Thrift.Type.String;
    Thrift.Protocol.RType.map = Thrift.Type.Map;
    Thrift.Protocol.RType.lst = Thrift.Type.List;
    Thrift.Protocol.RType.set = Thrift.Type.Set;
    Thrift.Protocol.RType.dat = Thrift.Type.DateTime;
    Thrift.Protocol.RType.bin = Thrift.Type.Binary;
    Thrift.Protocol.RType.dec = Thrift.Type.Decimal;

    Thrift.Protocol.Version = 1;

    Thrift.Protocol.prototype = {

        getTransport: function () {
            return this.transport;
        },

        //Write functions
        writeMessageBegin: function (name, messageType, seqid, liveLife, sender, receiver, senderQueueName, receiverQueueName) {
            this.tstack = [];
            this.tpos = [];
            this.tname = [];

            this.tstack.push([Thrift.Protocol.Version, '"' + name + '"', messageType, '"' + seqid + '"', liveLife,
        '"' + sender + '"', '"' + receiver + '"', '"' + senderQueueName + '"', '"' + receiverQueueName + '"']);
        },

        writeMessageEnd: function () {

            var obj = this.tstack.pop();
            //alert(this.tstack);
            this.wobj = this.tstack.pop();

            this.wobj.push(obj);

            this.wbuf = '[' + this.wobj.join(',') + ']';

            this.transport.write(this.wbuf);

            return this.wbuf;
        },


        writeStructBegin: function (name) {
            this.tname.push(name.name);
            this.tpos.push(this.tstack.length);
            this.tstack.push({});
        },

        writeStructEnd: function () {

            var p = this.tpos.pop();
            var struct = this.tstack[p];
            var structName = this.tname.pop();
            var str = '["' + structName + '",{';
            var first = true;
            for (var key in struct) {
                if (first) {
                    first = false;
                } else {
                    str += ',';
                }

                str += key + ':' + struct[key];
            }

            str += '}]';
            this.tstack[p] = str;
        },

        writeFieldBegin: function (name, fieldType, fieldId) {

            this.tpos.push(this.tstack.length);
            this.tstack.push({
                'fieldId': '"' +
                fieldId + '"', 'fieldType': Thrift.Protocol.Type[fieldType]
            });
        },

        writeFieldEnd: function () {
            var value = this.tstack.pop();
            var fieldInfo = this.tstack.pop();

            this.tstack[this.tstack.length - 1][fieldInfo.fieldId] = '{' +
            fieldInfo.fieldType + ':' + value + '}';
            this.tpos.pop();
        },

        writeFieldStop: function () {
            //na
        },

        writeMapBegin: function (keyType, valType, size) {
            //size is invalid, we'll set it on end.
            this.tpos.push(this.tstack.length);
            this.tstack.push([Thrift.Protocol.Type[keyType],
            Thrift.Protocol.Type[valType], 0]);
        },

        writeMapEnd: function () {
            var p = this.tpos.pop();

            if (p == this.tstack.length) {
                return;
            }

            if ((this.tstack.length - p - 1) % 2 !== 0) {
                this.tstack.push('');
            }

            var size = (this.tstack.length - p - 1) / 2;

            this.tstack[p][this.tstack[p].length - 1] = size;

            var map = '}';
            var first = true;
            while (this.tstack.length > p + 1) {
                var v = this.tstack.pop();
                var k = this.tstack.pop();
                if (first) {
                    first = false;
                } else {
                    map = ',' + map;
                }

                if (!isNaN(k)) { k = '"' + k + '"'; } //json "keys" need to be strings
                map = k + ':' + v + map;
            }
            map = '{' + map;

            this.tstack[p].push(map);
            this.tstack[p] = '[' + this.tstack[p].join(',') + ']';
        },

        writeListBegin: function (elemType, size) {
            this.tpos.push(this.tstack.length);
            this.tstack.push([Thrift.Protocol.Type[elemType], size]);
        },

        writeListEnd: function () {
            var p = this.tpos.pop();

            while (this.tstack.length > p + 1) {
                var tmpVal = this.tstack[p + 1];
                this.tstack.splice(p + 1, 1);
                this.tstack[p].push(tmpVal);
            }

            this.tstack[p] = '[' + this.tstack[p].join(',') + ']';
        },

        writeSetBegin: function (elemType, size) {
            this.tpos.push(this.tstack.length);
            this.tstack.push([Thrift.Protocol.Type[elemType], size]);
        },

        writeSetEnd: function () {
            var p = this.tpos.pop();

            while (this.tstack.length > p + 1) {
                var tmpVal = this.tstack[p + 1];
                this.tstack.splice(p + 1, 1);
                this.tstack[p].push(tmpVal);
            }

            this.tstack[p] = '[' + this.tstack[p].join(',') + ']';
        },

        writeBool: function (value) {
            this.tstack.push(value ? 1 : 0);
        },

        writeByte: function (i8) {
            this.tstack.push(i8);
        },

        writeI16: function (i16) {
            this.tstack.push(i16);
        },

        writeI32: function (i32) {
            this.tstack.push(i32);
        },

        writeI64: function (i64) {
            this.tstack.push(i64);
        },

        writeDouble: function (dbl) {
            this.tstack.push(dbl);
        },

        writeDecimal: function (dec) {
            this.tstack.push(dec);
        },

        writeString: function (str) {
            // We do not encode uri components for wire transfer:
            if (str === null) {
                this.tstack.push(null);
            } else {
                // concat may be slower than building a byte buffer
                var escapedString = '';
                for (var i = 0; i < str.length; i++) {
                    var ch = str.charAt(i);      // a single double quote: "
                    if (ch === '\"') {
                        escapedString += '\\\"'; // write out as: \"
                    } else if (ch === '\\') {    // a single backslash: \
                        escapedString += '\\\\'; // write out as: \\
                        /* Currently escaped forward slashes break TJSONProtocol.
                        * As it stands, we can simply pass forward slashes into
                        * our strings across the wire without being escaped.
                        * I think this is the protocol's bug, not thrift.js
                        * } else if(ch === '/') {   // a single forward slash: /
                        *  escapedString += '\\/';  // write out as \/
                        * }
                        */
                    } else if (ch === '\b') {    // a single backspace: invisible
                        escapedString += '\\b';  // write out as: \b"
                    } else if (ch === '\f') {    // a single formfeed: invisible
                        escapedString += '\\f';  // write out as: \f"
                    } else if (ch === '\n') {    // a single newline: invisible
                        escapedString += '\\n';  // write out as: \n"
                    } else if (ch === '\r') {    // a single return: invisible
                        escapedString += '\\r';  // write out as: \r"
                    } else if (ch === '\t') {    // a single tab: invisible
                        escapedString += '\\t';  // write out as: \t"
                    } else {
                        escapedString += ch;     // Else it need not be escaped
                    }
                }
                this.tstack.push('"' + escapedString + '"');
            }
        },

        writeBinary: function (str) {
            this.writeString(str);
        },


        // Reading functions
        readMessageBegin: function (message) {
            this.rstack = [];
            this.rpos = [];
            //        if (typeof jQuery !== 'undefined') {


            this.robj = jQuery.parseJSON(message);

            var r = {};
            var version = this.robj.shift();

            if (version != Thrift.Protocol.Version) {
                throw 'Wrong thrift protocol version: ' + version;
            }

            r.fname = this.robj.shift();
            r.mtype = this.robj.shift();
            r.rseqid = this.robj.shift();
            r.livelift = this.robj.shift();
            r.sender = this.robj.shift();
            r.senderQueueName = this.robj.shift();
            r.receiver = this.robj.shift();
            r.receiverQueueName = this.robj.shift();

            //get to the main obj
            this.rstack.push(this.robj.shift());

            return r;
        },

        readMessageEnd: function () {
        },

        readStructBegin: function (name) {
            var r = {};
            r.fname = '';

            //        var len = this.rstack.length;
            if (this.rstack[this.rstack.length - 1] instanceof Array) {
                if (this.rstack[this.rstack.length - 1].length == 2) {

                    if (getType(this.rstack[this.rstack.length - 1][0]) == "string" && getType(this.rstack[this.rstack.length - 1][1]) == "object") {
                        r.fname = this.rstack[this.rstack.length - 1].shift();
                        this.rstack[this.rstack.length - 1] = this.rstack[this.rstack.length - 1].shift();
                    } else if (getType(this.rstack[this.rstack.length - 1][0]) == "array") {
                        var ttt = this.rstack[this.rstack.length - 1].shift();
                        r.fname = ttt[0];
                        this.rstack.push(ttt[1]);
                    }
                    else {
                        this.rstack.push(this.rstack[this.rstack.length - 1].shift());
                    }
                } else {
                    if (getType(this.rstack[this.rstack.length - 1][0]) == "array") {
                        var ttt = this.rstack[this.rstack.length - 1].shift();
                        r.fname = ttt[0];
                        this.rstack.push(ttt[1]);
                    } else {
                        this.rstack.push(this.rstack[this.rstack.length - 1].shift());
                    }
                }
            }

            return r;
        },

        readStructEnd: function () {
            if (this.rstack[this.rstack.length - 2] instanceof Array) {
                this.rstack.pop();
            }
        },

        readStructObjEnd: function () {
            if (this.rstack[this.rstack.length - 2] instanceof Array) {
                this.rstack.pop();
            }
            else if (this.rstack[this.rstack.length - 2] instanceof Object && this.rstack[this.rstack.length - 2] != {}) {
                this.rstack.pop();
            }
        },

        readFieldBegin: function () {
            var r = {};

            var fid = -1;
            var ftype = Thrift.Type.Stop;

            //get a fieldId
            for (var f in (this.rstack[this.rstack.length - 1])) {
                if (f === null) {
                    continue;
                }

                fid = parseInt(f, 10);
                this.rpos.push(this.rstack.length);

                var field = this.rstack[this.rstack.length - 1][fid];

                //remove so we don't see it again
                delete this.rstack[this.rstack.length - 1][fid];

                this.rstack.push(field);

                break;
            }

            if (fid != -1) {

                //should only be 1 of these but this is the only
                //way to match a key
                for (var i in (this.rstack[this.rstack.length - 1])) {
                    if (Thrift.Protocol.RType[i] === null) {
                        continue;
                    }

                    ftype = Thrift.Protocol.RType[i];
                    this.rstack[this.rstack.length - 1] =
                    this.rstack[this.rstack.length - 1][i];
                }
            }

            r.fname = '';
            r.ftype = ftype;
            r.fid = fid;

            return r;
        },

        readFieldEnd: function () {
            var pos = this.rpos.pop();

            //get back to the right place in the stack
            while (this.rstack.length > pos) {
                this.rstack.pop();
            }
        },

        readMapBegin: function (keyType, valType, size) {
            var map = this.rstack.pop();

            var r = {};
            r.ktype = Thrift.Protocol.RType[map.shift()];
            r.vtype = Thrift.Protocol.RType[map.shift()];
            r.size = map.shift();


            this.rpos.push(this.rstack.length);
            this.rstack.push(map.shift());

            return r;
        },

        readMapEnd: function () {
            this.readFieldEnd();
        },

        readListBegin: function (elemType, size) {
            var list = this.rstack[this.rstack.length - 1];

            var r = {};
            r.etype = Thrift.Protocol.RType[list.shift()];
            r.size = list.shift();

            this.rpos.push(this.rstack.length);
            this.rstack.push(list);

            return r;
        },

        readListEnd: function () {
            this.readFieldEnd();
        },

        readSetBegin: function (elemType, size) {
            return this.readListBegin(elemType, size);
        },

        readSetEnd: function () {
            return this.readListEnd();
        },

        readBool: function () {
            var r = this.readI32();

            if (r !== null && r.value == '1') {
                r.value = true;
            } else {
                r.value = false;
            }

            return r;
        },

        readByte: function () {
            return this.readI32();
        },

        readI16: function () {
            return this.readI32();
        },

        readI32: function (f) {
            if (f === undefined) {
                f = this.rstack[this.rstack.length - 1];
            }

            var r = {};

            if (f instanceof Array) {
                if (f.length === 0) {
                    r.value = undefined;
                } else {
                    r.value = f.shift();
                }
            } else if (f instanceof Object) {
                for (var i in f) {
                    if (i === null) {
                        continue;
                    }
                    this.rstack.push(f[i]);
                    delete f[i];

                    r.value = i;
                    break;
                }
            } else {
                r.value = f;
                this.rstack.pop();
            }

            return r;
        },

        readI64: function () {
            return this.readI32();
        },

        readDouble: function () {
            return this.readI32();
        },

        readDecimal: function () {
            return this.readI32();
        },

        readString: function () {
            var r = this.readI32();
            return r;
        },

        readBinary: function () {
            return this.readString();
        },

        //Method to arbitrarily skip over data.
        skip: function (type) {
            throw 'skip not supported yet';
        }
    };

    var CalculationBase = 180;
    var DynSerialize = function () {

        var singleton = null;
        var readDynObject = function (serializer) {
            r = serializer.readStructBegin();
            structName = r.fname;
            var obj = eval(structName + "Class.createInstance()");
            var field;

            while (true) {

                field = serializer.readFieldBegin();
                if (field.ftype == Thrift.Type.Stop) {
                    break;
                }

                var property = obj.Class.getPropertyByID(field.fid);
                var propertyName = property.name.substr(0, 1).toLowerCase() + property.name.substr(1);
                switch (property.collectionType) {

                    case rock.core.CollectionType.None:
                        switch (property.dynType) {

                            case Thrift.Type.Stop:
                                break;
                            case Thrift.Type.Void:
                                break;
                            case Thrift.Type.Bool:
                                obj[propertyName] = serializer.readBool().value;
                                break;
                            case Thrift.Type.Byte:
                                obj[propertyName] = serializer.readByte().value;
                                break;
                            case Thrift.Type.Double:
                                obj[propertyName] = serializer.readDouble().value;
                                break;
                            case Thrift.Type.Decimal:
                                obj[propertyName] = serializer.readDecimal().value;
                                break;
                            case Thrift.Type.I16:
                                obj[propertyName] = serializer.readI16().value;
                                break;
                            case Thrift.Type.I32:
                                obj[propertyName] = serializer.readI32().value;
                                break;
                            case Thrift.Type.I64:
                                obj[propertyName] = serializer.readI64().value;
                                break;
                            case Thrift.Type.String:
                                obj[propertyName] = serializer.readString().value;
                                break;
                            case Thrift.Type.DateTime:
                                obj[propertyName] = serializer.readString().value;
                                break;
                            case Thrift.Type.Struct:
                                obj[propertyName] = DynSerialize.readDynObject(serializer);
                                break;
                            case Thrift.Type.Map:

                                break;
                            case Thrift.Type.Set:

                                break;
                            default:
                                TSerializerUtil.Skip(serializer, field.type);
                                break;
                        }
                        break;
                    case rock.core.CollectionType.List:
                        obj[propertyName] = DynSerialize.readList(serializer, property.structName);
                        break;
                }

                serializer.readFieldEnd();
            }
            serializer.readStructEnd();
            return obj;
        }

        var myfield = new TField();
        var _writeParameters = function (serializer, method) {
            var struc = new TStruct(method.name);
            serializer.writeStructBegin(struc);
            var field = new TField();
            var parameters = method.getParameters();
            for (parameterName in parameters) {
                parameter = parameters[parameterName];
                if (parameter.name != null && method[parameterName] != null) {

                    field.name = parameterName;
                    field.type = parameter.dynType;
                    field.id = parameter.id;

                    if (parameter.collectionType) {
                        serializer.writeFieldBegin(field.name, parameter.collectionType, field.id);
                    }
                    else {
                        serializer.writeFieldBegin(field.name, field.type, field.id);
                    }

                    switch (parameter.collectionType) {

                        case rock.core.CollectionType.None:
                            switch (field.type) {

                                case Thrift.Type.Stop:
                                    break;
                                case Thrift.Type.Void:
                                    break;
                                case Thrift.Type.Bool:
                                    serializer.writeBool(method[parameterName]);
                                    break;
                                case Thrift.Type.Byte:
                                    serializer.writeByte(method[parameterName]);
                                    break;
                                case Thrift.Type.Double:
                                    serializer.writeDouble(method[parameterName]);
                                    break;
                                case Thrift.Type.Decimal:
                                    serializer.writeDecimal(method[parameterName]);
                                    break;
                                case Thrift.Type.I16:
                                    serializer.writeI16(method[parameterName]);
                                    break;
                                case Thrift.Type.I32:
                                    serializer.writeI32(method[parameterName]);
                                    break;
                                case Thrift.Type.I64:
                                    serializer.writeI64(method[parameterName]);
                                    break;
                                case Thrift.Type.String:
                                    serializer.writeString(method[parameterName]);
                                    break;
                                case Thrift.Type.DateTime:
                                    serializer.writeString(method[parameterName]);
                                    break;
                                case Thrift.Type.Struct:
                                    DynSerialize.writeDynObject(serializer, method[parameterName]);
                                    break;

                                default:
                                    break;
                            }
                            break;
                        case rock.core.CollectionType.List:
                            DynSerialize.writeList(serializer, method[parameterName], field.type);
                            break;
                        case rock.core.CollectionType.Map:
                            DynSerialize.writeMap(serializer, method[parameterName]);
                            break;
                        case rock.core.CollectionType.Set:

                            break;
                    }
                    serializer.writeFieldEnd();
                }
            }

            serializer.writeFieldStop();
            serializer.writeStructEnd();
        }

        var _writeDynObject = function (serializer, obj) {

            //        serializer.WriteString(obj.DynClass.Name);

            var struc = new TStruct(obj.Class.className);
            serializer.writeStructBegin(struc);
            var field = new TField();
            var properties = obj.Class.getProperties().values();
            var property = null;
            for (var i = 0; i < properties.length; i++) {
                property = properties[i];
                if (property.name != null && obj[property.name] != null) {

                    field.name = property.name;
                    field.type = property.dynType;
                    field.id = property.id;

                    if (property.collectionType)
                        serializer.writeFieldBegin(field.name, property.collectionType, field.id);
                    else
                        serializer.writeFieldBegin(field.name, field.type, field.id);

                    switch (property.collectionType) {

                        case rock.core.CollectionType.None:
                            switch (field.type) {
                                case Thrift.Type.Stop:
                                    break;
                                case Thrift.Type.Void:
                                    break;
                                case Thrift.Type.Bool:
                                    serializer.writeBool(obj[property.name]);
                                    break;
                                case Thrift.Type.Byte:
                                    serializer.writeByte(obj[property.name]);
                                    break;
                                case Thrift.Type.Double:
                                    serializer.writeDouble(obj[property.name]);
                                    break;
                                case Thrift.Type.Decimal:
                                    serializer.writeDecimal(obj[property.name]);
                                    break;
                                case Thrift.Type.I16:
                                    serializer.writeI16(obj[property.name]);
                                    break;
                                case Thrift.Type.I32:
                                    serializer.writeI32(obj[property.name]);
                                    break;
                                case Thrift.Type.I64:
                                    serializer.writeI64(obj[property.name]);
                                    break;
                                case Thrift.Type.String:
                                    serializer.writeString(obj[property.name]);
                                    break;
                                case Thrift.Type.DateTime:
                                    serializer.writeString(obj[property.name]);
                                    break;
                                case Thrift.Type.Struct:
                                    DynSerialize.writeDynObject(serializer, obj[property.name]);
                                    break;
                                case Thrift.Type.Map:
                                    //oprot.writeString(this[property.name] as string);
                                    break;
                                case Thrift.Type.Set:
                                    //oprot.writeString(this[property.name] as string);
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case rock.core.CollectionType.List:

                            DynSerialize.writeList(serializer, obj[property.name], property.dynType);
                            break;
                    }
                    serializer.writeFieldEnd();
                }
            }

            //for (prop in properties) {
            //    if (!isNaN(prop)) {
            //        var property = properties[prop];
            //        if (property.name != null && obj[property.name] != null) {

            //            field.name = property.name;
            //            field.type = property.dynType;
            //            field.id = property.id;

            //            if (property.collectionType)
            //                serializer.writeFieldBegin(field.name, property.collectionType, field.id);
            //            else
            //                serializer.writeFieldBegin(field.name, field.type, field.id);

            //            switch (property.collectionType) {

            //                case rock.core.CollectionType.None:
            //                    switch (field.type) {
            //                        case Thrift.Type.Stop:
            //                            break;
            //                        case Thrift.Type.Void:
            //                            break;
            //                        case Thrift.Type.Bool:
            //                            serializer.writeBool(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.Byte:
            //                            serializer.writeByte(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.Double:
            //                            serializer.writeDouble(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.Decimal:
            //                            serializer.writeDecimal(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.I16:
            //                            serializer.writeI16(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.I32:
            //                            serializer.writeI32(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.I64:
            //                            serializer.writeI64(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.String:
            //                            serializer.writeString(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.DateTime:
            //                            serializer.writeString(obj[property.name]);
            //                            break;
            //                        case Thrift.Type.Struct:
            //                            DynSerialize.writeDynObject(serializer, obj[property.name]);
            //                            break;
            //                        case Thrift.Type.Map:
            //                            //oprot.writeString(this[property.name] as string);
            //                            break;
            //                        case Thrift.Type.Set:
            //                            //oprot.writeString(this[property.name] as string);
            //                            break;
            //                        default:
            //                            break;
            //                    }
            //                    break;
            //                case rock.core.CollectionType.List:

            //                    DynSerialize.writeList(serializer, obj[property.name], property.dynType);
            //                    break;
            //            }
            //            serializer.writeFieldEnd();
            //        }
            //    }
            //}

            serializer.writeFieldStop();
            serializer.writeStructEnd();
        }

        var _readResult = function (serializer, method) {
            var field;
            r = serializer.readStructBegin();

            while (true) {
                field = serializer.readFieldBegin();
                if (field.ftype == Thrift.Type.Stop) {
                    break;
                }
                var result = method.getResultPara();
                switch (result.collectionType) {

                    case rock.core.CollectionType.None:

                        switch (result.dynType) {

                            case Thrift.Type.Stop:
                                break;
                            case Thrift.Type.Void:
                                break;
                            case Thrift.Type.Bool:
                                method.resultValue = serializer.readBool();
                                break;
                            case Thrift.Type.Byte:
                                method.resultValue = serializer.readByte();
                                break;
                            case Thrift.Type.Double:
                                method.resultValue = serializer.readDouble();
                                break;
                            case Thrift.Type.Decimal:
                                method.resultValue = serializer.readDecimal();
                                break;
                            case Thrift.Type.I16:
                                method.resultValue = serializer.readI16();
                                break;
                            case Thrift.Type.I32:
                                method.resultValue = serializer.readI32();
                                break;
                            case Thrift.Type.I64:
                                method.resultValue = serializer.readI64();
                                break;
                            case Thrift.Type.String:
                                method.resultValue = serializer.readString();
                                break;
                            case Thrift.Type.DateTime:
                                method.resultValue = serializer.readString();
                                break;
                            case Thrift.Type.Struct:
                                method.resultValue = DynSerialize.readDynObject(serializer);
                                break;
                            default:
                                //TSerializerUtil.Skip(serializer, field.ftype);
                                break;
                        }
                        break;
                    case rock.core.CollectionType.List:
                        var resultList = DynSerialize.readList(serializer, result.structName);
                        method.resultValue = resultList;
                        break;
                    case rock.core.CollectionType.Map:
                        var resultMap = DynSerialize.readMap(serializer);
                        method.resultValue = resultMap;
                        break;
                    case rock.core.CollectionType.Set:

                        break;
                        serializer.readFieldEnd();
                }

                serializer.readStructEnd();
            }
        }

        var _writeList = function (serializer, list, type) {
            if (list) {

                serializer.writeListBegin(type, list.length);

                for (var i = 0; i < list.length; i++) {

                    if (list[i] != null) {
                        switch (type) {
                            case Thrift.Type.Stop:
                                break;
                            case Thrift.Type.Void:
                                break;
                            case Thrift.Type.Bool:
                                serializer.writeBool(list[i]);
                                break;
                            case Thrift.Type.Byte:
                                serializer.writeByte(list[i]);
                                break;
                            case Thrift.Type.Double:
                                serializer.writeDouble(list[i]);
                                break;
                            case Thrift.Type.Decimal:
                                serializer.writeDecimal(list[i]);
                                break;
                            case Thrift.Type.I16:
                                serializer.writeI16(list[i]);
                                break;
                            case Thrift.Type.I32:
                                serializer.writeI32(list[i]);
                                break;
                            case Thrift.Type.I64:
                                serializer.writeI64(list[i]);
                                break;
                            case Thrift.Type.String:
                                serializer.writeString(list[i]);
                                break;
                            case Thrift.Type.DateTime:
                                serializer.writeString(list[i]);
                                break;
                            case Thrift.Type.Struct:
                                DynSerialize.writeDynObject(serializer, list[i]);
                                break;
                            default:
                                break;
                        }
                    }
                }

                serializer.writeListEnd();
            }
            else {
                serializer.writeListBegin(type, 0);
                serializer.writeListEnd();
            }
        }

        var _readList = function (serializer, structName) {

            var tlist = serializer.readListBegin();
            var list = new rock.RockList();
            for (var i = 0; i < tlist.size; i++) {

                switch (tlist.etype) {
                    case Thrift.Type.Bool:
                        list.add(serializer.readBool());
                        break;
                    case Thrift.Type.Byte:
                        list.add(serializer.readByte());
                        break;
                    case Thrift.Type.Double:
                        list.add(serializer.readDouble());
                        break;
                    case Thrift.Type.Decimal:
                        list.add(serializer.readDecimal());
                        break;
                    case Thrift.Type.I16:
                        list.add(serializer.readI16());
                        break;
                    case Thrift.Type.I32:
                        list.add(serializer.readI32());
                        break;
                    case Thrift.Type.I64:
                        list.add(serializer.readI64());
                        break;
                    case Thrift.Type.String:
                        list.add(serializer.readString());
                        break;
                    case Thrift.Type.DateTime:
                        list.add(serializer.readString());
                        break;
                    case Thrift.Type.Struct:
                        list.add(DynSerialize.readDynObject(serializer));
                        break;
                    default:
                        break;
                }
            }

            serializer.readListEnd();
            return list;
        }

        //Map
        var _writeMap = function (serializer, dict) {
            var map = new TMap();
            map.KeyType = Thrift.Type.String;
            map.ValueType = Thrift.Type.Struct;
            map.Count = dict instanceof rock.RockMap ? dict.size() : 0;
            serializer.writeMapBegin(map.KeyType, map.ValueType, map.Count);

            if (dict != null && dict instanceof rock.RockMap) {
                for (var dictitemindex in dict.arr) {
                    if (!isNaN(dictitemindex)) {
                        var dictitem = dict.arr[dictitemindex];
                        serializer.writeString(dictitem.key);
                        //value
                        DynSerialize.writeObj(serializer, dictitem.value);
                    }
                }
            }

            serializer.writeMapEnd();
        }

        var _readMap = function (serializer) {
            var dict = new rock.RockMap();
            var map = serializer.readMapBegin();
            for (var mapindex = 0; mapindex < map.size; mapindex++) {
                var key = serializer.readString();
                var value = DynSerialize.readObj(serializer);
                dict.put(key, value);
            }

            serializer.readMapEnd();
            return dict;
        }

        //Object
        var _writeObj = function (serializer, value) {
            var struc = new TStruct("Obj");
            var collectionType;
            var dynType;
            var structName;

            //value
            serializer.writeStructBegin(struc);

            if (!isNullOrEmptyValue(value)) {
                try {
                    var reslut = getTypeDynType(value);
                    collectionType = reslut.collectionType;
                    dynType = reslut.dynType;
                    structName = reslut.structName;
                }
                catch (ex) {
                    return;
                }
                var field = new TField();
                field.name = "obj";
                field.id = collectionType * CalculationBase + dynType;

                switch (collectionType) {
                    case rock.core.CollectionType.None:
                        field.type = dynType;
                        serializer.writeFieldBegin(field.name, field.type, field.id);
                        switch (field.type) {
                            case Thrift.Type.Bool:
                                serializer.writeBool(value);
                                break;
                            case Thrift.Type.Byte:
                                serializer.writeByte(value);
                                break;
                            case Thrift.Type.Double:
                                serializer.writeDouble(value);
                                break;
                            case Thrift.Type.Decimal:
                                serializer.writeDecimal(value);
                                break;
                            case Thrift.Type.I16:
                                serializer.writeI16(value);
                                break;
                            case Thrift.Type.I32:
                                serializer.writeI32(value);
                                break;
                            case Thrift.Type.I64:
                                serializer.writeI64(value);
                                break;
                            case Thrift.Type.String:
                                serializer.writeString(value);
                                break;
                            case Thrift.Type.DateTime:
                                serializer.writeString(value);
                                break;
                            case Thrift.Type.Binary:
                                serializer.writeBinary(value);
                                break;
                            case Thrift.Type.Struct:
                                DynSerialize.writeDynObject(serializer, value);
                                break;
                            default:
                                break;
                        }
                        break;
                    case rock.core.CollectionType.List:
                        field.type = Thrift.Type.List;
                        serializer.writeFieldBegin(field.name, field.type, field.id);
                        DynSerialize.writeList(serializer, value, dynType);
                        break;

                    case rock.core.CollectionType.Map:
                        field.type = Thrift.Type.Map;
                        serializer.writeFieldBegin(field.name, field.type, field.id);
                        DynSerialize.writeMap(serializer, value);
                        break;
                    case rock.core.CollectionType.Set:
                        break;
                    default:
                        break;
                }
                serializer.writeFieldEnd();

            }

            serializer.writeFieldStop();

            serializer.writeStructEnd();
        }

        var _readObj = function (serializer) {
            var field;
            var tstruct = serializer.readStructBegin("Obj");
            var obj = null;

            while (true) {
                field = serializer.readFieldBegin();

                if (field.ftype == Thrift.Type.Stop) {
                    break;
                }

                var collection = parseInt(field.fid / CalculationBase);
                var dynType = field.fid % CalculationBase;
                switch (collection) {
                    case rock.core.CollectionType.None:
                        switch (dynType) {
                            case Thrift.Type.Bool:
                                obj = serializer.readBool();
                                break;
                            case Thrift.Type.Byte:
                                obj = serializer.readByte();
                                break;
                            case Thrift.Type.Double:
                                obj = serializer.readDouble();
                                break;
                            case Thrift.Type.Decimal:
                                obj = serializer.readDecimal();
                                break;
                            case Thrift.Type.I16:
                                obj = serializer.readI16();
                                break;
                            case Thrift.Type.I32:
                                obj = serializer.readI32();
                                break;
                            case Thrift.Type.I64:
                                obj = serializer.readI64();
                                break;
                            case Thrift.Type.String:
                                obj = serializer.readString();
                                break;
                            case Thrift.Type.DateTime:
                                obj = serializer.readString();
                                break;
                            case Thrift.Type.Binary:
                                obj = serializer.ReadBinary();
                                break;
                            case Thrift.Type.Struct:
                                obj = DynSerialize.readDynObject(serializer);
                                break;
                            default:
                                break;
                        }
                        break;

                    case rock.core.CollectionType.List:
                        obj = DynSerialize.readList(serializer, "Object");
                        break;

                    case rock.core.CollectionType.Set:
                        break;

                    case rock.core.CollectionType.Map:
                        obj = DynSerialize.readMap(serializer);
                        break;

                    default:
                        break;
                }
                serializer.readFieldEnd();
            }
            serializer.readStructObjEnd();

            return obj;
        }

        var getTypeDynType = function (obj) {
            var resalt = {};
            if (isNullOrEmptyValue(obj)) {
                throw new Error("不能对空对象或者空数组检测类型");
            }
            resalt.structName = null;
            var sample = obj;

            if (obj.length instanceof rock.RockList) {
                resalt.collectionType = rock.core.CollectionType.List;
                for (var i = 0; i < obj.length; i++) {
                    sample = obj[i];
                    if (!isNullOrEmptyValue(sample)) {
                        break;
                    }
                }
            }
            else if (obj instanceof rock.RockMap) {
                resalt.collectionType = rock.core.CollectionType.Map;
                for (var dictionaryEntryIndex in obj.arr) {
                    if (!isNaN(dictionaryEntryIndex)) {
                        continue;
                    }
                    var dictionaryEntry = obj.arr[dictionaryEntryIndex];

                    sample = dictionaryEntry.value;
                    if (!isNullOrEmptyValue(sample)) {
                        break;
                    }
                }
            }
            else if (obj.length !== undefined && isNaN(obj.length)) {
                resalt.collectionType = rock.core.CollectionType.Set;
                for (var valueIndex in obj) {
                    if (!isNaN(valueIndex)) {
                        continue;
                    }
                    value = obj[valueIndex];
                    sample = value;
                    if (!isNullOrEmptyValue(sample)) {
                        break;
                    }
                }
            }
            else {
                resalt.collectionType = rock.core.CollectionType.None;
                sample = obj;
            }

            if (!isNullOrEmptyValue(sample)) {
                if (typeof (sample) == 'boolean') {
                    resalt.dynType = Thrift.Type.Bool;
                }
                else if (typeof (sample) == 'number') {
                    resalt.dynType = Thrift.Type.I32;
                }
                else if (typeof (sample) == 'string') {
                    resalt.dynType = Thrift.Type.String;
                }
                else if (sample instanceof Date) {
                    resalt.dynType = Thrift.Type.DateTime;
                }
                else {
                    resalt.dynType = Thrift.Type.Struct;

                    if (sample.Class != undefined && sample.Class.className != undefined) {
                        structName = sample.Class.className;
                    }
                    else {
                        resalt.structName = "Object";
                    }
                }
            }
            else {
                throw new Error("不能对只由空对象或者空数组组成的对象检测类型");
            }
            return resalt;
        }

        var isNullOrEmptyValue = function (obj) {
            return obj == null || (obj.count == 0);
        }


        if (singleton == null) {
            singleton = {
                readDynObject: readDynObject,
                writeParameters: _writeParameters,
                writeDynObject: _writeDynObject,
                readResult: _readResult,
                writeList: _writeList,
                readList: _readList,
                writeMap: _writeMap,
                readMap: _readMap,
                writeObj: _writeObj,
                readObj: _readObj
            };
        }
        function TMap(keyType, valueType, count) {
            this.keyType = keyType;
            this.valueType = valueType;
            this.count = count;
        }

        function TField(name, type, id) {
            this.name = name;
            this.type = type;
            this.id = id;
        };
        function TStruct(name) {
            this.name = name;
            this.methods = new rock.Dictionary();
        };
        return singleton;
    }();

    //内部使用函数
    function fixJqText(str) {
        var tempstr = str.replace(/\%/g, "%25");
        tempstr = tempstr.replace(/\+/g, "%2B");
        tempstr = tempstr.replace(/\&/g, "%26");
        return tempstr;
    }

    rock.getServerPath = function (webPath) {
        var result = "Error";
        $.ajax({
            type: "POST",
            url: "/CommonServiceHandler.ashx",
            data: { "webpath": webPath },
            async: false,
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (data) {
                result = data;
            }
        });
        return result;
    }

    rock.getServerTime = function (timeType) {
        var result = "Error";
        $.ajax({
            type: "POST",
            url: "/CommonServiceHandler.ashx",
            data: { "ServerTime": timeType },
            async: false,
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (data) {
                result = data;
            }
        });
        return result;
    }

    rock.numToFixed = function (num, len) {
        var add = 0;
        var s, temp;
        var l = num + "";
        var start = l.indexOf(".");
        if (l.substr(start + len + 1, 1) >= 5) add = 1;
        var temp = Math.pow(10, len);
        s = Math.floor(num * temp) + add;
        return s / temp;
    }

    window.rock = rock;
})(window);

//jQuery插件
jQuery.extend({
    cookie: function (name, value, options) {
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            var path = options.path ? '; path=' + options.path : '';
            var domain = options.domain ? '; domain=' + options.domain : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', value, expires, path, domain, secure].join('');
        } else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = cookie.substring(name.length + 1);
                        break;
                    }
                }
            }
            return cookieValue;
        }
    },
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return r[2];
        return null;
    }
});
