#!/bin/env node
var fs = require('fs');
var users = fs.readdirSync("users");
for(i in users){
	try{
		var content = fs.readFileSync("users/"+users[i]).toString();
		JSON.parse(content);
	}
	catch(e){
		console.error("Invalid JSON in file: " + users[i]);
		process.exit(1);
	}
}