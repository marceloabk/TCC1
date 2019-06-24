const csv = require("csvtojson")
const sw = require('stopword')
const ObjectsToCsv = require('objects-to-csv')
const fs = require('fs')

const csvFilePath = './data/tweets.csv'


async function tweets_without_stopwords(path) {
  const jsonArray = await csv().fromFile(path)

  let tweets = []
  let word_array = []
  for (let i = 0; i < jsonArray.length; i++) {
    const tweet = jsonArray[i].text

    // remove urls
    let _tweet = tweet.replace(/https[a-z0-9./:…]+/gi, '')

    // remove pontuaction
    _tweet = _tweet.replace(/[?!.,\/!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g, " ")

    _tweet = mini_spell_checker(_tweet)

    // remove @users
    _tweet = _tweet.replace(/@[a-z0-9_]+ /gi, '')

    const tweet_without_stopwords = sw.removeStopwords(_tweet.split(' '), sw.br)

    word_array = counter(tweet_without_stopwords.join(" "), word_array, jsonArray[i].retweet_count)
    tweets.push({text: tweet_without_stopwords.join(" ")})
  }

  // final word_list
  let word_list = []
  for (const word in word_array) {
    word_list.push({'word': word, 'qty': word_array[word]})
  }
  

  let result = new ObjectsToCsv(tweets)
  await result.toDisk('./data/tweets_without_stopwords.csv')

  let result2 = new ObjectsToCsv(word_list)
  await result2.toDisk('./data/word_count.csv')
}

async function top_users(path) {
  const tweets = await csv().fromFile(path)

  let users = {}
  for (let i = 0; i < tweets.length; i++) {
    const user = tweets[i].user

    if (users[user] === undefined) {
      users[user] = 1
    } else {
      users[user]++
    }
  }
  
  // final mentions
  let final_users = []
  for (const user in users) {
    final_users.push({'user': user, 'posts': users[user]})
  }

  let result = new ObjectsToCsv(final_users)
  await result.toDisk('./data/top_users.csv')
}

async function tweet_entity(path, first_property, second_property) {
  const tweets = await csv().fromFile(path)

  let entity_quantity = {}
  for (let i = 0; i < tweets.length; i++) {
    const tweet_entity = JSON.parse(tweets[i][first_property])
    
    for (let j = 0; j < tweet_entity.length; j++) {      
      let entity = tweet_entity[j][second_property]

      if (entity_quantity[entity] === undefined) {
        entity_quantity[entity] = 1
      } else {
        entity_quantity[entity]++
      }
    }
  }
  
  let final_entities = []
  for (const entity in entity_quantity) {
    let csv_line = {}
    csv_line[first_property] = entity
    csv_line['qty'] = entity_quantity[entity]

    final_entities.push(csv_line)
  }

  let result = new ObjectsToCsv(final_entities)
  await result.toDisk(`./data/entity_${first_property}.csv`)
}


async function get_plataforms(path) {
  const tweets = await csv().fromFile(path)

  let plataforms = {}
  for (let i = 0; i < tweets.length; i++) {
    let plataform = tweets[i].source

    plataform = plataform.match(/>(.*?)</g)[0]
    plataform = plataform.split('>')[1]
    plataform = plataform.split('<')[0]

    if (plataforms[plataform] === undefined) {
      plataforms[plataform] = 1
    } else {
      plataforms[plataform]++
    }
  }
  
  // final mentions
  let final_plataform = []
  for (const plataform in plataforms) {
    final_plataform.push({'plataform': plataform, 'qty': plataforms[plataform]})
  }

  let result = new ObjectsToCsv(final_plataform)
  await result.toDisk('./data/plataforms.csv')
}

async function text_fallowers_retweet(path) {
  const tweets = await csv().fromFile(path)

  let data = []
  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    data.push({user: tweet.user, followers_count: tweet.followers_count, text: tweet.text, retweet_count: tweet.retweet_count})
  }

  let result = new ObjectsToCsv(data)
  await result.toDisk('./data/text_followers_retweet.csv')
}

function counter(text, word_array, retweets) {
  let first_split = text.split('\n')
  let word_list = []
  for (let i = 0; i < first_split.length; i++) {
    const splitted = first_split[i]
    word_list = splitted.split(' ').concat(word_list)
  }

  for (let i = 0; i < word_list.length; i++) {
    let word = word_list[i].toLowerCase()
    word = word.replace("'", '')
    word = word.replace('"', '')
    word = word.replace('”', '')
    word = word.replace('“', '')
    word = word.replace('"', '')

    if (word_array[word] === undefined) {
      word_array[word] = 1
    } else {
      if (retweets != 0) {
        word_array[word] += Number(retweets)
      } else {
        word_array[word]++
      }
    }
  }
  return word_array
}

