var board = require('./board.json');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var express = require('express');

var app = http.createServer(handler);
var io = socketio.listen(app);
app.listen(8000);

var filePort = (process.env.OPENSHIFT_INTERNAL_PORT || 8080);
var app2 = express();
//app2.get("/",handler);
app2.post("/",handler);
app2.configure(function(){
	app2.use('/',express.static(__dirname+'/public'));
});
app2.listen(filePort);
function handler(req, res)
{
	fs.readFile(__dirname+'/public/index.html',function(err, data){
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	});
}

var Sockets = {};
var List = [];
var Boards = {};

io.sockets.on('connection',function(socket){
	console.log('socket created\n');
	socket.on('login',function(data){
		Sockets[data] = socket;
		var presentFlag = false;
		for(var i in List)
		{
			if(List[i] == data)
			{
				presentFlag = true;
				break;
			}
			
		}
		if(!presentFlag) List.push(data);
		console.log(data+' connected with '+socket);
		socket.emit('login',data);
		
		socket.on('list',function(){
			socket.emit('list',List);
		});
		
		socket.on('play',function(data){
			//var cP = 1;
			//var boardObj = JSON.parse(JSON.stringify(board));
			var me = data.me;
			var opp = data.opponent;
			if(Boards[me]==undefined) Boards[me] = {};
			if(Boards[opp]==undefined) Boards[opp] = {};
			if(Boards[opp][me]!=undefined || Boards[opp][me]!=null)
			{
				var toSend = {};
				toSend.positive = opp;
				toSend.negative = me;
				toSend.cP = Boards[opp][me]['cP'];
				toSend.board = Boards[opp][me]['board'];
			}
			else
			{
				if(Boards[me][opp] == undefined || Boards[me][opp] == null)
				{
					Boards[me][opp] = {};
					Boards[me][opp]['board'] = JSON.parse(JSON.stringify(board));
					Boards[me][opp]['cP'] = 1;
				}
				var toSend = {};
				toSend.positive = me;
				toSend.negative = opp;
				toSend.cP = Boards[me][opp]['cP'];
				toSend.board = Boards[me][opp]['board'];
			}
			Sockets[opp].emit('play',toSend);
			Sockets[me].emit('play',toSend);
			//printBoard(boardObj);
		});
		socket.on('action',function(data){
			var boardObj = Boards[data.positive][data.negative].board;
			var cP = Boards[data.positive][data.negative].cP;
			cP = action(boardObj,cP,data.cell.substr(0,1),data.cell.substr(1,1));
			Boards[data.positive][data.negative].cP = cP;
			var toSend = {};
			toSend.cell = data.cell;
			toSend.cP = cP*(-1);
			toSend.positive = data.positive;
			toSend.negative = data.negative;
			Sockets[data.positive].emit('result',toSend);
			Sockets[data.negative].emit('result',toSend);
			var boardStatus = checkWin(boardObj);
			if(boardStatus != '')
			{
				var winner = data[boardStatus];
				Sockets[data.positive].emit('win',winner);
				Sockets[data.negative].emit('win',winner);
				Boards[data.positive][data.negative]=null;
			}
		});
		/*

		*/
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
			return 'positive';
		}
		else if(boardObj[0][i] == -3 || boardObj[i][0]==-3 || boardObj[0][4] == -3)
		{
			console.log('Negative Wins!');
			return 'negative';
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