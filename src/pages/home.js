const canvasSize = Math.min(window.innerHeight, window.innerWidth) * 0.75;
// 棋盘的格数 20*20
const boardSegment = 20;
// 棋盘的顶点数量
const boardVertexNumber = (boardSegment + 1) * 4;
// 棋盘顶点坐标数组
const boardVertex = [];


// 初始化棋盘的顶点坐标
export function initBoard() {
  const rowNumber = boardSegment + 1;
  const colNumber = boardSegment + 1;
  const rowHeight = 2 / boardSegment;
  const columnWidth = 2 / boardSegment;
  for(let i = 0; i < rowNumber; i++){
    boardVertex.push([vec2(-1.0,-1.0+i*0.1), vec2(1.0,-1.0+i*0.1)])
  }
  for(let i = 0; i < colNumber; i++){
    boardVertex.push([vec2(-1.0+i*0.1,-1.0), vec2(-1.0+i*0.1,1.0)])
  }
  return boardVertex
}
