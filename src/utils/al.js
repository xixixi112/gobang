const directionArrs = ["r","rd","d","ld"];
// 权重相关变量 forward  backward   center  double  null
const n2f1 = 0.3, // 两头空时 前面第一个空位置的权重
n2f2 = 0.1, // 两头空时 前面第二个空位置的权重
n2b1 = n2f1,
n2b2 = n2f2,
n1f1 = -0.1, // 一头空另一头是敌方或边界时  前面第一个空位置的权重
n1f2 = -0.2,
n1b1 = n1f1,
n1b2 = n1f2,
dn2c = 0.3, // 有两个片段时   两端都是空的时   中间位置的权重
dn2b1 = 0.1,// 有两个片段时   两端都是空的时   后方第一个位置的权重
dn2f1 = dn2b1,
dn1c = -0.1,
dn1b1 = -0.1,
dn1f1 = dn1b1;

export function directionCount(chessArr, direction, oneSide, i, j) {
    let count = 0;
    let nd = getNumberDirection(direction);
    if (chessArr[i][j] === oneSide) {
      count = 1;
      for (let k = 1; k < 5; k++) {
        if (
          chessArr[i + k * nd.h] &&
          chessArr[i + k * nd.h][j + k * nd.v] === oneSide
        ) {
          count++;
          continue;
        } else {
          break;
        }
      }
    }
    return count;
}

export function reverseDirection(direction) {
    let rd = "";
    switch (direction) {
      case "r":
        rd = "l";
        break;
      case "rd":
        rd = "lt";
        break;
      case "d":
        rd = "t";
        break;
      case "ld":
        rd = "rt";
        break;
      case "l":
        rd = "r";
        break;
      case "lt":
        rd = "rd";
        break;
      case "t":
        rd = "d";
        break;
      case "rt":
        rd = "ld";
        break;
      default:
        console.error("输入方向不对，无法反转");
    }
    return rd;
}

// 合并同一个位置的权重
function sumWeight(arr, x, y, weight) {
  let index = -1;
  for (let i = 0, len = arr.length; i < len; i++) {
    if (arr[i].x == x && arr[i].y == y) {
      index = i;
      break;
    }
  }
  if (index != -1) {
    // 如果已存在则权重相加
    arr[index].weight += weight;
  } else {
    // 如果不存在则添加一条
    arr.push({ x, y, weight });
  }
}

function bestPosition(myPointPositions, machinePointPositions) {
    let myMax = 0,
    myP = {},
    myArr = [];
    for (let i = 0, len = myPointPositions.length; i < len; i++) {
      if (myPointPositions[i].weight > myMax) {
        myMax = myPointPositions[i].weight;
        myP.x = myPointPositions[i].x;
        myP.y = myPointPositions[i].y;
      }
    }
    let enemyMax = 0,
    enemyP = {},
    enemyArr = [];
    for (let i = 0, len = machinePointPositions.length; i < len; i++) {
      if (machinePointPositions[i].weight > enemyMax) {
        enemyMax = machinePointPositions[i].weight;
        enemyP.x = machinePointPositions[i].x;
        enemyP.y = machinePointPositions[i].y;
      }
    }

    console.log("敌方权重最大：" + enemyMax, "我方权重最大：" + myMax);
    for (let i = 0, len = myPointPositions.length; i < len; i++) {
      if (myPointPositions[i].weight === myMax) {
        myArr.push(deepClone(myPointPositions[i]));
      }
    }
    for (let i = 0, len = machinePointPositions.length; i < len; i++) {
      if (machinePointPositions[i].weight === enemyMax) {
        enemyArr.push(deepClone(machinePointPositions[i]));
      }
    }
    console.log("myArr=", myArr, "enemyArr=", enemyArr)
    if (enemyMax > myMax) {
      // 敌方权重最大的地方（有相同位置时，谋求自己的大权重位置）
      let myMaxW = 0; // 我方在敌方最有位置处的最佳权重
      let recommedP = enemyP;
      for (let i = 0, len = enemyArr.length; i < len; i++) {
        for (let j = 0, len1 = myPointPositions.length; j < len1; j++) {
          if(
            myPointPositions[j].x == enemyArr[i].x && myPointPositions[j].y == enemyArr[i].y)
            {
                if(myPointPositions[j].weight > myMaxW){
                    myMaxW = myPointPositions[j].weight;
                    recommedP.x = myPointPositions[j].x;
                    recommedP.y = myPointPositions[j].y;
                }
            }
        }
      }
      return recommedP;
    } 
    else {
      // 我方权重最大的地方（有相同位置时，占据敌方的相对大权重位置）
      let enemyMaxW = 0; // 我方在敌方最有位置处的最佳权重
      let recommedP = myP;
      for (let i = 0, len = myArr.length; i < len; i++) {
        for (let j = 0, len1 = machinePointPositions.length; j < len1; j++) {
          if (machinePointPositions[j].x == myArr[i].x && machinePointPositions[j].y == myArr[i].y) 
          {
            if(machinePointPositions[j].weight > enemyMaxW) {
              enemyMaxW = machinePointPositions[j].weight;
              recommedP.x = machinePointPositions[j].x;
              recommedP.y = machinePointPositions[j].y;
            }
          }
        }
      }
      return recommedP;
    }
}

