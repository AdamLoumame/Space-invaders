window.onload = () => {
  document.querySelector('.loader').style.display = 'none'
}
let tileSize = 32
let rows = 16
let columns = 16

let canvas = document.querySelector('.canvas')
let context = canvas.getContext('2d')
canvas.height = tileSize * rows
canvas.width = tileSize * columns

let score = 0
let gameOver = false
// Ship
let Ship = {
  height: tileSize,
  width: 2 * tileSize,
  x: (tileSize * columns) / 2 - tileSize,
  y: tileSize * rows - 2 * tileSize,
}

let shipImg = new Image()
shipImg.src = './ship.png'
document.addEventListener('keydown', move)
function move(e) {
  if (gameOver) {
    return
  }
  if (e.code === 'ArrowRight' && Ship.x + Ship.width < canvas.width) {
    Ship.x += tileSize
  } else if (e.code === 'ArrowLeft' && Ship.x > 0) {
    Ship.x -= tileSize
  }
}
// Ship bullets
let bulletArray = []
let bulletSpeed = -10
document.addEventListener('keyup', shoot)
function shoot(e) {
  if (gameOver) {
    return
  }
  if (e.code === 'Space') {
    let bullet = {
      x: Ship.x + (Ship.width * 15) / 32,
      y: Ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    }
    bulletArray.push(bullet)
  }
}

// aliens
let aliensArray = []
let aliensWidth = 2 * tileSize
let aliensHeight = tileSize

let aliensColumns = 3
let aliensRow = 2

let imagesPATHS = ['./alien.png', './alien.png', './alien.png', './alien.png', './alien-yellow.png', './alien-cyan.png', './alien-cyan.png']
let alienSpeed = 1
function creatAliens() {
  for (let c = 0; c < aliensColumns; c++) {
    for (let r = 0; r < aliensRow; r++) {
      let alienImg = new Image()
      let randPath = imagesPATHS[Math.floor(Math.random() * imagesPATHS.length)]

      let Alien = {
        x: tileSize + c * aliensWidth,
        y: tileSize + r * aliensHeight,
        width: aliensWidth,
        height: aliensHeight,
        alive: randPath === './alien.png' ? 1 : randPath === './alien-cyan.png' ? 2 : 3,
        type: randPath === './alien.png' ? 1 : randPath === './alien-cyan.png' ? 2 : 3,
        src: randPath,
        loaded: false,
      }
      alienImg.src = Alien.src
      alienImg.onload = () => {
        Alien.loaded = true
        Alien.image = alienImg
      }
      aliensArray.push(Alien)
    }
  }
}
creatAliens()

// aliens bullets
let bulletArrayAliens = []
let bulletSpeedAliens = 2
setInterval(() => {
  n = 0
  for (let alien of aliensArray) {
    if (alien.src === './alien-yellow.png') {
      let Albullet = {
        x: alien.x + alien.width / 2,
        y: alien.y + alien.height,
        width: tileSize / 8,
        height: tileSize / 5,
        number: n,
      }
      bulletArrayAliens.push(Albullet)
    }
    n++
  }
}, 2500)

function update() {
  requestAnimationFrame(update)
  if (gameOver) {
    return
  }
  context.clearRect(0, 0, canvas.width, canvas.height)
  // ship
  context.drawImage(shipImg, Ship.x, Ship.y, Ship.width, Ship.height)
  // aliens
  for (let al of aliensArray) {
    if (al.alive > 0) {
      if (al.loaded) {
        context.drawImage(al.image, al.x, al.y, al.width, al.height)
      }
      al.x += alienSpeed
      if (al.x + al.width >= canvas.width || al.x <= 0) {
        alienSpeed *= -1
        al.x += alienSpeed * 2
        for (let x of aliensArray) {
          x.y += x.height
        }
      }
    } else {
      if (al.type === 1) {
        score += 100
      } else if (al.type === 2) {
        score += 250
      } else {
        score += 500
      }
      aliensArray.splice(aliensArray.indexOf(al), 1)
    }
    if (al.y >= Ship.y) {
      gameOver = true
      document.querySelector('.Restart').style.display = 'block'
    }
  }
  // bullets
  for (let bullet of bulletArray) {
    if (bullet.y <= 0 || bullet.used) {
      bulletArray.splice(bulletArray.indexOf(bullet), 1)
    } else {
      bullet.y += bulletSpeed
      context.fillStyle = 'white'
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

      for (let al of aliensArray) {
        if (al.alive && !bullet.used && detectCollision(al, bullet)) {
          al.alive -= 1
          bullet.used = true
          alienSpeed += 0.3
          if (al.src === './alien-cyan.png') {
            let alienImg = new Image()
            alienImg.src = './alien.png'
            alienImg.onload = () => {
              al.loaded = true
              al.image = alienImg
            }
          } else if (al.src === './alien-yellow.png') {
            let alienImg = new Image()
            alienImg.src = './alien-cyan.png'
            alienImg.onload = () => {
              al.loaded = true
              al.image = alienImg
            }
          }
        }
      }
    }
  }
  // updating levels
  if (aliensArray.length === 0) {
    aliensColumns = Math.min(aliensColumns + 1, columns / 2 - 2)
    aliensRow = Math.min(aliensRow + 1, rows - 4)
    bulletArray = []
    creatAliens()
  }
  // score
  context.fillStyle = 'white'
  context.font = '16px Pixelify Sans'
  context.fillText(score, 10, 20)
  // alien bullets
  for (let albullet of bulletArrayAliens) {
    if (albullet.y > canvas.height) {
      bulletArrayAliens.splice(bulletArrayAliens.indexOf(albullet), 1)
    } else {
      albullet.y += bulletSpeedAliens
      context.fillStyle = 'red'
      context.fillRect(albullet.x, albullet.y, albullet.width, albullet.height)

      if (!albullet.used && detectCollision(albullet, Ship, 12)) {
        gameOver = true
        document.querySelector('.reset').style.display = 'block'
      }
    }
  }
}
update()

function detectCollision(a, b, c = 0) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height - c > b.y
}
document.querySelector('.Restart').addEventListener('click', () => window.location.reload())

// keys pressing

document.addEventListener('keydown', e => {
  if (e.code === 'ArrowRight') {
    document.querySelector('.arrows span:nth-of-type(4)').style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
    document.querySelector('.arrows span:nth-of-type(4)').style.backgroundColor = 'white'
  }
  if (e.code === 'ArrowLeft') {
    document.querySelector('.arrows span:nth-of-type(3)').style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
    document.querySelector('.arrows span:nth-of-type(3)').style.backgroundColor = 'white'
  }
  if (e.code === 'ArrowUp') {
    document.querySelector('.arrows span:nth-of-type(2)').style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
    document.querySelector('.arrows span:nth-of-type(2)').style.backgroundColor = 'white'
  }
  if (e.code === 'ArrowDown') {
    document.querySelector('.arrows span:nth-of-type(5)').style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
    document.querySelector('.arrows span:nth-of-type(5)').style.backgroundColor = 'white'
  }
  if (e.code === 'ArrowRight') {
    document.querySelector('.arrows span:nth-of-type(4)').style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
    document.querySelector('.arrows span:nth-of-type(4)').style.backgroundColor = 'white'
  }
  if (e.code === 'Space') {
    document.querySelector('.b2').style.backgroundColor = 'white'
  }
  setTimeout(() => {
    document.querySelectorAll('.arrows span').forEach(e => {
      e.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
      e.style.backgroundColor = '#2c2d2f'
      document.querySelector('.b2').style.backgroundColor = '#9b1f57'
    })
  }, 100)
})
