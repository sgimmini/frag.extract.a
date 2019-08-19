from keras.models import model_from_json
import json
import numpy as np


def tokenization(input, vocab):
    output = np.zeros(len(vocab))
    tokens = input.split(' ')
    for i in range(0, len(tokens)):
        output[i] = vocab[tokens[i]]
    return output


# paths to model.son and model.h5
model_dir = "C:\\Users\\Florian\\frag.extract.a\\extraction_model\\result_full_data\\model.json"
weights_dir = "C:\\Users\\Florian\\frag.extract.a\\extraction_model\\result_full_data\\model.h5"
token_dir = "C:\\Users\\Florian\\frag.extract.a\\extraction_model\\result_full_data\\vocab.json"

# this is a quick way to load the model
json_file = open(model_dir, 'r')
loaded_model_json = json_file.read()
json_file.close()
model = model_from_json(loaded_model_json)
model.load_weights(weights_dir)

# load the tokenizer
with open(token_dir, 'rb') as handle:
    contents = handle.read()
    tokenizer = json.loads(contents)

# load test data
f = open("test_data.txt", 'r')
lines = f.readlines()
print(lines)

# open output file
with open("eval_model_result.txt", "w") as file:
    # now get the predictions for every case and write them into an output file
    for line in lines:
        tok = tokenization(line, tokenizer)
        prediction = model.predict(tok)
        to_write = line + " " + str(prediction) + "\n"
        file.write(to_write)