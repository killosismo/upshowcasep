var http = require("http");
	fs =require("fs");

var jade = fs.readFileSync(".views/index.jade");

http.createServer(function(req,res){
	res.write(jade);
	res.end();
}).listen(8080);