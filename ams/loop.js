var fs = require('fs');
var request = require('sync-request');
setInterval(function(){
	try{
		var configstr = fs.readFileSync(__dirname+"/config.json", 'utf8');
	    var config = null;
	    if(configstr != null){
		   config = JSON.parse(configstr);
		}
		if(config != null){
			var nodes = config["nodes"];
			var list = [];
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var res = null;
				try{
                    res = request('GET', 'http://localhost:'+(node["port"]-2));
				}catch(e){

				}
                if(res != null && res.getBody().indexOf("Bee") >= 0){
                	node["status"] = 1;
                	
                }else{
                	node["status"] = -1;
                	
                }
                if(node["status"] == 1){
                	try{
                   		res = request('GET', 'http://localhost:'+(node["port"])+'/peers');
                   		if(res != null){
							var peers = JSON.parse(res.getBody().toString());
					    	node["peers"] = peers["peers"].length;
						}else{
							node["peers"] = -1;
						}

					}catch(e){
						node["peers"] = -1;
					}
					
                }else{
                	 node["peers"] = -1;
                }
               
				list[i] = node;
			}
			console.log(JSON.stringify( {list: list}));
			var res = request('POST', 'http://209.250.227.61/bee_mon/notify.php', {
				json: {list: list},
			});
		}else{
			console.log("loop read config err");
		}

	}catch(e){
		console.log(e);
		var res = request('POST', 'http://209.250.227.61/bee_mon/notify.php', {
				json: {list: []},
		});
	}
    
},1000*30);

setInterval(function(){
	try{
		var configstr = fs.readFileSync(__dirname+"/config.json", 'utf8');
	    var config = null;
	    if(configstr != null){
		   config = JSON.parse(configstr);
		}
		if(config != null){
			var nodes = config["nodes"];
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var res = null;
				try{
                    res = request('GET', 'http://localhost:'+(node["port"])+'/chequebook/cheque');
				}catch(e){

				}
                var cheque = JSON.parse(res.getBody().toString());
                node["cheque"] = cheque;
                var res = request('POST', 'http://209.250.227.61/bee_mon/cheque.php', {
						json:node,
				});
				console.log(res.getBody().toString());
				
			}
		}else{
			console.log("loop read config err");
		}

	}catch(e){
		console.log(e);
	}
},1000*3600);

