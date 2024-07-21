import { groq } from '../App.js';

class ChatManager {
    constructor(characterDescription) {
        this.characterDescription = characterDescription;
        this.messages = [
          {
            "role": "system",
            "content": "You are a strange old man that speaks in riddles about programming and wizardry. You are concise and bizarre."
          }
        ];
    }
  
    addMessage(role, content) {
        this.messages.push({ role, content });
    }
  
    async getCharacterResponse() {
        try {
            const chatCompletion = await groq.chat.completions.create({
                "messages": this.messages,
                "model": "llama3-8b-8192",
                "temperature": 1,
                "max_tokens": 1024,
                "top_p": 1,
                "stream": false,
                "stop": null
            });
  
            // Initialize response variable
            const response = chatCompletion.choices.map(choice => choice.message?.content || '').join('');
            return response;
  
        } catch (error) {
            console.error('Error fetching character response:', error);
            // Provide a fallback response for testing
            return "I'm sorry, I couldn't fetch a response at this moment.";
        }
    }
  }

export default ChatManager;
