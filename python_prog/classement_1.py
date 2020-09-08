
import pandas as pd;
import numpy as np;
import csv;
import os; 
import requests;
import json;
from flask import Flask;
from flask_cors import CORS;
from flask import request;
import numpy as np;
from mlxtend.frequent_patterns import apriori, association_rules;
import matplotlib.pyplot as plt;

from random import seed;
from random import randrange;
from csv import reader;
from math import sqrt;


def main():
    app = Flask(__name__);
    CORS(app, resources={r"/*": {"origins": "http://localhost:4600"}});
     
    
    @app.route("/",)
    def index():
        return "Welcome to Python Server"
    
    @app.route('/classement_bd', methods=['POST'])  
    def classement_tendances_serveur():
       file = request.files.get('csvfile');
       data = pd.read_csv(file);
       print(data);
       data["total_points"] = data["nb_likes"]*3 +  data["nb_loves"]*2;
       data.sort_values(by = ["total_points"], inplace = True, ascending=False);
       
       #sauvegarder le fichier
       object = data.to_json (r'./csv_files/test_success.json');
       fichier = {'upload_file': open('./csv_files/test_success.json','rb')};
       x = requests.post('http://localhost:4600/python', files=fichier);
       print(x);
       

       return('ok')
   
    @app.route('/list_of_views', methods=['POST'])  
    def list_of_views():
       #os.remove('./csv_files/list_of_views.json')
       file = request.files.get('csvfile');
       #file.save(r'./csv_files/list_of_views_test_1.csv')
       data = pd.read_csv(file);
       print(data);
       #data["total_points"] = data["nb_likes"]*3 +  data["nb_loves"]*2;
       # data.sort_values(by = ["total_points"], inplace = True, ascending=False);
       
       #sauvegarder le fichier
       object = data.to_json (r'./csv_files/list_of_views.json');
       fichier = {'upload_file': open('./csv_files/list_of_views.json','rb')};
       x = requests.post('http://localhost:4600/python', files=fichier);
       print(x);
       

       return('ok')
      
    
    app.run(host="localhost", port=int("777"))
    
    
    #print(os.listdir('./csv_files/classement_likes.csv'))
    
def classement_tendances_bd_sans_serveur():
   
     
    data = pd.read_csv('./csv_files/test_python.csv');  
    #data =data[["id_bd","nb_likes", "nb_loves"]] 
    data["total_points"] = data["nb_likes"]*3 +  data["nb_loves"]*2;


    
    # sorting w.r.t name column 
    data.sort_values(by = ["total_points"], inplace = True, ascending=False);
    fichier1 = {'upload_file': open('./csv_files/test_python.csv','rb')};
    
    # display 
    #print(x);
    object = data.to_json (r'./csv_files/test_python_to_json.json');
    fichier = {'upload_file': open('./csv_files/test_python_to_json.json','rb')};
    x = requests.post('http://localhost:4600/python', files=fichier);
    print(x);
    return(data);

def list_of_bd_liked_by_author():
    test = pd.read_csv('./csv_files/liste_test_bd.csv', sep=',');
    print(test)
    test.sort_values(by = ["auteur"], inplace = True, ascending=True);
    

    liste_titles=[]
    index_list=[]
    items=[]
    for index, row in test.iterrows():
        items.append(row[0])
        index_list.append(row[-1])
    items=list(set(items))
    index_list=list(set(index_list))

    for i in index_list:
        name=i
        #print(i)
        list_titles_bd=[]
        for index, row in test.iterrows():
            if row[-1]==i:
                #print(row[0])
                list_titles_bd.append(row[0])
        liste_titles.append(list_titles_bd)
    #print(liste_titles)
    #print(items)
    #print(index_list)
 
    encoded_vals=[]
    for i in index_list:
      #print(liste_titles[i-1])
      labels = {}
      uncommons = list(set(items) - set(liste_titles[i-1]))
      commons = list(set(items).intersection(liste_titles[i-1]))
      for uc in uncommons:
          labels[uc] = 0
          #print(labels)
      for com in commons:
          labels[com] = 1
      encoded_vals.append(labels)
    #print(encoded_vals)

           
    list_bd_liked= pd.DataFrame(encoded_vals, index=index_list)     
    return(list_bd_liked)
    
