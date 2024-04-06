class App {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
    window.addEventListener("resize", this.resize.bind(this), false);
    this.resize();

    this.game = new Game(this.canvas);
    this.balls = new Balls(this.canvas.width, this.canvas.height);
    this.matrix = new Matrix(this.game);

    this.t = 0;

    document.addEventListener("keydown", (e) => {
       // console.log(e.keyCode);
      switch (e.keyCode) {
        case 82:
          if (this.game.state == 0) {
            this.game.state = 1;
            this.game.init(
              this.ctx,
              this.balls,
              this.matrix,
              this.canvas.width,
              this.canvas.height
            );
          } else if (this.game.state == 2) this.game.state = 0;
          break;
        case 68:
          if (this.game.state == 1) this.game.state = 2;
          break;
        case 75:
          if (!!this.game.state)
            this.balls.balls.forEach((ball) => {
              if (ball.state == 1) ball.y = this.canvas.height + 1;
            });
          break;
        case 73:
          if (!this.game.state && e.altKey) {
            localStorage.clear();
             // console.log("Init Game.");
          }
          break;
        case 77:
          if (this.game.state == 0) this.game.state = 3;
          break;
        case 66:
          if (this.game.state == 3) this.game.state = 0;
          break;
      }
    });

    this.canvas.addEventListener(
      "mousedown",
      (e) => {
        if (this.balls.state == 0 && this.game.state == 1) {
          this.balls.setTarget(e.offsetX, e.offsetY, this.t);
          this.balls.state = 1;
        }
      },
      false
    );

    // window.requestAnimationFrame(this.animate.bind(this));
    this.animate(this.t);
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;
    this.canvas.width = 600;
    this.canvas.height = 700;
  }

  // old animation loop system.
  // animate(t) {
  //   if(window.requestAnimationFrame(this.animate.bind(this)));
  //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  //
  //   if(this.game.state == 0) {
  //     this.game.drawStartMenu(this.ctx, this.canvas.width, this.canvas.height, t);
  //   } else if(this.game.state == 1) {
  //     this.balls.draw(this.ctx, this.canvas.width, this.canvas.height, this.balls);
  //     this.game.drawGame(this.ctx, this.canvas.width, this.canvas.height, this.matrix, this.game);
  //   } else if(this.game.state == 2) {
  //     this.matrix.draw(this.ctx, this.canvas.width, this.canvas.height, this.matrix, this.game);
  //     this.balls.draw(this.ctx, this.canvas.width, this.canvas.height, this.balls);
  //   } else if(this.game.state == 3) {
  //     this.game.drawGameOver(this.ctx, this.canvas.width, this.canvas.height);
  //   }
  //   this.t += 1;
  // }
  // old animation loop system.

  animate() {
    setInterval(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.game.state == 0) {
        this.game.drawStartMenu(
          this.ctx,
          this.canvas.width,
          this.canvas.height,
          this.t
        );
      } else if (this.game.state == 1) {
        this.game.drawGame(
          this.ctx,
          this.canvas.width,
          this.canvas.height,
          this.balls
          );
        this.balls.draw(
          this.ctx,
          this.canvas.width,
          this.canvas.height,
          this.matrix,
          this.game,
          this.t
          );
        this.matrix.draw(
          this.ctx,
          this.game,
          this.t,
          this.balls
          );
      } else if (this.game.state == 2) {
        this.game.drawGameOver(
          this.ctx,
          this.canvas.width,
          this.canvas.height,
          this.t
        );
      } else if (this.game.state == 3) {
        this.game.drawManual(this.ctx);
      }

      this.t += 1;
      // // console.log(t);
    }, 5);
  }
}

class Ball {
  constructor(canvasWidth, canvasHeight, x, y, speed, radius, id) {
    this.radius = radius;
    this.vx = 0;
    this.vy = 0;
    this.id = id;

    const diameter = this.radius * 2;
    this.x = x;
    this.y = y;

    this.state = 0;
  }

