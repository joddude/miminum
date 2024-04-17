const config_default = {
  color_scheme: 'dark',
  dim_mode: 'full',
  background_color: '#282828',
  clock_hours_12: false,
  clock_hours_zero: false,
  first_day_of_week: '1',
  clock_seconds: false,
  search_list: 'https://duckduckgo.com/?q={Q}\nhttps://www.google.com/search?q={Q}\nhttps://www.bing.com/search?q={Q}\nhttps://www.qwant.com/?q={Q}\nhttps://yep.com/web?q={Q}',
  search_suggestion_source: 'DuckDuckGo',
  links_list: 'https://mail.google.com/\nhttps://www.inoreader.com/\n-\nhttps://www.youtube.com/\nhttps://spotify.com/',
  bgimage_list: 'https://source.unsplash.com/random/{X}x{Y}/?landscape={R}\nhttps://source.unsplash.com/random/{X}x{Y}/?road={R}',
  bgimage_blur: '0',
  bgimage_autochange: '0',
};

var config;
var clock_timer;
var calendar_timer;
var bgimage_timer;
var bgimage_index = 0;


function init() {
  load_settings();
  apply_settings();
  bgimage();
}

function load_settings() {
  if (localStorage.getItem('miminum_config') != null) {
    config = JSON.parse(localStorage.getItem('miminum_config'));
  } else {
    config = structuredClone(config_default);
  }
  for(var key in config ) {
    let object = document.getElementById(key);
    if (object.type == 'checkbox') {
      object.checked = config[key];
    } else {
      object.value = config[key];
    }
  }
}

function apply_settings() {
  document.querySelectorAll('.config').forEach(function(object) {
    if (object.type == 'checkbox') {
      config[object.id] = object.checked;
    } else {
      config[object.id] = object.value;
    }
  });  
  document.body.style.backgroundColor = config.background_color;
  clearInterval(clock_timer);
  clearInterval(calendar_timer);
  clearInterval(bgimage_timer);
  color_scheme();
  dim_mode();
  links();
  search();
  clock();
  calendar();
  clock_timer = setInterval(clock, 1000);
  calendar_timer = setInterval(calendar, 60*1000);
  if (config.bgimage_autochange != '0') {
    bgimage_timer = setInterval(bgimage, 60000*parseInt(config.bgimage_autochange));
  } else {
    clearInterval(bgimage_timer);
  }
}

function save_settings() {
  localStorage.setItem('miminum_config', JSON.stringify(config));
}

function delete_settings() {
  localStorage.removeItem('miminum_config');
  init();
}

function color_scheme() {
  if (config.color_scheme == 'dark') {
    document.body.classList.replace('light', 'dark');
  } else {
    document.body.classList.replace('dark', 'light');
  }
}

function dim_mode() {
  switch(config.dim_mode) {
  case 'nothing':
    document.querySelectorAll('.dim').forEach(x=>x.classList.replace('dim', 'no-dim'));
    document.getElementById('container').classList.replace('dim', 'no-dim');
    break
  case 'block':
    document.querySelectorAll('.no-dim').forEach(x=>x.classList.replace('no-dim', 'dim'));
    document.getElementById('container').classList.replace('dim', 'no-dim');
    break
  case 'full':
  default:
    document.querySelectorAll('.dim').forEach(x=>x.classList.replace('dim', 'no-dim'));
    document.getElementById('container').classList.replace('no-dim', 'dim');
    break
  }
}

function bgimage() {
  var bgimage_list = config.bgimage_list.split('\n');
  if (bgimage_index > bgimage_list.length-1) bgimage_index = 0;
  if (bgimage_list[bgimage_index] == '') bgimage_index = 0;
  bgimage_url = bgimage_list[bgimage_index];
  bgimage_url = bgimage_url.replace('{R}', Math.random());
  bgimage_url = bgimage_url.replace('{X}', window.screen.width);
  bgimage_url = bgimage_url.replace('{Y}', window.screen.height);
  bgimage_index++;
  if (bgimage_url !== '') {
    document.getElementById('next_bgimage_button').classList.add('loading');
    document.querySelector('.bgimage-hidden').src = bgimage_url;
  } else {
    document.querySelectorAll('.bgimage').forEach(x=>x.classList.replace('bgimage-visible', 'bgimage-hidden'));
  }
}

function bgimage_onload(e) {
  document.getElementById('next_bgimage_button').classList.remove('loading');
  document.querySelector('.bgimage-visible').classList.replace('bgimage-visible', 'bgimage-hidden');
  e.style.filter = 'blur(' + config.bgimage_blur + 'px)';
  e.classList.replace('bgimage-hidden', 'bgimage-visible');
}

