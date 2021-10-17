//Här använder vi localStorage för att styra vår lagring
//Finns några todos lagrade laddas dessa in, annars skapar vi en ny array
//Vid varje uppdatering sparas alla todos till localStorage via "save:"
let todoList;
let todoStorage = {
  load: function () {
    if (localStorage.getItem('todo')) {
      todoList = JSON.parse(localStorage.getItem('todo'));
    } else {
      todoList = [];
    };
    todoList.forEach((todo, index) => {
      todo.id = index;
    });
    todoStorage.uid = todoList.length;
    return todoList;
  },

  save: function (todoList) {
    localStorage.setItem('todo', JSON.stringify(todoList));
  }
};

//Skapa filter för filtrering av färdiga eller ofärdiga todos
//Denna filtrering används även av hashChange
var filters = {
  all: function (todoList) {
    return todoList;
  },
  active: function (todoList) {
    return todoList.filter(function (todo) {
      return !todo.completed;
    });
  },
  completed: function (todoList) {
    return todoList.filter(function (todo) {
      return todo.completed;
    });
  }
};

//Här initierar vi vår applikation
const app = new Vue({

  //Här sätter vi vår grunddata, laddar in eventuella todos
  data: {
    todoList: todoStorage.load(),
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  },

  //Här bevakar vi förändringar i vår todoList, och sparar dessa till localStorage om så sker
  //"deep:" sätts till true för att Vue ska kunna leta förändringar inuti arrayen
  watch: {
    todoList: {
      handler: function (todoList) {
        todoStorage.save(todoList);
      },
      deep: true
    }
  },

  //Här beräknas de listobjekt som ska visas upp i GUI't
  //"computed:" känner av varje gång förändringar sker så GUI't uppdateras
  computed: {
    filteredTodoList: function () {
      return filters[this.visibility](this.todoList);
    },
    remaining: function () {
      return filters.active(this.todoList).length;
    },
    allDone: {
      get: function () {
        return this.remaining === 0;
      },
      set: function (value) {
        this.todoList.forEach(function (todo) {
          todo.completed = value;
        });
      }
    }
  },

  //Här håller vi koll på om vi har något annat än "1 item" och isåfall gör om till "items"
  filters: {
    checkIfPlural: function (n) {
      return n === 1 ? "item" : "items";
    }
  },

  //Här ligger våra metoder som skapar, ändrar eller tar bort en todo
  methods: {

    //Vi kollar att det finns ett faktiskt värde och isåfall lägger till med unikt id, värde och "status"
    //trim() för att ta bort oavsiktliga mellanslag före och efter, eller för att inte lägga till en tom todo
    addTodo: function () {
      var value = this.newTodo.trim();
      if (!value) {
        return;
      }
      this.todoList.push({
        id: todoStorage.uid++,
        title: value,
        completed: false
      });
      this.newTodo = "";
    },

    deleteTodo: function (todo) {
      this.todoList.splice(this.todoList.indexOf(todo), 1);
    },

    //Trigga följande vid dubbelklick
    //Skapa en variabel som håller koll på ursprungsvärdet vid avbruten redigering "beforeEditCache"
    editTodo: function (todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    //Körs vid enter eller musklick utanför editrutan, todo raderas vid tom sträng
    doneEdit: function (todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.deleteTodo(todo);
      }
    },

    //Körs vid esc
    cancelEdit: function (todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    //Rensar färdiga todos ur arrayen genom att skriva över arrayen med en "filtrerad" array
    deleteCompleted: function () {
      this.todoList = filters.active(this.todoList);
    }
  },

  //Funktion för att lägga fokus på editrutan vid dubbelklick
  directives: {
    "todo-focus": function (el, binding) {
      if (binding.value) {
        el.focus();
      }
    }
  }
});

//Skapa hashlänkar baserade på filtren
function onHashChange() {
  var visibility = window.location.hash.replace(/#\/?/, "");
  if (filters[visibility]) {
    app.visibility = visibility;
  } else {
    window.location.hash = "";
    app.visibility = "all";
  }
}

//Lägg till en eventlistener för onHashChange
window.addEventListener("hashchange", onHashChange);
onHashChange();

app.$mount(".todoapp");