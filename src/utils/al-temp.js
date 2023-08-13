/*
 * @Descripttion: 
 * @version: 
 * @Author: 韩震
 * @Date: 2023-07-26 22:35:13
 * @LastEditors: 韩震
 * @LastEditTime: 2023-07-27 21:55:47
 */
const EMPTY = 0;
const BLACK = 1;
const WHITE = -1;
const BOARD_SIZE = 20;

// 初始化一个空棋盘
function createEmptyBoard() {
  const board = new Array(BOARD_SIZE);
  for (let i = 0; i < BOARD_SIZE; i++) {
    board[i] = new Array(BOARD_SIZE).fill(EMPTY);
  }
  return board;
}

// 复制棋盘
function copyBoard(board) {
  return board.map((row) => [...row]);
}

// 检查某个位置是否在棋盘范围内
function isValidMove(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

// 检查当前位置是否有五子连珠
function checkWin(board, x, y, player) {
    // 定义四个方向的增量，分别表示水平、垂直、左斜、右斜
    const dx = [1, 0, 1, 1];
    const dy = [0, 1, 1, -1];
  
    // 遍历四个方向
    for (let dir = 0; dir < 4; dir++) {
      let count = 1; // 连珠数从1开始，因为当前位置已经有一个棋子了
  
      // 分别向两个方向遍历，直到不满足连珠条件为止
      for (let i = 1; i <= 4; i++) {
        const nx1 = x + i * dx[dir];
        const ny1 = y + i * dy[dir];
        const nx2 = x - i * dx[dir];
        const ny2 = y - i * dy[dir];
  
        // 判断当前位置是否在棋盘范围内，以及棋子颜色是否与当前玩家一致
        const isValid1 = isValidMove(nx1, ny1) && board[nx1][ny1] === player;
        const isValid2 = isValidMove(nx2, ny2) && board[nx2][ny2] === player;
  
        // 如果两个方向都不满足连珠条件，可以提前退出
        if (!isValid1 && !isValid2) {
          break;
        }
  
        // 统计连珠数
        if (isValid1) {
          count++;
        }
        if (isValid2) {
          count++;
        }
      }
  
      // 如果连珠数达到5个或以上，返回true表示胜利
      if (count >= 5) {
        return true;
      }
    }
  
    // 如果四个方向都没有满足连珠条件，返回false表示没有胜利
    return false;
  }

// 更复杂的评估函数
function evaluate(board, player) {
    const opponent = -player; // 对手的颜色
  
    // 特征权重，用于控制不同特征的重要性
    const featureWeights = {
      playerDouble: 10,     // 玩家双子的权重
      playerTriple: 100,    // 玩家三子的权重
      playerFour: 1000,     // 玩家四子的权重
      playerFive: 10000,    // 玩家五子的权重
      opponentDouble: -10,  // 对手双子的权重
      opponentTriple: -100, // 对手三子的权重
      opponentFour: -1000,  // 对手四子的权重
      opponentFive: -10000, // 对手五子的权重
      playerOpenFour: 2000, // 玩家的活四的权重
      opponentOpenFour: -2000, // 对手的活四的权重
      playerDoubleFour: 1000, // 玩家的双活四的权重
      opponentDoubleFour: -1000, // 对手的双活四的权重
      playerBlockedFour: 500, // 玩家的冲四的权重
      opponentBlockedFour: -500, // 对手的冲四的权重
      playerOpenThree: 100, // 玩家的活三的权重
      opponentOpenThree: -100, // 对手的活三的权重
      playerBlockedThree: 50, // 玩家的冲三的权重
      opponentBlockedThree: -50, // 对手的冲三的权重
      playerOpenTwo: 10, // 玩家的活二的权重
      opponentOpenTwo: -10, // 对手的活二的权重
      playerBlockedTwo: 5, // 玩家的冲二的权重
      opponentBlockedTwo: -5, // 对手的冲二的权重
    };
  
    // 初始化得分
    let playerScore = 0;
    let opponentScore = 0;
  
    // 计算连子数和得分
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[x][y] === player) {
          // 计算玩家的得分
          const playerConsecutive = countConsecutiveStones(board, x, y, player);
          playerScore += calculateScore(playerConsecutive, featureWeights);
        } else if (board[x][y] === opponent) {
          // 计算对手的得分
          const opponentConsecutive = countConsecutiveStones(board, x, y, opponent);
          opponentScore += calculateScore(opponentConsecutive, featureWeights);
        }
      }
    }
  
    // 返回最终的评估得分（正数对玩家有利，负数对对手有利）
    return playerScore - opponentScore;
  }
  
  // 计算连子数
  function countConsecutiveStones(board, x, y, player) {
    const directions = [
      [1, 0], [0, 1], [1, 1], [-1, 1] // 水平、垂直、对角线（左上-右下）、对角线（右上-左下）
    ];
    let consecutive = new Array(4).fill(0);
  
    for (let i = 0; i < directions.length; i++) {
      const [dx, dy] = directions[i];
      let count = 1;
      let blockedLeft = false;
      let blockedRight = false;
  
      // 向左搜索
      for (let j = 1; j <= 4; j++) {
        const nx = x - j * dx;
        const ny = y - j * dy;
        if (nx >= BOARD_SIZE || ny >= BOARD_SIZE){
          break
        }
        if (nx < 0 || ny < 0 || board[nx][ny] === -player) {
          blockedLeft = true;
          break;
        }
        if (nx < 0 || ny < 0 || board[nx][ny] !== player) {
          break;
        }
        count++;
      }
  
      // 向右搜索
      for (let j = 1; j <= 4; j++) {
        const nx = x + j * dx;
        const ny = y + j * dy;
        if(nx < 0 || ny < 0){
          break
        }
        if (nx >= BOARD_SIZE || ny >= BOARD_SIZE || board[nx][ny] === -player) {
          blockedRight = true;
          break;
        }
        if (nx >= BOARD_SIZE || ny >= BOARD_SIZE || board[nx][ny] !== player) {
          break;
        }
        count++;
      }
  
      // 更新连子数
      consecutive[i] = count;
  
      // 检查是否形成了冲四、活三、活二等特殊形态
      if (count === 4 && !blockedLeft && !blockedRight) {
        consecutive[i] = "DoubleFour";
      } else if (count === 3 && !blockedLeft && !blockedRight) {
        consecutive[i] = "OpenThree";
      } else if (count === 2 && !blockedLeft && !blockedRight) {
        consecutive[i] = "OpenTwo";
      } else if (count === 4 && (blockedLeft || blockedRight)) {
        consecutive[i] = "BlockedFour";
      } else if (count === 3 && (blockedLeft || blockedRight)) {
        consecutive[i] = "BlockedThree";
      } else if (count === 2 && (blockedLeft || blockedRight)) {
        consecutive[i] = "BlockedTwo";
      }
    }
  
    return consecutive;
  }
  
  // 根据连子数计算得分
  function calculateScore(consecutive, featureWeights) {
    let score = 0;
    if (consecutive.includes(5)) {
      score = featureWeights.playerFive;
    } else if (consecutive.includes("DoubleFour")) {
      score = featureWeights.playerDoubleFour;
    } else if (consecutive.includes(4)) {
      score = featureWeights.playerFour;
    } else if (consecutive.includes("OpenThree")) {
      score = featureWeights.playerOpenThree;
    } else if (consecutive.includes("BlockedFour")) {
      score = featureWeights.playerBlockedFour;
    } else if (consecutive.includes(3)) {
      score = featureWeights.playerTriple;
    } else if (consecutive.includes("BlockedThree")) {
      score = featureWeights.playerBlockedThree;
    } else if (consecutive.includes("OpenTwo")) {
      score = featureWeights.playerOpenTwo;
    } else if (consecutive.includes("BlockedTwo")) {
      score = featureWeights.playerBlockedTwo;
    } else if (consecutive.includes(2)) {
      score = featureWeights.playerDouble;
    }
    return score;
  }

