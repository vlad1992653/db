
const express = require('express')//подключаем express
//Для установки библиотеки - Express запишем команду в консоль 
//npm install express, нужна для работы фреймворка Express

const mysql2 = require('mysql2/promise');
//Для установки библиотеки -mysql2 запишем команду в консоль 
//npm install mysql2, необходима для работы с базами MY SQL

const bodyParser = require('body-parser');
//Для установки библиотеки - обработчик POST запросов 
//npm install body-parser, необхлдим для обработки POST запросов

const pool = mysql2.createPool({ //создаем соединение и 
//записываем его параметры в объект
  host     : '127.0.0.1',//путь к базе
  user     : 'root',//пользователь
  database : 'phone_book',//название базы
  password : ''//пароль пользователя
});

const app = express()//создаем сервер - app при вызове функции 
 //express из библиотеки фримворка

app.use(bodyParser.urlencoded({extended: true}));//для всех страниц 
//на сервере разблокируем возможность отправки POST запросов 
//метод app.use позволяет перехватывать все необработанные адреса

app.get ('/list', async function (req, res) {//создаем get запрос
//- функция сервера первым параметром которой является путь до 
//исполняемого узла сервера, а второй - асинхронная функция 
//с 2 параметрами - запрос/ответ сервера
const data = await pool.query ('SELECT * FROM `abonents`')
//ключивое солово await заставляет сервер ждать исполнения 
//скрипта правее него - query запрос на сервер - вывести все поля
//с таблицы `abonents`
let list = `<h1>Список абонентов</h1>`//создаем строку 
//с тегом заглавия
let nav1 = `<a href="/search">Поиск</a><hr/>`//создаем строку 
//с тегом ссылки на узел /search - поиск
let result = `<ul>`;//создаем строку с тегом ul
for (let elem of data[0]) {//перебираем массив результата от базы
//	в нулевом элементе запроса объекта data храниься значения SQL
// в виде массива, их можно перебрать циклом
result += `<li>` + `<a href="/abonent-telephones/` + elem.id + `">` + 
elem.name +`</a><a href="/abonent-del/`+ elem.id +`"> Удалить </a></li>`; 
//конкатенируем в строку добляем элемент списка 
//и в него вписываем ссылку (последний элемент - параметр маршрутов 
//url get запрос) с элементами объекта
	}
result += `</ul>`;//закрываем тег ul 
let forma =  `<form action="/add-name" method = "POST">
<input type="text" name="new_abonent" placeholder="Добавить абонента" /> 
<input type="submit" value="Добавить">
</form>`
res.send(list + nav1  + result+ forma);// выводим на сервер
})

app.post ('/add-name', async function (req, res) {
await pool.query ('INSERT INTO `abonents`(`name`) VALUES ("'+ req.body.new_abonent +'")')
res.redirect (`/list`) 
})

app.get ('/abonent-del/:abonent_del', async function (req, res) {
let abonent_del = req.params.abonent_del
await pool.query ('DELETE FROM `telephones` WHERE abonent_id = ' + abonent_del )
await pool.query ('DELETE FROM `abonents` WHERE id = ' + abonent_del )
res.redirect(`/list`) 
})

