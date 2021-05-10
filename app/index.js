const express = require('express')
const WebSocket = require('ws')

const app = express()
const map = new Map();

app.use('/static', express.static('app/public'))

var peers = []
var curPlayer = 0
var playerSockets = new Map()
var gameStarted = false
var curTurn = []
var total = 0

function createDeck() {
	var deck = []
	for (var i = 0; i < 10; i++) {
		deck.push(i)
		deck.push(i)
	}
	/* Fisher-Yates */
	for(let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]]
	}
	return deck
}
var deck = createDeck()

const wss = new WebSocket.Server({ port: 8080 })

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4()
};

wss.on('connection', function connection(ws, request) {
	ws.on('message', function incoming(message) {
		messageData = JSON.parse(message)
		sessionId = wss.getUniqueID()
		user_id = wss.getUniqueID()
		name = messageData.payload.user_name
		// console.log('current message kind: ' + messageData.kind)
	    if(messageData.kind === 'auth') {
    		// ******************************************************
    		// Auth Response
    		// ******************************************************
    		ws.send(JSON.stringify({
    			kind: 'auth.response',
    			payload: {
    				self: {
    					session_id: sessionId,
    					user: {
    						id: user_id,
    						display_name: name
    					}
    				},
    				peers: peers,
    				room_data: {
    					gameStarted,
    					deck: deck
    				}
    			}
    		}))
    		// ******************************************************
    		// Tell other players a new player joined
    		// ******************************************************
    		wss.clients.forEach(function each(client) {
    			if (client !== ws && client.readyState === WebSocket.OPEN) {
    				// console.log('new participant')
    				client.send(JSON.stringify({
    					kind: 'participant_joined',
    					payload: {
    						session_id: sessionId,
    						user: {id: user_id, display_name: name}
    					}
    				}))
    			}
    		})
    		peers.push({session_id: sessionId, user: {id: user_id, display_name: name}})
    	} else if (messageData.kind === 'start_game') {
    		// ******************************************************
    		// Start Game
    		// ******************************************************
    		sendToAll(JSON.stringify({
    			kind: 'game_started'
    		}))
    		nextPlayer()
    		gameStarted = true
	    } else if (messageData.kind === 'reveal') {
	    	// ******************************************************
    		// Handles card flipping
    		// ******************************************************
	    	curTurn.push(messageData.payload.index)
	    	sendToAll(JSON.stringify({
	    		kind: 'reveal_card',
    			card_id: messageData.payload.index
	    	}))
	    	if (curTurn.length === 2) {
	    		// ******************************************************
	    		// Check when two cards has been flipped
	    		// 1. check for match
	    		// 2. move to next player's turn
	    		// 3. end the game when all cards have been matched
	    		// ******************************************************
	    		if (curTurn[0] === curTurn[1]) {
	    			curTurn = [curTurn[0]]
	    		} else {
	    			if (deck[curTurn[0]] === deck[curTurn[1]]) {
		    			data = JSON.stringify({
		    				kind: 'matched',
		    				card1: curTurn[0],
		    				card2: curTurn[1]
		    			})
		    			total += 2
		    		} else {
		    			data = JSON.stringify({
		    				kind: 'not_matched',
		    				card1: curTurn[0],
		    				card2: curTurn[1]
		    			})
		    		}
		    		if (total === deck.length) {
		    			setTimeout(function () {
		    				sendToAll(data)
		    				endGame()
		    			}, 1000)
		    		} else {
		    			setTimeout(function () {
		    				sendToAll(data)
		    				nextPlayer()
		    			}, 1000)
			    		curTurn = []
		    		}
		    	}
	    	}
	    }
	    // console.log(deck)

	})
})

function sendToAll(message) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message)
		}
	})
}

function nextPlayer() {
	sendToAll(JSON.stringify({
		kind: 'current_player',
		player_name: peers[curPlayer].user.display_name
	}))
	if (curPlayer === peers.length - 1) {
		curPlayer = 0
	} else {
		curPlayer++
	}
}

function endGame() {
	gameStarted = false
	total = 0
	curPlayer = 0
	curTurn = []
	deck = createDeck()
	sendToAll(JSON.stringify({
		kind: 'game_stopped'
	}))
}

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html")
})

app.post('/', function(req, res) {

})

app.listen(3000, function() {
	console.log('running on 3000')
})
