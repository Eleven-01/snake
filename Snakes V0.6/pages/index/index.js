//index.js

Page({
    data: {
        score: 0,//比分
        maxscore: 0,//最高分（通过 wx.getStorageSync 读取）
        startx: 0,
        starty: 0,
        endx: 0,
        endy: 0,//以上四个做方向判断来用
        ground: [],//（0: 空白, 1: 蛇身, 2: 食物）
        rows: 28,
        cols: 22,//操场大小
        snake: [],//存蛇（如 [[0,0], [0,1], [0,2]]）
        food: [],//存食物
        direction: '',//方向
        modalHidden: true,
        timer: '',
        isPaused: false  // 添加暂停状态
    },

    //初始化
    onLoad: function () {
        // 读取历史最高分
        var maxscore = wx.getStorageSync('maxscore');
        if (!maxscore) {
            maxscore = 0
        }
        this.setData({
            maxscore: maxscore
        });
        //初始化地图
        this.initGround(this.data.rows, this.data.cols);
        this.initSnake(3);//初始化蛇
        this.creatFood();//初始化食物
        this.move();//蛇移动
    },

    //计分器
    storeScore: function () {
        if (this.data.maxscore < this.data.score) {
            this.setData({
                maxscore: this.data.score
            })
            wx.setStorageSync('maxscore', this.data.maxscore)
        }
    },

    // 初始化地图（全部置0）
    initGround: function (rows, cols) {
        let ground = [];
        for (var i = 0; i < rows; i++) {
            var arr = [];
            ground.push(arr);
            for (var j = 0; j < cols; j++) {
                ground[i].push(0);
            }
        }
        this.setData({
            ground: ground
        });
    },

    //初始化蛇（首行前 len 格为蛇身）
    initSnake: function (len) {
        let ground = this.data.ground;
        let snake = [];
        for (var i = 0; i < len; i++) {
            ground[0][i] = 1;
            snake.push([0, i]);
        }
        this.setData({
            ground: ground,
            snake: snake
        });
    },

    //蛇移动逻辑,每隔 400ms 移动一次
    move: function () {
        var that = this;
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
        this.data.timer = setInterval(function () {
            if (!that.data.direction) return; // 如果没有方向，不移动

            // 获取当前蛇头位置
            const snakeHEAD = that.data.snake[that.data.snake.length - 1];
            const snakeTAIL = that.data.snake[0];

            // 计算下一个位置
            let nextX = snakeHEAD[0];
            let nextY = snakeHEAD[1];

            switch (that.data.direction) {
                case 'left':
                    nextY--;
                    break;
                case 'right':
                    nextY++;
                    break;
                case 'top':
                    nextX++;
                    break;
                case 'bottom':
                    nextX--;
                    break;
            }

            // 检查是否会发生碰撞
            if (nextX < 0 || nextX >= that.data.rows || nextY < 0 || nextY >= that.data.cols) {
                console.log('撞墙了'); // 添加日志
                that.gameOver();
                return;
            }

            // 检查是否会撞到自己
            for (let i = 0; i < that.data.snake.length - 1; i++) {
                if (that.data.snake[i][0] === nextX && that.data.snake[i][1] === nextY) {
                    console.log('撞到自己了'); // 添加日志
                    that.gameOver();
                    return;
                }
            }

            // 移动蛇
            let ground = that.data.ground;
            let snake = that.data.snake;

            // 清除蛇尾
            ground[snakeTAIL[0]][snakeTAIL[1]] = 0;

            // 身体前移
            for (let i = 0; i < snake.length - 1; i++) {
                snake[i] = snake[i + 1];
            }

            // 更新蛇头
            snake[snake.length - 1] = [nextX, nextY];

            // 检查是否吃到食物
            if (nextX === that.data.food[0] && nextY === that.data.food[1]) {
                // 添加新的蛇身
                snake.unshift(snakeTAIL);
                ground[snakeTAIL[0]][snakeTAIL[1]] = 1;
                that.setData({
                    score: that.data.score + 10
                });
                that.storeScore();
                that.creatFood();
            }

            // 更新蛇身状态
            for (let i = 0; i < snake.length; i++) {
                ground[snake[i][0]][snake[i][1]] = 1;
            }

            that.setData({
                ground: ground,
                snake: snake
            });
        }, 400);
    },

    // 触摸事件处理
    tapStart: function (event) {
        this.setData({
            startx: event.touches[0].pageX,
            starty: event.touches[0].pageY
        })
    },
    tapMove: function (event) {
        this.setData({
            endx: event.touches[0].pageX,
            endy: event.touches[0].pageY
        })
    },
    tapEnd: function (event) {
        // 计算滑动方向
        var heng = (this.data.endx) ? (this.data.endx - this.data.startx) : 0;
        var shu = (this.data.endy) ? (this.data.endy - this.data.starty) : 0;

        if (Math.abs(heng) > 5 || Math.abs(shu) > 5) {
            var direction = (Math.abs(heng) > Math.abs(shu)) ? this.computeDir(1, heng) : this.computeDir(0, shu);
            // 与移动方向相反则不做处理
            switch (direction) {
                case 'left':
                    if (this.data.direction == 'right') return;
                    break;
                case 'right':
                    if (this.data.direction == 'left') return;
                    break;
                case 'top':
                    if (this.data.direction == 'bottom') return;
                    break;
                case 'bottom':
                    if (this.data.direction == 'top') return;
                    break;
                default:
            }
            this.setData({
                startx: 0,
                starty: 0,
                endx: 0,
                endy: 0,
                direction: direction
            })
        }
    },

    // 根据滑动方向计算移动方向
    computeDir: function (isheng, num) {
        if (isheng) return (num > 0) ? 'right' : 'left';
        return (num > 0) ? 'top' : 'bottom';
    },

    //食物生成
    creatFood: function () {
        let x, y;
        let ground = this.data.ground;
        // 要注意防止生成在蛇身上
        do {
            x = Math.floor(Math.random() * this.data.rows);
            y = Math.floor(Math.random() * this.data.cols);
        } while (this.data.ground[x][y] === 1);

        ground[x][y] = 2;
        this.setData({
            ground: ground,
            food: [x, y]
        });
    },

    // 根据方向调用对应移动函数
    changeDirection: function (dir) {
        switch (dir) {
            case 'left':
                return this.changeLeft();
                break;
            case 'right':
                return this.changeRight();
                break;
            case 'top':
                return this.changeTop();
                break;
            case 'bottom':
                return this.changeBottom();
                break;
            default:
        }
    },

    // 蛇向左转
    changeLeft: function () {
        var arr = this.data.snake;
        var len = this.data.snake.length;
        var snakeHEAD = arr[len - 1];
        var snakeTAIL = arr[0];
        var ground = this.data.ground;
        // 清除蛇尾
        ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
        // 身体前移（每个节点变为前一个节点的位置）
        for (var i = 0; i < len - 1; i++) {
            arr[i] = arr[i + 1];
        };
        // 更新蛇头（左移）
        var x = snakeHEAD[0];
        var y = snakeHEAD[1] - 1;
        arr[len - 1] = [x, y];
        // 检测碰撞与吃食物
        const isCollision = this.checkGame(snakeTAIL, arr[len - 1]);
        if (isCollision) return; // 发生碰撞时立即终止
        // 更新蛇身状态
        for (var i = 1; i < len; i++) {
            ground[arr[i][0]][arr[i][1]] = 1;
        }

        this.setData({
            ground: ground,
            snake: arr
        });
    },

    // 蛇向右转
    changeRight: function () {
        var arr = this.data.snake;
        var len = this.data.snake.length;
        var snakeHEAD = arr[len - 1];
        var snakeTAIL = arr[0];
        var ground = this.data.ground;
        // 清除蛇尾
        ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
        // 身体前移（每个节点变为前一个节点的位置）
        for (var i = 0; i < len - 1; i++) {
            arr[i] = arr[i + 1];
        };
        // 更新蛇头
        var x = snakeHEAD[0];
        var y = snakeHEAD[1] + 1;
        arr[len - 1] = [x, y];
        // 检测碰撞与吃食物
        const isCollision = this.checkGame(snakeTAIL, arr[len - 1]);
        if (isCollision) return; // 发生碰撞时立即终止
        // 更新蛇身状态
        for (var i = 1; i < len; i++) {
            ground[arr[i][0]][arr[i][1]] = 1;
        }

        this.setData({
            ground: ground,
            snake: arr
        });
    },

    // 蛇向下转
    changeBottom: function () {
        var arr = this.data.snake;
        var len = this.data.snake.length;
        var snakeHEAD = arr[len - 1];
        var snakeTAIL = arr[0];
        var ground = this.data.ground;
        // 清除蛇尾
        ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
        // 身体前移（每个节点变为前一个节点的位置）
        for (var i = 0; i < len - 1; i++) {
            arr[i] = arr[i + 1];
        };
        // 更新蛇头
        var x = snakeHEAD[0] - 1;
        var y = snakeHEAD[1];
        arr[len - 1] = [x, y];
        // 检测碰撞与吃食物
        const isCollision = this.checkGame(snakeTAIL, arr[len - 1]);
        if (isCollision) return; // 发生碰撞时立即终止
        // 更新蛇身状态
        for (var i = 1; i < len; i++) {
            ground[arr[i][0]][arr[i][1]] = 1;
        }

        this.setData({
            ground: ground,
            snake: arr
        });
    },

    // 蛇向上转
    changeTop: function () {
        var arr = this.data.snake;
        var len = this.data.snake.length;
        var snakeHEAD = arr[len - 1];
        var snakeTAIL = arr[0];
        var ground = this.data.ground;
        // 清除蛇尾
        ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
        // 身体前移（每个节点变为前一个节点的位置）
        for (var i = 0; i < len - 1; i++) {
            arr[i] = arr[i + 1];
        };
        // 更新蛇头
        var x = snakeHEAD[0] + 1;
        var y = snakeHEAD[1];
        arr[len - 1] = [x, y];
        // 检测碰撞与吃食物
        const isCollision = this.checkGame(snakeTAIL, arr[len - 1]);
        if (isCollision) return; // 发生碰撞时立即终止
        // 更新蛇身状态
        for (var i = 1; i < len; i++) {
            ground[arr[i][0]][arr[i][1]] = 1;
        }

        this.setData({
            ground: ground,
            snake: arr
        });
    },

    // 碰撞检测与食物处理 
    checkGame: function (snakeTAIL, snakeHEAD) {
        var arr = this.data.snake;
        var len = this.data.snake.length;
        var ground = this.data.ground;

        // 吃食物检测
        if (snakeHEAD[0] == this.data.food[0] && snakeHEAD[1] == this.data.food[1]) {
            // 添加新的蛇身
            arr.unshift(snakeTAIL);
            ground[snakeTAIL[0]][snakeTAIL[1]] = 1;
            ground[snakeHEAD[0]][snakeHEAD[1]] = 1;

            this.setData({
                score: this.data.score + 10,
                ground: ground,
                snake: arr
            });

            this.storeScore();
            this.creatFood();
        } else {
            // 如果没有吃到食物，更新蛇头位置
            ground[snakeHEAD[0]][snakeHEAD[1]] = 1;
            this.setData({
                ground: ground
            });
        }

        return false;
    },

    // 暂停/继续游戏
    pauseGame: function () {
        if (this.data.isPaused) {
            // 继续游戏
            this.setData({
                isPaused: false
            });
            this.move();
        } else {
            // 暂停游戏
            if (this.data.timer) {
                clearInterval(this.data.timer);
            }
            this.setData({
                isPaused: true
            });

            // 显示暂停弹窗
            wx.showModal({
                title: '游戏暂停',
                content: `当前得分：${this.data.score}\n历史最高：${this.data.maxscore}`,
                confirmText: '重新开始',
                cancelText: '继续游戏',
                success: (res) => {
                    if (res.confirm) {
                        // 点击重新开始
                        this.modalChange();
                    } else if (res.cancel) {
                        // 点击继续游戏
                        this.setData({
                            isPaused: false
                        });
                        this.move();
                    }
                }
            });
        }
    },

    // 游戏重启
    modalChange: function () {
        // 清除旧的定时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }

        // 重置游戏状态
        this.setData({
            score: 0,
            ground: [],
            snake: [],
            food: [],
            direction: '',
            timer: '',
            isPaused: false
        });

        // 重新初始化游戏
        this.initGround(this.data.rows, this.data.cols);
        this.initSnake(3);
        this.creatFood();
        this.move();
    },

    // 游戏结束处理
    gameOver: function () {
        // 清除定时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }

        // 使用showModal显示游戏结束弹窗
        wx.showModal({
            title: '游戏结束',
            content: `本次得分：${this.data.score}\n历史最高：${this.data.maxscore}`,
            showCancel: false,
            confirmText: '重新开始',
            success: (res) => {
                if (res.confirm) {
                    this.modalChange();
                }
            }
        });
    },
});