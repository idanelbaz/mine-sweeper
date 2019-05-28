'use strict'

var gGameisOn;
var gBoard;
var FLOOR = ' ';
var FLAG = '🏁';
var SIZE = 4;
var MINE = '💣';
var MINEBOOM = '💥';
var gMines = [];
var gMineCounter = 2;
var gClickCounter;
var gClockInterval = null;
var gLifesCounter = 3;
var gTime;
var gtimeScore;
var gIsHintclick = false;






function init() {
    gTime = 0;
    gGameisOn = true;
    document.getElementById(0).style.visibility = 'visible';
    document.getElementById(1).style.visibility = 'visible';
    document.getElementById(2).style.visibility = 'visible';
    gLifesCounter = 3;
    gClickCounter = 0;
    gMines = [];
    gBoard = createBoard();
    renderBoard(gBoard);
    document.querySelector('.smiley').src = 'img/smiley_flat.png';
    document.querySelector('.lifes').innerHTML = 'Lifes lest:  ' + gLifesCounter;
    document.querySelector('.mine-counter').innerHTML = 'Mines left ' + gMineCounter;
    document.querySelector('.gameOver').style.visibility = 'hidden';
    document.querySelector('.victory').style.visibility = 'hidden';
    if (gClockInterval) {
        clearInterval(gClockInterval);
        document.querySelector('.timer').innerText = gTime;
    }
    if (SIZE === 4) {
        document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('easy');
        gMineCounter = 2;
    } else if (SIZE === 8) {
        document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('medium');
        gMineCounter = 12;
    } else if (SIZE === 12) {
        document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('hard');
        gMineCounter = 30;
    }

}

function createBoard() {
    var board = [];
    //  making the board
    for (var i = 0; i < SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
                img: FLOOR,
                isclicked: false,
                isMine: false,
                isFlag: false,
            };
        }
    }
    return board;
}

function renderBoard(board) {
    var strHtml = '';
    //render the board
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j].img;
            var className = 'cell cell' + i + '-' + j;
            strHtml += '<td class="' + className + '" onmousedown="cellClicked(' + i + ', ' + j + ',event, this)"> ' + cell + ' </td>'
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.the-board');
    elBoard.innerHTML = strHtml;
}

function cellClicked(i, j, ev, element) {
    if (gGameisOn === true) {
        var cellLoc = {
                i: i,
                j: j,
            }
            // if mouse left click
        if (ev.button === 0) {
            if (gClickCounter === 0) {
                document.querySelector('.hintExp').style.visibility = 'hidden';
                timer();
                gClickCounter = 1;
                gBoard[cellLoc.i][cellLoc.j].isclicked = true;
                element.style = " background-color: lightgrey ";
                createAndRenderMine(gMineCounter);
                expendCell(cellLoc, element);
                checkIfWin(cellLoc);
            } else if (gIsHintclick === true) {
                expendCellHint(cellLoc);
                setTimeout(function() {
                    returnCells(cellLoc);
                }, 2000)
                gIsHintclick = false;
                console.log('hint');
                gIsHintclick = false;
            } else if (gClickCounter > 0 && gBoard[cellLoc.i][cellLoc.j].isFlag === true) return;
            else if (gBoard[cellLoc.i][cellLoc.j].isclicked === true) return;
            else if (gClickCounter > 0 && gBoard[cellLoc.i][cellLoc.j].isMine === true) {
                gLifesCounter--;
                if (gLifesCounter > 0) {
                    alert('You hit a mine, you got left ' + gLifesCounter + ' Lifes');
                    document.querySelector('.lifes').innerHTML = 'Lifes lest:  ' + gLifesCounter;
                    document.querySelector('.smiley').src = 'img/smiley_worried.png';
                } else {
                    for (var g = 0; g < gMines.length; g++) {
                        if (gMines[g] === cellLoc) continue
                        renderCell(gMines[g], MINE);
                    }
                    renderCell(cellLoc, MINEBOOM);
                    document.querySelector('.lifes').innerHTML = 'Lifes lest:  ' + gLifesCounter;
                    gameOver();
                }
            } else if (gClickCounter > 0 && gBoard[cellLoc.i][cellLoc.j].isMine === false && gBoard[cellLoc.i][cellLoc.j].isFlag === false) {
                gBoard[cellLoc.i][cellLoc.j].isclicked = true;
                element.style = " background-color: lightgrey ";
                expendCell(cellLoc)

            }
        }
        // if mouse right click
        else if (ev.button === 2) {
            if (gClickCounter === 0) return;
            // when already flag on.
            else if (gBoard[cellLoc.i][cellLoc.j].isFlag === true) {
                gBoard[cellLoc.i][cellLoc.j].img = FLOOR;
                gBoard[cellLoc.i][cellLoc.j].isFlag = false;
                renderCell(cellLoc, FLOOR);
                gMineCounter++;
                checkIfWin();
                // when hit floor and its not a mine.
            } else if (gBoard[cellLoc.i][cellLoc.j].isFlag === false && gBoard[cellLoc.i][cellLoc.j].isMine === true && gBoard[cellLoc.i][cellLoc.j].isclicked === false) {
                //put flag on board
                gBoard[cellLoc.i][cellLoc.j].isFlag = true;
                // render Flag.
                renderCell(cellLoc, FLAG);
                gMineCounter--;
                checkIfWin();

            } else if (gBoard[cellLoc.i][cellLoc.j].isclicked === false && gBoard[cellLoc.i][cellLoc.j].isMine === false) {
                //put flag on board
                gBoard[cellLoc.i][cellLoc.j].isFlag = true;
                // render Flag.
                renderCell(cellLoc, FLAG);
                gMineCounter--;
                checkIfWin();
            }
            document.querySelector('.mine-counter').innerHTML = 'Mines left ' + gMineCounter;
        }
    }
}

