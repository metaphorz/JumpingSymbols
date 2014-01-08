/*
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2010 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint sloppy: true */
/*global document:true,window:true */
var TapDigit;
TapDigit = TapDigit || {};

TapDigit.Parser = function () {
	var expression = null;
	var index = 0;

    // ArgumentList := Expression |
    //                 Expression ',' ArgumentList
    function parseArgumentList() {
        var token, expr, args = [];

        while (true) {
            expr = parseExpression();
            if (typeof expr === 'undefined') {
                // TODO maybe throw exception?
                break;
            }
            args.push(expr);
            token = expression[index];
            if (token.key != ',') {
                break;
            }
            index++;
        }

        return args;
    }

    // FunctionCall ::= Identifier '(' ')' ||
    //                  Identifier '(' ArgumentList ')'
    function parseFunctionCall(name) {
        var token, args = [];

        token = expression[index];
        index++;
        if (typeof token === 'undefined' || token.key != '(') {
            throw new SyntaxError('Expecting ( in a function call "' + name + '"');
        }

        token = expression[index];
        if (typeof token === 'undefined' || token.key != ')') {
            args = parseArgumentList();
        }

        token = expression[index];
        index++;
        if (typeof token === 'undefined' || token.key != ')') {
            throw new SyntaxError('Expecting ) in a function call "' + name + '"');
        }

        var returnNode = {
    		'FunctionCall' : {
                'name': name,
                'args': args
            }
    	};
        returnNode['FunctionCall'].toString = function(){
        	return 'FunctionCall';
        };
        returnNode['Unary']['name'].toString = function(){
        	return 'name';
        };
        returnNode['Unary']['args'].toString = function(){
        	return 'args';
        };
        return returnNode;
    }

    // Primary ::= Identifier |
    //             Number |
    //             '(' Assignment ')' |
    //             FunctionCall
    function parsePrimary() {
        var token, expr;

        token = expression[index];

        if (typeof token === 'undefined') {
            throw new SyntaxError('Unexpected termination of expression');
        }

        
        //Identifier ex) sin or X
        var isIdentifier = true;
        for (var i=0; i < token.key.length; i++) { 
        	if (    !(( token.key >= 'a' && token.key <= 'z') || (token.key >= 'A' && token.key <= 'Z'))   ) { 
        		isIdentifier = false;
        		break;
        	}
       	} 
        
        if ( isIdentifier ) {
        	
        	var preToken = expression[index];
        	
        	index++;
        	token = expression[index];
            if (typeof token !== 'undefined' && token.key == '(') {
                return parseFunctionCall(preToken.key);
            } else {
            	var returnNode = {
        			'Identifier': preToken.key
            	};
                returnNode['Identifier'].toString = function(){
                	return 'Identifier';
                };
                
                return returnNode;
            }
        }

        //Number(only integer)
        var isNumber = true;
        for (var i=0; i < token.key.length; i++) {
        	
        	if(i == 0){
        		
        		if (  ! (token.key.charAt(i) == '-' || (token.key.charAt(i) >= '0' && token.key.charAt(i) <= '9') ) ) { 
	        		isNumber = false;
	        		break;
        		}
        		
        	}else{
        		if (  !(token.key.charAt(i) >= '0' && token.key.charAt(i) <= '9') ) {
					
	        		isNumber = false;
	        		break;
        		}
        	}
       	}
		
		
		var isFraction = false;
		if(isNumber == false){
			isFraction = true;

			var isNumerator = false;
			var isDenominator = false;
			var divisionCount = 0;
			var divisionIndex = 0;
			
			for (var i=0; i < token.key.length; i++) {
				if(token.key.charAt(i) == '/'){
					divisionCount++;
					divisionIndex = i;
				}

				if(divisionCount >= 2){
					isFraction = false;
					break;
				}
			}
			
			if( !(token.key.length > divisionIndex+1) ){
				isFraction = false;
			}

			if(isFraction){
				for (var i=0; i < token.key.length; i++) {
					if(i < divisionIndex){
						//for negative number
						if(divisionIndex >= 2 && i == 0){ 
							if (  ! (token.key.charAt(i) == '-' || (token.key.charAt(i) >= '0' && token.key.charAt(i) <= '9') ) ) { 
								isFraction = false;
								break;
							}
						}
						//for positive number
						else{
							if (  ! (token.key.charAt(i) >= '0' && token.key.charAt(i) <= '9') ) { 
								isFraction = false;
								break;
							}		
						}
						isNumerator = true;

					}else if(i > divisionIndex){
						//for negative number
						if(token.key.length - divisionIndex+1 >= 2 && i == divisionIndex+1){ 
							if (  ! (token.key.charAt(i) == '-' || (token.key.charAt(i) >= '0' && token.key.charAt(i) <= '9') ) ) { 
								isFraction = false;
								break;
							}
						}
						//for positive number
						else{
							if (  ! (token.key.charAt(i) >= '0' && token.key.charAt(i) <= '9') ) { 
								isFraction = false;
								break;
							}
						}
						isDenominator = true;
					}
				}

				if( !(isDenominator && isNumerator) ){
					isFraction = false;
				}
			}
		}    
        
        if (isNumber || isFraction) {
        	index++;
            
        	var returnNode = {
        		'number': token
        	};
            returnNode['number'].toString = function(){
            	return 'number';
            };
            
            return returnNode;
        }

        if (typeof token !== 'undefined' && token.key == '(') {
        	var open = token;
            index++;
            expr = parseAssignment();
            token = expression[index];
            index++;
            if (typeof token !== 'undefined' && (token.key != ')')) {
                throw new SyntaxError('Expecting )');
            }
            var close = token;
            
            var returnNode = {
                'Parenthesis': {
                	'open' : open,
                	'Binary' : expr['Binary'],
                	'close' : close
                }
            };
            returnNode['Parenthesis'].toString = function(){
            	return 'Parenthesis';
            };
            returnNode['Parenthesis']['open'].toString = function(){
            	return 'open';
            };
            returnNode['Parenthesis']['close'].toString = function(){
            	return 'close';
            };
            
            return returnNode;
        }

        throw new SyntaxError('Parse error, can not process token ' + token.key);
    }

    // Multiplicative ::= Unary |
    //                    Multiplicative '*' Unary |
    //                    Multiplicative '/' Unary
    function parseMultiplicative() {
        var token, left, right;

        left = parsePrimary();
        token = expression[index];
        if (typeof token !== 'undefined' && (token.key == '*' || token.key == '/') ) {
            index++;
            right = parseMultiplicative();
            
            var returnNode = {
        		'Binary': {
                    'Left': left,
                    'operator': token,
                    'Right': right
                }
        	};
            returnNode['Binary'].toString = function(){
            	return 'Binary';
            };
            returnNode['Binary']['Left'].toString = function(){
            	return 'Left';
            };
            returnNode['Binary']['operator'].toString = function(){
            	return 'operator';
            };
            returnNode['Binary']['Right'].toString = function(){
            	return 'Right';
            };
            
            return returnNode;
        }
        return left;
    }

    // Additive ::= Multiplicative |
    //              Additive '+' Multiplicative |
    //              Additive '-' Multiplicative
    function parseAdditive() {
        var token, left, right;

        left = parseMultiplicative();
        token = expression[index];
        if (typeof token !== 'undefined' && (token.key == '+' || token.key == '-')) {
            index++;
            right = parseAdditive();
            
            var returnNode = {
        		'Binary': {
                    'Left': left,
                    'operator': token,
                    'Right': right
                }
        	};
            returnNode['Binary'].toString = function(){
            	return 'Binary';
            };
            returnNode['Binary']['Left'].toString = function(){
            	return 'Left';
            };
            returnNode['Binary']['operator'].toString = function(){
            	return 'operator';
            };
            returnNode['Binary']['Right'].toString = function(){
            	return 'Right';
            };
            return returnNode;
        }
        return left;
    }

    // Assignment ::= Identifier '=' Assignment |
    //                Additive
    function parseAssignment() {
        var token, expr;

        expr = parseAdditive();

        if (typeof expr !== 'undefined' && expr.Identifier) {
            token = expression[index];
            if (typeof token !== 'undefined' && token.key == '=') {
            	index++;
            	
            	var returnNode = {
                    'Assignment': {
                        'name': expr,
                        'value': parseAssignment()
                    }
                };
                returnNode['Assignment'].toString = function(){
                	return 'Assignment';
                };
            	
                return returnNode;
            }
            return expr;
        }
        return expr;
    }

    // Expression ::= Assignment
    function parseExpression() {
        return parseAssignment();
    }

    function parse(question) {
    	expression = null;
    	index = 0;
    	
        var expr, token;
        
        expression = question;
        
        //lexer.reset(expression);
        expr = parseExpression();

        token = expression[index];
        index++;
        if (typeof token !== 'undefined') {
            throw new SyntaxError('Unexpected token ' + token.key);
        }
        var returnNode = {
            'Expression': expr
        };
        returnNode['Expression'].toString = function(){
        	return 'Expression';
        };
        return returnNode;
    }

    return {
        parse: parse
    };
};

