const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const Twitter = require('twitter')

require('dotenv').config()

var client = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.token,
  access_token_secret: process.env.token_secret
})

let next_on_break = undefined
function getData(next=null, db, c) {
  if (next != null) {
    let twitterQuery = '(corrupção OR corrupçao OR corrupcão OR corrupcao OR corrupto OR corrupta) lang:pt'
    let query = undefined
    if (next === true) {
      query = {
        query: twitterQuery,
        fromDate: '201810010000',
        toDate: '201810080000',
        next: 'eyJhdXRoZW50aWNpdHkiOiJjY2Q2YzFmMDQ2MjY1MTU0OGQ2NzFlMGNlYjI1ODA4MGI1YTAzMDE2NTc3MjViYmRkMGIwNDc3NTY0MzcwOTI3IiwiZnJvbURhdGUiOiIyMDE4MTAwMTAwMDAiLCJ0b0RhdGUiOiIyMDE4MTAwODAwMDAiLCJuZXh0IjoiMjAxODEwMDgwMDAwMDAtMTA0OTA3ODQzNzQwNTc0MTA1Ni0wIn0='
      }
    } else {
      query = {
        query: twitterQuery,
        fromDate: '201810010000',
        toDate: '201810080000',
        next: next
      }
    }
    client.get('tweets/search/fullarchive/prod', query,  function(error, tweets, response) {
      if(error) {
        console.log(error)
        return;
      }

      insertDocuments(db, tweets.results)

      next_on_break = tweets.next
      
      console.log("next: ///////////////////////////")
      console.log(next_on_break)
      console.log("/////////////////////////////////")

      setTimeout(() => {
        getData(tweets.next, db, c)
      }, 5000)
    })
  } else {
    c.close()
    console.log('aewhooo acabou')
  }
}

// fromDate: '201810010000', toDate: '201810080000' 

// Connection URL
const url = 'mongodb://mongo:27017'
 
// Database Name
const dbName = 'twitter'
 
// Use connect method to connect to the server
MongoClient.connect(url,  {useNewUrlParser: true}, function(err, client) {
  assert.equal(null, err)
  console.log("///// Connected successfully to server")
 
  const db = client.db(dbName)

  getData(true, db, client)
})

const insertDocuments = function(db, tweets, callback) {
  // Get the documents collection
  const collection = db.collection('tweets')

  collection.insertMany(tweets, function(err, result) {
    assert.equal(err, null)
    console.log("Inserted tweet")
  })
}