app.get ('/abonent-telephones/:abonent_id', async function (req, res) {
//создаем get запрос - функция сервера первым параметром которой является 
//путь до исполняемого узла сервера в конце которого стоит параметр маршрутов,
//а второй - асинхронная функция с 2 параметрами - запрос/ответ сервера
let abonent_id = req.params.abonent_id//получаем параметр маршрутов из URL 
let telephones = await pool.query ('SELECT * FROM `telephones` WHERE abonent_id = ?',
 abonent_id)//ключивое солово await заставляет сервер ждать исполнения скрипта 
//правее него - query запрос на сервер - вывести из таблицы `telephones` поля 
//где значение abonent_id равен параметру маршрутов из URL - let abonent_id
let abonent =  await pool.query ('SELECT * FROM `abonents` WHERE id = ?', abonent_id)
//ключивое солово await заставляет сервер ждать исполнения скрипта правее него 
//- query запрос на сервер -  вывести из таблицы `abonents` поля где значения id  = 
// параметру маршрутов из URL - let abonent_id
let abon = `<h1>` + `Телефонные номера абонента-`+ abonent[0][0].name + `</h1>`
//для отображения заглавия узла - тел абонента находим имя абонента и конкатенируем с
//тегом заглавия	
let nav1 = `<a href="/search">Поиск  </a>`//добавляем строку с сылкой на узел поиск
let nav2 = `<a href="/list">На главную</a><hr/>`//добавляем строку с
//сылкой на узел на главную
let result = `<ul>`;//создаем строку с тегом ul
for (let elem of  telephones[0]) {// в массиве telephones[0] лежат объекты с 
//номерами типом и id, перебираем массив и получаем поля данных - объекты
result += `<li>` + elem.type +` | ` +elem.number +`<a href="/remove-telephone/`+ 
elem.id + ` "> Удалить  </a><a href="/change-telephones/`+ elem.id+ ` "> Изменить </a></li>`;
//конкатенируем в строку добляем элемент списка и в него вписываем тип телефона, 
//номер и в конце добавляем ссылку на удаление по id
}
result += `</ul>`;//закрываем тег ul 

let forma =  `<form action="/add-telephone/ `+ abonent_id +`" method = "POST">
<input type="text" name="number" placeholder="Номер телефона" /> 
<input type="text" name="type" placeholder="Тип телефона" />
<input type="submit" value="Добавить">
</form>`//создаем строку с формой отправляющую POST запросы на URL узел абонента
//атрибут  placeholder - заглушка для подписания полей
res.send(abon + nav1 + nav2 + result+ forma);//собираем строки вместе и отправляем 
//на сервер
})

app.get ('/remove-telephone/:remove_id', async function (req, res) {//создаем get запрос
//- функция сервера первым параметром которой является путь до исполняемого узла сервера
//в конце которого стоит параметр маршрутов, а второй - асинхронная функция 
//с 2 параметрами - запрос/ответ сервера
let remove_id = req.params.remove_id //получаем параметр маршрутов из URL 
let telephone = await pool.query ('SELECT * FROM `telephones` WHERE id = ?', remove_id)
//ключивое солово await заставляет сервер ждать исполнения скрипта правее него - 
//query запрос на сервер - вывести все поля из таблицы `telephones` где id = 
//параметру маршрутов из URL - let remove_id
await pool.query ('DELETE FROM `telephones` WHERE  id = ?',  remove_id)
//ключивое солово await заставляет сервер ждать исполнения скрипта правее него - 
//query запрос на сервер - удалить поля в таблице telephones` где id = параметру маршрутов
res.redirect(`/abonent-telephones/`+ telephone[0][0].abonent_id) //производим переадрисацию 
//на страницу (переход на другую страницу) телефонных номеров абонента путем нахождения 
//abonent_id в таблице `telephones` 
})

app.post ('/add-telephone/:abonent_id', async function (req, res) {//создаем POST запрос
//- функция сервера первым параметром которой является путь до исполняемого узла сервера
//в конце которого стоит параметр маршрутов, а второй - асинхронная функция 
//с 2 параметрами - запрос/ответ сервера
let abonent_id = req.params.abonent_id //получаем параметр маршрутов из URL 
await pool.query ('INSERT INTO `telephones` SET ?',  {abonent_id: abonent_id, 
type: req.body.type,  number: req.body.number})//ключивое солово await заставляет 
//сервер ждать исполнения скрипта правее него -  добавить в таьлицу `telephones` в поле 
//abonent_id значение abonent_id - параметр маршрутов из URL, в поле type значение POST 
//запроса из формы - /add-telephone/ поле type, в поле number значение POST 
//запроса из формы - /add-telephone/ поле number
res.redirect (`/abonent-telephones/` + abonent_id) //производим переадрисацию 
//на страницу (переход на другую страницу) телефонных номеров абонента путем нахождения 
//abonent_id из параметра маршрутов из URL 
})