TapDigit.Context = function () {
    var Constants, Functions;

    Constants = {
        pi: 3.1415926535897932384,
        phi: 1.6180339887498948482
    };

    Functions = {
        abs: Math.abs,
        acos: Math.acos,
        asin: Math.asin,
        atan: Math.atan,
        ceil: Math.ceil,
        cos: Math.cos,
        exp: Math.exp,
        floor: Math.floor,
        ln: Math.ln,
        random: Math.random,
        sin: Math.sin,
        sqrt: Math.sqrt,
        tan: Math.tan
    };

    return {
        Constants: Constants,
        Functions: Functions,
        Variables: {}
    };
};

TapDigit.Evaluator = function (ctx) {

    var parser = new TapDigit.Parser(),
        context = (arguments.length < 1) ? new TapDigit.Context() : ctx;

    function exec(node) {
        var left, right, expr, args, i;

        if (node.hasOwnProperty('Expression')) {
            return exec(node.Expression);
        }

        if (node.hasOwnProperty('number')) {
            return parseFloat(node.number);
        }

        if (node.hasOwnProperty('Binary')) {
            node = node.Binary;
            left = exec(node['Left']);
            right = exec(node['Right']);
            switch (node.operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
            default:
                throw new SyntaxError('Unknown operator ' + node.operator);
            }
        }

        if (node.hasOwnProperty('Unary')) {
            node = node.Unary;
            expr = exec(node.expression);
            switch (node.operator) {
            case '+':
                return expr;
            case '-':
                return -expr;
            default:
                throw new SyntaxError('Unknown operator ' + node.operator);
            }
        }

        if (node.hasOwnProperty('Identifier')) {
            if (context.Constants.hasOwnProperty(node.Identifier)) {
                return context.Constants[node.Identifier];
            }
            if (context.Variables.hasOwnProperty(node.Identifier)) {
                return context.Variables[node.Identifier];
            }
            throw new SyntaxError('Unknown identifier');
        }

        if (node.hasOwnProperty('Assignment')) {
            right = exec(node.Assignment.value);
            context.Variables[node.Assignment.name.Identifier] = right;
            return right;
        }

        if (node.hasOwnProperty('FunctionCall')) {
            expr = node.FunctionCall;
            if (context.Functions.hasOwnProperty(expr.name)) {
                args = [];
                for (i = 0; i < expr.args.length; i += 1) {
                    args.push(exec(expr.args[i]));
                }
                return context.Functions[expr.name].apply(null, args);
            }
            throw new SyntaxError('Unknown function ' + expr.name);
        }

        throw new SyntaxError('Unknown syntax node');
    }

    function evaluate(expr) {
        var tree = parser.parse(expr);
        return exec(tree);
    }

    return {
        evaluate: evaluate
    };
};

