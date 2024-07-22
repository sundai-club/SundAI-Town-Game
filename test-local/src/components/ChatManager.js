/**
 * Manages chat interactions within the game, handling the sending and receiving of messages via the Groq SDK.
 */
import { groq } from '../App.js';

class ChatManager {
    /**
     * Constructs a ChatManager with a specified character description.
     * @param {string} characterDescription - Description of the character this chat manager handles.
     * @param {string} LLM_CONTEXT - Description of the character this chat manager handles.
     */
    constructor(characterDescription, LLM_CONTEXT) {
        this.characterDescription = characterDescription;
        this.messages = [
          {
            "role": "system",
            "content": "You are a strange old man that speaks in riddles about programming and wizardry. You are concise and bizarre."
          }
        ];
    }
  
    /**
     * Adds a message to the chat log.
     * @param {string} role - The role of the message sender (e.g., 'user', 'npc').
     * @param {string} content - The content of the message.
     */
    addMessage(role, content) {
        this.messages.push({ role, content });
    }
  
    /**
     * Asynchronously fetches a response from the Groq chat completion based on the current chat log.
     * @returns {Promise<string>} The fetched response string.
     */
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
