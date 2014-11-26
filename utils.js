var moment = require('moment')
var Q = require('kew')

var repeat = function(promise, everyMs, last) {
    var now = moment();
    var usAgain = repeat.bind(null, promise, everyMs, now);
    promise()
        .then(function(result){
            var duration = moment() - now;
            var inMs;

            if(duration <= everyMs)
                inMs = everyMs - duration;
            else
                inMs = (everyMs * Math.ceil(duration / everyMs)) - duration;

            setTimeout(usAgain, inMs);

/*
            var slept;
            if(last) {
                slept = now - last;
                console.log(
                    'update took (ms): ' + Math.floor(duration) + ',\t' +
                    'jitter(ms): ' + Math.abs(everyMs - slept) % everyMs + '\t=> ' +
                    result);
            }
*/
        })
		.fail(function(err){
			console.error(err);
		});
}

exports.repeat = repeat;
