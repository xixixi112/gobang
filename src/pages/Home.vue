<!--
 * @Descripttion: 
 * @version: 
 * @Author: 韩震
 * @Date: 2023-04-23 22:45:46
 * @LastEditors: 韩震
 * @LastEditTime: 2023-08-13 16:49:28
-->
<template>
  <div>
    <div>
      <canvas id="board" width="400" height="400" @click="pointing"></canvas>
    </div>
  </div>
</template>

<script>
import FSHADER from "@/glsl/fshader.glsl";
import VSHADER from "@/glsl/vshader.glsl";
import { initShaders, vec2, vec4, flatten } from "@/utils/utils";
import {getMachinePoint, directionCount, reverseDirection} from "@/utils/al"
export default {
  data() {
    return {
      pointArr: [],
      gl: null,
      canvas: null,
      vertexBuffer: null,
      boardVertexNumber: 0, //棋盘顶点数量，用gl.LINES绘制时，横纵各需要21条线，每条线2个顶点，总共84个顶点
      boardSegment: 20, //棋盘的格数 20*20
      chessNumber: 0, // 棋子个数
      chessSegment: 36, //绘制圆形棋子需要画扇形，确定圆心后使用36个个顶点画扇形
      chessVertexCount: 0, //绘制所有棋子的顶点个数 chessNumber * chessSegment
      chessArr:null, //棋盘数组，0表示该点未下，1表示该点为黑色棋子，-1表示该点为白色棋子
      curChessColor:1, //当前棋子的颜色，1代表黑色，-1代表白色
      pointMessageArrs:[],
      directionArrs: ["r","rd","d","ld"]
    };
  },
  created() {
    this.chessArr = new Array(this.boardSegment).fill(0).map(item => new Array(this.boardSegment).fill(0))
    this.boardVertexNumber = this.boardSegment * 4
    // this.pointMessageArrs = new Array(this.boardSegment).fill(0).map(item => new Array(this.boardSegment).fill(0))
  },
  mounted() {
    this.getCanvas();
  },
  methods: {
    //获取canvas,绘制棋盘
    getCanvas() {
      const canvasSize = Math.min(window.innerHeight, window.innerWidth) * 0.75;
      // 棋盘顶点坐标数组
      const boardVertex = [];
      const rowNumber = this.boardSegment;
      const colNumber = this.boardSegment;
      // const rowHeight = 2 / boardSegment;
      // const columnWidth = 2 / boardSegment;
      for (let i = 0; i < rowNumber; i++) {
        boardVertex.push(vec2(-0.95, -0.95 + i * 0.1), vec2(0.95, -0.95 + i * 0.1));
      }
      for (let i = 0; i < colNumber; i++) {
        boardVertex.push(vec2(-0.95 + i * 0.1, -0.95), vec2(-0.95 + i * 0.1, 0.95));
      }
      // const vertices = Float32Array.from(boardVertex);
      let canvas = document.getElementById("board");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      this.canvas = canvas;
      let gl = canvas.getContext("webgl");
      this.gl = gl;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(204 / 255, 161 / 255, 129 / 255, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed");
        return;
      }
      // 创建缓冲区
      this.vertexBuffer = gl.createBuffer();
      // 将缓冲区对象绑定到目标
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      // 向缓冲区对象写入数据
      let maxPoints =
        this.boardVertexNumber +
        (this.boardSegment + 1) ** 2 * this.chessSegment;
      gl.bufferData(gl.ARRAY_BUFFER, maxPoints * 8, gl.STATIC_DRAW);
      let a_Position = gl.getAttribLocation(gl.program, "a_Position");
      // 将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      // 开启attribute变量
      gl.enableVertexAttribArray(a_Position);
      let u_Color = gl.getUniformLocation(gl.program, "u_Color");
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(boardVertex));

      gl.uniform4f(u_Color, 0.0, 0.0, 0.0, 1.0);
      gl.drawArrays(gl.LINES, 0, this.boardVertexNumber);
    },

    // 绘制一个棋子的点集
    chessVertex(x, y) {
      const chessRadius = 2 / 25 / 2;
      let chessVectexArr = [];
      for (let i = 0; i < this.chessSegment; i++) {
        const x_chess =
          x + chessRadius * Math.cos(((Math.PI * 2) / this.chessSegment) * i);
        const y_chess =
          y + chessRadius * Math.sin(((Math.PI * 2) / this.chessSegment) * i);
        chessVectexArr.push(vec2(x_chess, y_chess));
      }
      return chessVectexArr;
    },
    async pointing(e) {
      let x = e.clientX;
      let y = e.clientY;
      this.chessNumber++;
      let rect = e.target.getBoundingClientRect();
      x = (x - rect.left - this.canvas.width / 2) / (this.canvas.width / 2);
      y = (this.canvas.height / 2 - (y - rect.top)) / (this.canvas.height / 2);
      // 保证点在格子中间
      x = parseFloat((Math.round((x + 0.05) * 10) / 10 - 0.05).toFixed(2));  //toFixed是避免0.1+0.2!==0.3，保留2位小数
      y = parseFloat((Math.round((y + 0.05) * 10) / 10 - 0.05).toFixed(2));
      // console.log(x,y)
      let whereX = Math.round((x - 0.05) * 10 + 10)
      let whereY = Math.round((y - 0.05) * 10 + 10)
      // console.log(whereX, whereY)
      if(whereX < 0 || whereY < 0) {
        alert("请勿点击棋盘外")
        return
      }
      if(this.chessArr[whereX][whereY] !== 0){
        alert("该点已经落子，请选择其他位置落子")
        return
      }
      this.chessArr[whereX][whereY] = 1
      await this.asyncDraw(x,y)
      // 判断输赢
      for(let item of this.directionArrs){
        // console.log(item, directionCount(this.chessArr, item, 1, whereX, whereY) + directionCount(this.chessArr, reverseDirection(item), 1, whereX, whereY))
        if(directionCount(this.chessArr, item, 1, whereX, whereY) + directionCount(this.chessArr, reverseDirection(item), 1, whereX, whereY) - 1 === 5){
          this.canvas.style["pointer-events"] = "none"
          alert("黑棋胜利")
          return 
        }
      }

      let machinePoint = getMachinePoint(this.chessArr)
      this.chessArr[machinePoint.x][machinePoint.y] = -1
      this.chessNumber++;
      // debugger
      // console.log(machinePoint)
      await this.asyncDraw((machinePoint.x -10)/10+0.05,(machinePoint.y -10)/10+0.05)
      // 判断输赢
      for(let item of this.directionArrs){
        // console.log(item, directionCount(this.chessArr, item, -1, machinePoint.x, machinePoint.y) + directionCount(this.chessArr, reverseDirection(item), 1, machinePoint.x, machinePoint.y))
        if(directionCount(this.chessArr, item, -1, machinePoint.x, machinePoint.y) + directionCount(this.chessArr, reverseDirection(item), -1, machinePoint.x, machinePoint.y) - 1 === 5){
          this.canvas.style["pointer-events"] = "none"
          alert("白棋胜利")
          return 
        }
      }
    },
    // 每次落子后进行绘制
    drawChess(x,y){
      this.curChessColor = -1 * this.curChessColor
      let chessVectexArr = this.chessVertex(x, y);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      this.gl.bufferSubData(
        this.gl.ARRAY_BUFFER,
        (this.boardVertexNumber + this.chessVertexCount) * 8,
        flatten(chessVectexArr)
      );
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      let u_Color = this.gl.getUniformLocation(this.gl.program, "u_Color");
      this.gl.uniform4f(u_Color, 0.0, 0.0, 0.0, 1.0);
      this.gl.drawArrays(this.gl.LINES, 0, this.boardVertexNumber);
      this.chessVertexCount += this.chessSegment;
      for (let i = 0; i < this.chessVertexCount; i += this.chessSegment) {
        let chessColor = (i / this.chessSegment) % 2? vec4(1.0, 1.0, 1.0, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
        this.gl.uniform4fv(u_Color, chessColor);
        this.gl.drawArrays(
          this.gl.TRIANGLE_FAN,
          this.boardVertexNumber + i,
          this.chessSegment
        );
      }
    },
    asyncDraw(x,y) {
      return new Promise((resolve) => {
          requestAnimationFrame(() => {
            this.drawChess(x,y);
            setTimeout(() => {
              resolve();
            },0);
          });
      });
    }

  },
};
</script>

<style></style>