async function iramuteq(path) {

  const tweets = await csv().fromFile(path)

  let ira_string = ''
  for (let i = 0; i < tweets.length; i++) {
    let text = tweets[i].text
    text = mini_spell_checker(text)

    text = `**** *tweet_0\n\n${text}\n\n`
    ira_string += text
  }
  
  fs.writeFile('./data/iramuteq.txt', ira_string, 'utf8', (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}

function mini_spell_checker(text) {

  text = text.replace(/\n/gi, ' ')
    .replace(/@[a-z0-9_]+ /gi, '')
    .replace(/#/gi, '_')
    .replace(/-(?=\w)/gi, '_')
    .match(/[a-z\u00C0-\u017F0-9.:,?!_ ]/gi)
    .join('')
    .replace(/https[a-z0-9./:…]+/gi, '')
    .replace(/lava jato/gi, 'lava_jato')
    .replace(/corrupcao/gi, 'corrupção')
    .replace(/corrupçao/gi, 'corrupção')
    .replace(/corrupcão/gi, 'corrupção')
    .replace(/corrupsão/gi, 'corrupção')
    .replace(/corrupsao/gi, 'corrupção')
    .replace(/td /gi, 'tudo ')
    .replace(/vc /gi, 'você ')
    .replace(/vcs/gi, 'vocês')
    .replace(/voce /gi, 'você ')
    .replace(/voces /gi, 'vocês ')
    .replace(/oq /gi, 'o que ')
    .replace(/facista/gi, 'fascista')
    .replace(/fasista/gi, 'fascista')
    .replace(/facismo/gi, 'fascismo')
    .replace(/aecio/gi, 'aécio')
    .replace(/ñ/gi, 'não')
    .replace(/qm /gi, 'quem ')
    .replace(/mt /gi, 'muito ')
    .replace(/mto /gi, 'muito ')
    .replace(/fake news/gi, 'fake_news')
    .replace(/homofobico/gi, 'homofóbico')
    .replace(/ to /gi, ' estou ')
    .replace(/tô /gi, 'estou ')
    .replace(/tamo /gi, 'estamos ')
    .replace(/fuder/gi, 'foder')
    .replace(/fudeu/gi, 'fodeu')
    .replace(/hadad/gi, 'haddad')
    .replace(/msm/gi, 'mesmo')
    .replace(/agr /gi, 'agora ')
    .replace(/nao /gi, 'não ')
    .replace(/ so /gi, ' só ')
    .replace(/presidiario/gi, 'presidiário')
    .replace(/tbm/gi, 'também')
    .replace(/tb/gi, 'também')
    .replace(/ngm/gi, 'ninguém')
    .replace(/familia/gi, 'família')
    .replace(/mds/gi, 'meu_deus')
    .replace(/vamo /gi, 'vamos ')
    .replace(/gnt/gi, 'gente')
    .replace(/ pq /gi, ' porque ')
    .replace(/antipetista/gi, 'anti_petismo')
    .replace(/antipetismo/gi, 'anti_petismo')
    .replace(/anti_pt/gi, 'anti_petismo')
    .replace(/ptista /gi, 'petista ')
    .replace(/ anti /gi, ' anti_')
    .replace(/ cês/gi, 'vocês')
    .replace(/odio/gi, 'ódio')
    .replace(/ pm /gi, 'polícia_militar')
    .replace(/parabens/gi, 'parabéns')
    .replace(/renan calheiros/gi, 'renan_calheiros')
    .replace(/ vao /gi, ' vão ')
    .replace(/ tao /gi, ' tão ')
    .replace(/ ja /gi, ' já ')
    .replace(/ milhoes /gi, ' milhões ')
    .replace(/(k)\1+/gi, '')
    .replace(/(ha)\1+/gi, '')
    .replace(/ +(?= )/gi, '')
    .toLowerCase()

  return text;
}

tweets_without_stopwords(csvFilePath)
top_users(csvFilePath)
tweet_entity(csvFilePath, 'user_mentions', 'screen_name')
tweet_entity(csvFilePath, 'urls', 'expanded_url')
tweet_entity(csvFilePath, 'hashtags', 'text')
get_plataforms(csvFilePath)
text_fallowers_retweet(csvFilePath)
iramuteq(csvFilePath)