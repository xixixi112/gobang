var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform float u_TimeIndex;\n" +
  "void main() {\n" +
  "  gl_Position = a_Position;\n" +
  "  gl_PointSize = 5.0+u_TimeIndex*0.5;\n" + //当前点大小
  "}\n";

var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "void main() {\n" +
  "  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n" +
  "  if(d < 0.3) {\n" +
  "    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
  "  } else if(d < 0.5){\n" +
  "    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n" +
  "  } else { discard; }\n" +
  "}\n";
function initShaders(gl, vshader, fshader) {
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log("Failed to create program");
    return false;
  }

  gl.useProgram(program);
  gl.program = program;

  return true;
}
function createProgram(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log("Failed to link program: " + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}
function loadShader(gl, type, source) {
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log("unable to create shader");
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log("Failed to compile shader: " + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
function main() {
  var canvas = document.getElementById("glCanvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("Failed to set the vertex information");
    return;
  }

  var u_TimeIndex = gl.getUniformLocation(gl.program, "u_TimeIndex");
  if (!u_TimeIndex) {
    console.log("Failed to get the storage location of u_TimeIndex");
    return;
  }
  gl.uniform1f(u_TimeIndex, 0.0);

  gl.clearColor(0, 0, 0, 1);

  //当前索引
  var currentIndex = 0.0;
  var tick = function () {
    currentIndex += 1.0; //刷新一次就改变索引一次
    if (currentIndex >= 60.0) {
      currentIndex = 0.0;
    }
    draw(gl, n, u_TimeIndex, currentIndex);
    requestAnimationFrame(tick, canvas); //网页刷新时调用
  };
  tick();
}
main();
function draw(gl, n, u_TimeIndex, currentIndex) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(u_TimeIndex, currentIndex);
  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  var n = 3; //

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.enableVertexAttribArray(a_Position);

  return n;
}
