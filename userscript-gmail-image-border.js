// ==UserScript==
// @name         Gmail Image Border
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add border to images in Gmail compose window
// @match        https://mail.google.com/*
// @author       Anton Fisher (Ported by jonbp)
// @updateURL    https://github.com/jonbp/userscript-gmail-image-border/raw/main/userscript-gmail-image-border.js
// @downloadURL  https://github.com/jonbp/userscript-gmail-image-border/raw/main/userscript-gmail-image-border.js
// @grant        none
// ==/UserScript==

(function () {

  'use strict';

  var DEBUG = false;
  var EXT_NAME = 'ImageBorderExt';
  var controlsId = 'g-i-b-e-controls';

  var getNodeParentByTagName = function (el, tagName) {
    while (el.parentNode) {
      el = el.parentNode;
      if (el.tagName === tagName) {
        return el;
      }
    }
  };

  var findSeporator = function (sourceEl) {
    for (var i = 0; i < sourceEl.childNodes.length; i++) {
      if (sourceEl.childNodes[i].innerHTML === '|') {
        return sourceEl.childNodes[i];
      }
    }
  };

  var cloneSeporator = function (cloneSource) {
    var el;
    if (cloneSource) {
      el = document.createElement(cloneSource.tagName);
      el.innerHTML = cloneSource.innerHTML;
      el.className = cloneSource.className;
      el.style = cloneSource.style;
    } else {
      el = document.createElement('span');
      el.innerHTML = '|';
    }
    return el;
  };

  var createButtonsContainer = function (id) {
    var el = document.createElement('DIV');
    el.style.paddingTop = '4px';
    el.id = id;

    return el;
  };

  var createButton = function (innerHTML, className, onclick) {
    var el = document.createElement('a');

    el.href = '';
    el.innerHTML = innerHTML;
    el.className = className;
    el.onclick = function (e) {
      e.preventDefault();
      onclick.call(this);
      return false;
    };

    return el;
  };

  var getExampleButton = function () {
    return document.getElementById('resize-remove-image');
  };

  var isControlsContainerVisible = function (el) {
    return (el.style.visibility === 'visible');
  };

  var isBorderButtonInjected = function (id) {
    return (document.getElementById(id));
  };

  var warn = function (message) {
    console.warn(EXT_NAME + ': ' + message);
  };

  var _debug = function () {
    if (DEBUG) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(EXT_NAME + ':');
      console.log.apply(console, args);
    }
  };

  _debug('is here..');

  document.addEventListener('mousedown', function (mouseEvent) {
    var clickTarget = document.elementFromPoint(mouseEvent.x, mouseEvent.y);
    _debug('click on: ', mouseEvent.x, mouseEvent.y);

    if (clickTarget.tagName !== 'IMG') {
      return;
    }

    var count = 0;
    var timeout = 100;
    var exampleButtonCheckInterval = setInterval(function () {
      count++;
      var exampleButton = getExampleButton();

      if (!exampleButton) {
        // wait for one second
        _debug('wait example button', count, 'times');
        if (count * timeout > 1000) {
          clearInterval(exampleButtonCheckInterval);
          warn('Could not find example button');
        }
        return;
      }
      clearInterval(exampleButtonCheckInterval);

      var existingControlsTable = getNodeParentByTagName(exampleButton, 'TABLE');

      if (!existingControlsTable) {
        warn('Could not find example buttons table');
        return;
      }

      var controlsContainer = getNodeParentByTagName(existingControlsTable, 'DIV');

      if (!controlsContainer) {
        warn('Could not find example buttons container');
        return;
      }

      if (!isControlsContainerVisible(controlsContainer)) {
        _debug('controlls container is hidden');
        return;
      }

      if (isBorderButtonInjected(controlsId)) {
        _debug('buttons are already injected');
        return;
      }

      var borderControls = createButtonsContainer(controlsId);

      borderControls.appendChild(createButton(
        "Add Border",
        exampleButton.className,
        function () {
          clickTarget.style.border = '1px solid #ddd';
        }
      ));
      borderControls.appendChild(cloneSeporator(findSeporator(exampleButton.parentNode)));
      borderControls.appendChild(createButton(
        "Remove Border",
        exampleButton.className,
        function () {
          clickTarget.style.border = 'none';
        }
      ));

      _debug('inject border controls');
      exampleButton.parentNode.parentNode.appendChild(borderControls);
    }, timeout);
  });
})();