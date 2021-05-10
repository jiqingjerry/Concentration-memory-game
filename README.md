# concentration-stub
This is a web app for multiplayer Concentration-style game https://en.wikipedia.org/wiki/Concentration_(card_game).

Client code is provided by Alexey Chernikov.

The goal of this turn-based memory game is to find matching pairs of cards, which are presented face down on a grid.

The client is built to connect to a remote socket and send and receive JSON events.

## Events the client can send
- `{kind: "auth", room_roue, user_name}` - to authenticate under a certain name to a certain room/group of players
- `{kind: "start_game" }` - to declare your intention to begin a game session
- `{kind: "reveal", index}` - to flip a card on your turn
- `{kind: "update_display_name", display_name}`

## Events the client consumes
- auth.response
```
{
  kind: "auth.response",
  payload: {
    self: {
      session_id: "authenticated_user_session_id", // the session_id identified a socket connection  
      user: {
        id: user_id,
        display_name: display_name
      }
    }
    peers: [
      {
        session_id,
        user: {id, display_name}
      }
    ],
    room_data: {
      started,
      deck: [
        1, 2, 3, 4, ... // must be even, since the game is about matching pairs
      ]
    }
  }
}
```
- participant_joined
```
{
  kind: "participant_joined"
  payload: {
    session_id,
    user: {id, display_name}
  }
}
```
- participant_left
```
{
  kind: "pagirticipant_left"
  payload: {
    session_id,
    user: {id, display_name}
  }
}
```
- `{kind: "game_started"}`
- `{kind: "game_stopped"}`
