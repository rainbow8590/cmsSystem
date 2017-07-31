var express = require('express');
var router = express.Router();
var app = express();

var bodyParser = require('body-parser');

var mongoClient = require('mongodb').mongoClient;
var dbUrl = 'mongodb://localhost:27017/system08';

//model
var Model = require('../model/model.js');
var userDB = new Model('user')
var subjectDB = new Model('subject');
//
var admin = new Model('admin')


//上传文件模块
var path = require('path')
var fs = require('fs')
var multer = require('multer');
var uid = require('uid');
var timeStamp = require('time-stamp');



//文件上传配置
var storage = multer.diskStorage({
    //文件路径配置
    destination:function(req,file,cb){
        cb(null,'uploads')
    },
    //文件名称配置
    filename:function(req,file,cb){
        var extname = path.extname(file.originalname);
        cb(null,'upic_'+ timeStamp('YYYYMMDD') + timeStamp('HH') +'_'+uid()+extname) 
    }
})

//过滤配置
function fileFilter(req,file,cb){
    var imgType = ['image/png','image/gif','image/jpeg'];
    if(imgType.indexOf(file.mimetype) == -1){
        cb(null,false);
        cb(new Error('只能上传png/jpeg/gif格式的图片'));
    }else{
        cb(null,true);
    }
}



var upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits:{fileSize:1024*1024*5}
})



/* GET home page. */
router.get('/', function(req, res, next) {

    if(!req.session.user){
        res.redirect('/admin/login')
    }else{
        res.render('admin/index');
        console.log(req.session.user.username)
    }
});

//增加学员页面
router.get('/addUser',function(req,res){
    subjectDB.find(function(err,data){
        if(err){
            res.send(err)
        }else{
            res.render('admin/addUser',{subjectData:data})
        }
    })
})

//增加学员信息
router.post('/insertUser',upload.single('headpic'),function(req,res,next){
    req.body.headpic = req.file.filename;
    userDB.insert(req.body,function(err){
        if(err){
            res.send('插入数据失败')
        }else{
            res.redirect('/admin/userList')
        }
    })
})

//学员列表

router.get('/userList',function(req,res){
   var pageSize = 4;

    userDB.getCount(function(err,total){
        if(err){
            console.log(err)
            res.send(err)
        }else{
            
           var page = req.query.page ? req.query.page : 1;
            var maxPage = Math.ceil(total/pageSize);

            if(page <= 0){page = 1};

            if(page >= maxPage ){page = maxPage};

            userDB.getPageData({"amount":pageSize,"pages":page},function(err,data){
                if(err){
                    //console.log(err)
                    res.send(err);
                }else{

                    ;(function fn(i){
                        var id = {"_id": new require('mongodb').ObjectId(data[i].subjectId)};
                        subjectDB.findOneOrMany(id,function(err,data2){
                            data[i].subjectName = data2[0].name;
                            //有page参数时修改img的路径
                            // if(req.query.page){
                            //     data[i].headpic = '/'+data[i].headpic
                            // }
                            if(i < data.length-1){
                                fn(++i);
                            }else{
                                res.render('admin/userList',{dataList:data,page:page,maxPage:maxPage});
                            }
                        });
                    })(0);
                }
            })
        }
    })

     
})

//编辑学员页面
router.get('/editUser/:id',function(req,res){
    var id = {_id: new require('mongodb').ObjectId(req.params.id)}
    userDB.findOneOrMany(id,function(err,data1){

        if(err){
            res.send(err)
        }else{
            subjectDB.find(function(err,data2){
                res.render('admin/editUser',{data:data1[0],subjectData:data2})
            })
        }
        
    })
    
})

//更改学员信息
router.post('/updateUser',upload.single('newheadpic'),function(req,res){
    var id = {_id: new require('mongodb').ObjectId(req.body._id)}
    if(!(req.file == undefined)){
        req.body.headpic = req.file.filename;
        req.body.newheadpic = req.file.filename;
    }
    
    delete req.body._id;
    userDB.update(id,req.body,function(err){
        if(err){
            res.send(err)
        }else{  
            console.log('修改成功')
            res.redirect('/admin/userList')
        }
    })
})

