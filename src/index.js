import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;

function Square(props) {
  let bgCol;
  switch(props.value){
    case 1:
      bgCol = "bg-col1";
      break;
    case 2:
      bgCol = "bg-col2";
      break;
    case 3:
      bgCol = "bg-col3";
      break;
    default:
      bgCol = "bg-col4";
      break;
  }
  return (
    <button 
      className = {"square " + (props.highlight ? "highlight" : bgCol)}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onMouseUp={props.onMouseUp}
      onMouseDown={props.onMouseDown}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    let squares = Array(BOARD_HEIGHT);
    for (var i = squares.length - 1; i >= 0; i--) {
      squares[i] = Array(BOARD_WIDTH);
      for (var j = squares[i].length - 1; j >= 0; j--) {
        squares[i][j] = rand123();
      }
    }
    this.state = {
      squares: squares,
      trace: [],
      points: 0,
    };
  }

  handleMouse(x,y,event) {
    if (!this.hasMoreMoves()){
      return;
    }
    if (this.state.trace.length === 0) { // not currently drawing
      if (event === "down") {
        const trace = this.state.trace.concat([{x:x,y:y}]);
        this.setState({trace: trace});
      }
    } else {
      if (x === -1 && y === -1) {
        event = "up";
      }
      const last = this.state.trace[this.state.trace.length - 1];
      if ( x > -1 && y > -1 && !this.isAdjacent(x,y, last['x'], last['y']) ) {
        // wrong track, reset
        this.setState({trace: []});
      }
      switch(event){
        case "enter":
          const idx = this.isInTrace(x,y);
          if (idx > -1) {
            this.setState({trace: this.state.trace.splice(0,idx+1)});
          } else {
            this.setState({trace: this.state.trace.concat([{x:x,y:y}])});
          }
          break;
        case "up":
          if (x === -1 && y === -1){
            this.setState({trace: []});
            break;
          }
          const [points, squares] = this.calculatePoints();
          if (squares !== null)
            this.setState({trace: [], points: this.state.points + points, squares: squares});
          else
            this.setState({trace: []});
          break;
        default:
          break;
      }
    }
  }

  isInTrace(x,y) {
    for (var i = 0; i < this.state.trace.length; i++) {
      if (this.state.trace[i]['x'] === x && this.state.trace[i]['y'] === y){
        return i;
      }
    }
    return -1;
  }

  isAdjacent(x1,y1,x2,y2) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);

    if (dx === 1 && dy === 0)
      return true;
    if (dx === 0 && dy === 1)
      return true;
    return false;
  }

  calculatePoints(){
    const trace = this.state.trace;
    const squares = this.state.squares;
    if (trace.length === 0 || trace.length === 1){
      return [0, null];
    }
    const v = squares[trace[0]['x']][trace[1]['y']];
    let points = v;

    for (var i = 1; i < trace.length; i++) {
      if (v !== squares[trace[i]['x']][trace[i]['y']]){
        return [0, null];
      } else {
        points += v;
      }
    }

    let new_squares = Array(BOARD_HEIGHT);
    for (i = new_squares.length - 1; i >= 0; i--) {
      new_squares[i] = Array(BOARD_WIDTH);
      for (var j = new_squares[i].length - 1; j >= 0; j--) {
        new_squares[i][j] = squares[i][j];
      }
    }
    for (i = 0; i < trace.length-1; i++) {
      new_squares[trace[i]['x']][trace[i]['y']] = rand123();
    }
    new_squares[trace[trace.length-1]['x']][trace[trace.length-1]['y']] = points;
    return [points, new_squares];
  }

  hasMoreMoves(){
    for (var i = 0; i < BOARD_HEIGHT; i++) {
      const i1 = i+1;
      for (var j = 0; j < BOARD_WIDTH; j++) {
        const j1 = j+1;
        if (i1 < BOARD_HEIGHT && this.state.squares[i][j] === this.state.squares[i1][j]){
          return true;
        }
        if (j1 < BOARD_WIDTH && this.state.squares[i][j] === this.state.squares[i][j1]){
          return true;
        }
      }
    }
    return false;
  }

  renderSquare(x,y) {
    return <Square 
        value={this.state.squares[x][y]}
        highlight={this.isInTrace(x, y) > -1} 
        onMouseEnter={() => this.handleMouse(x,y,"enter")}
        onMouseUp={() => this.handleMouse(x,y,"up")}
        onMouseDown={() => this.handleMouse(x,y,"down")} 
        key={x + "_" + y}
      />;
  }

  render() {
    let board = [];
    for (var i = 0; i < BOARD_HEIGHT; i++) {
      let row = [];
      for (var j = 0; j < BOARD_WIDTH; j++) {
        row.push(this.renderSquare(i,j));
      }
      board.push(<div className="board-row" key={i.toString()}>
        {row}
      </div>);
    }
    const status = (this.hasMoreMoves() ? "Points: " : "Match ended. Points: ") + this.state.points;
    return (
      <div>
        <div className="status">{status}</div>
        <div onMouseLeave={() => this.handleMouse(-1,-1,"leave")}>
          {board}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-info">
          Game inspired by <a href="https://gridentify.com/">Gridentify</a> with few changes.
        </div>
        <div className="game-board">
          <Board />
        </div>
      </div>
    );
  }
}

function rand123(){
  return Math.floor(Math.random() * 3) + 1;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