  draw(ctx, canvasWidth, canvasHeight, balls, matrix, t) {
    if (this.state == 0) {
      // setTimeout(() => {
      //   this.state = 1;
      // }, this.id * 30);
      // // // console.log('start time:', balls.startTime);
      if (t - balls.startTime >= 6 * this.id) this.state = 1;
    } else if (this.state == 1) {
      this.x += this.vx;
      this.y += this.vy;
      this.bounceCanvas(canvasWidth, canvasHeight, balls);
      this.bounceObject(balls, matrix);

      ctx.fillStyle = "#fdd700";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }

  bounceCanvas(canvasWidth, canvasHeight, balls) {
    const minX = 0;
    const minY = 0;
    const maxX = canvasWidth;
    const maxY = canvasHeight;

    if (this.x <= minX || this.x >= maxX) {
      this.vx *= -1;
      this.x += this.vx;
    } else if (this.y <= minY) {
      this.vy *= -1;
      this.y += this.vy;
    } else if (this.y >= maxY - this.radius) {
      if (balls.state == 1) {
        balls.x = Math.round((this.x * 100) / 100);
        balls.y = canvasHeight - 12;
        balls.state = 2;
        // // console.log(balls.x, balls.y);
      }
      this.state = 2;
      this.vx = 0;
      this.vy = 0;
      this.draw();
    }
  }

  bounceObject(balls, matrix) {
    matrix.matrix.forEach((object) => {
      if (object.id != 1 && object.level >= 1) {
        const minX = object.x - this.radius;
        const maxX = object.maxX + this.radius;
        const minY = object.y - this.radius;
        const maxY = object.maxY + this.radius;
        if (this.x > minX && this.x < maxX && this.y > minY && this.y < maxY) {
          const x1 = Math.abs(minX - this.x);
          const x2 = Math.abs(this.x - maxX);
          const y1 = Math.abs(minY - this.y);
          const y2 = Math.abs(this.y - maxY);
          const min1 = Math.min(x1, x2);
          const min2 = Math.min(y1, y2);
          const min = Math.min(min1, min2);

          if (min == min2) {
            this.vy *= -1;
            this.y += this.vy * 2;
            object.level -= 1;
            matrix.update();
            // // console.log(object);
          } else if (min == min1) {
            this.vx *= -1;
            this.x += this.vx * 2;
            object.level -= 1;
            matrix.update();
            // // console.log(object);
          }
          // // console.log(object);
          // if(object.level == 0 && object.id != 0) matrix.bonusBlockUpdate(object);
          if(object.level == 0 && object.id != 0) {
            balls.addNumber++;
            matrix.bonusBlockUpdate(object);
          }
        }
      } else if (object.id == 1 && object.level == 1) {
        const minX = object.x - this.radius * 2;
        const maxX = object.maxX + this.radius;
        const minY = object.y - this.radius * 2;
        const maxY = object.maxY + this.radius;
        if (this.x > minX && this.x < maxX && this.y > minY && this.y < maxY) {
          object.level = -1;
        }
      }
    });
  }
}

class Balls {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 11;
    this.balls = new Array();
    this.state = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4.5;
    this.id = 0;
    this.radius = 11;
    this.addNewBall(canvasWidth, canvasHeight, 1);
    this.addNumber = 0;
    this.startTime = 0;
  }

  init(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 11;
    this.balls = new Array();
    this.state = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 3.5;
    this.id = 0;
    this.addNewBall(canvasWidth, canvasHeight, 1);
    this.addNumber = 0;
    this.startTime = 0;
  }

  draw(ctx, canvasWidth, canvasHeight, matrix, game, t) {
    if (this.state == 0) {
      ctx.fillStyle = "#fdd700";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
      ctx.fill();
    } else if (this.state == 1 || this.state == 2) {
      this.balls.forEach((ball) => {
        ball.draw(ctx, canvasWidth, canvasHeight, this, matrix, t);
      });
      if (this.state == 2) {
        ctx.fillStyle = "#fdd700";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctx.fill();
      }
      if (this.balls.every((ball) => ball.state == 2) && this.state == 2) {
        this.update();
        this.state = 0;
        matrix.addNewLine(game);
        this.addNewBall(canvasWidth, canvasHeight, this.addNumber);
      }
    }
  }

  setTarget(offsetX, offsetY, t) {
    const delta = Math.round((offsetX - this.x) * 1000) / 1000;
    const deltaY = Math.round((offsetY - this.y - this.radius) * 1000) / 1000;
    let vx = 0;
    let vy = 0;
    const theta = -Math.atan2(deltaY, delta);
    // // console.log(theta);
    if (theta <= 0.17) {
      vx = Math.round(this.speed * 10 * Math.cos(0.17) / 10);
      vy = Math.abs(Math.round(this.speed * 10 * Math.sin(0.17)) / 10) * -1;
    } else if (theta >= 2.96) {
      vx = Math.round(this.speed * 10 * Math.cos(2.96)) / 10;
      vy = Math.abs(Math.round(this.speed * 10 * Math.sin(2.96)) / 10) * -1;
    } else {
      vx = Math.round(this.speed * 100 * Math.cos(theta)) / 100;
      vy = Math.abs(Math.round(this.speed * 100 * Math.sin(theta)) / 100) * -1;
    }
    this.startTime = t;
    // // console.log(t);
    this.balls.forEach((ball) => {
      ball.vx = vx;
      ball.vy = vy;
    });
  }

