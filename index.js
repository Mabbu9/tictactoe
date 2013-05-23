var board = require('./board.json');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var app = http.createServer(handler);
var io = socketio.listen(app);
app.listen(8000);

function handler(req, res)
{
	fs.readFile(__dirname+'/index.html',function(err, data){
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	});
}

var Sockets = {};

io.sockets.on('connection',function(socket){
	console.log('socket created\n');
	socket.on('login',function(data){
		Sockets[data] = socket;
		console.log(data+' connected with '+socket);
		socket.emit('login',data);
	});
	var cP = 1;
	var boardObj = JSON.parse(JSON.stringify(board));
	printBoard(boardObj);
	socket.on('action',function(data){
		cP = action(boardObj,cP,data.substr(0,1),data.substr(1,1));
		socket.emit('result',{cell:data,cP:cP*(-1)});
		var boardStatus = checkWin(boardObj);
		if(boardStatus != '')
			socket.emit('win',boardStatus);
	});
});


//game(board); //starts the test game
function game(boardObj)
{
	var currentPlayer = 1;
	
	printBoard(boardObj);
	//input should be taken here, sample input given below
	currentPlayer = action(boardObj,currentPlayer,2,2);
	currentPlayer = action(boardObj,currentPlayer,2,3);
	currentPlayer = action(boardObj,currentPlayer,1,2);
	currentPlayer = action(boardObj,currentPlayer,3,3);
	currentPlayer = action(boardObj,currentPlayer,1,1);
	currentPlayer = action(boardObj,currentPlayer,1,3);
	//updateBoard(boardObj,currentPlayer,i,j);
	//then change currentPlayer to opposite;
}

//action returns the next player
function action(boardObj,currentPlayer,i,j)
{
	if(updateBoard(boardObj,currentPlayer,i,j))
		console.log('updated');
	else
	{
		console.log('invalid option');
		return currentPlayer;
	}
	printBoard(boardObj);
	checkWin(boardObj);
	return currentPlayer*(-1);
}

//prints the board on server console
function printBoard(boardObj)
{
	for(var i=0;i<4;i++)
	{
		var toPrint = '';
		for(var j=0;j<=4;j++)
		{
			var cell = boardObj[i][j];
			if(cell == undefined) cell='';
			toPrint = toPrint + cell +'\t';
		}
		console.log(toPrint);
	}
	console.log('');
}

//checks the winning conditions each time
function checkWin(boardObj)
{
	for(var i=0;i<4;i++)
	{
		if(boardObj[0][i] == 3 || boardObj[i][0]==3 || boardObj[0][4] == 3)
		{
			console.log('Positive Wins!');
			return 'Positive Wins!';
		}
		else if(boardObj[0][i] == -3 || boardObj[i][0]==-3 || boardObj[0][4] == -3)
		{
			console.log('Negative Wins!');
			return 'Negative Wins!';
		}
	}
	return '';
}

//updates the board with either 1 or -1 and the sums
function updateBoard(boardObj,inNum,i,j)
{
	if(boardObj[i][j] != 0) return false;
	boardObj[i][j] = inNum;
	boardObj[i][0] = boardObj[i][0]+inNum;
	boardObj[0][j] = boardObj[0][j]+inNum;
	if(i+j==4) boardObj[0][4] = boardObj[0][4] + inNum;
	if(i==j) boardObj[0][0] = boardObj[0][0] + inNum;
	return true;
}