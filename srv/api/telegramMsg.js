const config = require('../config');
const http = require('request');
const fetch = require('node-fetch');
module.exports.sendMsg = (req, res) => {

  // FROM ::ffff:192.168.1.10 to 192.168.1.10
  const array = req.ip.split(':');
  const remoteIP = array[array.length - 1];
  const url = `http://ip-api.com/json/` + remoteIP;
  console.log("> URL: " + url);

  const apiCall = async (req) => {
    const res = await fetch(req);
    const data = await res.json();
    console.log(data);
    displayApi(data);
  }

  function displayApi(data) {

    //каждый элемент обьекта запихиваем в массив
    let fields = [
      new Date().toLocaleString(),
      '',
      '<b>ЗАЯВКА</b>',
      '',
      '<b>FROM : </b>' + req.headers['host'],
      '<b>IP : </b>' + remoteIP,
      '<b>NAME : </b>' + req.body.user,
      '<b>MOBILE : </b>' + req.body.mobile,
      '<b>COUNTRY : </b>' + data.city,
      '<b>REGION : </b>' + data.regionName,
      '<b>ZIP : </b>' + data.zip,
      '<b>LAT : </b>' + data.lat,
      '<b>LON : </b>' + data.lon,
      '<b>TIMEZONE : </b>' + data.timezone,
      '<b>ISP : </b>' + data.isp
    ]
    let msg = ''
    //проходимся по массиву и склеиваем все в одну строку
    fields.forEach(field => {
      msg += field + '\n'
    });
    //кодируем результат в текст, понятный адресной строке
    msg = encodeURI(msg)
    //делаем запрос
    http.post(`https://api.telegram.org/bot${config.TLG_BOT}/sendMessage?chat_id=${config.CHAT_ID}&parse_mode=html&text=${msg}`, function (error, response, body) {
      //не забываем обработать ответ
      console.log('> ERROR:', error);
      console.log('> STATUS:', response && response.statusCode);
      console.log('> BODY:', body);
      if (response.statusCode === 200) {
        console.log('TLG - OK');
      }
      if (response.statusCode !== 200) {
        console.log('TLG - NG');
      }
    });

  }

  apiCall(url);

}