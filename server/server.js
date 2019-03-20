var request=require('request');
var cheerio=require('cheerio');
var express=require('express');
var hbs=require('hbs');
var puppeteer=require('puppeteer');
var bodyparser=require('body-parser');
var keyword_extractor=require('keyword-extractor');
var {search1}=require('./model.js');
var app=express();
app.use(express.static(__dirname+'/../public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine',hbs);
app.listen(8080,function(){
    console.log('started server on port 8080');
});
var str1,url1,url2,url3,tex=[],arr=[],visit={};
app.get('/',function(req,res){
    res.render("index.hbs",{
        arr: tex
    });
});
app.post('/',function(req,res){
    var str=req.body.text1;
    var str2 = keyword_extractor.extract(str,{
        language:"english",
        remove_digits: true,
        return_changed_case:true,
        remove_duplicates: false
    });
    tex=[];
    if(req.body.id1==='ques'){
        search1.findOne({ques: str},function(err,result){
            if(result){
                request({
                    url: result.URL,
                    json: true
                },function(err,resp,body){
                    var $=cheerio.load(body);
                    $('p').each(function(i,elem) {
                        tex[i]=$(this).text();
                    });
                    res.end('abc');
                });
            }
            else
            {
                scrape(str+' quora',function(url1){
                    console.log(url1);
                    request({
                        url: url1,
                        json: true
                        },function(err,resp,body){
                            var $=cheerio.load(body);
                            var relativeLinks = $("a[href^='/']");
                            relativeLinks.each(function(){
                                url3=$(this).attr('href');
                                var str2="";
                                for(var i=1;i<url3.length;i++)
                                {
                                    if(url3[i]==='-' || url3[i]==='_')
                                    str2+=' ';
                                    else
                                    str2+=url3[i];
                                }
                                url3='https://www.quora.com'+url3;
                                str2=str2.toLowerCase();
                                //search1.findOne({ques: str2},function(err,result){
                                    //if(!result)
                                    //{
                                        var data=new search1({
                                            ques: str2,
                                            URL: url3
                                        });
                                        data.save();
                                    //}
                                //});
                            });
                            $('p').each(function(i,elem){
                                tex[i]=$(this).text();
                            });
                            res.end('abc');
                    });
                
                });
            }
        });
    }
    else
    {
       search1.findOne({ques: str},function(err,result){
            if(result)
            {
                console.log("hello");
                request({
                    url: result.URL,
                    json: true
                },function(err,resp,body){
                    var $=cheerio.load(body);
                    $('p').each(function(i,elem){
                        tex[i]=$(this).text();
                    });
                    res.end('abc');
                });
            }
            else
            {
                console.log('nhi hua');
                scrape1(str,function(url1){
                    request({
                        url: url1,
                        json: true
                    },function(err,resp,body){
                        var $=cheerio.load(body);
                        var relativeLinks = $("a[href^='/']");
                        relativeLinks.each(function(){
                            url3=$(this).attr('href');
                            var str2="";
                            for(var i=6;i<url3.length;i++)
                            {
                                if(url3[i]==='-' || url3[i]==='_')
                                str2+=' ';
                                else
                                str2+=url3[i];
                            }
                            url3='https://www.wikipedia.org'+url3;
                            str2=str2.toLowerCase();
                            //search1.findOne({ques: str2},function(err,result){
                                //if(!result)
                                //{
                                    var data=new search1({
                                        ques: str2,
                                        URL: url3
                                    });
                                    data.save();
                                //}
                            //});
                        });
                        $('p').each(function(i,elem) {
                            tex[i]=$(this).text();
                        });
                        res.end('abc');
                    });
                });
            }
        });
    }
});

let scrape=async(str1,callback)=>{
    var browser=await puppeteer.launch({headless:true});
    var page=await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 900
      })
      await page.goto('https://www.google.com/');
      var search=await page.$('#tsf > div:nth-child(2) > div > div.RNNXgb > div > div.a4bIc > input');
      await search.click();
      await search.type(str1);
      await search.dispose();
      var but=await page.$('#tsf > div:nth-child(2) > div > div.FPdoLc.VlcLAe > center > input[type="submit"]:nth-child(1)');
      await but.click();
      await page.waitFor(5000);
      var a=await page.$('#rso > div:nth-child(1) > div > div:nth-child(1) > div > div > div.r > a');
      await a.click();
      await page.waitFor(5000);
      const url = await page.evaluate(() => location.href);
      await browser.close();
      callback(url);
}

let scrape1=async(str1,callback)=>{
    var browser=await puppeteer.launch({headless:true});
    var page=await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 900
      })
      await page.goto('https://www.wikipedia.org/');
      var search=await page.$('#searchInput');
      await search.click();
      await search.type(str1);
      await search.dispose();
      var but=await page.$('#search-form > fieldset > button > i');
      await but.click();
      await page.waitFor(5000);
      const url = await page.evaluate(() => location.href);
      console.log(url);
       await browser.close();
       callback(url);
}