function deepClone(values) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == values || "object" != typeof values) return values;

    // Handle Date
    if (values instanceof Date) {
      copy = new Date();
      copy.setTime(values.getTime());
      return copy;
    }

    // Handle Array
    if (values instanceof Array) {
      copy = [];
      for (var i = 0, len = values.length; i < len; i++) {
        copy[i] = deepClone(values[i]);
      }
      return copy;
    }

    // Handle Object
    if (values instanceof Object) {
      copy = {};
      for (var attr in values) {
        if (values.hasOwnProperty(attr))
          copy[attr] = deepClone(values[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy values! Its type isn't supported.");
}

function getNumberDirection(direction) {
    let res = { h: 0, v: 0 }; // h horizontal v vertical
    switch (direction) {
      case "r":
        res.h = 1;
        res.v = 0;
        break;
      case "rd":
        res.h = 1;
        res.v = 1;
        break;
      case "d":
        res.h = 0;
        res.v = 1;
        break;
      case "ld":
        res.h = -1;
        res.v = 1;
        break;
      case "l":
        res.h = -1;
        res.v = 0;
        break;
      case "lt":
        res.h = -1;
        res.v = -1;
        break;
      case "t":
        res.h = 0;
        res.v = -1;
        break;
      case "rt":
        res.h = 1;
        res.v = -1;
        break;
      default:
        console.error("方向输入有误");
    }
    return res;
}
function getNextPoint(chessArr, myPointPositions, machinePointPositions){
    let oneSide = 1
    let enemySide = -1
    let chessLength = chessArr.length
    for(let i=1;i<chessLength;i++){         
        for(let j=1;j<chessLength;j++){    
            if(chessArr[i][j] === oneSide){ // 我方
                for(let d = 0; d<directionArrs.length;d++){
                    let count = directionCount(chessArr, directionArrs[d],oneSide,i,j);
                    let nd = getNumberDirection(directionArrs[d]);
                    let h = nd.h;
                    let v = nd.v;
                    // 某个方向的末端的推荐权重  (权重暂时认为后方第一个位置和第二位位置一样) 两头空的+0.2  一端空的+0  两端都死的考虑能否凑5个子
                    if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === 0){ // 前1空
                        if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === 0){ // 末1空
                            if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === 0){ //末2空
                                sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+n2b1));
                                sumWeight(myPointPositions,i+(count+1)*h,j+(count+1)*v,10**(count+n2b2));
                            }else if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === oneSide){ // 末2己
                                let count2 = directionCount(chessArr, directionArrs[d],oneSide,i+(count+1)*h,j+(count+1)*v);
                                if(chessArr[i+(count+1+count2)*h] && chessArr[i+(count+1+count2)*h][j+(count+1+count2)*v] === 0){
                                    sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+count2+dn2c));
                                    sumWeight(myPointPositions,i+(count+1+count2)*h,j+(count+1+count2)*v,10**(count+count2+dn2b1));
                                }else {
                                    sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+count2+dn1c));
                                }
                            }else { //末2敌或边界  
                                sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+n1b1));
                            }
                        }else { // 末1敌或边界   末1不可能是己方的
                            // 末端没有推荐的位置
                        }
                    }else if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === oneSide){ // 前1己  这里已经计算过了，跳过逻辑
                        continue;
                    }else { // 前1 敌方或边界
                        if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === 0){ // 末1空
                            if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === 0){ //末2空
                                sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+n1b1));
                                sumWeight(myPointPositions,i+(count+1)*h,j+(count+1)*v,10**(count+n1b2));
                            }else if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === oneSide){ // 末2己
//                                    sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+0.1));
                                let count2 = directionCount(chessArr, directionArrs[d],oneSide,i+(count+1)*h,j+(count+1)*v);
                                if(chessArr[i+(count+1+count2)*h] && chessArr[i+(count+1+count2)*h][j+(count+1+count2)*v] === 0){
                                    sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+count2+dn1c));
                                    sumWeight(myPointPositions,i+(count+1+count2)*h,j+(count+1+count2)*v,10**(count+count2+dn1b1));
                                }else {// 两端是死的 中间要么是5要么就没意义
                                    if(count+1+count2 == 5){
                                        sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+count2+1));
                                    }else{
                                        sumWeight(myPointPositions,i+count*h,j+count*v,0);
                                        //console.log("中间凑不够5个，中间权重是0");
                                    }
                                }
                            }else { //末2敌或边界
                                if(count==4){ // 只有四颗子的时候这个位置才有意义
                                    sumWeight(myPointPositions,i+count*h,j+count*v,10**(count+1));
                                }
                            }
                        }else { // 末1敌或边界   末1不可能是己方的
                            // 走不了了
                        }
                    }
                    // 某个方向的前端的推荐权重
                    if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === 0){ // 后1空
                        if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === 0){ // 前1空
                            if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === 0){ //前2空
                                sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+n2f1));
                                sumWeight(myPointPositions,i-2*h,j-2*v,10**(count+n2f2));
                            }else if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === oneSide){ // 前2己
//                                    sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+0.3));
                                let count2 = directionCount(chessArr, reverseDirection(directionArrs[d]),oneSide,i-2*h,j-2*v);
                                if(chessArr[i-(1+count2)*h] && chessArr[i-(1+count2)*h][j-(1+count2)*v] === 0){
                                    sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+count2+dn2c));
                                    sumWeight(myPointPositions,i-(1+count2)*h,j-(1+count2)*v,10**(count+count2+dn2f1));
                                }else {
                                    sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+count2+dn1c));
                                    sumWeight(myPointPositions,i-(1+count2)*h,j-(1+count2)*v,10**(count+count2+dn1f1));
                                }
                            }else { //前2敌或边界
                                sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+n1f1));
                            }
                        }else { // 前1敌或边界   前1不可能是己方的
                            // 前端没有推荐的位置
                        }
                    }else if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === oneSide){ // 后1己  这里已经计算过了，跳过逻辑
                        continue;
                    }else { // 后1 敌方或边界
                        if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === 0){ // 前1空
                            if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === 0){ //前2空
                                sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+n1f1));
                                sumWeight(myPointPositions,i-2*h,j-2*v,10**(count+n1f2));
                            }else if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === oneSide){ // 前2己
                                // sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+0.1));
                                let count2 = directionCount(chessArr, reverseDirection(directionArrs[d]),oneSide,i-2*h,j-2*v);
                                if(chessArr[i-(1+count2)*h] && chessArr[i-(1+count2)*h][j-(1+count2)*v] === 0){
                                    sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+count2+dn1c));
                                    sumWeight(myPointPositions,i-(1+count2)*h,j-(1+count2)*v,10**(count+count2+dn1f1));
                                }else {
                                    if(count+1+count2 == 5){
                                        sumWeight(myPointPositions,i-1*h,j-1*v,10**(count+count2+1));
                                    }else{
                                        sumWeight(myPointPositions,i-1*h,j-1*v,0);
                                        //console.log("中间凑不够5个，中间权重是0");
                                    }
                                }
                            }else { //前2敌或边界
                                if(count==4){ // 只有四颗子的时候这个位置才有意义
                                    sumWeight(myPointPositions,i-2*h,j-2*v,10**(count+1));
                                }
                            }
                        }else { // 前1敌或边界  前1不可能是己方的
                            // 前后都是敌，推荐个锤子
                        }
                    }
                }
            }else if(chessArr[i][j] === enemySide){ // 敌方
                for(let d = 0;d<directionArrs.length;d++){
                    let count = directionCount(chessArr, directionArrs[d],enemySide,i,j);
                    let nd = getNumberDirection(directionArrs[d]);
                    let h = nd.h;
                    let v = nd.v;
                    // 某个方向的末端的推荐权重
                    if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === 0){ // 前1空
                        if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === 0){ // 末1空
                            if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === 0){ //末2空
                                sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+n2b1));
                                sumWeight(machinePointPositions,i+(count+1)*h,j+(count+1)*v,10**(count+n2b2));
                            }else if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === enemySide){ // 末2己
                                let count2 = directionCount(chessArr, directionArrs[d],enemySide,i+(count+1)*h,j+(count+1)*v);
                                if(chessArr[i+(count+1+count2)*h] && chessArr[i+(count+1+count2)*h][j+(count+1+count2)*v] === 0){
                                    sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+count2+dn2c));
                                    sumWeight(machinePointPositions,i+(count+1+count2)*h,j+(count+1+count2)*v,10**(count+count2+dn2b1));
                                }else {
                                    sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+count2+dn1c));
                                }
                                // sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+0.3));
                            }else { //末2敌或边界  
                                sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+n1b1));
                            }
                        }else { // 末1敌或边界   末1不可能是己方的
                            // 末端没有推荐的位置
                        }
                    }else if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === enemySide){ // 前1己  这里已经计算过了，跳过逻辑
                        continue;
                    }else { // 前1 敌方或边界
                        if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === 0){ // 末1空
                            if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === 0){ //末2空
                                sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+n1b1));
                                sumWeight(machinePointPositions,i+(count+1)*h,j+(count+1)*v,10**(count+n1b2));
                            }else if(chessArr[i+(count+1)*h] && chessArr[i+(count+1)*h][j+(count+1)*v] === enemySide){ // 末2己
                                //sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+0.1));
                                let count2 = directionCount(chessArr, directionArrs[d],enemySide,i+(count+1)*h,j+(count+1)*v);
                                if(chessArr[i+(count+1+count2)*h] && chessArr[i+(count+1+count2)*h][j+(count+1+count2)*v] === 0){
                                    sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+count2+dn1c));
                                    sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+count2+dn1f1));
                                }else {// 两端是死的，看中间够5个不
                                    if(count+1+count2 == 5){
                                        sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+count2+1));
                                    }else{
                                        sumWeight(machinePointPositions,i+count*h,j+count*v,0);
                                        //console.log("中间凑不够5个，中间权重是0");
                                    }
                                }
                            }else { //末2敌或边界
                                if(count==4){ // 只有四颗子的时候这个位置才有意义
                                    sumWeight(machinePointPositions,i+count*h,j+count*v,10**(count+1));
                                }
                            }
                        }else { // 末1敌或边界   末1不可能是己方的
                            // 走不了了
                        }
                    }
                    
                    // 某个方向的前端的推荐权重
                    if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === 0){ // 后1空
                        if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === 0){ // 前1空
                            if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === 0){ //前2空
                                sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+n2f1));
                                sumWeight(machinePointPositions,i-2*h,j-2*v,10**(count+n2f2));
                            }else if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === enemySide){ // 前2己
                                // sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+0.3));
                                let count2 = directionCount(chessArr, reverseDirection(directionArrs[d]),enemySide,i-2*h,j-2*v);
                                if(chessArr[i-(1+count2)*h] && chessArr[i-(1+count2)*h][j-(1+count2)*v] === 0){
                                    sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+count2+dn2c));
                                    sumWeight(machinePointPositions,i-(1+count2)*h,j-(1+count2)*v,10**(count+count2+dn2f1));
                                }else {
                                    sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+count2+dn1c));
                                }
                            }else { //前2敌或边界
                                sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+dn1c));
                            }
                        }else { // 前1敌或边界   前1不可能是己方的
                            // 前端没有推荐的位置
                        }
                    }else if(chessArr[i+count*h] && chessArr[i+count*h][j+count*v] === enemySide){ // 后1己  这里已经计算过了，跳过逻辑
                        continue;
                    }else { // 后1 敌方或边界
                        if(chessArr[i-1*h] && chessArr[i-1*h][j-1*v] === 0){ // 前1空
                            if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === 0){ //前2空
                                sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+n1f1));
                                sumWeight(machinePointPositions,i-2*h,j-2*v,10**(count+n1f2));
                            }else if(chessArr[i-2*h] && chessArr[i-2*h][j-2*v] === enemySide){ // 前2己
                                // sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+0.1));
                                let count2 = directionCount(chessArr, reverseDirection(directionArrs[d]),enemySide,i-2*h,j-2*v);
                                if(chessArr[i-(1+count2)*h] && chessArr[i-(1+count2)*h][j-(1+count2)*v] === 0){
                                    sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+count2+dn1c));
                                    sumWeight(machinePointPositions,i-(1+count2)*h,j-(1+count2)*v,10**(count+count2+dn1f1));
                                }else { // 前后是死的
                                    if(count+1+count2 == 5){
                                        sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+count2+1));
                                    }else{
                                        sumWeight(machinePointPositions,i-1*h,j-1*v,0);
                                        //console.log("中间凑不够5个，中间权重是0");
                                    }
                                }
                            }else { //前2敌或边界
                                if(count==4){ // 只有四颗子的时候这个位置才有意义
                                    sumWeight(machinePointPositions,i-1*h,j-1*v,10**(count+1));
                                }
                            }
                        }else { // 前1敌或边界  前1不可能是己方的
                            // 前后都是敌，推荐个锤子
                        }
                    }
                    
                }
            }
        }
    }
}


export function getMachinePoint(chessArr){
    let myPointPositions = []
    let machinePointPositions = []
    getNextPoint(chessArr, myPointPositions, machinePointPositions)
    console.log(myPointPositions, machinePointPositions)
    return bestPosition(myPointPositions, machinePointPositions)
}