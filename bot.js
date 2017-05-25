import walk from 'walk'
import fs from 'fs'

import {parse} from './parse'

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '318693963:AAF9Vz-Qy1FPLjpy84pZeHSssqEwC6_IP3g';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
// bot.onText(/\/help (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message
//
//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"
//
//   // send back the matched "whatever" to the chat
//   //bot.sendMessage(chatId, resp);
//   bot.sendMessage(chatId,)
// });


// bot.onText(/\/stat (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message
//
//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"
//
//   // send back the matched "whatever" to the chat
//   //bot.sendMessage(chatId, resp);
//   bot.sendMessage(chatId, `
//     статистика
//   `)
// });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  console.log(msg.text);

  var an = 'да да... я тут.. набери /help , чтобы увидеть список команд... Чтобы увидеть карточки зайди на amgame.ga'

  if(msg.text.indexOf('$') != -1){
    an = 'карточка успешно добавлена!'
    const walker = walk.walk("./dics/");
    var ar = [];
    walker.on("file", (root, fileStats, next)=> {
      if( fileStats.name.split('.')[0] == 'test' ) { // ТУТ ВАЖНО ЗАМЕНИЬ тест файл
        fs.readFile("./dics/" + fileStats.name, 'utf-8' , (err, data)=> {
          let d = parse(data);
          if(d){
            d.push({
              lean: msg.text.split('$')[0].trim() ,
              answer: msg.text.split('$')[1].trim() ,
              s: 0,
              q: 0,
              t: (new Date()).getTime()
            })
          }
          if(!err && d){
            fs.writeFile(`./dics/${"test"}.json`,
              JSON.stringify(d),
              er=> bot.sendMessage(chatId, er ? er : an) );
          }else{
            res.json({error: 1});
          }
        });
      }else{
        next();
      }
    });
    walker.on("errors", (root, nodeStatsArray, next)=> bot.sendMessage(chatId, 'ошибка на сервере') );
    walker.on("end", _=> bot.sendMessage(chatId, 'шото файл не найден') );


  }else{
    switch (msg.text) {
      case '/help':
        an =  `Привет, я amgame бот. С помощью меня ты сможешь добавить карточки для изучения слов/фраз и посмотреть статистику по карточкам. Чтобы добавить карточку отправь мне сообщение в формате: hello $ привет (первое изучаемое слово/фраза, второе перевод). Чтобы отследить статистику по всем карточкам отправь мне команду /stat`
        break;
      case '/stat':
          const walker = walk.walk("./dics/");
          walker.on("file", (root, fileStats, next)=> {
            if( fileStats.name.split('.')[0] == "test" ) {
              fs.readFile("./dics/" + fileStats.name, 'utf-8' , (err, data)=> {
                var d = parse(data)
                if(d){
                  var mes = '';
                  mes+='Всего карточек '+d.length+'\n';
                  var q = 0;
                  var s = 0;
                  for(var i in d){
                    q+=parseInt(d[i].q)
                    s+=parseFloat(d[i].s)
                  }
                  mes+='Всего ответов: '+q+'\n';
                  mes+='Средний бал: '+Math.floor(s/d.length) + '%';
                  bot.sendMessage(chatId,mes);
                }else{
                  bot.sendMessage(chatId,'что-то по письке пошло')
                }

              });
            }else{
              next();
            }
          });
      //walker.on("errors", (root, nodeStatsArray, next)=> next() );
      //walker.on("end", _=> res.json(ar) );
        break;
      default:
        bot.sendMessage(chatId, an);
    }
  }

  // send a message to the chat acknowledging receipt of their message

});

export default bot;
