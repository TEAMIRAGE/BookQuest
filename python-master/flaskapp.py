from flask import Flask, request, jsonify
from flask_cors import CORS
import vertexai
from vertexai.language_models import TextGenerationModel
import requests
from google.oauth2 import service_account

app = Flask(__name__ if __name__ != "__main__" else "your_module_name")
CORS(app)
credentials = service_account.Credentials.from_service_account_file(
    'linear-yen-400506-78e0707a1328.json')
# Initialize Vertex AI and the model
vertexai.init(project="linear-yen-400506", location="us-central1", credentials=credentials)
parameters = {
    "max_output_tokens": 1024,
    "temperature": 0.2,
    "top_p": 0.8,
    "top_k": 40
}
model = TextGenerationModel.from_pretrained("text-bison")

@app.route('/api/AI-chat-answer/<userid>', methods=['POST'])
def ai_chat_answer(userid):
    try:
        print("Userid is: "+userid)
        user_input = request.json.get('username')

        print(user_input)
        # Make a request to get book details
        book_details_response = requests.get(f"http://localhost:3000/api/all_books_details?id={userid}")
        if book_details_response.status_code != 200:
            return jsonify({"message": "Error retrieving book details"}), 500

        book_details = book_details_response.json()
        print(book_details)
        book_name = book_details.get('name')

        author_name = book_details.get('author')
        print(book_name, author_name)

        response = model.predict(
            f"{user_input} in context of the book {book_name} by the author {author_name}\n",
            **parameters
        )

        print(response.text)

        return jsonify({"message": response.text}), 201

    except Exception as e:
        print(e)
        return jsonify({"message": "Error occurred"}), 500

if __name__ == "__main__":
    app.run()