// 获取当前棋盘上所有可行的落子位置
function getAvailableMoves(board) {
  const availableMoves = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === EMPTY) {
        availableMoves.push([x, y]);
      }
    }
  }
  return availableMoves;
}
// 极小化极大算法 with Alpha-Beta剪枝
// Minimax算法
function minimax(board, depth, maximizingPlayer, alpha, beta, player) {
    if (depth === 0 || checkWin(board, player) || checkWin(board, -player)) {
      return evaluate(board, player);
    }
  
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      const availableMoves = getAvailableMoves(board);
  
      for (const move of availableMoves) {
        const [x, y] = move;
        if (board[x][y] === EMPTY) {
          board[x][y] = player;
          const EVAL = minimax(board, depth - 1, false, alpha, beta, player);
          board[x][y] = EMPTY;
          maxEval = Math.max(maxEval, EVAL);
          alpha = Math.max(alpha, EVAL);
          if (beta <= alpha) {
            break; // Alpha-Beta剪枝
          }
        }
      }
  
      return maxEval;
    } else {
      let minEval = Infinity;
      const availableMoves = getAvailableMoves(board);
  
      for (const move of availableMoves) {
        const [x, y] = move;
        if (board[x][y] === EMPTY) {
          board[x][y] = -player;
          const EVAL = minimax(board, depth - 1, true, alpha, beta, player);
          board[x][y] = EMPTY;
          minEval = Math.min(minEval, EVAL);
          beta = Math.min(beta, EVAL);
          if (beta <= alpha) {
            break; // Alpha-Beta剪枝
          }
        }
      }
  
      return minEval;
    }
  }