  update() {
    //this.startTime = 0;
    this.balls.forEach((ball) => {
      ball.state = 0;
      ball.x = this.x;
      ball.y = this.y;
    });
  }

  addNewBall(canvasWidth, canvasHeight, addNumber) {
    for (let i = 0; i < addNumber; i++) {
      const ball = new Ball(
        canvasWidth,
        canvasHeight,
        this.x,
        this.y,
        this.speed,
        this.radius,
        this.id
      );
      this.balls.push(ball);
      this.id++;
    }
    this.addNumber = 0;
  }
}

class Block {
  constructor(xId, level) {
    this.id = 0;
    this.xId = xId;
    this.yId = 0;
    this.x = this.xId * 100;
    this.y = this.yId * 50;
    this.level = level;
    this.maxLevel = level;
    this.width = 100;
    this.height = 50;
    this.maxX = this.x + this.width;
    this.maxY = this.y + this.height;
    this.particles;
  }

  draw(ctx, matrixLevel) {
    if (this.level > 0) {
      ctx.fillStyle = `rgba(255, 56, 78, ${
        (1 / (matrixLevel - 1)) * this.level * 0.9 + 0.1
      })`;
      this.strokeRoundedRect(
        ctx,
        this.x + 2,
        this.y + 2,
        this.width - 4,
        this.height - 4,
        5
      );
      ctx.font = "17.5px BM YEONSUNG OTF";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(
        this.level,
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    } else if (this.level == 0) {
      this.particles = new Particles(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.maxLevel,
        this.id
      );
      this.level -= 1;
    } else if (this.level == -1) {
      this.particles.draw(ctx);
      if (this.particles.state == -1) this.level = -2;
    }
  }

  strokeRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.fill();
    ctx.closePath();
  }
}

class BonusBlock {
  constructor(xId, level, id) {
    this.id = id; // 2~4
    this.xId = xId;
    this.yId = 0;
    this.x = this.xId * 100;
    this.y = this.yId * 50;
    this.level = level * 1.5;
    this.width = 100;
    this.height = 50;
    this.maxX = this.x + this.width;
    this.maxY = this.y + this.height;
    this.particles;
  }
  draw(ctx, matrixLevel, t) {
    if (this.level > 0) {
      this.strokeRoundedRect(
        ctx,
        this.x + 4,
        this.y + 4,
        this.width - 8,
        this.height - 8,
        5,
        matrixLevel
      );
      //   ctx.fillStyle = `rgba(253, 184, 39, ${
      //     (1 / (matrixLevel - 1)) * this.level * (0.9 + 0.1)
      //   })`;
      ctx.strokeStyle = `rgba(255, 56, 78, ${
        (1 / (matrixLevel - 1)) * this.level * 0.9 + 0.1
      })`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
      this.strokeRoundedRect(
        ctx,
        this.x + 8 + Math.sin(t / 2),
        this.y + 8 + Math.cos(t / 2),
        this.width - 16,
        this.height - 16,
        5,
        matrixLevel
      );
      ctx.fillStyle = "rgb(50, 177, 108)";
      ctx.fill();
      ctx.closePath();

      this.fillBonusLine(
        ctx,
        this.x + 2,
        this.y + 2,
        this.width - 4,
        this.height - 4,
        matrixLevel
      );
      ctx.font = "17.5px BM YEONSUNG OTF";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(
        this.level,
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    } else if (this.level == 0) {
      this.particles = new Particles(
        this.x + this.width / 2,
        this.y + this.height / 2,
        0,
        this.id
        );
         // console.log(this.particles);
      this.level = -1;
    } else if (this.level == -1) {
      this.particles.draw(ctx);
      if (this.particles.state == -1) this.level = -2;
    }
  }

  strokeRoundedRect(ctx, x, y, width, height, radius, matrixLevel) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
  }

