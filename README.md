# 🤖 AI Chat App — Flask + Anthropic

A full-stack AI chat web application built with Flask (backend) and HTML/CSS/JS (frontend), powered by the Anthropic Claude API.

---

## 📁 Project Structure

```
ai-chat-app/
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── .env                    # API key (git-ignored)
├── .gitignore
├── templates/
│   └── index.html          # Main HTML page
└── static/
    ├── css/
    │   └── style.css       # All styling
    └── js/
        └── app.js          # Frontend logic
```

---

## ⚡ Quick Setup (VS Code)

### 1. Open in VS Code
```bash
cd ai-chat-app
code .
```

### 2. Create a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add your Anthropic API key
Open `.env` and replace the placeholder:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```
Get your key at: https://console.anthropic.com

### 5. Load environment variables
Add this to the top of `app.py` (already included):
```python
from dotenv import load_dotenv
load_dotenv()
```

### 6. Run the app
```bash
python app.py
```

### 7. Open in browser
```
http://localhost:5000
```

---

## 🔑 Getting an Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy and paste it into your `.env` file

---

## 🚀 Features

- 💬 Real-time chat with Claude AI
- 🧠 Full conversation memory (context preserved across turns)
- ✨ Markdown rendering (code blocks, bold, lists, etc.)
- 📜 Chat history in sidebar
- 🔄 New Chat / Clear chat functionality
- 💡 Quick suggestion prompts
- 📱 Responsive design (mobile-friendly)
- ⚠️ Error handling with toast notifications

---

## 🛠 Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | HTML5, CSS3, Vanilla JS     |
| Backend  | Python 3, Flask             |
| AI       | Anthropic Claude API        |
| Styling  | Custom CSS (dark theme)     |

---

## 🔧 VS Code Extensions (Recommended)

- **Python** (ms-python.python)
- **Pylance** (ms-python.vscode-pylance)
- **Flask Snippets**
- **Prettier** (for HTML/CSS/JS formatting)
- **REST Client** (for testing API endpoints)

---

## 📡 API Endpoint

### `POST /chat`

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:**
```json
{
  "reply": "Hello! How can I help you today?"
}
```

**Error response:**
```json
{
  "error": "Error description here"
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `AuthenticationError` | Check your API key in `.env` |
| Port 5000 in use | Change `port=5000` in `app.py` |
| CORS error | `flask-cors` is included — ensure it's installed |
| Network error in browser | Make sure Flask is running (`python app.py`) |

---

## 📝 Customization

- **Change AI personality**: Edit the `system` prompt in `app.py`
- **Change model**: Replace `claude-sonnet-4-20250514` in `app.py`
- **Adjust max tokens**: Change `max_tokens=1024` in `app.py`
- **Theme colors**: Edit CSS variables in `static/css/style.css`
