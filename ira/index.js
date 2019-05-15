const r = require('rethinkdb')

console.log('mas ué rusbé')

let connection = null
r.connect({host: 'db', port: 28015, db: 'TwitterDB'}, function (err, conn) {
  if (err) throw err
  connection = conn
})

function conn_open(callback) {
  if (connection === null) {
    setTimeout(() => {
      conn_open(callback)
    }, 5000);
  } else {
    callback()
  }
}

function print_objs() {
  r.table('Tweets').run(connection, function(err, cursor) {
    if (err) {
      console.log('[ERR Rethink] can\'t print table Tweets DB')
      return
    }
    cursor.each(console.log)
  })
}

function count() {
  r.table('Tweets').count().run(connection, function(err, result) {
    if (err) {
      console.log('[ERR Rethink] can\'t finish count')
      return
    }
    console.log(`Total tweets: ${result}`)
  })
}

function filter_retweets() {
  
  r.db('TwitterDB').table('Tweets').filter(
    r.row.hasFields('retweeted_status').not()
    .and(
      r.row('extended_tweet')('full_text').match("corrupção")
      .or(r.row('extended_tweet')('full_text').match("corrupçao"))
      .or(r.row('extended_tweet')('full_text').match("corrupcão"))
      .or(r.row('extended_tweet')('full_text').match("corrupcao"))
      .or(r.row('extended_tweet')('full_text').match("corrupto"))
      .or(r.row('extended_tweet')('full_text').match("corrupta"))

      .or(r.row('text').match("corrupção"))
      .or(r.row('text').match("corrupçao"))
      .or(r.row('text').match("corrupcão"))
      .or(r.row('text').match("corrupcao"))
      .or(r.row('text').match("corrupto"))
      .or(r.row('text').match("corrupta"))
    )
  ).pluck({'extended_tweet' : ['full_text']}, 'text')
  .run(connection, function(err, result) {
    if (err) {
      console.log('[ERR Rethink] can\'t filter retweets')
      return
    }
    result.each(console.log)
  })
}


conn_open(filter_retweets)

//map(function(tweet){
//  return 1
//}).reduce(function(a,b){
//  return a.add(b)
//})
// r.epochTime(r.row('timestamp_ms').coerceTo('number'))

//r.db('TwitterDB').table('Tweets').group(
//  r.epochTime(r.row('timestamp_ms').coerceTo('number').div(1000)).dayOfYear()
//).count()