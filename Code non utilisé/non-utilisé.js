    //-------------------------------------------------------------------------------------
    startMultiPlayer()
  
    // Multiplayer
    function startMultiPlayer() {
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
  
      // Another player has connected or disconnected
      socket.on('player-connection', num => {
        console.log(`Player number ${num} has connected or disconnected`)
        playerConnectedOrDisconnected(num)
      })
  
      // On enemy ready
      socket.on('enemy-ready', num => {
        enemyReady = true
        playerReady(num)
        if (ready) {
          playGameMulti(socket)
          setupButtons.style.display = 'none'
        }
      })
  
      // Check player status
      socket.on('check-players', players => {
        players.forEach((p, i) => {
          if(p.connected) playerConnectedOrDisconnected(i)
          if(p.ready) {
            playerReady(i)
            if(i !== playerReady) enemyReady = true
          }
        })
      })
  
      // On Timeout
      socket.on('timeout', () => {
        infoDisplay.innerHTML = 'You have reached the 10 minute limit'
      })
  
      // Ready button click
      startButton.addEventListener('click', () => {
        if(allShipsPlaced) playGameMulti(socket)
        else infoDisplay.innerHTML = "Please place all ships"
      })
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    //move around user ship
    ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragover', dragOver))
    userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
    userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
    userSquares.forEach(square => square.addEventListener('drop', dragDrop))
    userSquares.forEach(square => square.addEventListener('dragend', dragEnd))
  
    let selectedShipNameWithIndex
    let draggedShip
    let draggedShipLength
  
    ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
      selectedShipNameWithIndex = e.target.id
      // console.log(selectedShipNameWithIndex)
    }))
  
    function dragStart() {
      draggedShip = this
      draggedShipLength = this.childNodes.length
      // console.log(draggedShip)
    }
  
    function dragOver(e) {
      e.preventDefault()
    }
  
    function dragEnter(e) {
      e.preventDefault()
    }
  
    function dragLeave() {
      // console.log('drag leave')
    }
  
    function dragDrop() {
      let shipNameWithLastId = draggedShip.lastChild.id
      let shipClass = shipNameWithLastId.slice(0, -2)
      // console.log(shipClass)
      let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
      let shipLastId = lastShipIndex + parseInt(this.dataset.id)
      // console.log(shipLastId)
      const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
      const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
      
      let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
      let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)
  
      selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))
  
      shipLastId = shipLastId - selectedShipIndex
      // console.log(shipLastId)
  
      if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
        for (let i=0; i < draggedShipLength; i++) {
          let directionClass
          if (i === 0) directionClass = 'start'
          if (i === draggedShipLength - 1) directionClass = 'end'
          userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
        }
      //As long as the index of the ship you are dragging is not in the newNotAllowedVertical array! This means that sometimes if you drag the ship by its
      //index-1 , index-2 and so on, the ship will rebound back to the displayGrid.
      } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
        for (let i=0; i < draggedShipLength; i++) {
          let directionClass
          if (i === 0) directionClass = 'start'
          if (i === draggedShipLength - 1) directionClass = 'end'
          userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', 'vertical', directionClass, shipClass)
        }
      } else return
  
      displayGrid.removeChild(draggedShip)
      if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
    }
  
    function dragEnd() {
      // console.log('dragend')
    }
    
    
    
    
    
    
    
    
    // Game Logic for Single Player
    function playGameSingle() {
        if (isGameOver) return
        if (currentPlayer === 'user') {
          turnDisplay.innerHTML = 'Your Go'
          computerSquares.forEach(square => square.addEventListener('click', function(e) {
            shotFired = square.dataset.id
            revealSquare(square.classList)
          }))
        }
        if (currentPlayer === 'enemy') {
          turnDisplay.innerHTML = 'Computers Go'
          setTimeout(enemyGo, 1000)
        }
      }
    
      let destroyerCount = 0
      let submarineCount = 0
      let cruiserCount = 0
      let battleshipCount = 0
      let carrierCount = 0
    
      function revealSquare(classList) {
        const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`)
        const obj = Object.values(classList)
        if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
          if (obj.includes('destroyer')) destroyerCount++
          if (obj.includes('submarine')) submarineCount++
          if (obj.includes('cruiser')) cruiserCount++
          if (obj.includes('battleship')) battleshipCount++
          if (obj.includes('carrier')) carrierCount++
        }
        if (obj.includes('taken')) {
          enemySquare.classList.add('boom')
        } else {
          enemySquare.classList.add('miss')
        }
        checkForWins()
        currentPlayer = 'enemy'
        if(gameMode === 'singlePlayer') playGameSingle()
      }
    
      let cpuDestroyerCount = 0
      let cpuSubmarineCount = 0
      let cpuCruiserCount = 0
      let cpuBattleshipCount = 0
      let cpuCarrierCount = 0
    
    
      function enemyGo(square) {
        if (gameMode === 'singlePlayer') square = Math.floor(Math.random() * userSquares.length)
        if (!userSquares[square].classList.contains('boom')) {
          const hit = userSquares[square].classList.contains('taken')
          userSquares[square].classList.add(hit ? 'boom' : 'miss')
          if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++
          if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++
          if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++
          if (userSquares[square].classList.contains('battleship')) cpuBattleshipCount++
          if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++
          checkForWins()
        } else if (gameMode === 'singlePlayer') enemyGo()
        currentPlayer = 'user'
        turnDisplay.innerHTML = 'Your Go'
      }
    
      function checkForWins() {
        let enemy = 'computer'
        if(gameMode === 'multiPlayer') enemy = 'enemy'
        if (destroyerCount === 2) {
          infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`
          destroyerCount = 10
        }
        if (submarineCount === 3) {
          infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`
          submarineCount = 10
        }
        if (cruiserCount === 3) {
          infoDisplay.innerHTML = `You sunk the ${enemy}'s cruiser`
          cruiserCount = 10
        }
        if (battleshipCount === 4) {
          infoDisplay.innerHTML = `You sunk the ${enemy}'s battleship`
          battleshipCount = 10
        }
        if (carrierCount === 5) {
          infoDisplay.innerHTML = `You sunk the ${enemy}'s carrier`
          carrierCount = 10
        }
        if (cpuDestroyerCount === 2) {
          infoDisplay.innerHTML = `${enemy} sunk your destroyer`
          cpuDestroyerCount = 10
        }
        if (cpuSubmarineCount === 3) {
          infoDisplay.innerHTML = `${enemy} sunk your submarine`
          cpuSubmarineCount = 10
        }
        if (cpuCruiserCount === 3) {
          infoDisplay.innerHTML = `${enemy} sunk your cruiser`
          cpuCruiserCount = 10
        }
        if (cpuBattleshipCount === 4) {
          infoDisplay.innerHTML = `${enemy} sunk your battleship`
          cpuBattleshipCount = 10
        }
        if (cpuCarrierCount === 5) {
          infoDisplay.innerHTML = `${enemy} sunk your carrier`
          cpuCarrierCount = 10
        }
    
        if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
          infoDisplay.innerHTML = "YOU WIN"
          gameOver()
        }
        if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) === 50) {
          infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
          gameOver()
        }
      }
    
      function gameOver() {
        isGameOver = true
        startButton.removeEventListener('click', playGameSingle)
      }