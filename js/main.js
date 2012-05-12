/*
 * In-browser CoffeeScript REPL
 * 
 * written by Larry Ng
 */

$(function () {
  
  var $output = $('#output');
  var $input = $('#input');
  var $prompt = $('#prompt');
  var $inputdiv = $('#inputdiv');
  var $inputl = $('#inputl');
  var $inputr = $('#inputr');
  var $inputcopy = $('#inputcopy');
  
  var HISTORY = [];
  var HISTORY_I = -1;
  var SAVED = "";
  var MULTILINE = false;
  
  var print = function (s) {
    s = s || " ";
    $output[0].innerHTML += '<pre>' + s + '</pre>';
  }
  
  var grabInput = function () {
    var tmp = $input.val();
    $input.val('');
    return tmp;
  }
  
  var processSaved = function () {
    try {
      compiled = CoffeeScript.compile(SAVED);
      compiled = compiled.slice(14, compiled.length-17);
      value = eval.call(window, compiled);
      window['$_'] = value;
      output = String(value);
    } catch (e) {
      if (e.stack) {
        output = e.stack;
        
        // FF doesn't have Error.toString() as the first line of Error.stack
        // while Chrome does.
        if (output.split('\n')[0] !== e.toString()) {
          output = e.toString() + '\n' + e.stack;
        }
      } else {
        output = e.toString();
      }
    }
    SAVED = "";
    print(output);
  }
  
  var setPrompt = function (multi) {
    var s = multi ? "------" : "coffee";
    $prompt.html(s + '&gt;&nbsp;');
  }
  
  var addToSaved = function (s) {
    if (s[s.length-1] === '\\') {
      SAVED += s.substring(0, s.length-1);
    } else {
      SAVED += s;
    }
    addToHistory(s);
    SAVED += '\n';
  }
  
  var addToHistory = function (s) {
    HISTORY.unshift(s);
    HISTORY_I = -1;
  }
  
  var resizeInput = function (e) {
    // using the invisible div trick
    // see: http://www.impressivewebs.com/textarea-auto-resize/
    
    var width = $inputdiv.width() - $inputl.width();
    var content = $input.val();
    content.replace(/\n/g, '<br/>');
    $inputcopy.html(content);
    
    $inputcopy.width(width);
    $input.width(width);
    $input.height($inputcopy.height());
  }
  
  var scrollToBottom = function () {
    window.scrollTo(0, $prompt[0].offsetTop);
  }
  
  var inputKeypress = function (e) {
    var compiled;
    var input;
    var value;
    var output;
    
    if (e.which === 13) {
      e.preventDefault();
      input = grabInput();
      
      print($prompt.html() + input);
      
      if (input) {
        addToSaved(input);
        if (input[input.length-1] !== '\\' && !MULTILINE) {
          processSaved();
        }
      }
    } else if (e.which === 27) {
      e.preventDefault();
      input = $input.val();
      
      if (input) {
        if (MULTILINE) {
          if (SAVED) {
            input = grabInput();
            
            print($prompt.html() + input);
            addToSaved(input);
            processSaved();
          }
        }
      } else {
        if (MULTILINE) {
          if (SAVED) {
            processSaved();
          }
        }
      }
      
      MULTILINE = !MULTILINE;
      setPrompt(MULTILINE);
    } else if (e.which === 38) {
      e.preventDefault();
      
      if (HISTORY_I < HISTORY.length-1) {
        HISTORY_I += 1;
        $input.val(HISTORY[HISTORY_I]);
      }
    } else if (e.which === 40) {
      e.preventDefault();
      
      if (HISTORY_I > 0) {
        HISTORY_I += -1;
        $input.val(HISTORY[HISTORY_I]);
      }
    }
    
    scrollToBottom();
  };
  
  var printKeyPressed = function (e) {
    print(e.which);
  }
  
  // bind handlers
  $input.keydown(inputKeypress);
  $(window).resize(resizeInput);
  $input.keyup(resizeInput);
  $input.change(resizeInput);
  
  // initialize
  resizeInput();
  $input.focus();
  
  // header
  print("// CoffeeScript v" + CoffeeScript.VERSION + " REPL")
  print("//");
  print("// Press Esc to toggle multiline mode.");
  print();
  
})