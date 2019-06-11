from extractor import Extractor
import re
import os
import tensorflow as tf
import time
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.logging.set_verbosity(tf.logging.ERROR)


def pipeline(X):
    st = time.time()
    extractor = Extractor()
    X['intent'] = X['intent'].apply(lambda x: x.lower())
    X['intent'] = X['intent'].apply(lambda x: re.sub(pattern='[^a-z0-9]', string=x, repl=' '))
    X['intent'] = X['intent'] + '||BORDER|| ' + X['snippet']
    X = X['intent']
    input_tokenized = extractor.tokenize(X)
    prediction = extractor.predict(input_tokenized)
    xy = zip(prediction, X.tolist())
    xy.sort(reverse=True)
    sorted_x = [x for y,x in xy]
    sorted_y = [y for y,x in xy]
    return sorted_x, sorted_y


