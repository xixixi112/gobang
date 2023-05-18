<!--
 * @Descripttion: 
 * @version: 
 * @Author: 韩震
 * @Date: 2023-04-23 22:45:46
 * @LastEditors: 韩震
 * @LastEditTime: 2023-05-18 15:46:49
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
import { initBoard } from "./home";
import { initShaders, vec2, vec4, flatten } from "@/utils/utils";
export default {
  data() {
    return {
      pointArr: [],
      gl: null,
      canvas: null,
      vertexBuffer: null,
      boardVertexNumber: 84, //棋盘顶点数量，用gl.lines绘制时，横纵各需要21条线，每条线2个顶点，总共84个顶点
      boardSegment: 20, //棋盘的格数 20*20
      chessNumber: 0, // 棋子个数
      chessSegment: 36, //绘制圆形棋子需要多个顶点，暂定为1个点
      chessVertexCount: 0, //绘制所有棋子的顶点个数 chessNumber * chessSegment
    };
  },
  // created() {},
  mounted() {
    this.getCanvas();
  },
  methods: {
    //获取canvas,绘制棋盘

    getCanvas() {
      const canvasSize = Math.min(window.innerHeight, window.innerWidth) * 0.75;
      // 棋盘顶点坐标数组
      const boardVertex = [];
      const rowNumber = this.boardSegment + 1;
      const colNumber = this.boardSegment + 1;
      // const rowHeight = 2 / boardSegment;
      // const columnWidth = 2 / boardSegment;
      for (let i = 0; i < rowNumber; i++) {
        boardVertex.push(vec2(-1.0, -1.0 + i * 0.1), vec2(1.0, -1.0 + i * 0.1));
      }
      for (let i = 0; i < colNumber; i++) {
        boardVertex.push(vec2(-1.0 + i * 0.1, -1.0), vec2(-1.0 + i * 0.1, 1.0));
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
    pointing(e) {
      let x = e.clientX;
      let y = e.clientY;
      this.chessNumber++;
      console.log(x, y);
      let rect = e.target.getBoundingClientRect();
      x = (x - rect.left - this.canvas.width / 2) / (this.canvas.width / 2);
      y = (this.canvas.height / 2 - (y - rect.top)) / (this.canvas.height / 2);
      // 保证点在格子上
      x = Math.round(x * 10) / 10;
      y = Math.round(y * 10) / 10;
      let chessVectexArr = this.chessVertex(x, y);
      
      console.log(chessVectexArr);
      // this.pointArr.push([x,y])
      // gl.clear(gl.COLOR_BUFFER_BIT)
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
        let chessColor =
          (i / this.chessSegment) % 2
            ? vec4(1.0, 1.0, 1.0, 1.0)
            : vec4(0.0, 0.0, 0.0, 1.0);
        this.gl.uniform4fv(u_Color, chessColor);
        this.gl.drawArrays(
          this.gl.TRIANGLE_FAN,
          this.boardVertexNumber + i,
          this.chessSegment
        );
      }
    },
  },
};
</script>

<style></style>