  fillBonusLine(ctx, x, y, width, height, matrixLevel) {
    const lineWidth = 8;
    ctx.fillStyle = `rgba(255, 56, 78, ${
      (1 / (matrixLevel - 1)) * this.level * 0.9 + 0.1
    })`;
    if (this.id != 3)
      ctx.fillRect(x + 4, y + height / 2 - lineWidth / 2, width - 8, lineWidth);
    if (this.id != 2)
      ctx.fillRect(x + width / 2 - lineWidth / 2, y + 4, lineWidth, height - 8);
  }
}

class Particle {
  constructor(x, y, r, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.opacity = 1;
    this.g = 0.05;
    this.friction = 0.99;
  }

  draw(ctx) {
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    // ctx.fillStyle = `rgba(255, 56, 78, ${this.opacity})`;
    ctx.fillStyle = this.color + `${this.opacity})`;
    ctx.fillRect(this.x, this.y, this.r, this.r);
    // ctx.fill();
    // ctx.closePath();
  }

  update(ctx) {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.g;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= 0.004;
    this.draw(ctx);
  }
}

  class Aura {
    constructor(x, y, blockId) {
      this.x = x;
      this.y = y;
      this.blockId = blockId;
      this.opacity = 1;
      this.t = 0;
    }

    draw(ctx) {
      const j = Math.sin(this.opacity) * 20;
      //  // console.log(Math.cos(this.opacity));
      if (this.blockId != 3) {
        ctx.fillStyle = `rgba(50, 177, 108, ${this.opacity})`;
        ctx.fillRect(this.x - this.t, this.y - j, this.t, j * 2);
        ctx.fillRect(this.x, this.y - j, this.t, j * 2);
      }
      if (this.blockId != 2) {
        ctx.fillStyle = `rgba(50, 177, 108, ${this.opacity})`;
        ctx.fillRect(this.x - j, this.y - this.t, j * 2, this.t);
        ctx.fillRect(this.x - j, this.y, j * 2, this.t);
      }
    }

    update(ctx) {
      this.opacity -= 0.007;
      this.t += 50;
      this.draw(ctx);
    }
  }

class Particles {
  constructor(x, y, maxLevel, blockId) {
    this.x = x;
    this.y = y;
    this.blockId = blockId;
    this.color = blockId == 0 ? "rgba(255, 56, 78," : "rgba(50, 177, 108,";
    this.particles = new Array();
    const particleCount = maxLevel * 2 < 200 ? maxLevel * 2 : 200;
    const power = 20;
    let radians = (Math.PI * 2) / particleCount;
    this.state = 1;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          6,
          Math.cos(radians * i) * (Math.random() * power),
          Math.sin(radians * i) * (Math.random() * power),
          this.color
        )
      );
    }

    if (this.blockId != 0) {
      this.particles.push(new Aura(this.x, this.y, this.blockId));
    }
  }

  draw(ctx) {
    if (this.particles.length <= 0) {
      this.state = -1;
    }
    this.particles.forEach((particle, i) => {
      if (particle.opacity >= 0) {
        particle.update(ctx);
      } else {
        this.particles.splice(i, 1);
      }
    });
  }
}

class Bonus {
  constructor(xId) {
    this.id = 1;
    this.xId = xId;
    this.yId = 0;
    this.x = xId * 100 + 50;
    this.y = 25;
    this.radius = 10;
    this.level = 1;
    this.maxX = this.x + this.radius;
    this.maxY = this.y + this.radius;
  }
  draw(ctx, balls) {
    if (this.level > -1) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#32b16c";
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = "#fdd700";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    } else if (this.level == -1) {
      balls.addNumber++;
      this.level = -2;
    }
  }
}

