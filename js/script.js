function callback() {
  if (fileControl.files.length > 0) { //если кол-во выбранных файлов больше 0
    file = fileControl.files[0];
    partNumber = []; //массив для хранения номера зап. части
    quantity = []; //массив для хранения кол-ва
    var reader = new FileReader();
    reader.onload = function(event) {
      var contents = event.target.result;
      var lines = contents.split('\n'); //разбиваем содержимое файла на строки
      j = 0;
      for (var line = 0; line < lines.length - 1; line++) { //последняя строка пустая
		console.log(lines[line]);
        lineItems = lines[line].split('\t'); //разбиваем строки на значения разделенные табуляцией
        qty = parseFloat(lineItems[9]);
        if ((lineItems[2].substring(0, 2) === 'FO') && (parseFloat(lineItems[9]) >= 1)) { //фильтр по группе товаров и количеству (>0)
			console.log(lineItems[4]);
          if ((lineItems[4] !== 'Вт') && (lineItems[4] !== 'Бр')) { //отфильтровываем склады Брак и Витрина
            if (lineItems[0].length != 6) { //отфильтровываем 6-ти значные номера 
              if ((lineItems[0].length == 8) && (lineItems[0].substring(7) == "F")) { //отсекаем букву F на конце и номеров формата XXXXXXXF
                partNumber[j] = lineItems[0].replace("F", "");
              }
			  else if (lineItems[0] == '9L8Z1177DF') { //не стандартный случай
                partNumber[j] = lineItems[0].replace("F", "");
              }
			  else {
                partNumber[j] = lineItems[0];
              }
              quantity[j] = parseFloat(lineItems[9]); // округляем кол-во до целых
			  if (partNumber[j] == partNumber[j-1] ){ //проверка на задвоение номеров
				  console.log('задвоение:',partNumber[j]);
				  quantity[j-1]=quantity[j-1]+quantity[j] // суммируем кол-во задвоеных номеров
				  j--;
			  }
              j++;
            }
          }
        }
      }
      result_data = 'Количество найденных строк:'+j+'<br/><table border="1">'; //переменная для вывода результата на страницу
      result_data_csv = ""; //переменная для вывода результата в файл
      for (var i = 0; i < j; i++) { //выводим полученный результат
        result_data = result_data + "<tr><td>" + partNumber[i] + "</td><td>" + quantity[i] + "</td></tr>";
        result_data_csv = result_data_csv + partNumber[i] + ";" + quantity[i] + ";\n"
      }
      result_data = result_data + '</table>';
      var blob = new Blob([result_data_csv], {
        type: "text/csv;charset=utf-8"
      });
      saveAs(blob, "act.csv");
      document.querySelector(".content").innerHTML = result_data;
    };
    reader.onerror = function(event) {
      console.error("Файл не может быть прочитан! код " + event.target.error.code);
    };
    reader.readAsText(file, 'Windows-1251'); //важно указать правильную кодировку обрабатываемого файла
  }
}

function init() {
  importButton = document.querySelector(".import-button");
  fileControl = document.querySelector(".stock-file");
  if (importButton.addEventListener) {
    importButton.addEventListener("click", callback, false); //Modern browsers
  }
  else if (importButton.attachEvent) {
    importButton.attachEvent('onclick', callback); //Old IE
  }
}
document.addEventListener("DOMContentLoaded", function() {
  init();
}, false);
