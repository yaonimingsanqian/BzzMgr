
var fs = require('fs');
var express = require('express');
var app = express();
var request = require('sync-request');
var shell = require('shelljs');

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}
app.get('/createnode', function (req, res) {
    var params = req.query;
    var ip = params["ip"];
    var key = params["key"];
	var tmp = 2000;
	var config = null;
	try {
	  config = fs.readFileSync(__dirname+"/config.json", 'utf8');
	} catch (err) {
	 console.log("read config error");
	}
	if(config != null){
	   config = JSON.parse(config);
	   tmp = config["nextport"];
	}else{
	   config = {};
	}
	var w_data = 'clef-signer-enable: false\nfull-node: true\nswap-enable: true\nswap-initial-deposit: \"10000000000000000\"\nswap-deployment-gas-price: \"1000000000000\"\nverbosity: trace\nwelcome-message: \"BZZ BZZ BZZ \"\ndebug-api-enable: true';
	// w_data += "\ndebug-api-addr: :1635";
	// w_data += "\np2p-addr: :1634";
	// w_data += "\napi-addr: :1633";
	// w_data += "\nnat-addr: "+ip+":1634";
	w_data += "\nswap-endpoint: "+key;
	// w_data += "\ndata-dir: /data";
	w_data += "\npassword: \"Aa@cj302\"\n"
	fs.writeFileSync(__dirname + '/yaml/'+tmp+".yaml", w_data);

	shell.exec("mkdir -p /data/bee/"+tmp);
	console.log("sudo docker run --name "+tmp+" -d -v /data/bee/"+tmp+":/data -v "+(__dirname + "/yaml")+":/yaml -p "+tmp+":1635 -p "+(tmp-1)+":1634 -p "+(tmp-2)+":1633 --rm -it ethersphere/bee:latest start --config /yaml/"+tmp+".yaml --data-dir=/data --nat-addr="+ip+":"+tmp);
	var dockerResult = shell.exec("docker run --name "+tmp+" -d -v /data/bee/"+tmp+":/data -v "+(__dirname + "/yaml")+":/yaml -p "+tmp+":1635 -p "+(tmp-1)+":1634 -p "+(tmp-2)+":1633 --rm -it ethersphere/bee:latest start --config /yaml/"+tmp+".yaml --data-dir=/data --nat-addr="+ip+":"+tmp);
  //  shell.exec("sh ./run.sh "+tmp+" "+key+" "+"1");

    console.log("dockerResult:"+dockerResult);
    var nodes = config["nodes"];
	if(nodes == null){
		nodes = [];
	}
    var address = "";
   // console.log("grep -rn \"ethereum address\" "+__dirname+"/log/"+tmp+".txt");
    for (var i = 0; i <= 20; i++) {
    	// var result = shell.exec("grep -rn \"ethereum address\" "+__dirname+"/log/"+tmp+".txt");
       
     //    if(result != null && result.length > 0 && result.indexOf("ethereum address") > 0){
     //    	result = replaceAll(result,'\"',"");
     //    	result = replaceAll(result,' ','');
     //    	console.log("grep ethereum address result="+result);
     //    	address = result.split('usingethereumaddress')[1].replace('\n',"");
     //    	break;
     //    }
            try{
               console.log("begin query ethereum")
               var res = request('GET', 'http://localhost:'+(tmp)+'/address');
               console.log("address res="+res);
               var json = JSON.parse(res.getBody().toString());
               if('ethereum' in json){
               	   address = json["ethereum"];
               	   break;
               }
			}catch(e){

			}
                
    }
    console.log("wallet address:"+address);
    nodes[nodes.length] = {ip:ip,port:tmp,key:key,yaml:tmp,address:address,recharge:0,status:-1};
	config["nextport"]=tmp+10;
	config["nodes"] = nodes;
    fs.writeFileSync(__dirname+"/config.json",JSON.stringify(config));
    var tmp = nodes[nodes.length-1];
	res.json({rtn:0,node:tmp});
})

app.get('/recharge', function (req, res) {
    var params = req.query;
    var prarm_yaml = params["yaml"];
	try{
		var configstr = fs.readFileSync(__dirname+"/config.json", 'utf8');
	    var config = null;
	    if(configstr != null){
		   config = JSON.parse(configstr);
		}
		if(config != null){
			var nodes = config["nodes"];
			var find = 0;
			for (var i = 0; i < nodes.length; i++) {
				 var node = nodes[i];
				 var yaml = node["yaml"];
				 if(prarm_yaml == yaml){
				 	node["recharge"] = 1;
				 	find = 1;
				 	break;
				 }
			}
			if(find == 1){
			   config["nodes"] = nodes;
			   fs.writeFileSync(__dirname+"/config.json",JSON.stringify(config));
			   res.json({ret:0,msg:"ok"});
			}else{
			   res.json({ret:-3,msg:"yaml not exist"});
			}
			
		}else{
			console.log("loop read config err");
			res.json({ret:-1,msg:"config not exist"});
		}

	}catch(e){
		console.log(e);
		res.json({ret:-2,msg:"zero node"});
	}
})

app.get('/restartnode', function (req, res) {
    var params = req.query;
    var yaml = params["yaml"];
    var key = params["key"];

  //  shell.exec("sh ./run.sh "+yaml+" "+key+" "+"1");
    shell.exec("docker stop "+yaml);
    shell.exec("docker start "+yaml);
    res.json({rtn:0,msg:"ok"});
})

// app.post('/restartnode', function (req, res) {
//     var params = req.query;
//     var yaml = params["yaml"];
//     var key = params["key"];
//     var network_id = params["network_id"];
//     if(network_id == null || network_id == ""){
//     	network_id = 10;
//     }
//     shell.exec("sh ./run.sh "+yaml+" "+key+" "+"1"+" "+network_id);
//     res.json({rtn:0,msg:"ok"});
// })


app.get('/checknode',function(req,res){

})
 
var server = app.listen(8081, function () {
var host = server.address().address
var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})