function expendCell(cellLoc) {
    var res = [];
    var i = cellLoc.i;
    var j = cellLoc.j;
    for (var r = i - 2; r <= i + 2; r++) {
        for (var c = j - 2; c <= j + 2; c++) {
            if (r < 0 || c < 0 || r >= gBoard.length || c >= gBoard[0].length) continue;
            if (r === gBoard[r] && c === gBoard[c]) continue;
            var expendCell = {
                i: r,
                j: c,
            }
            if (gBoard[r][c].isMine === true) continue;

            //found neg cell without mine inside.
            res.push(expendCell)
        }
    }
    //render the negs cells.
    for (var h = 0; h < res.length; h++) {
        gBoard[res[h].i][res[h].j].isclicked = true;
        var negNum = checkNegs(res[h].i, res[h].j);
        if (negNum === 0) renderCell(res[h], '<div style = " background-color: lightgrey " class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)"></div>');
        else if (negNum === 1) renderCell(res[h], '<div style = " background-color: lightgrey " class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)">1️⃣</div>');
        else if (negNum === 2) renderCell(res[h], '<div style = " background-color: lightgrey " class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)">2️⃣</div>');
        else if (negNum === 3) renderCell(res[h], '<div style = " background-color: lightgrey " class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)">3️⃣</div>');
        else if (negNum === 4) renderCell(res[h], '<div style = " background-color: lightgrey " class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)">4️⃣</div>');

    }
    console.log(res);

}

function checkNegs(i, j) {
    var negAround = 0;
    // check how many mines there is near each neg. 
    for (var r = i - 1; r <= i + 1; r++) {
        for (var c = j - 1; c <= j + 1; c++) {
            if (r < 0 || c < 0 || r >= gBoard.length || c >= gBoard[0].length) continue;
            if (r === gBoard[r] && c === gBoard[c]) continue;
            if (gBoard[r][c].isMine === true) negAround++

        }
    }
    return negAround;
}

function changeSize(numCell) {
    // change the size of the board and the number of mines. 
    var elScore = document.querySelector('.score');
    SIZE = numCell;

    if (SIZE === 4) {
        document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('easy');
        gMineCounter = 2;
    } else if (SIZE === 8) {
        document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('medium');
        gMineCounter = 12;
    } else if (SIZE === 12) {
        document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('hard');
        gMineCounter = 30;
    }
    init();
}

