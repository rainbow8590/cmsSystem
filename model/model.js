var mongoClient = require('mongodb').MongoClient;

var dbUrl = 'mongodb://localhost:27017/system08';

module.exports = function(collection){
    //连接数据库
    this.connect = function(callback){
        mongoClient.connect(dbUrl,function(err,db){
            if(err){
                console.log('连接数据库失败');
                callback(err)
            }else{
                callback(null,db)
            }
          
        })
    }
    //插入数据
    this.insert = function(data,callback){
        this.connect(function(err,db){
            db.collection(collection).insert(data,function(err){
                if(err){
                    callback(err);
                }else{
                    callback(err,null);
                }
                db.close();
            })
        })
    }
    //查找全部数据
    this.find = function(callback){
        this.connect(function(err,db){
            db.collection(collection).find().toArray(function(err,data){
                if(err){
                    callback(err);
                }else{
                    callback(null,data);
                }
                db.close();
            })
        })
    }
    //查找一条或多条数据
     this.findOneOrMany = function(tj,callback){
        this.connect(function(err,db){
            db.collection(collection).find(tj).toArray(function(err,data){
                if(err){
                    callback(err);
                }else{
                    callback(null,data);
                }
                db.close();
            })
        })
    }

    //更新数据
    this.update = function(tj,json,callback){
        this.connect(function(err,db){
            db.collection(collection).update(tj,json,function(err){
                if(err){
                    callback(err);
                }else{
                    callback(err);
                }
                db.close();
            })
        })
    }

    //删除数据
    this.remove = function(tj,callback){
        this.connect(function(err,db){
            db.collection(collection).remove(tj,function(err){
                if(err){
                    callback(err)   
                }else{
                    callback(null)
                }
                db.close();
            })
        })
    }

    //获取指定页码的数据
    this.getPageData = function(option,callback){
            this.connect(function(err,db){
                db.collection(collection).find().limit(option.amount).skip(option.amount*(option.pages-1)).toArray(function(err,data){
                    if(err){
                        callback(err)
                    }else{
                        callback(null,data)
                    }
                    db.close();
                })
            })
    }
    //获取总数量
    this.getCount = function(callback){
         this.connect(function(err,db){
            db.collection(collection).find().count(function(err,total){
                if(err){
                    callback(err)
                }else{
                    callback(null,total)
                }
                db.close();
            })
        })
    }
}