app.get ('/change-telephones/:change_id', async function (req, res) {
let change_id = req.params.change_id
let abonent = await pool.query ('SELECT * FROM `telephones` WHERE id =' + change_id)
let name_abonents = abonent[0][0].abonent_id
let names = await pool.query ('SELECT * FROM `abonents` WHERE id =' + name_abonents)
let abon = `<h1>` + `Телефонный номер абонента - `+ names[0][0].name + `</h1>`
let nav = `<a href="/abonent-telephones/` +  name_abonents +`"> Отмена  </a><hr/>`
let forma =  `<form action="/change/ `+ change_id +`" method = "POST">
<input type="text" name="number" placeholder="Номер телефона" /> 
<input type="text" name="type" placeholder="Тип телефона" />
<input type="submit" value="Изменить">
</form>`
res.send(abon + nav + forma);
})

app.post ('/change/:change_id', async function (req, res) {
let change_id = req.params.change_id
let abonent = await pool.query ('SELECT * FROM `telephones` WHERE id = ?', change_id)
await pool.query ('UPDATE `telephones` SET  type = " '+ req.body.type +' ",  number = " '+ 
req.body.number +' " WHERE  id = '+ change_id)
res.redirect (`/abonent-telephones/` + abonent[0][0].abonent_id) 
})

app.get ('/search',   async function (req, res) {//создаем get запрос
//- функция сервера первым параметром которой является путь до исполняемого узла сервера
//, а второй - асинхронная функция с 2 параметрами - запрос/ответ сервера
let abonent_query = req.query.abonent_query || ''// вводим переменную которая получает
//	get запрос от формы поиска или пустую строку если значения в get запросе нет
let data = await pool.query (`SELECT abonents.name, telephones.number FROM telephones 
JOIN abonents ON  telephones.abonent_id = abonents.id WHERE abonents.name LIKE ?`, 
abonent_query + '%')//ключивое солово await заставляет сервер ждать исполнения скрипта 
//правее него -  вывести  поля name таб. abonents, поля number таб. telephones из 
//связанных таблиц 	telephones и abonents если поле abonent_id таб. telephones = полю id
//таб. abonents и где поле name таб. abonents похоже на введенное значение get запроса 
//с формы
let sear = `<h1>` + `Поиск абонентов`+`</h1>`//создаем строку с тегом загаловка 
let nav = `<a href="/list">На главную</a><hr/>`//создаем строку с тегом ссылки на 
//главную страницу - /list
let forma =  `<form action="/search" method="GET">
<input type="text" name="abonent_query" placeholder="Поиск" value=` + 
(abonent_query ? abonent_query : '') + `><input type="submit" value="Отправить запрос">
</form>`//в строку записываем форму с get запросом в поле поиска - abonent_query 
//в атрибуте значения указываем что если поле не заполнено записать пустую строку 
//если заполнено передать значение от get запроса
let message = `Найдено телефонов -` + `<span>` + data[0].length + `</span>`
//определяем кол-во найденных телефонов определив длинну массива полученных полей 
//обертываем в тег span и в строку
let result = `<ul>`;//создаем строку с тегом ul
for (let elem of data[0]) {//перебираем массив результата от базы
result += `<li>` + elem.name +` | ` +elem.number +`</li>`;//конкатенируем в строку
//передав в result значения элементов объекта - name и number и передав в тег списка
}
result += `</ul>`;//закрываем тег ul 
res.send( sear + nav + forma + message + result);//собираем строки вместе и отправляем 
//на сервер
})

app.listen(3000, function() {//указываем порт сервера 
console.log('СЕРВЕР РАБОТАЕТ (отклик сервера на порт 3000)');//сообщение в консоль сервера
})//выводим в консоль












