jsQueryBuilder.providers = {
    toSQL : function(jsBuilder) {
        var sql = "";
        var generate = function(str, arr, separator) {
            var res = "";
            for (var x = 0; x < arr.length; x++) {
                if (res) res += separator || "";
                res += String.format(str, arr[x]);
            }
            return res;
        }

        var strDistinct = jsBuilder.distinct ? " Distinct " : "";
        var strTable = jsBuilder.data || "__NO_TABLE__";
        var strColumns = generate("{name}", jsBuilder.columns, ",") || "*";
        var strWhere   = generate("{name}={value}", jsBuilder.conditions, " AND ");
        var strOrder   = generate("{name} {opc.type}", jsBuilder.order, ",");
        
        sql += "SELECT " + strDistinct + strColumns
            + " FROM " + strTable
            + (strWhere ? " WHERE " + strWhere : "")
            + (strOrder ? " ORDER BY " + strOrder : "");
        
        return sql;
    },
    toURL: function(jsBuilder) {
        var url = "";
        var generate = function(str, arr, separator) {
            var res = "";
            for (var x = 0; x < arr.length; x++) {
                if (res) res += separator || "";
                res += String.format(str, arr[x]);
            }
            return res;
        }
        
        var strTable = jsBuilder.data || "__NO_TABLE__";
        var strColumns = generate("{name}", jsBuilder.columns, ",") || "__ALL__";
        var strWhere   = generate("{name}={value}", jsBuilder.conditions, ",");
        var strOrder   = generate("{name} {type}", jsBuilder.order, ",");
        
        url += "&c=" + escape(strColumns)
             + "&d=" + escape(jsBuilder.distinct)
             + "&t=" + escape(strTable)
             + escape(strWhere ? "&w" + strWhere : "")
             + escape(strOrder ? "&o" + strOrder : "");
        
        return url;
    },
    toARR: function(jsBuilder) {
        var res = [], x = 0;
        var filter = function(obj) {
            for (x = 0; x < jsBuilder.conditions.length; x++) {
                var c = jsBuilder.conditions[x];
                if (c.value !== Object.data(obj, c.name)) return false;
            }
            return true;
        };
        
        var sort = function(obj1, obj2) {
            var greather = 1, less = -1, equals = 0;
            
            if (jsBuilder.order[x].opc.type == "DESC") {
                greather = -1;
                less = 1;
            }
            
            for (x = 0; x < jsBuilder.order.length; x++) {
                var c = jsBuilder.order[x];
                if (Object.data(obj1, c.name) < Object.data(obj2, c.name)) return less;
                if (Object.data(obj1, c.name) > Object.data(obj2, c.name)) return greather;
                return equals;
            }
            
            return equals;
        }

        return jsBuilder.data.filter(filter).sort(sort);
    }
}