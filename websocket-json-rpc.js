/*
 * websocket-json-rpc.js
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
  * @class wsRPC
  * param	{object}	ws - The websocket object to be wrapped around
  */
 function wsRPC(ws)
 {
 	var inflight = {}; //rpc calls in flight (object containing resolve()/reject() objects)
 	var sequence = 0;
	function hasKeys(obj, keys)
 	{
 		var objKeys = Object.keys(obj);
 		return keys.reduce(function (acc, item)
 		{
			return acc && objKeys.includes(item);
		}, true);
 	}
 	function getSequence()
 	{
 		return sequence++;
 	}
	ws.onmessage = function(message)
	{
		var data;
		//die if JSON malformed
		try {
			data = JSON.parse(message.data);
		} catch (e) {
			if (RPC_DEBUG)
				console.log("wsRPC Error parsing:", message.data);
			return; //give up
		}
		//die if fields missing
		if (!(hasKeys(data, ["result", "error", "id"]))) {
			if (RPC_DEBUG)
				console.log("wsRPC message missing required fields: ", message.data);
			return; //give up
		}
		if (!(data.id in inflight)) {
			if (RPC_DEBUG)
				console.log("wsRPC response parsed for non-existant request", message.data);
			return; //give up
		}
		if (data.error != null) {
			inflight[data.id].reject(data.error);
		} else {
			inflight[data.id].resolve(data.result);
		}
	}
	this.makeCall = async function(method, params, timeout)
	{
		var request = {
			"method": method,
			"params": params,
			"id": getSequence()
		};
		var done = new Promise(function(resolve, reject)
		{
			inflight[request.id] = {
				"resolve": resolve,
				"reject": reject
			};
		});
		if (timeout) {
			var timer = new Promise(function(resolve, reject)
			{
				setTimeout(reject, timeout);
			});
			return Promise.race([done, timer]);
		}
		return done;
	}
}
//brain-dead browser detection
if (document === undefined) {
	module.exports = {wsRPC: wsRPC};
}
