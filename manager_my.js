app.Manager = (function (_, document, app) {

    var saveEditId;
    var MAX_LINE = 20;
    var reverse = true;


    function Manager(el, options) {
        options = options || {};

        this.storage = new app.Storage(options.type);
        this.storage.load();
        this.el = el;
        return this;
    }

    Manager.prototype = {

        initialize: function () {
            this.initTemplate();
            this.findNodes();
            this.render();
            this.addHandlers();
        },
// сокращения для удобства   
        findNodes: function () {
            this.nodes = {
                lastName: document.getElementById('lastName'),
                firstName: document.getElementById('firstName'),
                age: document.getElementById('age'),
                addButton: document.getElementById('add-button'),
                updateButton: document.getElementById('update-button'),
                saveButton: document.getElementById('save-button'),
                clearButton: document.getElementById('clear-button'),
                goButton: document.getElementById('go-button'),
                filterField: document.getElementById('filter'),
                cancelButton: document.getElementById('cancel-button'),
                table: document.getElementById('table'),
                items: document.getElementsByClassName('list')[0],
                editButton: document.getElementById('edit-button'),
                deleteButton: document.getElementById('delete-button'),


            };
        },
 // добавление обработчиков на события
        addHandlers: function () {
            var thisAddHandlers = this;

            this.nodes.items.addEventListener('click', function (e) {

                if (e.target.classList.contains('fa-pencil')){
                    thisAddHandlers.nodes.addButton.hidden = true;
                    //console.log(thisAddHandlers.nodes.addButton);
                    thisAddHandlers.nodes.updateButton.hidden = false;
                    //console.log(thisAddHandlers.nodes.updateButton);
                    thisAddHandlers.editElement(e.target);
                }  else if (e.target.classList.contains('fa-trash-o')) {
                    thisAddHandlers.removeLine(e.target);
                }
            });

            this.nodes.addButton.addEventListener('click', function (e) {
                e.preventDefault();
                this.addPerson();
            }.bind(this));

            this.nodes.saveButton.addEventListener('click', this.saveItems.bind(this));

            this.nodes.clearButton.addEventListener('click', this.clearItems.bind(this));

            this.nodes.cancelButton.addEventListener('click', this.cancelItems.bind(this));

            this.nodes.goButton.addEventListener('click', this.filter.bind(this));

            this.nodes.table.addEventListener('click', this.sort.bind(this));
          
        },
//создание таблицы
        initTemplate: function () {
            var templateContent = document.getElementById('item');

            this.template = _.template(templateContent.innerHTML);
        },
//заполнение таблицы из сториджа
        render: function () {
            
            var result = this.storage.getData().reduce(function (sum, el) {
                return sum + this.renderItem(el);
            }.bind(this), '');

            this.el.innerHTML = result;
            //console.log('render - ' + result);
            //console.log(result);

        },

        renderItem: function (data) {
            return this.template(data);
        },

//создание обьекта с данными из формы
        addPerson: function() {

            var data = this.storage.getData();

            var person = {
                lastName: this.nodes.lastName.value,
                firstName: this.nodes.firstName.value,
                age: this.nodes.age.value,
                id: this.storage.getData().length + 1,
            };

            if (person.lastName && person.firstName && person.age) {
                this.setItems(person);
                this.resetPersonData();
                this.render();
            } else {
                alert ("You have written wrong data - let's  try again, please");
                this.resetPersonData();
            };

        },
//сброс данных из формы
        resetPersonData: function () {
            this.nodes.lastName.value = '';
            this.nodes.firstName.value = '';
            this.nodes.age.value = '';
        },
//вызов функии сохранения данных в локал сторедж
        saveItems: function () {
            console.log('saveItems');
            this.storage.save();
        },
//добавление элементов(значений) в массив данных (строку таблицы)
        setItems: function (data) {
            if ( this.storage.getData().length < MAX_LINE) {
            this.storage.set(data);
            } else {
            
                var arr = this.storage.getData();
                
                arr.pop();
                 
                this.storage.set(data);
             };
            this.render();
        },
//вызов функции очистки локал сторежд
        clearItems: function () {
            console.log('clearItems');
            this.storage.clearLocalStorage();
            this.render();
        },
//вызов функции очистки темп сторежд
        cancelItems: function () {
            console.log('cancelItems');
            this.storage.cancelTempStorage();
            this.storage.load();
            var result =this.render()
            console.log("cancelItems" + result);
        },
//вызов функции фильтр 
        filter: function (data) {
            console.log('filter');
            this.storage.load();

            var filterList = this.storage.getData();
            var filterElement = this.nodes.filterField.value;

            var columnSearch;

            //определяем наличие или отсутствие ключа

            if (/:/.test(filterElement)) {
                console.log("filterElement.split(:)");
                columnSearch = filterElement.split(':');
            } else {
                columnSearch = filterElement;
                console.log("filterElement");
            };
            //создаем массив из ключей
            var keys = Object.keys(filterList[0]);
            console.log(keys);
            // реализуем функцию фильтрации :
            if (keys.indexOf(columnSearch[0]) == -1) {
                //фильтр при отсутствии ключа
                var filterResult = filterList.filter(function (value, index) {

                    //if (value.firstName.indexOf(filterElement) != -1 || 
                        //(value.lastName.indexOf(filterElement) != -1 || 
                            //value.age.indexOf(filterElement) != -1)){
                        //console.log('without keys');
                       return value.firstName.indexOf(filterElement) != -1 || 
                        (value.lastName.indexOf(filterElement) != -1 || 
                            value.age.indexOf(filterElement) != -1);
                    //} //else {
                        //return false;
                    //}
                });
            } else {
                //фильтр при наличии ключа
                var filterResult = filterList.filter(function (value, index) {
                //console.log( "with keys" + value, columnSearch);
                //if (value[columnSearch[0]].indexOf(columnSearch[1]) != -1){
                    return value[columnSearch[0]].indexOf(columnSearch[1]) != -1;
                //}
                    //return false;
                });   

            }

        this.storage.tempStorage = filterResult;
        this.render();

            
        },
//получение элемента из HTML
        getItemRoot: function (element) {
            console.log("getItemRoot - begin" + element);
            console.log(element);
            while (element.tagName.toLowerCase() != 'tr') {
                element = element.parentNode;
            }

            return element;
            console.log("getItemRoot - end" + element);
            console.log(element);
        },
//удаление строки таблицы
        removeLine: function (removeButton) {
            console.log("removeLine");
            var rootItem = this.getItemRoot(removeButton);
            var currentItem =  rootItem.getAttribute('data-id');
            var arr = this.storage.getData();
                 arr.forEach(function (el, index) {

                 if (el.id == currentItem) {
                     console.log("removeLine index line - " + index);
                   arr.splice (index, 1);
                 }

             });

            this.render();

        },
//редактирование строки таблицы  - вырезание строчки и сохранение ее в массив
        editElement: function(editButton) {
            var editThis = this;

            var rootItem = this.getItemRoot(editButton);
            //console.log("editElement - " + rootItem);
            var currentItem =  rootItem.getAttribute('data-id');
            //console.log("editElement - " + currentItem);
            var arr = this.storage.getData();
            //console.log("arr - " + arr);
            //console.log(arr);
            //var editArr =[];
            var editArr;

                arr.forEach(function (el, index) {

                    if (el.id == currentItem) {
                        //editArr = arr.splice (index, 1);
                        editArr = arr[index];
                        //console.log("editElement index line - " + index);
                        //console.log(editArr);
                        editThis.nodes.lastName.value = editArr.lastName;
                        editThis.nodes.firstName.value = editArr.firstName;
                        editThis.nodes.age.value = editArr.age;
                        editArr = arr.splice (index, 1);
                    }
                });

            
             this.nodes.updateButton.addEventListener('click', function(e) {

                e.preventDefault();
                console.log('updateButton');

                if ((this.nodes.firstName.value) && (this.nodes.lastName.value) && (this.nodes.age.value)) {
                    console.log("if ((this.nodes.firstName.value)");
                    this.addPerson();
                    console.log("this.addPerson();");
                    this.nodes.updateButton.hidden = true;
                    console.log("this.nodes.updateButton.hidden = true;");
                    this.nodes.addButton.hidden = false;
                    console.log("this.nodes.addButton.hidden = false;");
                    this.renderItem();
                    console.log("this.renderItem();");
                    this.render();
                    console.log("this.render();");
                    this.nodes.addButton.hidden = false;
                    console.log("this.nodes.addButton.hidden = false;");
                    this.nodes.updateButton.hidden = true;                    
                };

            } .bind(this));

            this.render();

        },
//сортировка столбцов        
        sort: function (e) {
           

            if (e.target.tagName != 'TH') {
                return;
            }
            // Если TH -- сортируем
            sortTable(e.target.cellIndex, e.target.getAttribute('data-type'));
            //console.log('data-type');

            function sortTable(colNum, type) {
                //console.log('sortTable');

                var tbody = table.getElementsByTagName('tbody')[0];
                // Составить массив из TR (оригинальный вариант)
                var rowsArray = [].slice.call(tbody.rows);
                //console.log('rowsArray - ' + rowsArray);
                console.log(rowsArray);

                // определить функцию сравнения, в зависимости от типа
                var compare;

                switch (type) {
                    //console.log('switch');
                    case 'number':
                    console.log('switch-N');
                        compare = function(rowA, rowB) {
                            console.log('number');
                            return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML;
                            
                            };
                            break;
                    case 'string':
                        console.log('switch=S');
                        compare = function(rowA, rowB) {
                            console.log('switch-string');
                            return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? 1 : -1;
                            };
                            break;

                }

                // сортировать
                rowsArray.sort(compare);
                
                // Убрать tbody из большого DOM документа для лучшей производительности
                table.removeChild(tbody);

                

                if (reverse) {

                    // добавить результат в нужном порядке в TBODY 
                    // они автоматически будут убраны со старых мест и вставлены в правильном порядке
                    for (var i = 0; i < rowsArray.length; i++) {
                        tbody.appendChild(rowsArray[i]);
                    };

                    reverse = false;

                } else {
                    //сортировка в обратном порядке
                    rowsArray.reverse();
                    for (var i = 0; i < rowsArray.length; i++) {
                        tbody.appendChild(rowsArray[i]);
                    }
                    reverse = true;
                }

                table.appendChild(tbody);
            };
                
        }

    };

    return Manager;

} (_, document, app));