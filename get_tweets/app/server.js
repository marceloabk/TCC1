const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const ObjectsToCsv = require('objects-to-csv')

// Connection URL
const url = 'mongodb://mongo:27017'
 
// Database Name
const dbName = 'twitter'
 
// Use connect method to connect to the server
MongoClient.connect(url,  {useNewUrlParser: true}, function(err, client) {
  assert.equal(null, err)
  console.log("///// Connected successfully to server")
 
  const db = client.db(dbName)
  findDocuments(db, function() {
    console.log("Finished")
    client.close()
  })
})

const insertDocuments = function(db, tweets, callback) {
  // Get the documents collection
  const collection = db.collection('tweets')

  collection.insertMany(tweets, function(err, result) {
    assert.equal(err, null)
    console.log("Inserted tweet")
  })
}

const tweetTexts = []
const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('tweets')
  // Find some documents

  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null)
    for (let i = 0; i < docs.length; i++) {
      const tweet = docs[i]
      
      let refined_tweet = {
        created_at: tweet.created_at,
        source: tweet.source,
        user: tweet.user.screen_name,
        followers_count: tweet.user.followers_count,
        retweet_count: tweet.retweet_count,
        favorite_count: tweet.favorite_count,
        hashtags: tweet.entities.hashtags,
        urls: tweet.entities.urls,
        user_mentions: tweet.entities.user_mentions,
        media: tweet.entities.media,
        symbols: tweet.entities.symbols,
        polls: tweet.entities.polls,
      }
      if (tweet.extended_tweet) {
        refined_tweet.text = tweet.extended_tweet.full_text
      } else {
        refined_tweet.text = tweet.text
      }

      tweetTexts.push(refined_tweet)
    }

    (async() =>{
      let csv = new ObjectsToCsv(tweetTexts)
      
      // Save to file:
      await csv.toDisk('./tweets.csv')
    })();

  })
}