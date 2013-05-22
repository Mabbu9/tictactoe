var board = require('./board.json');

game(board); //starts the game

function game(boardObj)
{
	var currentPlayer = 1;
	
	printBoard(boardObj);
	//input should be taken here, sample input given below
	currentPlayer = (-1) * action(boardObj,currentPlayer,2,2);
	currentPlayer = (-1) * action(boardObj,currentPlayer,2,3);
	currentPlayer = (-1) * action(boardObj,currentPlayer,1,2);
	currentPlayer = (-1) * action(boardObj,currentPlayer,3,3);
	currentPlayer = (-1) * action(boardObj,currentPlayer,1,1);
	currentPlayer = (-1) * action(boardObj,currentPlayer,1,3);
	//updateBoard(boardObj,currentPlayer,i,j);
	//then change currentPlayer to opposite;
}

function action(boardObj,currentPlayer,i,j)
{
	if(updateBoard(boardObj,currentPlayer,i,j))
		console.log('updated');
	else
	{
		console.log('invalid option');
		return currentPlayer*(-1);
	}
	printBoard(boardObj);
	checkWin(boardObj);
	return currentPlayer;
}

function printBoard(boardObj)
{
	for(var i=0;i<=4;i++)
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

function checkWin(boardObj)
{
	for(var i=0;i<=4;i++)
	{
		if(boardObj[0][i] == 3 || boardObj[i][0]==3)
		{
			console.log('Positive Wins!');
			return;
		}
		else if(boardObj[0][i] == -3 || boardObj[i][0]==-3)
		{
			console.log('Negative Wins!');
			return;
		}
	}
}

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