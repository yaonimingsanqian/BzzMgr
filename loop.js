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
				list[i] = node;
			}
			console.log(JSON.stringify( {list: list}));
			var res = request('POST', 'http://209.250.227.61/bee_mon/notify.php', {
				json: {list: list},
			});
			console.log(res.getBody().toString());
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

