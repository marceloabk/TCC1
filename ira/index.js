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
      r.branch(
        r.row.hasFields('extended_tweet'),
        r.or(
          r.row('extended_tweet')('full_text').match("(?i)corrupção"),
          r.row('extended_tweet')('full_text').match("(?i)corrupçao"),
          r.row('extended_tweet')('full_text').match("(?i)corrupcão"),
          r.row('extended_tweet')('full_text').match("(?i)corrupcao"),
          r.row('extended_tweet')('full_text').match("(?i)corrupto"),
          r.row('extended_tweet')('full_text').match("(?i)corrupta")
        ),
        r.or(
          r.row('text').match("(?i)corrupção"),
          r.row('text').match("(?i)corrupçao"),
          r.row('text').match("(?i)corrupcão"),
          r.row('text').match("(?i)corrupcao"),
          r.row('text').match("(?i)corrupto"),
          r.row('text').match("(?i)corrupta")
        )        
      )
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

function delete_not_corruption(){
  r.db('TwitterDB').table('Tweets').filter(
    r.row.hasFields('retweeted_status')
    .or(
      r.branch(
        r.row.hasFields('extended_tweet'),
        r.and(
          r.row('extended_tweet')('full_text').match("(?i)corrupção").not(),
          r.row('extended_tweet')('full_text').match("(?i)corrupçao").not(),
          r.row('extended_tweet')('full_text').match("(?i)corrupcão").not(),
          r.row('extended_tweet')('full_text').match("(?i)corrupcao").not(),
          r.row('extended_tweet')('full_text').match("(?i)corrupto").not(),
          r.row('extended_tweet')('full_text').match("(?i)corrupta").not()
        ),
        r.and(
          r.row('text').match("(?i)corrupção").not(),
          r.row('text').match("(?i)corrupçao").not(),
          r.row('text').match("(?i)corrupcão").not(),
          r.row('text').match("(?i)corrupcao").not(),
          r.row('text').match("(?i)corrupto").not(),
          r.row('text').match("(?i)corrupta").not()
        )        
      )
    )
  ).delete()
  .run(connection, function(err, result) {
    if (err) {
      console.log('[ERR Rethink] can\'t delete retweets')
      console.log(err)
      return
    }
    console.log(result)
  })
}

conn_open(delete_not_corruption)

//map(function(tweet){
//  return 1
//}).reduce(function(a,b){
//  return a.add(b)
//})
// r.epochTime(r.row('timestamp_ms').coerceTo('number'))

//r.db('TwitterDB').table('Tweets').group(
//  r.epochTime(r.row('timestamp_ms').coerceTo('number').div(1000)).dayOfYear()
//).count()