def association_rules_sans_serveur():
    df = pd.read_csv('./csv_files/liste_bs.csv', sep=',')
    liste_bd=pd.read_csv('./csv_files/liste_titles_bd.csv', sep=',', nrows=1)
    item_list = (liste_bd.loc[0])

   
    #items = (df['0'].unique())
    items=[]
    for value in item_list:
        items.append(value)        
        
    encoded_vals = []
    for index, row in df.iterrows():
         labels = {}
         uncommons = list(set(items) - set(row))
         commons = list(set(items).intersection(row))
         for uc in uncommons:
             labels[uc] = 0
             print(labels)
         for com in commons:
             labels[com] = 1
         encoded_vals.append(labels)
         print(encoded_vals)

    #print( encoded_vals)
    ohe_df = pd.DataFrame(encoded_vals)
    #print(ohe_df.head(15))
    freq_items = apriori(ohe_df, min_support=0.2, use_colnames=True, verbose=1)
    # print(freq_items.head(7))
    rules = association_rules(freq_items, metric="confidence", min_threshold=0.6)
    rules.sort_values(by = ["lift"], inplace = True, ascending=False);
    #print(rules[['antecedents', 'consequents','lift']])

   
    plt.scatter(rules["lift"], rules["lift"]*rules["confidence"], alpha=0.5)
    plt.xlabel("lift")
    plt.ylabel("lift*confidence")
    plt.title("Support vs Lift")
    plt.show()
    return(rules["lift"])

def knn_test():
    # calculate the Euclidean distance between two vectors
    def euclidean_distance(row1, row2):
        distance = 0.0
        for i in range(len(row1)-1):
            distance += (row1[i] - row2[i])**2
            return sqrt(distance)
    
    # Locate the most similar neighbors
    def get_neighbors(train, test_row, num_neighbors):
        distances = list()
        for train_row in train:
            dist = euclidean_distance(test_row, train_row)
            distances.append((train_row, dist))
            distances.sort(key=lambda tup: tup[1])
            neighbors = list()
        for i in range(num_neighbors):
            neighbors.append(distances[i][0])
        return neighbors
    
    # Make a classification prediction with neighbors
    def predict_classification(train, test_row, num_neighbors):
        neighbors = get_neighbors(train, test_row, num_neighbors)
        print(neighbors)
        output_values = [row[-1] for row in neighbors]
        print(output_values.count(0))
        prediction = max(set(output_values), key=output_values.count)
        return prediction
    
    # Test distance function
    dataset = [[2.7810836,2.550537003,0],
               [1.465489372,2.362125076,0],
               [3.396561688,4.400293529,0],
               [1.38807019,1.850220317,0],
               [3.06407232,3.005305973,0],
               [7.627531214,2.759262235,1],
               [5.332441248,2.088626775,1],
               [6.922596716,1.77106367,1],
               [8.675418651,-0.242068655,1],
               [7.673756466,3.508563011,1]]
    
    prediction = predict_classification(dataset, dataset[0], 6)
    print('Expected %d, Got %d.' % (dataset[0][-1], prediction))
    return('x')


def knn_sans_serveur():
    df = pd.read_csv('./csv_files/liste_bs.csv', sep=',')
    liste_bd=pd.read_csv('./csv_files/liste_titles_bd.csv', sep=',', nrows=1)
    item_list = (liste_bd.loc[0])
    
    #items = (df['0'].unique())
    items=[]
    for value in item_list:
        items.append(value)        
        
    encoded_vals = []
    for index, row in df.iterrows():
         labels = {}
         uncommons = list(set(items) - set(row))
         commons = list(set(items).intersection(row))
         for uc in uncommons:
             labels[uc] = 0
         for com in commons:
             labels[com] = 1
         encoded_vals.append(labels)

    #print( encoded_vals)
    ohe_df = pd.DataFrame(encoded_vals)
    print(ohe_df)
    #print(ohe_df.head(15))
    return('x')