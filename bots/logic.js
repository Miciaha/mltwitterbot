//Initialize methods
var redis = require('redis')
var Twit = require("twit")
//var sentiment = require("sentiment")
const parser = require("feedparser")
const config = require("./config")
let scholar = require("google-scholar")

const bot = new Twit(config)

var client = redis.createClient(process.env.REDISCLOUD_URL)


var REDIS_KEY = 'repliedTo'

//Analyze sentiment
function processTweet(tweet){
    client.sadd(REDIS_KEY, tweet.user.id_str, function(err, reply){
        
        var username = tweet.user.name.split(' ')[0]
        
        if (err){
            console.log(err)
        }  else {
            /*
            var naughtyOrNice = sentiment(tweet.text, {'@machineelsa':0}).score
            switch(naughtyOrNice) {
                case -5:
                    var message = "! Wow, I really hope you don't kiss your mother with that mouth " + username + ". GOOD DAY, SIR!"
                    break
                
                case -4,-3,-2,-1: 
                    var message = " I don't have the ability to not take what you tweeted to heart just yet. I'll just say 'Ouch' for now " + username + "."
                    break
                
                default:
                    var message = " You're nice enough for me " + username + ". Let's be buds :)"
            
                
            }
            */
            var request = tweet.text
            var message = "Hello, " + username +"."
            
            if(request.includes("find")){
                if(request.include("article")){
                    
                    message += " Here's a recent article on"
                
                    if(request.includes("machine learning")){
                        message += " Machine Learning: "   
                        scholar.all('machine learning').then(resultsObj =>{
                            var artNum = Math.floor(Math.random() * resultsObj.length())
                            console.log(resultsObj[artNum])
                        })
                    }
                    else if(request.includes("deep learning")){
                        message += " Deep Learning"
                    }
                    else if(request.includes("neural networks")){
                        message += " Neural Networks"
                    }
                    
                    else
                    {
                        message += " I'm sorry. It appears I have no feeds on that topic."
                    }
                }    
                
                if(request.include("tweet")){
                    if(request.includes("machine learning")){
                        
                    }
                    if(request.includes("deep learning")){
                        
                    }
                    if(request.includes("neural networks")){
                        
                    }
                }
                
                
                
                
            }
            
            
            replyTo(tweet, message)
        }
    })
}

function replyTo(tweet, message){
    var text = '@' + tweet.user.screen_name + message
    bot.post('statuses/update',{status: text, in_reply_to_status_id: tweet.user.id_str},
    function(err, data, response){
        console.log(data,err)
    }
    )
}

var stream = bot.stream('statuses/filter', {track: '@machineelsa'})

const senti = () =>{
    stream.on('tweet', function(tweet){
        //console.log(tweet)
        processTweet(tweet)
    })
    
    stream.on('limit', function(limitMessage){
        //console.log(limitMessage)
    })
    
    stream.on('disconnect', function(disconnectMessage){
       // console.log(disconnectMessage)
    })
    
    stream.on('reconnect', function(request, response, connectInterval){
        //console.log('Reconnonecting in ' + connectInterval + 'ms...')
    })
    
    stream.on('error', function(error){
        //console.log(error)
    })
}
module.exports = senti