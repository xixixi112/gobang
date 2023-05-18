<!--
 * @Descripttion: 
 * @version: 
 * @Author: 韩震
 * @Date: 2023-04-23 22:45:46
 * @LastEditors: 韩震
 * @LastEditTime: 2023-04-24 23:33:59
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
import { initShaders } from "@/utils/utils";
export default {
  data() {
    return {
      pointArr: [],
      gl:null,
      canvas:null,
      vertexBuffer:null,
      offset:168,
      chessNumber:0,
      boardVertexNumber:0,
    };
  },
  created() {},
  mounted() {
    this.getCanvas();
  },
  methods: {
    //获取canvas,绘制棋盘
    
    getCanvas() {
      const canvasSize = Math.min(window.innerHeight, window.innerWidth)*0.75;
      // 棋盘的格数 20*20
      const boardSegment = 20;
      // 棋盘的顶点数量
      const boardVertexNumber = (boardSegment + 1) * 4;
      this.boardVertexNumber = boardVertexNumber
      // 棋盘顶点坐标数组
      const boardVertex = [];
      const rowNumber = boardSegment + 1;
      const colNumber = boardSegment + 1;
      // const rowHeight = 2 / boardSegment;
      // const columnWidth = 2 / boardSegment;
      for (let i = 0; i < rowNumber; i++) {
        boardVertex.push(-1.0, -1.0 + i * 0.1, 1.0, -1.0 + i * 0.1);
      }
      for (let i = 0; i < colNumber; i++) {
        boardVertex.push(-1.0 + i * 0.1, -1.0, -1.0 + i * 0.1, 1.0);
      }
      const vertices = Float32Array.from(boardVertex);
      let canvas = document.getElementById("board");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      this.canvas = canvas
      let gl = canvas.getContext("webgl");
      this.gl = gl
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(204 / 255, 161 / 255, 129 / 255, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed");
        return;
      }
      // 创建缓冲区
      const vertexBuffer = gl.createBuffer();
      // 将缓冲区对象绑定到目标
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      // 向缓冲区对象写入数据
      gl.bufferData(gl.ARRAY_BUFFER,vertices, gl.STATIC_DRAW)
      let a_Position = gl.getAttribLocation(gl.program, "a_Position")
      // 将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
      // 开启attribute变量
      gl.enableVertexAttribArray(a_Position)
      let u_Color = gl.getUniformLocation(gl.program, "u_Color")
      gl.uniform4f(u_Color, 0.0, 0.0, 0.0, 1.0)
      // 绘制
      gl.drawArrays(gl.LINES, 0, boardVertexNumber)
    },

    pointing(e){
      // console.log(e)
      // let canvas = document.getElementById("board")
      // let gl = canvas.getContext("webgl")
      // if(!initShaders(gl, VSHADER, FSHADER)){
      //   console.log("Failed")
      //   return
      // }
      // let a_Position = gl.getAttribLocation(gl.program, "a_Position")
      // let u_Color = gl.getUniformLocation(gl.program, "u_Color")
      // if(a_Position < 0){
      //   return
      // }

      let x = e.clientX
      let y = e.clientY
      
      this.chessNumber+=1
      console.log(x, y)
      let rect = e.target.getBoundingClientRect()
      x = ((x - rect.left) - this.canvas.width/2)/(this.canvas.width/2)
      y = (this.canvas.height/2 - (y - rect.top))/(this.canvas.height/2)
      // this.pointArr.push([x,y])
      // gl.clear(gl.COLOR_BUFFER_BIT)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, new Float32Array([x,y]))
      this.offset += 8
      for(let i = 0; i < this.chessNumber; i++){
        this.gl.drawArrays(this.gl.POINTS, this.boardVertexNumber + i, 1)
      }
    }
  },
};
</script>

<style></style>
