/*
 * websocket-reconnect.js
 * Implements JSON-RPC v1.0 wrapper around a websocket
 * Copyright 2017 Zane J Cersovsky
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Exponential back off wait time class
 * @class BackOff
 * @param	{number}	start	The starting exponent
 * @param	{number}	end		The maximum exponent
 * @param	{number}	coeff	The coefficent (in milliseconds)
 */
function BackOff(start = 0, end = 10, coeff = 1000)
{
	var curExp = start;
	/**
	 * Returns current wait time then increments exponent
	 * @function	backOff
	 * @memberof	BackOff
	 * @returns	{number}	Number of millaseconds to wait
	 */
	function backOff()
	{
		var ret = coeff*Math.pow(2, curExp);
		curExp = (curExp+1 > end) ? end : curExp+1;
		return ret;
	}
}

//brain-dead browser detection
if (document === undefined) {
	module.exports = {BackOff: BackOff};
}
