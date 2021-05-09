import Client from './src/client.mjs'

window.onload = async function() {
	var c1 = new Client()
	await c1.connect()
	console.log('connected')
	var curPlayer = ''
	var myName = ''
	// document.getElementById('submit').addEventListener("click", async function() {
	$(document).on('click', '#submit', async function(event){
		c1.joinRoom(document.getElementById('playerName').value)
		$('#submit').text('Start Game')
		$('#submit').attr('id', 'start_game')
		c1.addEventListener('auth.response', function(event) {
			updatePlayers(event.payload.self.user.display_name)
			displayPlayers(event.payload.peers)
			myName = event.payload.self.user.display_name
		})
		c1.addEventListener('participant_joined', function(event) {
			updatePlayers(event.payload.user.display_name)
		})
		c1.addEventListener('game_started', function(event) {
			console.log(event.kind)
			createBoard(c1.deck)
		})
		c1.addEventListener('reveal_card', function(event) {
			$('#' + event.card_id).removeClass("bg-light")
		})
		c1.addEventListener('current_player', function(event) {
			console.log('current_player: ' + event.player_name)
			updateCurrentPlayer(event.player_name)
		})
		c1.addEventListener('matched', function(event) {
			$('#' + event.card1).removeClass("cover")
			$('#' + event.card2).removeClass("cover")
			$('#' + event.card1 + ' .card').css('z-index', 1)
			$('#' + event.card2 + ' .card').css('z-index', 1)
			$('#' + event.card1).addClass("bg-success bg-gradient")
			$('#' + event.card2).addClass("bg-success bg-gradient")
		})
		c1.addEventListener('not_matched', function(event) {
			console.log('not_matched here')
			console.log(event)
			$('#' + event.card1).addClass("bg-light")
			$('#' + event.card2).addClass("bg-light")
		})
	})

	$(document).on('click', '#start_game', async function() {
		console.log('starting game')
		c1.sendGameStart()
	})

	$(document).on('click', '.cover', async function() {
		if(myName === curPlayer) {
			c1.reveal($(this).attr('id'))
			console.log($(this).attr('id'))
		}
	})

	function createBoard(deck) {
		var board = ''
		$('.text-center').after('<div class="gameboard d-flex border-dark flex-wrap bd-highlight mb-3"></div>')
		for (var i = 0; i < deck.length; i++) {
			$('.gameboard').append(`
				<div class="cover p-2 border bg-light border-dark m-3 box" id="${i}">
				  	<div class="card">${deck[i]}</div>
				</div>`)
		}
	}

	function updatePlayers(name) {
		$('ul').add(`<li class="list-group-item">${name}</li>`).appendTo('ul')
	}

	function displayPlayers(peers) {
		for (var i = 0; i < peers.length; i++) {
			var curName = peers[i].user.display_name
			$('ul').add(`<li class="list-group-item id="${curName}">${curName}</li>`).appendTo('ul')
		}
	}

	function updateCurrentPlayer(name) {
		if($('#current_player').length) {
			$('#current_player').text(`${name}'s turn!`)
		} else {
			$('ul').after(`<h3 id="current_player">${name}'s turn!</h3>`)
		}
		curPlayer = event.player_name
	}
}

