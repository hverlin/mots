/*
*   The cursor is used to focus a special frame and write in it
*/
define(function () {

  // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
  function isMobileOrTablet() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  var _preventBlurLock;

  var enumDirections = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40
  };

  var _grid,
      _letterUpdateCallback,
      _nbLines,
      _nbCols,
      _focusCell = null;
      _focusDirection = null;
  
  /*
  *   Constructor
  *   @param: {Object}    gridObj               Grid instance given by the server
  *   @param: {Function}  letterUpdateCallback  Function to call when we update a letter frame (insert new letter or delete current one)
  */
  function Cursor(gridObj, letterUpdateCallback) {
    // Getting Grid
    _grid = gridObj.cases;
    _nbLines = gridObj.nbLines;
    _nbCols = gridObj.nbColumns

    // Retreive callback
    _letterUpdateCallback = letterUpdateCallback;
  }


  /*-------------------------
      
      Private functions
  
  -------------------------*/

  /*
  *   Set the cursor direction
  *   @param: {Int}  direction   [Optional] If this parameter is setted, force the direction. Else just toggle the current direction
  */
  function setCursorDirection(direction) {
    // If no direction given, toggle current direction
    if (!direction) {
      if (_focusDirection == enumDirections.Right) {
        _focusCell.classList.remove('goRight');
        _focusCell.classList.add('goDown');
        _focusDirection = enumDirections.Down;
      }
      else {
        _focusCell.classList.remove('goDown');
        _focusCell.classList.add('goRight');
        _focusDirection = enumDirections.Right;
      }
    }
    // Else change direction to the one needed then apply right style
    else {
      _focusDirection = (_focusDirection == enumDirections.Right) ? enumDirections.Down : enumDirections.Right;
      _focusCell.classList.remove('goRight');
      _focusCell.classList.remove('goDown');
      if (_focusDirection == enumDirections.Right)
        _focusCell.classList.add('goRight');
      else
        _focusCell.classList.add('goDown');
    }
  }

  /*
  *   Move the cursor to the next case according to the direction
  *   @param: {Int}  direction   [Optional] If this parameter is setted, force the direction. Else just follow the cursor one.
  *   @return: {Bool}  True if the cursor has moved, else false
  */
  function moveCursor(direction) {
    var frameNumber = parseInt(_focusCell.getAttribute('data-pos')),
        index = 0;

    // Retreive direction if not specified
    if (direction == undefined)
      direction = _focusDirection;

    // According to the direction, check if the next frame is available
    switch (direction) {
      case enumDirections.Left:
        // The first frame will always be a description frame
        index = frameNumber - 1;
        break;
      case enumDirections.Right:
        index = ((frameNumber + 1) >= _grid.length) ? 0 : (frameNumber + 1);
        break;
      case enumDirections.Up:
        index = (frameNumber > _nbCols) ? (frameNumber - _nbCols) : 0;
        break;
      case enumDirections.Down:
        index = ((frameNumber + _nbCols) >= _grid.length) ? 0 : (frameNumber + _nbCols);
        break;

      default:
        console.log('[ERROR] [Cursor.moveCursor] Unknow direction ' + direction);
    }

    // If the next frame is a letter frame, movo on it
    if (_grid[index].type == 2) {
      // Release old frame
      _focusCell.classList.remove('goRight');
      _focusCell.classList.remove('goDown');

      // Focus new frame
      _focusCell = document.querySelector('.frame' + index);
      _preventBlurLock = true;
      _focusCell.firstChild.focus();
      _preventBlurLock = false;
      if (direction == enumDirections.Left || direction == enumDirections.Right) {
        _focusDirection = enumDirections.Right;
        _focusCell.classList.add('goRight');
      }
      else {
        _focusDirection = enumDirections.Down;
        _focusCell.classList.add('goDown');
      }

      return (true);
    }
    // Else do nothing
    else
      return (false);
  }


  function onClickReceived(event) {
    if (_focusCell != null) {
      // If the player clicked the same frame, just toggle the cursor direction
      if (_focusCell == event.target) {
        setCursorDirection();
        return;
      }
      _focusCell.classList.remove('goRight');
      _focusCell.classList.remove('goDown');
    }

    // Remember the cell, focus it and set default direction
    _focusCell = event.target.parentElement;
    event.target.focus();
    _focusCell.classList.add('goRight');
    _focusDirection = enumDirections.Right;

    // move the grid otherwise it would be hidden by the virtual keyboard
    if (isMobileOrTablet() && +_focusCell.dataset.line > 7) {
      document.getElementById('game-panel').style.bottom = '400px';
    }
  }

  function onEnter(event) {
    if (event.keyCode !== 13) {
      return;
    }

    if (!event.target.value) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    insertLetter(event.target.value);
  }

  function onblur() {
    if(_preventBlurLock) {
      return;
    }

    document.getElementById('game-panel').style.bottom = '0';
    if (!this.value) {
      return;
    }

    insertLetter(this.value);
  }

  /*
  * When a letter is pressed on the grid
  */
  function onLetterPressed(event) {
    event.preventDefault();
    event.stopPropagation();
    var key = event.keyCode;

    // If a letter is pressed
    if ((key >= 65) && (key <= 90)) {
      insertLetter(String.fromCharCode(key));
    }

    // If backspace / escape / del is pressed
    if ((key == 8) || (key == 27) || (key == 46) || (key == 32)) {
      removeLetter();
      event.preventDefault();
    }

    // If an arrow is pressed
    if ((key >= 37) && (key <= 40))
      moveCursor(key);

  }


  /*
  * Insert a letter in the grid
  */
  function insertLetter(letter) {
    var character = letter.toUpperCase();
    var pos = parseInt(_focusCell.getAttribute('data-pos'));

    // Print letter on grid if we can
    if ((_focusCell != null) && (_grid[pos].available == true)) {
      _focusCell.firstChild.value = character;
    
      // Notify grid that a new letter is inserted
      _letterUpdateCallback(pos, character);
    }

    // Go to the next frame
    moveCursor(_focusDirection)
  }

  function removeLetter() {
    var pos = parseInt(_focusCell.getAttribute('data-pos'));

    if (_grid[pos].available == true) {
      _focusCell.firstChild.value = '';
      
      // Notify grid that the letter has been removed
      _letterUpdateCallback(parseInt(_focusCell.getAttribute('data-pos')), null);
    }
  }



  /*-------------------------
      
      Public methods
  
  -------------------------*/

  /*
  * Register to click and keyboard events
  */
  Cursor.prototype.RegisterEvents = function () {
    var letterCases = document.querySelectorAll('.letter'),
        size,
        i;

    // For each letter case
    size = letterCases.length;
    for (i = 0; i < size; i++) {
      // Register click event for cursor
      letterCases[i].addEventListener('click', onClickReceived, false);

      if (isMobileOrTablet()) {
        // a mobile keyboard does not send keydown event, update the cell on blur instead
        letterCases[i].firstChild.addEventListener('blur', onblur, false);
        letterCases[i].firstChild.addEventListener('keydown', onEnter, false);
      } else {
        letterCases[i].addEventListener('keydown', onLetterPressed, false);
      }
    };

  };


  return (Cursor);
  
});
