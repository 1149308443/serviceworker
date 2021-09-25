const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require("path");

const server = http.createServer((req,res)=>{

const {pathname,query} = url.parse(req.url,true);
console.log(pathname,query)

const filePath = path.resolve(__dirname, '.'+pathname);

if(pathname == '/servicework.js'){
  fs.readFile(filePath,(err,data)=>{
    if(err){
      res.writeHead(404)
      res.write('not find')
    }else{
      res.writeHead(200,{"Content-type": "application/javascript"})
      res.write(data);
    }
    res.end();
  });
}else if(pathname == '/style.css'){
  fs.readFile(filePath,(err,data)=>{
    if(err){
      res.writeHead(404)
      res.write('not find')
    }else{
      res.writeHead(200,{"Content-type": "text/css"})
      res.write(data);
    }
    res.end();
  });
}else if(pathname == '/getdata'){
  res.write('222777');
  res.end();
}else{
  fs.readFile(filePath,(err,data)=>{
    if(err){
      res.writeHead(404)
      res.write('not find')
    }else{
      res.write(data);
    }
    res.end();
  });
} 
});

server.listen('8888',()=>{
  console.log('监听端口成功8888');
});
