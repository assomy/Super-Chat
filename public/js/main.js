requirejs.config({
	baseUrl: "js"
})

requirejs(['canvas'], function ( canvas ) {			
		var socket = io.connect();

		canvas.init()

		socket.on('begin', function(obj){
		console.log(obj)
		})
	}
)