var redis = require('redis');
var Twit = require("twit");

var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

var url = require("url");
var redisURL = url.parse(process.env.REDISCLOUD_URL || 'redis://127.0.0.1:6379');
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
if (process.env.REDISCLOUD_URL){
    client.auth(redisURL.auth.split(":"[1]));
}

var REDIS_KEY = 'repliedTo';
function processTweet(tweet){
    client.sadd(REDIS_KEY, tweet.user.id_str, function(err, reply){
        if (err){
            console.log(err);
        } else if (reply == 1 || tweet.user.screen_name == process.env.TWITTER_DEBUG_USER){
            console.log('This is a new user OR it is the debug user');
            replyTo(tweet, 'Go Away, Miciaha');
        } else {
            console.log('We have seen this user before');
        }
    });
}

function replyTo(tweet, message){
    var text = '@' + tweet.user.screen_name + ' ' + message;
    T.post('statuses/update',{status: text, in_reply_to_status_id: tweet.user.id_str},
    function(err, data, response){
        console.log(data,err)
    }
    );
}

var stream = T.stream('statuses/filter', {track: '@MachineElsa'});

stream.on('tweet', function(tweet){
    console.log(tweet);
    processTweet(tweet);
});

stream.on('limit', function(limitMessage){
    console.log(limitMessage);
});

stream.on('disconnect', function(disconnectMessage){
    console.log(disconnectMessage);
});

stream.on('reconnect', function(request, response, connectInterval){
    console.log('Reconnonecting in ' + connectInterval + 'ms...');
});

stream.on('error', function(error){
    console.log(error);
});