import pandas as pd
import csv

#def path(n):
#    return './sfv/'+n+'.csv'

test_file0 = ['2018-10-09',
             '2018-10-11',
             '2018-10-12']

data_list = pd.DataFrame(columns=['Fighter\'s ID'])

#test_file1 = map(path, test_file0)

for (file0, i) in zip(test_file0, range(len(test_file0))):
    test_data = pd.read_csv('./sfv/'+file0+'.csv', dtype='object')
    test_data = test_data[['Fighter\'s ID', 'LP']]
    test_data = test_data.rename(columns={'LP': file0})
    data_list = pd.merge(data_list, test_data, right_on='Fighter\'s ID', left_on='Fighter\'s ID', how='outer')

data_list = data_list.set_index('Fighter\'s ID')
data_list.to_csv('./sfv/merge/merge_list.csv')