//   检查玩家是否存在长连禁手，它将遍历整个棋盘并查找每个位置的连续子数。如果找到某个位置存在6个或以上的连续子数，就意味着玩家存在长连禁手。
// 检查是否有长连禁手
// 检查是否存在长连禁手
function checkLongWin(board, player) {
    const opponent = -player;
  
    // 遍历棋盘，查找每个位置的连续子数
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[x][y] === player) {
          // 检查水平、垂直、对角线方向的连续子数
          if (countConsecutiveStones(board, x, y, player, 1, 0) >= 6) {
            return true;
          }
          if (countConsecutiveStones(board, x, y, player, 0, 1) >= 6) {
            return true;
          }
          if (countConsecutiveStones(board, x, y, player, 1, 1) >= 6) {
            return true;
          }
          if (countConsecutiveStones(board, x, y, player, 1, -1) >= 6) {
            return true;
          }
        }
      }
    }
  
    return false;
  }

// 检查是否存在双三禁手或双四禁手
function checkDoubleThreeAndDoubleFour(board, player) {
    const opponent = -player;
  
    // 遍历棋盘，查找每个位置的连续子数
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[x][y] === EMPTY) {
          // 假设在此位置落子
          board[x][y] = player;
  
          // 计算连续子数
          const consecutive = countConsecutiveStones(board, x, y, player);
  
          // 检查是否存在双三禁手
          if (consecutive.filter(count => count === 3).length >= 2) {
            board[x][y] = EMPTY; // 恢复棋盘状态
            return true;
          }
  
          // 检查是否存在双四禁手
          if (consecutive.filter(count => count === 4).length >= 2) {
            board[x][y] = EMPTY; // 恢复棋盘状态
            return true;
          }
  
          board[x][y] = EMPTY; // 恢复棋盘状态
        }
      }
    }
  
    return false;
  }

// 找到最佳落子位置
export default function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = { x: -1, y: -1 };

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] === EMPTY) {
        const newBoard = copyBoard(board);
        newBoard[x][y] = WHITE; // 假设下一步是白棋

        // 检查是否违反长连禁手规则
        if (checkLongWin(newBoard, WHITE)) {
          continue;
        }

        // 检查是否违反双三禁手或双四禁手规则
        if (checkDoubleThreeAndDoubleFour(newBoard, WHITE)) {
          continue;
        }

        const score = minimax(newBoard, 4, -Infinity, Infinity, false); // 这里设置搜索深度为4，你可以根据需要调整

        if (score > bestScore) {
          bestScore = score;
          bestMove.x = x;
          bestMove.y = y;
        }
      }
    }
  }

  return bestMove;
}
