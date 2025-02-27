/**
 * @namespace
 * Contains text tokenization and breaking routines
 */

var RE_COLORS = /%([bc]){([^}]*)}/g;

// token types
export var TYPE_TEXT = 0;
export var TYPE_NEWLINE = 1;
export var TYPE_FG = 2;
export var TYPE_BG = 3;

/**
 * Measure size of a resulting text block
 */
export function measure(str, maxWidth) {
  var result = {
    width: 0,
    height: 1
  };
  var tokens = tokenize(str, maxWidth);
  var lineWidth = 0;
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    switch (token.type) {
      case TYPE_TEXT:
        lineWidth += token.value.length;
        break;
      case TYPE_NEWLINE:
        result.height++;
        result.width = Math.max(result.width, lineWidth);
        lineWidth = 0;
        break;
    }
  }
  result.width = Math.max(result.width, lineWidth);
  return result;
}

/**
 * Convert string to a series of a formatting commands
 */
export function tokenize(str, maxWidth) {
  var result = [];

  /* first tokenization pass - split texts and color formatting commands */
  var offset = 0;
  str.replace(RE_COLORS, function (match, type, name, index) {
    /* string before */
    var part = str.substring(offset, index);
    if (part.length) {
      result.push({
        type: TYPE_TEXT,
        value: part
      });
    }

    /* color command */
    result.push({
      type: type == "c" ? TYPE_FG : TYPE_BG,
      value: name.trim()
    });
    offset = index + match.length;
    return "";
  });

  /* last remaining part */
  var part = str.substring(offset);
  if (part.length) {
    result.push({
      type: TYPE_TEXT,
      value: part
    });
  }
  return breakLines(result, maxWidth);
}

/* insert line breaks into first-pass tokenized data */
function breakLines(tokens, maxWidth) {
  if (!maxWidth) {
    maxWidth = Infinity;
  }
  var i = 0;
  var lineLength = 0;
  var lastTokenWithSpace = -1;
  while (i < tokens.length) {
    /* take all text tokens, remove space, apply linebreaks */
    var token = tokens[i];
    if (token.type == TYPE_NEWLINE) {
      /* reset */
      lineLength = 0;
      lastTokenWithSpace = -1;
    }
    if (token.type != TYPE_TEXT) {
      /* skip non-text tokens */
      i++;
      continue;
    }

    /* remove spaces at the beginning of line */
    while (lineLength == 0 && token.value.charAt(0) == " ") {
      token.value = token.value.substring(1);
    }

    /* forced newline? insert two new tokens after this one */
    var index = token.value.indexOf("\n");
    if (index != -1) {
      token.value = breakInsideToken(tokens, i, index, true);

      /* if there are spaces at the end, we must remove them (we do not want the line too long) */
      var arr = token.value.split("");
      while (arr.length && arr[arr.length - 1] == " ") {
        arr.pop();
      }
      token.value = arr.join("");
    }

    /* token degenerated? */
    if (!token.value.length) {
      tokens.splice(i, 1);
      continue;
    }
    if (lineLength + token.value.length > maxWidth) {
      /* line too long, find a suitable breaking spot */

      /* is it possible to break within this token? */
      var _index = -1;
      while (1) {
        var nextIndex = token.value.indexOf(" ", _index + 1);
        if (nextIndex == -1) {
          break;
        }
        if (lineLength + nextIndex > maxWidth) {
          break;
        }
        _index = nextIndex;
      }
      if (_index != -1) {
        /* break at space within this one */
        token.value = breakInsideToken(tokens, i, _index, true);
      } else if (lastTokenWithSpace != -1) {
        /* is there a previous token where a break can occur? */
        var _token = tokens[lastTokenWithSpace];
        var breakIndex = _token.value.lastIndexOf(" ");
        _token.value = breakInsideToken(tokens, lastTokenWithSpace, breakIndex, true);
        i = lastTokenWithSpace;
      } else {
        /* force break in this token */
        token.value = breakInsideToken(tokens, i, maxWidth - lineLength, false);
      }
    } else {
      /* line not long, continue */
      lineLength += token.value.length;
      if (token.value.indexOf(" ") != -1) {
        lastTokenWithSpace = i;
      }
    }
    i++; /* advance to next token */
  }

  tokens.push({
    type: TYPE_NEWLINE
  }); /* insert fake newline to fix the last text line */

  /* remove trailing space from text tokens before newlines */
  var lastTextToken = null;
  for (var _i = 0; _i < tokens.length; _i++) {
    var _token2 = tokens[_i];
    switch (_token2.type) {
      case TYPE_TEXT:
        lastTextToken = _token2;
        break;
      case TYPE_NEWLINE:
        if (lastTextToken) {
          /* remove trailing space */
          var _arr = lastTextToken.value.split("");
          while (_arr.length && _arr[_arr.length - 1] == " ") {
            _arr.pop();
          }
          lastTextToken.value = _arr.join("");
        }
        lastTextToken = null;
        break;
    }
  }
  tokens.pop(); /* remove fake token */

  return tokens;
}

/**
 * Create new tokens and insert them into the stream
 * @param {object[]} tokens
 * @param {int} tokenIndex Token being processed
 * @param {int} breakIndex Index within current token's value
 * @param {bool} removeBreakChar Do we want to remove the breaking character?
 * @returns {string} remaining unbroken token value
 */
function breakInsideToken(tokens, tokenIndex, breakIndex, removeBreakChar) {
  var newBreakToken = {
    type: TYPE_NEWLINE
  };
  var newTextToken = {
    type: TYPE_TEXT,
    value: tokens[tokenIndex].value.substring(breakIndex + (removeBreakChar ? 1 : 0))
  };
  tokens.splice(tokenIndex + 1, 0, newBreakToken, newTextToken);
  return tokens[tokenIndex].value.substring(0, breakIndex);
}