function modal_window_open(e) {
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById(e.dataset.modal).classList.remove('hidden');
}

function modal_windows_close() {
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.querySelectorAll('.modal-window').forEach(x=>x.classList.add('hidden'));
}

function links() {
  var links_list = config.links_list.split('\n');
  var links_html = '';
  links_list.forEach(function(url) {
    if (url == '-') {
      links_html += '<hr>';
    } else {
      var url_element = url.match(/https?\:\/\/(?:www\.)*([^\/$]+)/);
      if (url_element !== null) {
        links_html += '<a class="link" href="' + url + '">';
        links_html += '<img src="' + 'https://icons.duckduckgo.com/ip3/' + url_element[1] + '.ico"';
        links_html += 'onerror="this.alt=\'' + url_element[1].charAt(0).toUpperCase() + '\'"/>';
        links_html += url_element[1] + '</a>';
      }
    }
  });
  document.getElementById('links').innerHTML = links_html;
}

function clock() {
  var userLang = navigator.language || navigator.userLanguage; 
  var time_now = new Date();
  var hours = time_now.getHours();
  var minutes = time_now.getMinutes();
  var seconds = time_now.getSeconds();
  if(config.clock_hours_12){
    if(hours > 12){
      hours = hours - 12;
      clock_hours_pm = true;
    }
  }
  if(config.clock_hours_zero){
    if (hours < 10) hours = '0' + hours;
  }
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;
  var clock = hours + ' : ' + minutes;
  if(config.clock_seconds) clock = clock + ' : ' + seconds;
  if(config.clock_hours_12) {
   if(clock_hours_pm) clock = clock + '  PM'
   else clock = clock + '  AM';
  }
  var date = time_now.toLocaleDateString(userLang, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'} );
  document.getElementById('time').innerText = clock;
  document.getElementById('date').innerText = date;
}

function calendar() {
  var userLang = navigator.language || navigator.userLanguage; 
  var time_now = new Date();
  var month_prev = new Date();
  var month_next = new Date();
  month_prev.setMonth(time_now.getMonth()-1, 1);
  month_next.setMonth(time_now.getMonth()+1, 1);
  var cal = '<div class="calendar-month">';
  cal += month_prev.toLocaleDateString(userLang, { month: 'long' });
  cal += month_calendar(month_prev);
  cal += '</div><div class="calendar-month">';
  cal += time_now.toLocaleDateString(userLang, { month: 'long' });
  cal += month_calendar(time_now);
  cal += '</div><div class="calendar-month">';
  cal += month_next.toLocaleDateString(userLang, { month: 'long' });
  cal += month_calendar(month_next);
  cal += '</div>';
  document.getElementById('calendar').innerHTML = cal;
}

function month_calendar(month) {
  var userLang = navigator.language || navigator.userLanguage; 
  var first_day_of_week = parseInt(config.first_day_of_week);
  var time_now = new Date();
  var weekday;
  var last_day_of_week = (first_day_of_week + 6)%7;
  month.setDate(1);
  var cal = '<table><tr>';
  for(var index=first_day_of_week; index < (7 + first_day_of_week); index++) {
    weekday = (index + 7)%7;
    let baseDate = new Date(Date.UTC(2017, 0, 1)); // Sunday
    baseDate.setDate(baseDate.getDate() + weekday);
    let weekday_short = baseDate.toLocaleDateString(userLang, {weekday: 'short'});
    if((weekday == time_now.getDay()) && (month.getMonth() == time_now.getMonth()) && (month.getFullYear() == time_now.getFullYear()))
      cal += '<td><b>' + weekday_short + '</b></td>';
    else cal += '<td>' + weekday_short + '</td>';
  }
  cal += '</tr><tr>';
  for(var index=first_day_of_week; index < month.getDay(); index++) cal += '<td></td>';
  for(var index=0; index < 31; index++) {
    if(month.getDate() > index ) {
      if(month.getDay() == first_day_of_week) cal += '<tr>';
      if((month.getDate() == time_now.getDate()) && (month.getMonth() == time_now.getMonth()) && (month.getFullYear() == time_now.getFullYear()))
        cal += '<td class="today"><b>' + month.getDate() + '</b></td>';
      else cal += '<td>' + month.getDate() + '</td>';
      if(month.getDay() == last_day_of_week) cal += '</tr>';
    }
    month.setDate(month.getDate()+1);
  }
  cal += '</td></tr></table>';
  return cal;
}

function search() {
  var search_list = config.search_list.split('\n');
  var search_buttons_html = '';
  search_list.forEach(function(url, index) {
    var url_element = url.match(/https?\:\/\/(?:www\.)*([^\/$]+)/);
    if (url_element !== null) {
      search_buttons_html += '<button class="button-search" onClick="search_query(this)" ';
      search_buttons_html += 'title="' + url_element[1] + '" data-search=' + index + '>';
      search_buttons_html += '<img src="' + 'https://icons.duckduckgo.com/ip3/' + url_element[1] + '.ico"';
      search_buttons_html += 'onerror="this.alt=\'' + url_element[1].charAt(0).toUpperCase() + '\'"/>';
      search_buttons_html += '</button>';
    }
  });
  document.getElementById('search_buttons').innerHTML = search_buttons_html;
}

function search_query(e) {
  let search_input = document.getElementById('search_input');
  let selected = document.querySelector('.selected');
  if (selected == null) {
    var search_value = search_input.value;
  } else {
    var search_value = selected.dataset.value;
  }
  if (search_value !=='') {
    let search_list = config.search_list.split('\n');
    let search_index = e.dataset.search || 0;
    let search_url = search_list[search_index];
    search_url = search_url.replace('{Q}', search_value);
    location.href = encodeURI(search_url);
  }
}

function search_input_key(event) {
  let search_input = document.getElementById('search_input');
  let selected = document.querySelector('.selected');
  if(event.key=='Enter') search_query(search_input);
  if(event.key == 'ArrowDown') {
    event.preventDefault(); 
    if (selected == null) {
      let first_suggestion = document.getElementById('search_suggestion').firstChild;
      suggestion_select(first_suggestion);
      search_input.value = first_suggestion.dataset.value;
    } else if (selected !== document.getElementById('search_suggestion').lastChild) {
      let next = selected.nextSibling;
      suggestion_select(next);
      search_input.value = next.dataset.value;
    }
  }
  if(event.key == 'ArrowUp') {
    event.preventDefault(); 
    if (selected == document.getElementById('search_suggestion').firstChild) {
      search_input.value = search_input.dataset.value;
      suggestion_select(null);
    } else {
      let previous = selected.previousSibling;
      suggestion_select(previous);
      search_input.value = previous.dataset.value;
    }
  }
}

function search_suggestion() {
  var search_value = document.getElementById('search_input').value;
  document.getElementById('search_input').dataset.value = search_value;
  if (search_value == '') {
    document.getElementById('search_suggestion').innerHTML = '';
    document.getElementById('search_suggestion').style.opacity = 0;
  } else {
    if (config.search_suggestion_source == 'DuckDuckGo') search_suggestion_duckduckgo(search_value);
    if (config.search_suggestion_source == 'Google') search_suggestion_google(search_value);
  }
}

function search_suggestion_show(suggestions) {
  let suggestions_html = '';
  suggestions = suggestions.slice(0, 10);
  suggestions.forEach(function(item, index) {
    suggestions_html += '<div class="suggestion" tabindex="0" ';
    suggestions_html += 'onMousemove="suggestion_select(this)" onMouseout="suggestion_select(null)" onClick="search_query(this)" ';
    suggestions_html += 'data-value="' + item + '">' + item + '</div>';
  document.getElementById('search_suggestion').innerHTML = suggestions_html;
  document.getElementById('search_suggestion').style.opacity = 1;
  })
}

function suggestion_select(e) {
  document.getElementById('search_input').focus();
  document.querySelectorAll('.suggestion').forEach(x=>x.classList.remove('selected'));
  if (e !== null) e.classList.add('selected');
}

async function search_suggestion_duckduckgo(search_value) {
  let suggestions_url = 'https://duckduckgo.com/ac/?q=' + search_value + '&kl=wt-wt';
  let suggestions = [];
  const response = await get_url_cors_bypass(suggestions_url);
  response.forEach(function(item) {
    suggestions.push(item['phrase']);
  })
  search_suggestion_show(suggestions);
}

async function search_suggestion_google(search_value) {
  let suggestions_url = 'https://google.com/complete/search?output=toolbar&client=chrome&q=' + search_value;
  let suggestions = [];
  const response = await get_url_cors_bypass(suggestions_url);
  response[1].forEach(function(item) {
    suggestions.push(item);
  })
  search_suggestion_show(suggestions);
}

function get_url_cors_bypass(url) {
  return new Promise((resolve, reject) => {
    script = document.createElement('script');
    const done = () => {
      document.head.removeChild(script);
      window['autocompleteCallback'] = null;
    };
    window['autocompleteCallback'] = response => {
      done();
      resolve(response);
    };
    script.onerror = () => {
      done();
      reject();
    };
    script.src = url + '&callback=autocompleteCallback';
    document.querySelector('head').appendChild(script);
  })
}

