import sys
import vertexai
from vertexai.language_models import TextGenerationModel

vertexai.init(project="linear-yen-400506", location="us-central1")
parameters = {
    "max_output_tokens": 1024,
    "temperature": 0.2,
    "top_p": 0.8,
    "top_k": 40
}
model = TextGenerationModel.from_pretrained("text-bison")
user_input = sys.argv[1]
book_name = sys.argv[2]
author_name = sys.argv[3]
response = model.predict(
    f"""{user_input} in context of the book {book_name} by the author {author_name}
 """,
    **parameters
)
print(f"{response.text}")