TapDigit.Editor = function (element) {

    var input, editor, cursor, blinkTimer, lexer, hasFocus;

    function hideCursor() {
        if (blinkTimer) {
            window.clearInterval(blinkTimer);
        }
        blinkTimer = undefined;
        cursor.style.visibility = 'hidden';
    }

    function blinkCursor() {
        var visible = true;
        if (blinkTimer) {
            window.clearInterval(blinkTimer);
        }
        blinkTimer = window.setInterval(function () {
            cursor.style.visibility = visible ? '' : 'hidden';
            visible = !visible;
        }, 423);
    }

    // Get cursor position from the proxy input and adjust the editor
    function updateCursor() {
        var start, end, x, y, i, el, cls;

        if (typeof cursor === 'undefined') {
            return;
        }

        if (cursor.getAttribute('id') !== 'cursor') {
            return;
        }

        start = input.selectionStart;
        end = input.selectionEnd;
        if (start > end) {
            end = input.selectionStart;
            start = input.selectionEnd;
        }

        if (editor.childNodes.length <= start) {
            return;
        }

        el = editor.childNodes[start];
        if (el) {
            x = el.offsetLeft;
            y = el.offsetTop;
            cursor.style.left = x + 'px';
            cursor.style.top = y + 'px';
            cursor.style.opacity = 1;
        }

        // If there is a selection, add the CSS class 'selected'
        // to all nodes inside the selection range.
        cursor.style.opacity = (start === end) ? 1 : 0;
        for (i = 0; i < editor.childNodes.length; i += 1) {
            el = editor.childNodes[i];
            cls = el.getAttribute('class');
            if (cls !== null) {
                cls = cls.replace(' selected', '');
                if (i >= start && i < end) {
                    cls += ' selected';
                }
                el.setAttribute('class', cls);
            }
        }
    }

    // Get a new text from the proxy input and update the syntax highlight
    function updateEditor() {
        var expr, tokens, token, i, j, text, str, html;

        if (typeof lexer === 'undefined') {
            lexer = new TapDigit.Lexer();
        }

        tokens = [];
        try {
            expr = input.value;
            lexer.reset(expr);
            while (true) {
                token = lexer.next();
                if (typeof token === 'undefined') {
                    break;
                }
                tokens.push(token);
            }

            text = '';
            html = '';
            for (i = 0; i < tokens.length; i += 1) {
                token = tokens[i];
                j = 0;
                while (text.length < token.start) {
                    text += ' ';
                    html += '<span class="blank"> </span>';
                    j = 1;
                }
                str = expr.substring(token.start, token.end + 1);
                for (j = 0; j < str.length; j += 1) {
                    html += '<span class="' + token.type + '">';
                    html += str.charAt(j);
                    text += str.charAt(j);
                    html += '</span>';
                }
            }
            while (text.length < expr.length) {
                text += ' ';
                html += '<span class="blank"> </span>';
            }
        } catch (e) {
            // plain spans for the editor
            html = '';
            for (i = 0; i < expr.length; i += 1) {
                html += '<span class="error">' + expr.charAt(i) + '</span>';
            }
        } finally {
            html += '<span class="cursor" id="cursor">\u00A0</span>';
            if (html !== editor.innerHTML) {
                editor.innerHTML = html;
                cursor = document.getElementById('cursor');
                blinkCursor();
                updateCursor();
            }
        }
    }

    function focus() {
        window.setTimeout(function () {
            input.focus();
            blinkCursor();
            updateCursor();
        }, 0);
    }

    function blur() {
        input.blur();
    }

    function deselect() {
        var el, cls;
        input.selectionEnd = input.selectionStart;
        el = editor.firstChild;
        while (el) {
            cls = el.getAttribute('class');
            if (cls && cls.match('selected')) {
                cls = cls.replace('selected', '');
                el.setAttribute('class', cls);
            }
            el = el.nextSibling;
        }
    }

    function setHandler(el, event, handler) {
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        } else {
            el.attachEvent('on' + event, handler);
        }
    }

    function resetHandler(el, event, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(event, handler, false);
        } else {
            el.detachEvent('on' + event, handler);
        }
    }

    function onInputKeyDown(event) {
        updateCursor();
    }

    function onInputKeyUp(event) {
        updateEditor();
    }

    function onInputBlur() {
        hasFocus = false;
        hideCursor();
    }

    function onInputFocus() {
        hasFocus = true;
    }

    function onEditorMouseDown(event) {
        var x, y, i, el, x1, y1, x2, y2, anchor;

        deselect();

        x = event.clientX;
        y = event.clientY;
        for (i = 0; i < editor.childNodes.length; i += 1) {
            el = editor.childNodes[i];
            x1 = el.offsetLeft;
            x2 = x1 + el.offsetWidth;
            y1 = el.offsetTop;
            y2 = y1 + el.offsetHeight;
            if (x1 <= x && x < x2 && y1 <= y && y < y2) {
                input.selectionStart = i;
                input.selectionEnd = i;
                anchor = i;
                blinkCursor();
                break;
            }
        }

        // no match, then assume it is at the end
        if (i >= editor.childNodes.length) {
            input.selectionStart = input.value.length;
            input.selectionEnd = input.selectionStart;
            anchor = input.value.length;
        }

        function onDocumentMouseMove(event) {
            var i;
            if (event.target && event.target.parentNode === editor) {
                for (i = 0; i < editor.childNodes.length; i += 1) {
                    el = editor.childNodes[i];
                    if (el === event.target && el !== cursor) {
                        input.selectionStart = Math.min(i, anchor);
                        input.selectionEnd = Math.max(i, anchor);
                        blinkCursor();
                        updateCursor();
                        break;
                    }
                }
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.returnValue = false;
        }

        function onDocumentMouseUp(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.returnValue = false;
            window.setTimeout(function () {
                resetHandler(document, 'mousemove', onDocumentMouseMove);
                resetHandler(document, 'mouseup', onDocumentMouseUp);
            }, 100);
        }

        focus();
        setHandler(document, 'mousemove', onDocumentMouseMove);
        setHandler(document, 'mouseup', onDocumentMouseUp);
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.returnValue = false;
    }

    function setupDOM(element) {
        var container, wrapper;

        // Proxy input where we capture user keyboard interaction
        input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.width = '100px';
        input.value = 'x = 40 + (6 / 3.0)';
        input.style.position = 'absolute';

        // Container for the above proxy, it also hides the proxy element
        container = document.createElement('div');
        container.appendChild(input);
        container.style.overflow = 'hidden';
        container.style.width = '1px';
        container.style.height = '0px';
        container.style.position = 'relative';

        // The "fake" editor
        editor = document.createElement('div');
        editor.setAttribute('class', 'editor');
        editor.style.wrap = 'on';
        editor.textContent = ' ';

        // Top-level wrapper for container
        wrapper = document.createElement('div');
        wrapper.appendChild(container);
        wrapper.appendChild(editor);
        element.appendChild(wrapper);

        // Wire all event handlers
        setHandler(input, 'keydown', onInputKeyDown);
        setHandler(input, 'keyup', onInputKeyUp);
        setHandler(input, 'blur', onInputBlur);
        setHandler(input, 'focus', onInputFocus);
        setHandler(editor, 'mousedown', onEditorMouseDown);
    }

    hasFocus = false;
    setupDOM(element);
    updateEditor();

    return {
        focus: focus,
        blur: blur,
        deselect: deselect
    };
};

