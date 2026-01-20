# Webhook Integration Guide

This guide explains how to integrate and use webhooks with WordGuess Pro on port 3015.

## Quick Start

1. Start the server on port 3015:
```bash
npm run dev -- -p 3015
```

2. The webhooks will be available at:
- Guess: `http://localhost:3015/api/webhook/guess`
- Events: `http://localhost:3015/api/webhook/event`

## Webhook Endpoints

### 1. Guess Webhook

Submit a word guess for a player.

**URL**: `POST http://localhost:3015/api/webhook/guess`

**Request Body**:
```json
{
  "player_name": "PlayerName",
  "guess_word": "ANSWER"
}
```

**Success Response** (Correct Guess):
```json
{
  "success": true,
  "correct": true,
  "player": "PlayerName",
  "points": 10,
  "tied": false,
  "message": "Correct!"
}
```

**Success Response** (Incorrect Guess):
```json
{
  "success": false,
  "correct": false,
  "message": "Incorrect guess"
}
```

**Points System**:
- First player to guess correctly: **10 points**
- Players who guess within 1 second of first: **5 points**
- During double points mode: **2x multiplier**

### 2. Event Webhook

Trigger game events from external sources.

**URL**: `POST http://localhost:3015/api/webhook/event`

**Request Body**:
```json
{
  "sender_name": "EventSenderName",
  "event_type": "EVENT_TYPE"
}
```

**Available Event Types**:

#### reveal_letter
Reveals one random unrevealed letter.
```json
{
  "sender_name": "StreamBot",
  "event_type": "reveal_letter"
}
```

#### change_word
Requests the game to change to a new random word.
```json
{
  "sender_name": "Moderator",
  "event_type": "change_word"
}
```

#### double_points
Activates 2x points multiplier for 30 seconds.
```json
{
  "sender_name": "VIPUser",
  "event_type": "double_points"
}
```

#### reveal_all
Instantly reveals all letters in the word.
```json
{
  "sender_name": "Admin",
  "event_type": "reveal_all"
}
```

#### auto_win
Makes the sender automatically win the round.
```json
{
  "sender_name": "WinnerName",
  "event_type": "auto_win"
}
```

## Testing Examples

### Using cURL

**Submit a guess**:
```bash
curl -X POST http://localhost:3015/api/webhook/guess \
  -H "Content-Type: application/json" \
  -d '{
    "player_name": "Alice",
    "guess_word": "JAVASCRIPT"
  }'
```

**Reveal a letter**:
```bash
curl -X POST http://localhost:3015/api/webhook/event \
  -H "Content-Type: application/json" \
  -d '{
    "sender_name": "Bot",
    "event_type": "reveal_letter"
  }'
```

**Activate double points**:
```bash
curl -X POST http://localhost:3015/api/webhook/event \
  -H "Content-Type: application/json" \
  -d '{
    "sender_name": "Streamer",
    "event_type": "double_points"
  }'
```

### Using JavaScript/Node.js

```javascript
// Submit a guess
async function submitGuess(playerName, guessWord) {
  const response = await fetch('http://localhost:3015/api/webhook/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      player_name: playerName,
      guess_word: guessWord
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// Trigger an event
async function triggerEvent(senderName, eventType) {
  const response = await fetch('http://localhost:3015/api/webhook/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_name: senderName,
      event_type: eventType
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// Usage
submitGuess("Player1", "JAVASCRIPT");
triggerEvent("Bot", "reveal_letter");
```

### Using Python

```python
import requests
import json

# Submit a guess
def submit_guess(player_name, guess_word):
    url = "http://localhost:3015/api/webhook/guess"
    payload = {
        "player_name": player_name,
        "guess_word": guess_word
    }
    response = requests.post(url, json=payload)
    return response.json()

# Trigger an event
def trigger_event(sender_name, event_type):
    url = "http://localhost:3015/api/webhook/event"
    payload = {
        "sender_name": sender_name,
        "event_type": event_type
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = submit_guess("Player1", "JAVASCRIPT")
print(result)

result = trigger_event("Bot", "reveal_letter")
print(result)
```

## Integration Scenarios

### Twitch Chat Bot
Integrate with Twitch chat to allow viewers to guess:
```javascript
client.on('message', (channel, tags, message, self) => {
  if (message.startsWith('!guess ')) {
    const word = message.substring(7).trim().toUpperCase();
    submitGuess(tags.username, word);
  }
});
```

### Discord Bot
Allow Discord users to participate:
```javascript
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!guess ')) {
    const word = message.content.substring(7).trim().toUpperCase();
    const result = await submitGuess(message.author.username, word);
    message.reply(result.correct ? '✅ Correct!' : '❌ Incorrect');
  }
});
```

### OBS Stream Deck
Create buttons that trigger events:
- Button 1: Reveal Letter
- Button 2: Double Points
- Button 3: Change Word

### Zapier/IFTTT
Connect to external triggers:
- Tweet received → Reveal letter
- Donation received → Double points
- Follower milestone → Auto win for random viewer

## Error Handling

All webhook responses include error information:

**No Active Round**:
```json
{
  "error": "No active game round"
}
```

**Invalid Event Type**:
```json
{
  "error": "Invalid event_type"
}
```

**Missing Parameters**:
```json
{
  "error": "player_name and guess_word are required"
}
```

## Monitoring Webhook Activity

The game UI includes a real-time webhook activity monitor that shows:
- Recent webhook calls
- Sender names
- Event types
- Timestamps

Access it from the game screen in the bottom section.

## Security Considerations

For production deployments:
1. Add authentication to webhook endpoints
2. Implement rate limiting
3. Validate sender names
4. Use HTTPS
5. Add IP whitelisting if needed

## Support

For issues or questions, check the main README.md or create an issue in the repository.
