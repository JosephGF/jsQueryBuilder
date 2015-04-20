var jsQueryBuilder = function jsQueryBuilder(provider) {
    var _provider = provider || jsQueryBuilder.providers.toSQL;
    
    if (!(this instanceof  jsQueryBuilder)) {
        var q = new jsQueryBuilder();
        return q.select.apply(q, arguments);
    }
    
    var _columns = [];
    var _conditions = [];
    var _order = [];
    var _data = null;
    var _distinct = false;

    this.columns = null;
    Object.defineProperty(this, "columns", {
        get: function () {
            return _columns;
        }
    });
    
    this.conditions = null;
    Object.defineProperty(this, "conditions", {
        get: function () {
            return _conditions;
        }
    });
    
    this.order = null;
    Object.defineProperty(this, "order", {
        get: function () {
            return _order;
        }
    });
    
    this.data = null;
    Object.defineProperty(this, "data", {
        get: function () {
            return _data;
        }
    });
    
    this.distinct = null;
    Object.defineProperty(this, "distinct", {
        get: function () {
            return _distinct;
        }
    });

    var _createColumn = function(name, value, opc) {
        return new jsQueryBuilder.column(name, value, opc);
    };

    var _getColumn = function(arg, value, options) {
        if (typeof arg === "undefined")
            throw "column can't be null";

        var columns = [];
        options = options || {};

        if (arg instanceof jsQueryBuilder.column) return arg;

        if (typeof arg === "string") {
            columns.add(_createColumn(arg, value, options));
        } else if (typeof arg === "object") {
            for (var c in arg) {
                columns.add(_createColumn(c, arg[c], options));
            }
        }

        return columns;
    }

    var _getColumns = function(args, options) {
        var items = [];
        for (var idx = 0; idx < args.length; idx++) {
            var current = args[idx];
            if (typeof current === "object" && !(current instanceof Array)) {
                for (var c in current) {
                    if (current.hasOwnProperty(c))
                        items.add(_getColumn(c, current[c], options));
                }
            } else {
                if (typeof current === "string")
                    current = current.split(",");

                for (var x = 0; x < current.length; x++)
                    items.add(_getColumn(current[x], void 0, options));
            }
        }
        return items;
    };

    this.select = function() {
        _columns.add(_getColumns(arguments));
        return this;
    };
    
    this.from = function(data) {
        _data = data;
        return this;
    }
    
    this.where = function(data, comparer, value) {
        _conditions.add(_getColumn(data, value, { c : comparer }));
        return this;
    };
    
    this.orderBy = function(column, desc) {
        desc = desc || false;
        _order.add(_getColumns([column], { type: desc ? "DESC": "ASC" }));
        return this;
    };
    
    this.distinct = function(distinct) {
        distinct = distinct || true;
        _distinct = distinct == true;
        return this;
    };

    this.toString = function(provider) {
        /*var str = "";
        str += "Distinct - " + _distinct + "<br />";
        str += "Columns - " + JSON.stringify(_columns) + "<br />";
        str += "Where - " + JSON.stringify(_conditions) + "<br />";
        str += "Order - " + JSON.stringify(_order) + "<br />";*/

        provider = provider || _provider;
        return provider(this);
    };
    
    this.execute = function(provider) {
        provider = provider || _provider;
        return provider(this);
    }
};


/// EXTENSIONS
Array.prototype.add = function(data) {
    if (typeof data === "undefined") return;

    if (data instanceof Array) {
        for (var i = 0; i < data.length; i++)
            this.push(data[i]);
    } else {
        this.push(data);
    }
};

String.format = function() {
    var str = arguments[0], res = str;
    if (arguments.length == 2 && typeof arguments[1] === "object") {
        var expr = /\{(.*?)\}/g
          , match = null;
        while (match = expr.exec(str)) {
            var key = match[1]
              , value = Object.data(arguments[1], key)
              , regEx = new RegExp("" + match[0] + "", "gm");
            res = res.replace(regEx, value || "");
        }
    } else {
        for (var i = 0; i < arguments.length; i++) {
            var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            res = res.replace(regEx, arguments[i]);
        }
    }

    return res;
};

Object.data = function(obj, namespace) {
    var value = obj
      , namespace = namespace.split(".");
    for (var x = 0; x < namespace.length; x++) {
        value = value[namespace[x]];
    }
    
    return value;
}