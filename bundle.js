(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DisplayComponent;
function DisplayComponent(el, bus, type) {
  this.el = el;
  this.bus = bus;
  this.type = type;
  this.displayWrapper = document.createElement('div');
  this.displayWrapper.className = 'displayWrapper';
  this.controlsWrapper = document.createElement('div');
  this.controlsWrapper.className = 'controlsWrapper';
  this.historyWrapper = document.createElement('div');
  this.historyWrapper.className = 'historyWrapper';
  this.fieldSizeWrapper = document.createElement('div');
  this.fieldSizeWrapper.className = 'fieldSizeWrapper';
  this.paused = true;
  this.el.appendChild(this.displayWrapper);
  this.el.appendChild(this.controlsWrapper);
  this.el.appendChild(this.historyWrapper);
  this.el.appendChild(this.fieldSizeWrapper);
  this.cellSide = 30;
}

DisplayComponent.prototype.render = function (field) {
  this.displayWrapper.innerHTML = '';
  if (this.type === 'text') {
    var table = document.createElement('table');
    var tb = '';
    for (var i = 0; i < field.length; i++) {
      tb += '<tr>';
      for (var j = 0; j < field[0].length; j++) {
        if (field[i][j] == '_') {
          tb += '<td class="' + i + ';' + j + '">' + ' ' + '</td>';
        } else {
          tb += '<td class="' + i + ';' + j + '">' + field[i][j] + '</td>';
        }
      }
      tb += '</tr>';
    }
    table.innerHTML = tb;
    this.displayWrapper.appendChild(table);
  } else if (this.type === 'canvas') {
    var canvas = document.createElement('canvas');
    canvas.width = field[0].length * this.cellSide;
    canvas.height = field.length * this.cellSide;
    var context = canvas.getContext('2d');
    context.fillStyle = 'rgb(200, 0, 0)';
    var currentX = 0;
    var currentY = 0;
    for (var i = 0; i < field.length; i++) {
      currentX = 0;
      for (var j = 0; j < field[0].length; j++) {
        if (field[i][j] == '*') {
          context.fillRect(currentX, currentY, this.cellSide, this.cellSide);
        }
        currentX += this.cellSide;
      }
      currentY += this.cellSide;
    }
    this.displayWrapper.appendChild(canvas);
  } else if (this.type === 'svg') {
    var SVG_NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', field[0].length * this.cellSide);
    svg.setAttribute('height', field.length * this.cellSide);
    var wrapper = document.createElementNS(SVG_NS, 'rect');
    wrapper.setAttribute('class', 'svgWrapper');
    svg.appendChild(wrapper);
    var currentX = 0;
    var currentY = 0;
    for (var i = 0; i < field.length; i++) {
      currentX = 0;
      for (var j = 0; j < field[0].length; j++) {
        if (field[i][j] == '*') {
          var rect = '\n            <rect \n              x="' + currentX + '"\n              y="' + currentY + '"\n              width="' + this.cellSide + '"\n              class="inner-square"\n            />';
          svg.innerHTML += rect;
        }
        currentX += this.cellSide;
      }
      currentY += this.cellSide;
    }
    this.displayWrapper.appendChild(svg);
  }
  this.addCellListeners();
};

DisplayComponent.prototype.addCellListeners = function () {
  var _this = this;

  if (this.type === 'text') {
    var table = this.displayWrapper.querySelector('table');
    table.addEventListener('click', function (event) {
      if (event.target.tagName.toLowerCase() === 'td') {
        _this.bus.trigger('cellClick', event.target.className.split(';'));
      }
    });
  }
  if (this.type === 'canvas') {
    var canvas = this.displayWrapper.querySelector('canvas');
    canvas.addEventListener('click', function (event) {
      var rect = canvas.getBoundingClientRect();
      var i = event.clientY - rect.top;
      var j = event.clientX - rect.left;
      _this.bus.trigger('cellClick', [Math.floor(i / _this.cellSide), Math.floor(j / _this.cellSide)]);
    });
  }
  if (this.type === 'svg') {
    var svg = this.displayWrapper.querySelector('svg');
    svg.addEventListener('click', function (event) {
      var i = event.offsetY;
      var j = event.offsetX;
      _this.bus.trigger('cellClick', [Math.floor(i / _this.cellSide), Math.floor(j / _this.cellSide)]);
    });
  }
};

DisplayComponent.prototype.addControls = function () {
  var _this2 = this;

  this.controlsWrapper.innerHTML = '';
  var slowerButton = document.createElement('button');
  slowerButton.className = 'slowerButton';
  slowerButton.innerHTML = '|<<';
  var PPButton = document.createElement('button');
  if (this.paused === true) {
    PPButton.innerHTML = '>';
  } else {
    PPButton.innerHTML = '||';
  }
  PPButton.className = 'PPButton';
  var fasterButton = document.createElement('button');
  fasterButton.className = 'fasterButton';
  fasterButton.innerHTML = '>>|';
  this.controlsWrapper.className = 'controlsWrapper';
  this.controlsWrapper.appendChild(slowerButton);
  this.controlsWrapper.appendChild(PPButton);
  this.controlsWrapper.appendChild(fasterButton);
  if (!this.listenerAdded) {
    this.controlsWrapper.addEventListener('click', function (event) {
      if (event.target.tagName.toLowerCase() === 'button') {
        if (event.target.className === 'slowerButton') {
          _this2.bus.trigger('slowerClick');
          return;
        }
        if (event.target.className === 'PPButton') {
          _this2.bus.trigger('switchClick');
          return;
        }
        if (event.target.className === 'fasterButton') {
          _this2.bus.trigger('fasterClick');
          return;
        }
      }
      _this2.bus.trigger('rerenderRequest');
    });
    this.listenerAdded = true;
  }
};

DisplayComponent.prototype.changePPButton = function (text) {
  var PPButton = this.controlsWrapper.querySelector('.PPButton');
  if (PPButton) {
    PPButton.innerHTML = text;
  }
};

DisplayComponent.prototype.addHistory = function () {
  var _this3 = this;

  this.historyWrapper.innerHTML = '';
  var input = document.createElement('input');
  input.setAttribute('type', 'range');
  input.setAttribute('min', 0);
  input.setAttribute('max', this.bus.maxHistory);
  input.className = 'range';
  this.historyWrapper.appendChild(input);
  input.addEventListener('input', function () {
    _this3.bus.trigger('historyChange', input.value);
  });
};

DisplayComponent.prototype.addFieldSize = function () {
  var _this4 = this;

  this.fieldSizeWrapper.innerHTML = '';
  var selectX = document.createElement('select');
  selectX.innerHTML = '<option value="5"> 5 </option>\n                       <option value="10"> 10 </option>\n                       <option value="15"> 15 </option>';
  var selectY = document.createElement('select');
  selectY.innerHTML = '<option value="5"> 5 </option>\n                       <option value="10"> 10 </option>\n                       <option value="15"> 15 </option>';
  var button = document.createElement('button');
  button.innerHTML = 'create new field';
  this.fieldSizeWrapper.appendChild(selectX);
  this.fieldSizeWrapper.appendChild(selectY);
  this.fieldSizeWrapper.appendChild(button);
  button.addEventListener('click', function () {
    _this4.bus.trigger('fieldSizeChange', [+selectX.value, +selectY.value]);
  });
};

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventBus;
function EventBus() {}

EventBus.prototype.on = function (eventName, cb) {
  if (!this[eventName]) {
    this[eventName] = [];
  }
  this[eventName].push(cb);
};
EventBus.prototype.off = function (eventName, cb) {
  this[eventName] = this[eventName].filter(function (func) {
    return func !== cb;
  });
};
EventBus.prototype.trigger = function (eventName, arg) {
  if (this[eventName]) {
    this[eventName].forEach(function (cb) {
      cb(arg);
    });
  }
};
EventBus.prototype.once = function (eventName, cb) {
  var wrapper = function (arg) {
    this.off(eventName, wrapper);
    return cb(arg);
  }.bind(this);
  this.on(eventName, wrapper);
};

},{}],3:[function(require,module,exports){
'use strict';

var _event_bus = require('./event_bus.js');

var _event_bus2 = _interopRequireDefault(_event_bus);

var _router = require('./router.js');

var _router2 = _interopRequireDefault(_router);

var _menu = require('./menu.js');

var _menu2 = _interopRequireDefault(_menu);

var _display_component = require('./display_component.js');

var _display_component2 = _interopRequireDefault(_display_component);

var _life_game = require('./life_game.js');

var _life_game2 = _interopRequireDefault(_life_game);

var _render_about = require('./render_about.js');

var _render_about2 = _interopRequireDefault(_render_about);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var body = document.querySelector('body');
var contentEl = document.querySelector('#content');
var menuWrapper = document.querySelector('#menuWrapper');
var eventBus = new _event_bus2.default();
var display = new _display_component2.default(contentEl, eventBus, 'text');
var about = new _render_about2.default(contentEl);
var field = [];
for (var i = 0; i < 10; i++) {
  field[i] = ['_', '*', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'];
}
var game = new _life_game2.default(field, eventBus);

eventBus.on('cellClick', function (coords) {
  game.switchCell(coords[0], coords[1]);
});

eventBus.on('switchClick', function () {
  game.switchGameState();
  if (game.paused) {
    display.changePPButton('>');
  } else {
    display.changePPButton('||');
  }
});

eventBus.on('rerenderRequest', function () {
  display.render(game.currentState);
  display.addHistory();
});

eventBus.on('fasterClick', function () {
  game.changeSpeed('+');
  game.switchGameState(); //redrawing
  game.switchGameState();
});

eventBus.on('slowerClick', function () {
  game.changeSpeed('-');
  game.switchGameState();
  game.switchGameState();
});

eventBus.on('fieldSizeChange', function (sizeArray) {
  game.pauseGame();
  display.changePPButton('>');
  field = [];
  for (var i = 0; i <= sizeArray[0]; i++) {
    var line = [];
    for (var j = 0; j <= sizeArray[1]; j++) {
      line.push('_');
    }
    field.push(line);
  }
  game = new _life_game2.default(field, eventBus);
  eventBus.trigger('rerenderRequest');
});

eventBus.on('historyChange', function (position) {
  game.pauseGame();
  display.changePPButton('>');
  //position is string so not strict comparison used
  var newArray = [];
  game.history[position].forEach(function (line, index) {
    newArray[index] = line.slice();
  });
  game.currentState = newArray;
  display.render(game.currentState);
});

var router = new _router2.default({
  routes: [{
    name: 'text',
    match: 'text',
    onEnter: function onEnter() {
      display.type = 'text';
      display.render(game.currentState);
      display.addControls();
      display.addHistory();
      display.addFieldSize();
    }
  }, {
    name: 'canvas',
    match: 'canvas',
    onEnter: function onEnter() {
      display.type = 'canvas';
      display.render(game.currentState);
      display.addControls();
      display.addHistory();
      display.addFieldSize();
    }
  }, {
    name: 'svg',
    match: 'svg',
    onEnter: function onEnter() {
      display.type = 'svg';
      display.render(game.currentState);
      display.addControls();
      display.addHistory();
      display.addFieldSize();
    }
  }, {
    name: 'about',
    match: 'about',
    onEnter: function onEnter() {
      game.pauseGame();
      display.changePPButton('||');
      about.render();
      console.log('about');
    },
    onLeave: function onLeave() {
      document.querySelector('.aboutWrapper').innerHTML = '';
    }
  }]
});

var menu = new _menu2.default(menuWrapper, eventBus, { text: 'Text', canvas: 'Canvas', svg: 'SVG', about: 'about' });
menu.render();
menu.addListener();
window.location.hash = 'about';

},{"./display_component.js":1,"./event_bus.js":2,"./life_game.js":4,"./menu.js":5,"./render_about.js":6,"./router.js":7}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LifeGame;
function LifeGame(startingField, bus) {
  this.currentState = startingField;
  this.history = [];
  this.paused = true;
  this.speed = 500;
  this.bus = bus;
  this.bus.maxHistory = 0;
  var tmp = [];
  startingField.forEach(function (line, index) {
    tmp[index] = line.slice();
  });
  this.history.push(tmp);
}

LifeGame.prototype = {
  getNeighbours: function getNeighbours(i, j) {
    return [[i - 1, j - 1], [i - 1, j], [i - 1, j + 1], [i, j - 1], [i, j + 1], [i + 1, j - 1], [i + 1, j], [i + 1, j + 1]];
  },
  nextGen: function nextGen() {
    var field = [];
    this.currentState.forEach(function (line, index) {
      field[index] = line.slice();
    });
    var livingNeighbours = 0;
    var neighbourArray;
    for (var i = 0; i < field.length; i++) {
      for (var j = 0; j < field[i].length; j++) {
        neighbourArray = this.getNeighbours(i, j);
        neighbourArray.forEach(function (item) {
          if (field[item[0]] && field[item[1]]) {
            if (field[item[0]][item[1]] === '*' || field[item[0]][item[1]] === '-') {
              livingNeighbours++;
            }
          }
        });
        if (field[i][j] === '*' && (livingNeighbours > 3 || livingNeighbours < 2)) {
          field[i][j] = '-';
        }
        if (field[i][j] === '_' && livingNeighbours === 3) {
          field[i][j] = '+';
        }
        livingNeighbours = 0;
      }
    }
    for (var i = 0; i < field.length; i++) {
      for (var j = 0; j < field[i].length; j++) {
        if (field[i][j] === '-') {
          field[i][j] = '_';
        }
        if (field[i][j] === '+') {
          field[i][j] = '*';
        }
      }
    }
    this.currentState = field;
    var newArray = [];
    this.currentState.forEach(function (line, index) {
      newArray[index] = line.slice();
    });
    this.history.push(newArray);
    this.bus.maxHistory += 1;
  },
  switchCell: function switchCell(i, j) {
    if (this.currentState[i][j] === '_') {
      this.currentState[i][j] = '*';
    } else if (this.currentState[i][j] === '*') {
      this.currentState[i][j] = '_';
    }
    this.bus.trigger('rerenderRequest');
  },
  switchGameState: function switchGameState() {
    if (this.paused) {
      this.startGame();
    } else {
      this.pauseGame();
    }
  },
  pauseGame: function pauseGame() {
    this.paused = true;
    clearInterval(this.intervalId);
  },
  startGame: function startGame() {
    var _this = this;

    this.intervalId = setInterval(function () {
      _this.nextGen();
      _this.bus.trigger('rerenderRequest');
    }, this.speed);
    this.paused = false;
  },
  changeSpeed: function changeSpeed(value) {
    if (value === '+') {
      if (this.speed > 100) {
        this.speed -= 100;
      }
    }
    if (value === '-') {
      if (this.speed <= 1000) {
        this.speed += 100;
      }
    }
  }
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Menu;
function Menu(element, eventBus, routes) {
  this.routes = routes;
  this.eventBus = eventBus;
  this.element = element;
  this.menuEl = document.createElement('div');
}

Menu.prototype = {
  render: function render() {
    var tmp;
    for (var key in this.routes) {
      tmp = document.createElement('button');
      tmp.setAttribute('class', 'link:' + key);
      tmp.innerHTML = this.routes[key];
      this.menuEl.appendChild(tmp);
    }
    this.element.appendChild(this.menuEl);
  },
  addListener: function addListener() {
    var _this = this;

    this.menuEl.addEventListener('click', function (e) {
      if (e.target.tagName.toLowerCase() === 'button') {
        _this.menuEl.querySelectorAll('button').forEach(function (button) {
          return button.classList.remove('current');
        });
        e.target.classList.add('current');
        var newHash = e.target.getAttribute('class').split(':')[1].split(' ')[0];
        window.location.hash = newHash;
      }
    });
  }
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AboutPage;
function AboutPage(el) {
  this.el = el;
  this.aboutWrapper = document.createElement('div');
  this.aboutWrapper.className = 'aboutWrapper';
  this.el.appendChild(this.aboutWrapper);
}

AboutPage.prototype.render = function () {
  this.clearElements();
  this.aboutWrapper.innerHTML = '<ul>\n                                  <li>Conway\'s  Game of Life SPA by Igor Terechtchenko, 2018</li>\n                                  <li> <a href=https://en.wikipedia.org/wiki/Conway\'s_Game_of_Life>Background and rules</a></li>\n                                  <li> <a href=https://github.com/IgorTerechtchenko/js--base-course/tree/08/08/ht/IgorTerechtchenko> App\'s github page </li>\n                                  </ul>';
};

AboutPage.prototype.clearElements = function () {
  var divs = this.el.querySelectorAll('div');
  divs.forEach(function (div) {
    div.innerHTML = '';
  });
};

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HashRouter;
function HashRouter(options) {
  options = options || {};
  this.routes = options.routes || [];
  this.handleUrl(getHash());
  window.addEventListener('hashchange', function () {
    this.handleUrl(getHash());
  }.bind(this));
}

HashRouter.prototype = {
  handleUrl: function handleUrl(url) {
    var _this = this;

    var routes = this.routes || [];
    var result = findRoute(routes, url);
    var route = result[0];
    var params = result[1];
    if (!route) {
      return;
    }

    Promise.resolve().then(function () {
      if (_this.prevRoute && _this.prevRoute.onLeave) {
        return _this.prevRoute.onLeave.call(_this.prevRoute, _this.prevParams);
      }
    }).then(function () {
      if (route.onBeforeEnter) {
        return route.onBeforeEnter.call(route, params);
      }
    }).then(function () {
      _this.prevRoute = route;
      _this.prevParams = params;
      if (route.onEnter) {
        return route.onEnter.call(route, params);
      }
    });
  }
};

function getHash() {
  return decodeURI(window.location.hash).slice(1);
}

function findRoute(routeList, url) {
  var result = [null, null];
  routeList.forEach(function (route) {
    if (result[0]) {
      return;
    }
    if (route.match === url) {
      result = [route, url];
    } else if (route.match instanceof RegExp && route.match.test(url)) {
      result = [route, url.match(route.match)];
    } else if (typeof route.match === 'function' && route.match.call(this, url)) {
      result = [route, route.match.call(this, url)];
    }
  });
  return result;
}

},{}]},{},[3]);
