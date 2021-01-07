document.addEventListener('DOMContentLoaded', () => {
    
    const grilleUtilisateur = document.querySelector('.grille-utilisateur')
    const grilleAdversaire = document.querySelector('.grille-adversaire')
    
   
    const carreUtilisateur = []
    const carreAdversaire = []
    let estHorizontal = true
    const width = 10
    
    var positionBateaux = []
    
    
    //Bateaux
    const tableauBateaux = [
      {
        name: 'destroyer',
        directions: [[0, 1],[0, width]]
      },
      {
        name: 'sousMarin',
        directions: [[0, 1, 2],[0, width, width*2]]
      },
      {
        name: 'croiseur',
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
  
    createBoard(grilleUtilisateur, carreUtilisateur)
    createBoard(grilleAdversaire, carreAdversaire)
  
    
    
    startmultiJoueur()
  
    // MultiJoueur
    function startmultiJoueur() {
     
      generate(tableauBateaux[0])
      generate(tableauBateaux[1])
      generate(tableauBateaux[2])
      generate(tableauBateaux[3])
      generate(tableauBateaux[4])  
      
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
      carreAdversaire.forEach(square => {
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
        const square = carreUtilisateur[id]
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
  
  
    

    //Create Board
    function createBoard(grid, squares) {
      for (let i = 0; i < width*width; i++) {
        const square = document.createElement('div')
        square.dataset.id = i
        grid.appendChild(square)
        squares.push(square)
      }
    }
  

    
    
    //Mettre les bateaux en position aléatoire et renvoyer tableau avec position des bateaux
    function generate(ship) {
      
      let randomDirection = Math.floor(Math.random() * ship.directions.length)
      let current = ship.directions[randomDirection]
      if (randomDirection === 0) direction = 1
      if (randomDirection === 1) direction = 10
      let randomStart = Math.abs(Math.floor(Math.random() * carreUtilisateur.length - (ship.directions[0].length * direction)))
  
      const isTaken = current.some(index => carreUtilisateur[randomStart + index].classList.contains('taken'))
      const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
      const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0) //Empêche au bateau d'être placé sur le bord de la grille
  
      if (!isTaken && !isAtRightEdge && !isAtLeftEdge){
        current.forEach(index => carreUtilisateur[randomStart + index].classList.add('taken', ship.name)) 
        
        var longueurBateaux = ship.directions[randomDirection].length
        
        //Tableau de potition des bateaux
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

  }) 