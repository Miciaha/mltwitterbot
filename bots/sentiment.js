//Initialize methods
var redis = require('redis');
var Twit = require("twit");
var sentiment = require("sentiment");
const config = require("./config");

const bot = new Twit(config);
var url = require("url");
var redisURL = url.parse(process.env.REDISCLOUD_URL || 'redis://rediscloud:62WwEPziRxb2ooXy@redis-13077.c12.us-east-1-4.ec2.cloud.redislabs.com:13077');
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
if (process.env.REDISCLOUD_URL){
    client.auth(redisURL.auth.split(":"[1]));
}

var REDIS_KEY = 'repliedTo';

//Analyze sentiment
function processTweet(tweet){
    client.sadd(REDIS_KEY, tweet.user.id_str, function(err, reply){
        if (err){
            console.log(err);
        }  else {
            var naughtyOrNice = sentiment(tweet.text, {'@machineelsa':0}).score;
            switch(naughtyOrNice) {
                case -5:
                    var message = "! Wow, I really hope you don't kiss your mother with that mouth " + tweet.user.name + ". GOOD DAY, SIR!"
                    break;
                
                case -4,-3,-2,-1: 
                    var message = " I don't have the ability to not take what you tweeted to heart just yet. I'll just say 'Ouch' for now."
                    break;
                
                default:
                    var message = " You're nice enough for me " + tweet.user.name + ". Let's be buds :)"
            }
            
            replyTo(tweet, message);
        }
    });
}

function replyTo(tweet, message){
    var text = '@' + tweet.user.screen_name + message;
    bot.post('statuses/update',{status: text, in_reply_to_status_id: tweet.user.id_str},
    function(err, data, response){
        console.log(data,err)
    }
    );
}

var stream = bot.stream('statuses/filter', {track: '@MachineElsa'});

const senti = () =>{
    stream.on('tweet', function(tweet){
        //console.log(tweet);
        processTweet(tweet);
    });
    
    stream.on('limit', function(limitMessage){
        //console.log(limitMessage);
    });
    
    stream.on('disconnect', function(disconnectMessage){
       // console.log(disconnectMessage);
    });
    
    stream.on('reconnect', function(request, response, connectInterval){
        //console.log('Reconnonecting in ' + connectInterval + 'ms...');
    });
    
    stream.on('error', function(error){
        //console.log(error);
    });
}
module.exports = senti;