//头像页面
router.get('/editHead/:id',function(req,res){
    var id = {_id: new require('mongodb').ObjectId(req.params.id)}
    userDB.findOneOrMany(id,function(err,data){
        if(err){
            res.send(err)
        }else{
            res.render('admin/editHead',{userData: data[0]})
        }
        
    })
    
})
//更改头像信息
router.post('/updateUserHead',upload.single('headpic'),function(req,res){
    var id = {_id: new require('mongodb').ObjectId(req.body._id)}
    // req.body.headpic = req.file.filename;
    var imgName = req.file.filename;
    delete req.body._id;
    userDB.update(id,{$set:{ "headpic" : imgName }},function(err){
        if(err){
            console.
            res.send(err)
        }else{  
            console.log('修改成功')
            console.log(imgName)
            res.redirect('/admin/userList')
        }
    })
})

//删除学员
router.get('/delUser/:id',function(req,res){
    var id = {_id: new require('mongodb').ObjectId(req.params.id)}
    userDB.remove(id,function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect('/admin/userList')
        }
    })
})

/*=============================  学科操作  ================================*/
//添加学科
router.get('/addSubject',function(req,res){
    res.render('admin/addSubject')
})
//添加学科信息
router.post('/insertSubject',function(req,res){
    subjectDB.insert(req.body,function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect('/admin/subjectList')
        }
    })
})

//学科列表
router.get('/subjectList',function(req,res){
    subjectDB.find(function(err,data){
        if(err){
            res.send(err)
        }else{
            res.render('admin/subjectList',{dataList:data})
        }
    })
})
//编辑学科
router.get('/editSubject/:id',function(req,res){

    var id = {_id: new require('mongodb').ObjectId(req.params.id)}
    subjectDB.findOneOrMany(id,function(err,data){
        if(err){
            res.send(err)
        }else{
            res.render('admin/editSubject',{data:data[0]})
        }
    })
})
//接收学科信息
router.post('/updateSubject',function(req,res){

    var id = {_id: new require('mongodb').ObjectId(req.body._id)}
    delete req.body._id
    subjectDB.update(id,req.body,function(err){
        if(err){
            res.send(err)
        }else{   
            res.redirect('/admin/subjectList')
        }
    })
})

//删除学科
router.get('/delSubject/:id',function(req,res){
    var id = {_id: new require('mongodb').ObjectId(req.params.id)}
    subjectDB.remove(id,function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect('/admin/subjectList')
        }
    })
})


//注册页面
router.get('/reg',function(req,res){
    res.render('admin/reg')
})

//注册页面数据
router.post('/reg',function(req,res){
    var username = req.body.username.trim();
    var password = req.body.password.trim();

    //MD5加密
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    var pass = md5.update(password);
    var ps = md5.digest('hex');

    admin.insert({username:username,password:ps},function(err){
        if(err){
            res.send('no');
        }else{
            res.send('注册成功')
        }
    })
})


//登录页面
router.get('/login',function(req,res){
    res.render('admin/login')
})

//登录页面数据
router.post('/login',function(req,res){
    var username = req.body.username.trim();
    var password = req.body.password.trim();

    //MD5加密
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    var pass = md5.update(password);
    var ps = md5.digest('hex');


    admin.findOneOrMany({username:username,password:ps},function(err,data){
        if(err){
            res.send('no');
        }else{
           
            if(data){

                req.session.user = data[0];
                console.log(req.session.user)
                res.send('yes')
            }else{
                res.send('nnono')
            }
        }
    })
})

//退出登录
router.get('/logout',function(req,res){
    req.session.user = null;
    res.redirect('/admin/login')
})

module.exports = router
