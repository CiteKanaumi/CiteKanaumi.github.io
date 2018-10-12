import pandas as pd
import csv
import os

path = './sfv/'
files = []

for x in os.listdir(path):
    if os.path.isfile(path + x):
        x=x.replace('.csv','')
        files.append(x)

data_list = pd.DataFrame(columns=['Fighter\'s ID'])

for (file0, i) in zip(files, range(len(files))):
    test_data = pd.read_csv('./sfv/'+file0+'.csv', dtype='object')
    test_data = test_data[['Fighter\'s ID', 'LP']]
    test_data = test_data.rename(columns={'LP': file0})
    data_list = pd.merge(data_list, test_data, right_on='Fighter\'s ID', left_on='Fighter\'s ID', how='outer')

data_list = data_list.set_index('Fighter\'s ID')
data_list.to_csv('./sfv/merge/merge_list.csv')
