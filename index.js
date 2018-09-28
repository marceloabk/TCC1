const TwitterStream = require('twitter-stream-api'),
  r = require('rethinkdb')

require('dotenv').load()
const keys = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  token: process.env.token,
  token_secret: process.env.token_secret
}

let connection = null
r.connect({host: 'db', port: 28015, db: 'TwitterDB'}, function (err, conn) {
  if (err) throw err
  connection = conn
})

function dbInsert(obj) {
  r.db('TwitterDB').table('Tweets').insert(obj).run(connection, function (err, result) {
    if (err) throw err
    console.log(JSON.stringify(result, null, 2))
  })
}

var Twitter = new TwitterStream(keys)

Twitter.on('data', function (obj) {
  if (connection === null) {
    setTimeout(dbInsert(obj), 10000)
  } else {
    dbInsert(obj)
  }
})

Twitter.stream('statuses/filter', {
  track: [
    'corrupção',
    'corrupçao',
    'corrupcão',
    'corrupcao',
    'corrupto',
    'corrupta',
    'política',
    'politica',
    'político',
    'politico',
    'eleições',
    'eleiçoes',
    'eleicões',
    'eleicoes',
  ],
  language: 'pt'
})

Twitter.on('connection success', function (uri) {
  console.log('connection success', uri)
})

Twitter.on('connection aborted', function () {
  console.log('connection aborted')
})

Twitter.on('connection error network', function () {
  console.log('connection error network')
})

Twitter.on('connection error stall', function () {
  console.log('connection error stall')
})

Twitter.on('connection error http', function (err) {
  console.log('connection error http', err)
})

Twitter.on('connection rate limit', function () {
  console.log('connection rate limit')
})

Twitter.on('connection error unknown', function () {
  console.log('connection error unknown')
})

Twitter.on('data keep-alive', function () {
  console.log('data keep-alive')
})

Twitter.on('data error', function () {
  console.log('data error')
})