function createAndRenderMine(mineNum) {

    var randomRow = getRandomInt(0, gBoard[0].length)
    var randomColl = getRandomInt(0, gBoard[0].length)
    var renderMine = {
        i: randomRow,
        j: randomColl,
    }

    for (var i = 0; i < mineNum; i++) {
        // making sure mine doesnt happan one on one. 
        if (gBoard[renderMine.i][renderMine.j].isMine === true || gBoard[renderMine.i][renderMine.j].isclicked === true) {
            randomRow = getRandomInt(0, gBoard[0].length)
            randomColl = getRandomInt(0, gBoard[0].length)
            renderMine = {
                i: randomRow,
                j: randomColl,
            }
        }
        gMines.push(renderMine);
        // put random mine on board.
        gBoard[randomRow][randomColl].img = MINE;
        gBoard[randomRow][randomColl].isMine = true;

        //render the random mine 
        renderCell(renderMine, FLOOR)
            // hide mine.

        //restart varibels
        randomRow = getRandomInt(0, gBoard[0].length)
        randomColl = getRandomInt(0, gBoard[0].length)
        renderMine = {
            i: randomRow,
            j: randomColl,
        }
    }
}

function checkIfWin() {
    var flagCounter = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            // check when flag cell is also a mine cell.
            if (gBoard[i][j].isFlag === true && gBoard[i][j].isMine === true) flagCounter++
        }
    }

    if (flagCounter === gMines.length) {
        console.log('victory');
        document.querySelector('.victory').style.visibility = 'visible';
        clearInterval(gClockInterval);
        document.querySelector('.smiley').src = 'img/smiley_win.png';
        gGameisOn = false;
        if (SIZE === 4) {
            if (gtimeScore < localStorage.getItem('easy')) {
                localStorage.setItem('easy', gtimeScore)
                document.querySelector('.score').innerText = 'best score ' + localStorage.getItem('easy');
            }
        }
    } else if (SIZE === 8) {
        if (gtimeScore < localStorage.getItem('medium')) {
            localStorage.setItem('medium', gtimeScore);
        }
    } else {
        if (gtimeScore < localStorage.getItem('hard')) {
            localStorage.setItem('hard', gtimeScore)

        }
    }
}


function expendCellHint(cellLoc) {
    var res = [];
    var i = cellLoc.i;
    var j = cellLoc.j;
    for (var r = i - 1; r <= i + 1; r++) {
        for (var c = j - 1; c <= j + 1; c++) {
            if (r < 0 || c < 0 || r >= gBoard.length || c >= gBoard[0].length) continue;
            if (r === gBoard[r] && c === gBoard[c]) continue;
            var expendCell = {
                i: r,
                j: c,
            }

            res.push(expendCell);
        }
    }
    //render the negs cells.
    for (var h = 0; h < res.length; h++) {
        renderCell(res[h], '<div style = " background-color: lightgrey " class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)"> ' + gBoard[res[h].i][res[h].j].img + '</div>');
    }
}


function returnCells(cellLoc) {
    var res = [];
    var i = cellLoc.i;
    var j = cellLoc.j;
    for (var r = i - 1; r <= i + 1; r++) {
        for (var c = j - 1; c <= j + 1; c++) {
            if (r < 0 || c < 0 || r >= gBoard.length || c >= gBoard[0].length) continue;
            if (r === gBoard[r] && c === gBoard[c]) continue;
            var expendCell = {
                i: r,
                j: c,
            }
            res.push(expendCell)
        }
    }
    //render the negs cells.
    for (var h = 0; h < res.length; h++) {
        renderCell(res[h], '<div class="cell cell' + res[h].i + '-' + res[h].j + '" onmousedown="cellClicked(' + res[h].i + ', ' + res[h].j + ',event, this)"></div>');
    }
}


function useHint(elHint) {

    if (confirm('HINT: You can click on any cell you want, after that you will have 2 sec to see, Ok? ')) {
        gIsHintclick = true;
        elHint.style.visibility = 'hidden';
    } else return;
}

function gameOver() {
    console.log('gameover');
    document.querySelector('.gameOver').style.visibility = 'visible';
    clearInterval(gClockInterval);
    document.querySelector('.smiley').src = 'img/smiley_sad.png';
    gGameisOn = false;
}

function playAgain() {
    if (SIZE === 4) gMineCounter = 2;
    else if (SIZE === 8) gMineCounter = 12;
    else if (SIZE === 12) gMineCounter = 30;
    init();
}

function isEmptyCell(cellLoc) {
    return gBoard[cellLoc.i][cellLoc.j].isMine === false;
}

function renderCell(location, value) {

    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function timer() {
    var clockTime = document.querySelector('.timer');
    var startTime = Date.now();
    gClockInterval = setInterval(function() {
        gTime = (Date.now() - startTime) / 1000;
        gtimeScore = gTime
        clockTime.innerText = gTime;
    }, 100);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}