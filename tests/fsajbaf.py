import pandas as pd
import numpy as np
data = pd.read_csv("C:\\Users\\Florian\\Desktop\\Coding\\conala-corpus\\mined_as_csv.csv")
from tqdm import tqdm

dirty = []
for i in tqdm(range(0, len(data['intent'])), desc="Fucking around"):
    if data.at[i, 'prob'] < 0.15 and i % 18 != 0:
        dirty.append(i)

data.drop(inplace=True, labels=dirty, axis=0)

print(len(data['intent']))
print(data['prob'].mean())