class Matrix {
  constructor(game) {
    this.matrix = new Array();
    this.level = 1;
    this.randomMatrix = new Array(
      [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4],
      [1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5],
      [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      [1, 2, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      [1, 2, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      [1, 2, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      [1, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    );
    this.randomArray = new Array();
    this.randomArray = this.randomMatrix[0];
    this.stage = 0;
    this.addNewLine(game);
  }

  init(game) {
    this.matrix = new Array();
    this.level = 1;
    // // console.log(game);
    this.addNewLine(game);
    this.stage = 0;
  }

  draw(ctx, game, t, balls) {
    this.matrix.forEach((object) => {
      if (object.id != 1) object.draw(ctx, this.level, t);
      else object.draw(ctx, balls);
    });
    game.crrScore = this.level - 1;
  }

  addNewLine(game) {
    this.matrix = this.matrix.map((object) => {
      object.yId++;
      object.y += 50;
      object.maxY += 50;
      return object;
    });
    if (
      this.level == 11 ||
      this.level == 31 ||
      this.level == 61 ||
      this.level == 101 ||
      this.level == 201 ||
      this.level == 301
    ) {
      this.stage++;
      this.randomArray = this.randomMatrix[this.stage];
    }
    // // console.log(this.randomArray);

    let newLineElements = new Array();
    let j = this.getRandomInt(0, 19);
    const randomNum = this.randomArray[j] + 1;
    // // console.log(randomNum);
    let bonusId;
    let array = new Array(0, 1, 2, 3, 4, 5);
    while (array.length > randomNum) {
      array.splice(Math.round(Math.random() * array.length), 1);
    }
    // // console.log(array);
    while (!bonusId) {
      bonusId = array[this.getRandomInt(0, array.length)];
    }
    // // console.log(this.level, array);
    for (let i = 0; i < randomNum; i++) {
      if (array[i] == bonusId) {
        if (this.level % 2 == 0) {
          const bonusBlockId = this.getRandomInt(2, 4);
          const bonus = new BonusBlock(array[i], this.level, bonusBlockId);
          this.matrix.push(bonus);
           // console.log(bonus);
        } else {
          const bonus = new Bonus(array[i]);
          this.matrix.push(bonus);
        }
        // // console.log(bonus);
      } else {
        const block = new Block(array[i], this.level);
        // // console.log(block);
        this.matrix.push(block);
      }
    }
    this.level++;

    // // console.log(this.matrix.some(object => object.level) == -1 && object.yId == -3));
    this.matrix.forEach((object) => {
      if (object.level > -1 && object.yId == 13) {
        if (object.id != 1) game.state = 2;
        else object.level = -1;
      }
    });
  }

  update() {
    this.matrix = this.matrix.filter((object) => {
      if (object.level >= -1) return object;
    });
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  bonusBlockUpdate(object) {
    // // console.log(object);
    if (object.id != 3) {
      this.matrix.forEach((o) => {
        if (o.yId == object.yId) o.level = 0;
      });
    }
    if (object.id != 2) {
      this.matrix.forEach((o) => {
        if (o.id == 0 && o.xId == object.xId) o.level = 0;
      });
    }
  }
}

class Game {
  constructor(canvas) {
    this.state = 0;
    this.ballsNumber = 0;
    this.crrScore = 0;
    this.fontSize = 15;
    this.name = "";
    this.bord = !localStorage.getItem("bord")
      ? []
      : JSON.parse(this.decodeString(JSON.parse(localStorage.getItem("bord"))));
    this.highScore = this.bord == true ? this.bord[0].score : 0;
  }

  init(ctx, balls, matrix, canvasWidth, canvasHeight) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    this.crrScore = 0;
    balls.init(canvasWidth, canvasHeight);
    matrix.init(this);
    this.name = "";
    this.bord = localStorage.getItem("bord")
      ? JSON.parse(this.decodeString(JSON.parse(localStorage.getItem("bord"))))
      : [];
    this.highScore = this.bord == true ? this.bord[0].score : 0;
  }

  drawStartMenu(ctx, canvasWidth, canvasHeight, t) {
    ctx.font = "100px BM YEONSUNG OTF";
    const script = [
      "SWIPE",
      "BRICK",
      "BREAKER",
      "0. 1. 4",
      "press R key to Start",
      "press M key to see manual!",
      "MADE BY SAUP819",
    ];

    ctx.fillStyle = "#000000";
    let img = new Image();
    // img.src = "./asset/SBB.png";
    img.src = "./asset/tmp.png";
    ctx.drawImage(img, 0, 0);

    ctx.font = "100px BM YEONSUNG OTF";
    ctx.fillStyle = "#fdd700";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.shadowColor = "#f384ae";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.font = "15px BM YEONSUNG OTF";
    ctx.fillText(script[3], canvasWidth / 2, canvasHeight / 2 + 175);
    this.fontSize += Math.sin(t / 15) * 0.2;
    ctx.font = `${this.fontSize}px BM YEONSUNG OTF`;
    ctx.fillText(script[4], canvasWidth / 2, canvasHeight / 2 + 250);
    ctx.fillText(script[5], canvasWidth / 2, canvasHeight / 2 + 275);
    ctx.font = "10px BM YEONSUNG OTF";
    ctx.fillText(script[6], canvasWidth / 2, canvasHeight - 10);
  }

  drawGame(ctx, canvasWidth, canvasHeight, balls) {
    ctx.font = "100px BM YEONSUNG OTF";
    ctx.fillStyle = "#fdd700";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(121, 134, 203, 10)";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    this.ballsNumber = balls.balls.filter(
      (ball) => ball.state == 0 || ball.state == 1
    ).length;
    ctx.fillText(
      "x" + this.ballsNumber,
      canvasWidth / 2,
      canvasHeight / 2 - 20
    );
    ctx.font = "25px BM YEONSUNG OTF";
    ctx.fillStyle = "rgb(50, 177, 108)";
    ctx.fillText("+" + balls.addNumber, canvasWidth / 2, canvasHeight / 2 + 40);
  }

  drawGameOver(ctx, canvasWidth, canvasHeight, t) {
    if (!this.name) {
      this.name = window.prompt("What's Your Name? (within 10 char)");
      if (this.name.length > 10) this.name = "";
      if (!!this.name)
        this.bord.push({ name: this.name, score: this.crrScore });
      this.bord.sort((a, b) => b.score - a.score).reverse();
      localStorage.setItem(
        "bord",
        JSON.stringify(this.encodeArray(JSON.stringify(this.bord)))
      );
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = "#f384ae";
    ctx.font = "100px BM YEONSUNG OTF";
    ctx.fillStyle = "#fdd700";
    if (this.highScore > this.crrScore) {
      ctx.fillText("Game Over", canvasWidth / 2, 70);
    } else {
      ctx.fillText("New Record!", canvasWidth / 2, 70);
      this.highScore = this.bord[0].score;
    }

    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.font = "40px BM YEONSUNG OTF";
    ctx.fillText("Your Score: " + this.crrScore, canvasWidth / 2, 135);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = "20px BM YEONSUNG OTF";

    ctx.fillStyle = "#ff384e";
    ctx.fillText("RANK", 50, 200);
    ctx.fillStyle = "#fdd700";
    ctx.fillText("NAME", 160, 200);
    ctx.fillStyle = "rgb(50, 177, 108)";
    ctx.fillText("SCORE", 270, 200);
    ctx.fillStyle = "#fdd700";
    for (let i in this.bord) {
      let size = 25;
      if (i < 15) {
        ctx.fillStyle = "#ff384e";
        ctx.fillText(`${+i + 1}`, 50, 225 + size * i);
        ctx.fillStyle = "#fdd700";
        ctx.font = "15px BM YEONSUNG OTF";
        ctx.fillText(`${this.bord[i].name}`, 160, 225 + size * i);
        ctx.fillStyle = "rgb(50, 177, 108)";
        ctx.font = "20px BM YEONSUNG OTF";
        ctx.fillText(`${this.bord[i].score}`, 270, 225 + size * i);
        ctx.fillStyle = "#fdd700";
      } else if (i < 30) {
        ctx.fillStyle = "#ff384e";
        ctx.fillText(`${+i + 1}`, 50 + 280, 225 + size(i - 15));
        ctx.fillStyle = "#fdd700";
        ctx.font = "15px BM YEONSUNG OTF";
        ctx.fillText(`${this.bord[i].name}`, 160 + 280, 225 + size * (i - 15));
        ctx.fillStyle = "rgb(50, 177, 108)";
        ctx.font = "20px BM YEONSUNG OTF";
        ctx.fillText(`${this.bord[i].score}`, 270 + 280, 225 + size * (i - 15));
        ctx.fillStyle = "#fdd700";
      }
    }
    this.fontSize += Math.sin(t / 100) * 0.02;
    ctx.font = `${this.fontSize}px BM YEONSUNG OTF`;
    ctx.fillText("press R key to restart!", canvasWidth / 2, canvasHeight - 50);
  }

  drawManual(ctx) {
    ctx.fillStyle = "#000000";
    let img = new Image();
    // img.src = "./asset/manual.png";
    img.src = "./asset/tmp.png";
    ctx.drawImage(img, 0, 0, 600, 800);
  }

  encodeArray(array) {
    let encodedArray = new Array();
    for (let index in array) {
      encodedArray.push(btoa(`${array[index].charCodeAt()}`));
    }
    return encodedArray;
  }

  decodeString(string) {
    let decodedString = new String();
    for (let index in string) {
      decodedString = decodedString + String.fromCharCode(atob(string[index]));
    }
    return decodedString;
  }
}

window.onload = () => {
	new App();
}
