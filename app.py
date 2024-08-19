from flask import Flask, request, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np
import io

app = Flask(__name__)

# Load your trained model
model = tf.keras.models.load_model('model.keras')

def preprocess_image(image):
    image = image.resize((224, 224))  # Resize to the model's expected input size
    image = np.array(image) / 255.0  # Normalize the image
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

@app.route('/predict', methods=['POST'])
def predict():
    try:
        image_file = request.files['file']
        image = Image.open(io.BytesIO(image_file.read()))
        processed_image = preprocess_image(image)
        prediction = model.predict(processed_image).tolist()
        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
