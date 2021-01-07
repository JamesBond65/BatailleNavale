document.addEventListener('DOMContentLoaded', () => {
    
    const grilleUtilisateur = document.querySelector('.grid-user')
    const computerGrid = document.querySelector('.grid-computer')
    const displayGrid = document.querySelector('.grid-display')
    const ships = document.querySelectorAll('.ship')
    const destroyer = document.querySelector('.destroyer-container')
    const submarine = document.querySelector('.submarine-container')
    const cruiser = document.querySelector('.cruiser-container')
    const porteAvion = document.querySelector('.porteAvion-container')
    const carrier = document.querySelector('.carrier-container')
    const startButton = document.querySelector('#start')
    const rotateButton = document.querySelector('#rotate')
    const turnDisplay = document.querySelector('#whose-go')
    const infoDisplay = document.querySelector('#info')
    const setupButtons = document.getElementById('setup-buttons')
    
    
    
    
    const userSquares = []
    const computerSquares = []
    let isHorizontal = true
    let isGameOver = false
    let currentPlayer = 'user'
    const width = 10
    let playerNum = 0
    let ready = false
    let enemyReady = false
    let allShipsPlaced = false
    let shotFired = -1
    var positionBateaux = []
    
    
    //Bateaux
    const shipArray = [
      {
        name: 'destroyer',
        directions: [[0, 1],[0, width]]
      },
      {
        name: 'submarine',
        directions: [[0, 1, 2],[0, width, width*2]]
      },
      {
        name: 'cruiser',
        directions: [[0, 1, 2],[0, width, width*2]]
      },
      {
        name: 'porteAvion',
        directions: [[0, 1, 2, 3],[0, width, width*2, width*3]]
      },
      {
        name: 'carrier',
        directions: [[0, 1, 2, 3, 4],[0, width, width*2, width*3, width*4]]
      },
    ]
  
    createBoard(grilleUtilisateur, userSquares)
    createBoard(computerGrid, computerSquares)
  
    //-------------------------------------------------------------------------------------//
    startmultiJoueur()
  
    // multiJoueur
    function startmultiJoueur() {
     
      generate(shipArray[0])
      generate(shipArray[1])
      generate(shipArray[2])
      generate(shipArray[3])
      generate(shipArray[4])  
      console.log(positionBateaux)
      
      
      const socket = io();
  
      // Get your player number
      socket.on('player-number', num => {
        if (num === -1) {
          infoDisplay.innerHTML = "Sorry, the server is full"
        } else {
          playerNum = parseInt(num)
          if(playerNum === 1) currentPlayer = "enemy"
  
          console.log(playerNum)
  
          // Get other player status
          socket.emit('check-players')
        }
      })
  
  
      // Setup event listeners for firing
      computerSquares.forEach(square => {
        square.addEventListener('click', () => {
          if(currentPlayer === 'user' && ready && enemyReady) {
            shotFired = square.dataset.id
            socket.emit('fire', shotFired)
          }
        })
      })
  
      // On Fire Received
      socket.on('fire', id => {
        enemyGo(id)
        const square = userSquares[id]
        socket.emit('fire-reply', square.classList)
        playGameMulti(socket)
      })
  
      // On Fire Reply Received
      socket.on('fire-reply', classList => {
        revealSquare(classList)
        playGameMulti(socket)
      })
  
      function playerConnectedOrDisconnected(num) {
        let player = `.p${parseInt(num) + 1}`
        document.querySelector(`${player} .connected`).classList.toggle('active')
        if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
      }
    }
  
    // Single Player
    function startSinglePlayer() {
      generate(shipArray[0])
      generate(shipArray[1])
      generate(shipArray[2])
      generate(shipArray[3])
      generate(shipArray[4])
  
      startButton.addEventListener('click', () => {
        setupButtons.style.display = 'none'
        playGameSingle()
      })
    }
  
    //------------------------------------------------------------------------------------------------------------------------
    

    //Create Board
    function createBoard(grid, squares) {
      for (let i = 0; i < width*width; i++) {
        const square = document.createElement('div')
        square.dataset.id = i
        grid.appendChild(square)
        squares.push(square)
      }
    }
  

    
    //--------------------------------------------------------------------------------------//
    
    //Mettre les bateaux en position aléatoire et renvoyer tableau avec position des bateaux
    function generate(ship) {
      
      let randomDirection = Math.floor(Math.random() * ship.directions.length)
      let current = ship.directions[randomDirection]
      if (randomDirection === 0) direction = 1
      if (randomDirection === 1) direction = 10
      let randomStart = Math.abs(Math.floor(Math.random() * userSquares.length - (ship.directions[0].length * direction)))
  
      const isTaken = current.some(index => userSquares[randomStart + index].classList.contains('taken'))
      const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
      const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)
  
      if (!isTaken && !isAtRightEdge && !isAtLeftEdge){
        current.forEach(index => userSquares[randomStart + index].classList.add('taken', ship.name)) 
        
        var longueurBateaux = ship.directions[randomDirection].length
        
        if (direction === 1){
          for (let i=0; i<longueurBateaux; i++){
            positionBateaux.push(randomStart + i)
            }
          }
          
        else {
          for (let u=0; u<longueurBateaux; u++){
            positionBateaux.push(randomStart + u*10)
            }
        }
        
      } 
      
      else generate(ship)
    }
    
  //---------------------------------------------------------------------------------------------//


    //Tourner les bateaux
    function rotate() {
      if (isHorizontal) {
        destroyer.classList.toggle('destroyer-container-vertical')
        submarine.classList.toggle('submarine-container-vertical')
        cruiser.classList.toggle('cruiser-container-vertical')
        porteAvion.classList.toggle('porteAvion-container-vertical')
        carrier.classList.toggle('carrier-container-vertical')
        isHorizontal = false
        // console.log(isHorizontal)
        return
      }
      if (!isHorizontal) {
        destroyer.classList.toggle('destroyer-container-vertical')
        submarine.classList.toggle('submarine-container-vertical')
        cruiser.classList.toggle('cruiser-container-vertical')
        porteAvion.classList.toggle('porteAvion-container-vertical')
        carrier.classList.toggle('carrier-container-vertical')
        isHorizontal = true
        // console.log(isHorizontal)
        return
      }
    }
    rotateButton.addEventListener('click', rotate)
  

    // Fonction multiJoueur------------------------------------------------------------------------------------------

    function playGameMulti(socket) {


      setupButtons.style.display = 'none'
      if(isGameOver) return
      if(!ready) {
        socket.emit('player-ready')
        ready = true
        playerReady(playerNum)
      }
  
      if(enemyReady) {
        if(currentPlayer === 'user') {
          turnDisplay.innerHTML = 'Your Go'
        }
        if(currentPlayer === 'enemy') {
          turnDisplay.innerHTML = "Enemy's Go"
        }
      }
    }
  
    function playerReady(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .ready`).classList.toggle('active')
    }
  //--------------------------------------------------------------------------------------------------------------------------
  }) 