
var JsonPatch = require('fast-json-patch');
var Firebase = require('firebase');
var async = require('async');
var EventSource = require('eventsource');
var express = require('express');
var app = express();
var myFirebaseRef = new Firebase('https://articletestserver.firebaseio.com');
var teamName = null;
var eventSource = null;
var streamdata = null;
var streamtoken = null;



function connectStream(TeamItem) {
    
    streamdata = "https://streamdata.motwin.net/http://rss2json.com/api.json?rss_url=http%3A%2F%2Fwww.nba.com%2F";
    streamtoken = "%2Frss.xml&X-Sd-Token=OTRlM2RmYTgtNGE0ZC00YTU3LTgyZWYtN2NiMGIyNWUxMGMz";
    //opens eventsource for current url
    var TeamName = TeamItem.Name;
    if (TeamName == "Mavericks"){
        // console.log(TeamName);
        return;
    }
    var link = streamdata + TeamName + streamtoken;
    TeamItem.info = new EventSource(link);
    // log opening of eventsource
    TeamItem.info.onopen = function() {
       // console.log(TeamName + ' opened');
    };
    // add event listener for current url
    TeamItem.info.addEventListener('data', function(item) {
        //set teamName as the query sent to api
        var data = JSON.parse(item.data);
        data = data.items
        // teamName = data.query;
        if(data == null){
            console.log(TeamName);
        }
        //add timestamp to each item
        for (var i = 0; i < data.length; i++){
            data[i].timeStamp = Firebase.ServerValue.TIMESTAMP;
        }
        

        //set firebase node as the query sent to api
        var myFirebaseRef = new Firebase('https://articletestserver.firebaseio.com/' + TeamItem.Team);
        //set initial data with returned api data
        myFirebaseRef.set(data);
       
        
    });
    //add event listener to listen for updates on current url
    TeamItem.info.addEventListener('patch', function(patch) {
         var item = JSON.parse(patch.data);
       

            if (item.op == "add") {
                var myFirebaseRef = new Firebase('https://articleserver.firebaseio.com/' + TeamName);
                //push update to database
                item.value.timeStamp = Firebase.ServerValue.TIMESTAMP;
                myFirebaseRef.push(item.value);
                console.log(TeamName + " " + item.value);
            } 
        
        console.log(item);

    });
    //add listener for errors
    TeamItem.info.addEventListener('error', function(e) {
        console.log('ERROR!');
        console.log(e.data);
        console.log(TeamName);
        
    });
    
}



function connect() {
    
    
    
    var TeamList = [{"Team": "Atlanta Hawks", "info": {}, "Name": "Hawks"}, {"Team": "Boston Celtics", "info": {}, "Name": "Celtics"}, {"Team": "Brooklyn Nets", "info": {}, "Name":"Nets"}, {"Team": "Charlotte Hornets", "info": {}, "Name":"Hornets"}, {"Team": "Chicago Bulls", "info": {}, "Name":"Bulls"}, {"Team": "Cleveland Cavaliers", "info": {}, "Name":"cavaliers"}, {"Team": "Dallas Mavericks", "info": {}, "Name":"Mavericks"}, {"Team": "Denver Nuggets", "info": {}, "Name":"Nuggets"}, {"Team": "Detroit Pistons", "info": {}, "Name":"Pistons"}, {"Team": "Golden State Warriors", "info": {}, "Name":"Warriors"}, {"Team": "Houston Rockets", "info": {}, "Name":"Rockets"}, {"Team": "Indiana Pacers", "info": {}, "Name":"pacers"}, {"Team": "LA Clippers", "info": {}, "Name":"Clippers"}, {"Team": "LA Lakers", "info": {}, "Name":"Lakers"}, {"Team": "Memphis Grizzlies", "info": {}, "Name":"Grizzlies"}, {"Team": "Miami Heat", "info": {}, "Name":"Heat"}, {"Team": "Milwaukee Bucks", "info": {}, "Name":"Bucks"}, {"Team": "Minnesota Timberwolves", "info": {}, "Name":"Timberwolves"}, {"Team": "New Orleans Pelicans", "info": {}, "Name":"Pelicans"}, {"Team": "New York Knicks", "info": {}, "Name":"Knicks"}, {"Team": "Oklahoma City Thunder", "info": {}, "Name":"Thunder"}, {"Team": "Orlando Magic", "info": {}, "Name":"Magic"}, {"Team": "Philadelphia Sixers", "info": {}, "Name":"Sixers"}, {"Team": "Phoenix Suns", "info": {}, "Name":"Suns"}, {"Team": "Portland Trail Blazers", "info": {}, "Name":"Blazers"}, {"Team": "Sacramento Kings", "info": {}, "Name":"Kings"}, {"Team": "San Antonio Spurs", "info": {}, "Name":"Spurs"}, {"Team": "Toronto Raptors", "info": {}, "Name":"Raptors"}, {"Team": "Utah Jazz", "info": {}, "Name":"Jazz"}, {"Team": "Washington Wizards", "info": {}, "Name":"Wizards"}];
    

    var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000
    var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
     
    app.listen(server_port, server_ip_address, function () {
      console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
    });

    async.eachLimit(TeamList, 1, function(team, callback){
        setTimeout(function(){
        connectStream(team);
        callback();
       }, (1500));
        }, function(err){
                if(err) {console.log(err);}
                
    });

}




    


function server() {
    //connect to firebase node
    //connect to each url
    connect();
}
console.log('start');
server();