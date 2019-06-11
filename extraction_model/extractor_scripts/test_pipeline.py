from pipeline import pipeline
import pandas as pd
import time
import os
import tensorflow as tf
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.logging.set_verbosity(tf.logging.ERROR)


start = time.time()
intent = "How to use a for loop in python?"
X = pd.DataFrame.from_dict({'intent': '',
                            'snippet': ['list = [33, 21, 44]: for item in list: print(item)', 'print("This is getting meta")', 'list = sorted(list)', 'for x in test: x = x+1', 'quit()']})
for i in range(len(X['snippet'])):
    X.at[i, 'intent'] = intent
order_x, order_y = pipeline(X)
print(order_x)
print(order_y)
end = time.time()
print("This took %s minutes." % str((end-start)/60))
