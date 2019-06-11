from keras.models import load_model
from pickle import load
from keras.preprocessing.sequence import pad_sequences
from keras.models import model_from_json
import os
import tensorflow as tf
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.logging.set_verbosity(tf.logging.ERROR)


class Extractor:

    def __init__(self):
        # this can be alternitavely be used but is way slower
        # self.model = load_model('/home/rauls/LSTM_5k.h5')
        json_file = open("/home/rauls/model.json", 'r')
        loaded_model_json = json_file.read()
        json_file.close()
        self.model = model_from_json(loaded_model_json)
        self.model.load_weights("/home/rauls/model.h5")
        self.tokenizer = load(open('/home/rauls/tokenizer.pk', 'rb'))
        self.MAX_SEQUENCE_LEN = 1000

    def set_model(self, path):
        self.model = load_model(filepath=path)

    def set_model_joblib(self, path):
        from joblib import load as jl
        self.model = jl(path)

    def set_tokenizer(self, path):
        self.tokenizer = load(open(path, 'rb'))

    def set_max_seq_len(self, maximum):
        self.MAX_SEQUENCE_LEN = maximum

    def predict(self, input):
        assert self.model is not None
        prediction = self.model.predict(input)
        return prediction

    def tokenize(self, input):
        assert self.tokenizer is not None
        tokens = self.tokenizer.texts_to_sequences(input)
        if self.MAX_SEQUENCE_LEN is not None:
            padded_tokens = pad_sequences(tokens, self.MAX_SEQUENCE_LEN)
        else:
            padded_tokens = pad_sequences(tokens)
        return padded_tokens

