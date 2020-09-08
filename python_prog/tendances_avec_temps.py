

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

def classement_bd_liked():
    
    #faire une fonction qui récupère les bd aimés la veille
    data = pd.read_csv('./csv_files/liste_liked_bd.csv'); 
    print(data)
    dups = data.pivot_table(index=['bd_id'], aggfunc='size')
    print(dups)
    dups_list=list(zip(dups.index,dups))
    print(dups_list)
    dups_sorted= sorted(dups_list, key=lambda x: x[1],reverse=True)
    print(dups_sorted)
    #on obtient la liste des bd les plus aimés de la veille
    
    #faire pareil pour les vues et les j'adores
    
    #faire un classement global selon les 3 critères pour des poids différents
    
    
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
    