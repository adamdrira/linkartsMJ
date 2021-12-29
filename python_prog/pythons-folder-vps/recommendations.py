import pandas as pd
import numpy as np
import csv
import os
import requests
import json
from flask import Flask
from flask_cors import CORS
from flask import request
from mlxtend.frequent_patterns import apriori, association_rules
import matplotlib.pyplot as plt

from random import seed
from random import randrange
from csv import reader
from math import sqrt


def main():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:4600"}})


    @app.route("/",)
    def index():
        return "Welcome to Python Server"

    @app.route('/list_of_views', methods=['POST'])
    def recommendations_for_home():

       file = request.files.get('csvfile')
       headers_content = request.headers.get('user_id')
       headers={'user_id':headers_content}
       data = pd.read_csv(file)
       list_of_views_csv = recommendation_categories_and_styles_first_page(data)


       #artpieces
       list_of_views_artpieces_csv = recommendation_artpieces_first_page(data)
  GNU nano 4.8                                                               recommendations.py


       #sauvegarder le fichier en json et en csv
       list_of_views_artpieces_csv.to_json(r'../linkarts/data_and_routes/routes/python_files/recommendations_artpieces-'+str(headers_content)+'.json',force_ascii=False)
       fichier_1 = {'upload_file': open('../linkarts/data_and_routes/routes/python_files/recommendations_artpieces-'+str(headers_content)+'.json','rb')}
       y = requests.post('http://localhost:4600/python/python_artpieces', files=fichier_1, headers=headers)


       #sauvegarder le fichier en json

       list_of_views_csv.to_json(r'../linkarts/data_and_routes/routes/python_files/recommendations-'+str(headers_content)+'.json',force_ascii=False)
       fichier = {'upload_file': open('../linkarts/data_and_routes/routes/python_files/recommendations-'+str(headers_content)+'.json','rb')}
       x = requests.post('http://localhost:4600/python/python_recommendations', files=fichier, headers=headers)


       return('ok')

    @app.route('/rankings', methods=['POST'])
    def rankings():

       date = request.headers.get('date')
       headers = {'date': date}
       views_csv = request.files.get('csv_view_file')
       love_csv = request.files.get('csv_loves_file')
       like_csv = request.files.get('csv_likes_file')

       data_view = pd.read_csv(views_csv)
       data_likes = pd.read_csv(like_csv)
       data_loves= pd.read_csv(love_csv)

       csv_bd_rankings = rankings_bd(data_view,data_likes,data_loves)
       csv_drawings_rankings = rankings_drawing(data_view,data_likes,data_loves)
       csv_writings_rankings = rankings_writings(data_view,data_likes,data_loves)



       csv_bd_rankings.to_json(r'../linkarts/data_and_routes/routes/python_files/comics_rankings_for_trendings-'+str(date)+'.json',force_ascii=False)
       fichier = {'upload_file': open('../linkarts/data_and_routes/routes/python_files/comics_rankings_for_trendings-'+str(date)+'.json','rb')}
       x = requests.post('http://localhost:4600/python/receive_comics_trendings', files=fichier, headers=headers)

       csv_drawings_rankings.to_json (r'../linkarts/data_and_routes/routes/python_files/drawings_rankings_for_trendings-'+str(date)+'.json',force_ascii=False)
       fichier_2 = {'upload_file': open('../linkarts/data_and_routes/routes/python_files/drawings_rankings_for_trendings-'+str(date)+'.json','rb')}
       x = requests.post('http://localhost:4600/python/receive_drawings_trendings', files=fichier_2, headers=headers)

       csv_writings_rankings.to_json (r'../linkarts/data_and_routes/routes/python_files/writings_rankings_for_trendings-'+str(date)+'.json',force_ascii=False)
       fichier_3 = {'upload_file': open('../linkarts/data_and_routes/routes/python_files/writings_rankings_for_trendings-'+str(date)+'.json','rb')}
       x = requests.post('http://localhost:4600/python/receive_writings_trendings', files=fichier_3, headers=headers)


       return('ok')



    app.run(host="localhost", port=int("777"))




def list_of_bd_liked_by_author():
    #l'objectif est d'obtenir un csv
    test = pd.read_csv('./csv_files/liste_test_bd.csv', sep=',')
    test.sort_values(by = ["auteur"], inplace = True, ascending=True)

    liste_titles_liked=[]
    index_list=[]
    items=[]
    for index, row in test.iterrows():
        items.append(row[0])
        index_list.append(row[-1])
    items=list(set(items))
    #sorted list of author id
    index_list=list(set(index_list))
    for i in index_list:
        name=i
        list_titles_bd=[]
        for index, row in test.iterrows():
            if row[-1]==i:
                list_titles_bd.append(row[0])
        liste_titles_liked.append(list_titles_bd)

    encoded_vals=[]
    for i in index_list:
      labels = {}
      uncommons = list(set(items) - set(liste_titles_liked[i-1]))
      commons = list(set(items).intersection(liste_titles_liked[i-1]))
      for uc in uncommons:
          labels[uc] = 0
      for com in commons:
          labels[com] = 1
      encoded_vals.append(labels)



    list_bd_liked= pd.DataFrame(encoded_vals, index=index_list)
    list_bd_liked.to_csv(r'./csv_files/list_of_bd_liked_test_1.csv')
    list_of_recommendation_accord_list_bd_liked(items,list_bd_liked,encoded_vals)


    return(list_bd_liked)

def list_of_recommendation_accord_list_bd_liked(items,data_frame,encoded_vals):



    encoded_vals_invers = []
    encoded_vals_invers_2 =[]
    liked_bd=[]
    not_liked_bd=[]
    for line in encoded_vals:
        labels_invers={}
        labels_invers_2={}
        labels_liked_bd=[]
        labels_not_liked_bd=[]
        for item in items:
            if line[item]==1:
                labels_invers[item]=0
                labels_invers_2[item]=1
                labels_liked_bd.append(item)
            if line[item]==0:
                labels_not_liked_bd.append(item)
                labels_invers[item]=0
                labels_invers_2[item]=0
        liked_bd.append(labels_liked_bd)
        not_liked_bd.append(labels_not_liked_bd)
        encoded_vals_invers.append(labels_invers)
        encoded_vals_invers_2.append(labels_invers_2)




    ohe_df_invers_2 = pd.DataFrame(encoded_vals_invers_2)

    freq_items = apriori(data_frame, min_support=0.2, use_colnames=True, verbose=1)
    rules = association_rules(freq_items, metric="confidence", min_threshold=0.6)
    rules.sort_values(by = ["lift"], inplace = True, ascending=False)
    antec = (rules[['antecedents', 'consequents','lift']])

    for index, row in antec.iterrows():
        j=0
        for bd in liked_bd:
            bd_antec=list(row[0])
            result = all(elem in bd for elem in bd_antec)
            if result:
                bd_conseq=list(row[1])
                result2 = all(elem in not_liked_bd[j] for elem in bd_conseq)
                if result2:
                    for elem in bd_conseq:
                        encoded_vals_invers[j][elem]=1
            j+=1

    data=pd.DataFrame(encoded_vals_invers)
    data.to_csv(r'./csv_files/resultas.csv')



    """
    plt.scatter(rules["lift"], rules["lift"]*rules["confidence"], alpha=0.5)
    plt.xlabel("lift")
    plt.ylabel("lift*confidence")
    plt.title("Support vs Lift")
    plt.show()
    """

    return(rules["lift"])


def recommendation_of_comics_step_1():
    df = pd.read_csv('./csv_files/liste_bs.csv', sep=',')
    #ici on recupere une ligne avec l'ensemble des bd
    liste_bd=pd.read_csv('./csv_files/liste_titles_bd.csv', sep=',', nrows=1)
    item_list = (liste_bd.loc[0])


    #on prepare une liste de l'ensemble des bd issue du csv
    items=[]
    for value in item_list:
        items.append(value)

    encoded_vals = []
    encoded_vals_invers = []
    liked_bd=[]
    not_liked_bd=[]
    for index, row in df.iterrows():
         labels = {}
         #on prepare le csv inverse avec bdr recommandees
         labels_invers={}
         #on prepare la liste des bd aimees et non aimees par auteur
  GNU nano 4.8                                                               recommendations.py
         labels_liked_bd=[]
         labels_not_liked_bd=[]
         uncommons = list(set(items) - set(row))
         commons = list(set(items).intersection(row))
         for uc in uncommons:
             labels[uc] = 0
             labels_invers[uc] = 0
             labels_not_liked_bd.append(uc)
         for com in commons:
             labels[com] = 1
             labels_invers[com] = 0
             labels_liked_bd.append(com)
         encoded_vals.append(labels)
         encoded_vals_invers.append(labels_invers)
         liked_bd.append(labels_liked_bd)
         not_liked_bd.append(labels_not_liked_bd)

    ohe_df = pd.DataFrame(encoded_vals)
    ohe_df_invers = pd.DataFrame(encoded_vals_invers)
    freq_items = apriori(ohe_df, min_support=0.2, use_colnames=True, verbose=1)
    rules = association_rules(freq_items, metric="confidence", min_threshold=0.6)
    rules.sort_values(by = ["lift"], inplace = True, ascending=False)
    test_result = (rules[['antecedents', 'consequents','lift']])
    antec = test_result

    for index, row in antec.iterrows():
        #on a la liste des antecedents et on regarde pour chaque ligne si l'antecedent concerne l'auteur
        # concerner l'auteur veut dire que l'antecedent fait partie des bd aimees et que les concequences n'en font pas
        # le j=0 permet de parcourir la liste des bd aimees et non aimees par auteur concernee a chaque boucle for
        j=0
        for bd in liked_bd:
            bd_antec=list(row[0])
            #la fonction all return true si chaque bd de la liste des antec est dans la liste des bd aimees
            result = all(elem in bd for elem in bd_antec)
            if result:
                bd_conseq=list(row[1])
                result2 = all(elem in not_liked_bd[j] for elem in bd_conseq)
                if result2:
                    for elem in bd_conseq:
                        encoded_vals_invers[j][elem]=1
            j+=1

    data=pd.DataFrame(encoded_vals_invers)
    data.to_csv(r'./csv_files/resultas.csv')
    a=pd.read_csv('./csv_files/resultas.csv', sep=',')

    test_loc = test_result.loc[82]
    rat = []
    for value in test_loc:
        rat.append(value)

    """
    plt.scatter(rules["lift"], rules["lift"]*rules["confidence"], alpha=0.5)
    plt.xlabel("lift")
    plt.ylabel("lift*confidence")
    plt.title("Support vs Lift")
    plt.show()
    """
    return(rules["lift"])



def recommendation_categories_and_styles_first_page(data):

    #data = pd.read_csv('./csv_files/list_of_views_test_1.csv')
    dups = data.pivot_table(index=["publication_category"], aggfunc='size')
    dups_list=list(zip(dups.index,dups))
    dups_sorted= sorted(dups_list, key=lambda x: x[1],reverse=True)
    #maintenant qu'on a la liste triees des categories aimees on va obtenir la liste des styles aimes par categorie
    sorted_list=[]
    for item in dups_sorted:
        label={}
        list_of_styles=[]
        category_list=list(item)
        category=category_list[0]
        data_one_category=data.loc[data['publication_category'] == category]
        dups_styles = data_one_category.pivot_table(index=["style"], aggfunc='size')
        dups_styles_list=list(zip(dups_styles.index,dups_styles))
        #on trie de facon inverse car le set() va inverser le trie
        dups_styles_list= sorted(dups_styles_list, key=lambda x: x[1],reverse=True)
        label[category]=(dups_styles_list)
        sorted_list.append(label)
    ohe_df = pd.DataFrame(sorted_list)
    return ohe_df

def recommendation_artpieces_first_page(data):

    #on recupere les 50 dernieres oeuvres vues.
    #data = pd.read_csv('./csv_files/list_of_views_test_1.csv')
    dups = data.pivot_table(index=["publication_category"], aggfunc='size')
    dups_list=list(zip(dups.index,dups))
    dups_sorted= sorted(dups_list, key=lambda x: x[1],reverse=True)
    #maintenant qu'on a la liste triees des categories aimees on va obtenir la liste des styles aimes par categorie
    sorted_list=[]
    for item in dups_sorted:
        list_category_json={}
        couple_format_id={}
        list_of_id=[]
        category=list(item)[0]
        data_one_category=data.loc[data['publication_category'] == category]
        for index, row in data_one_category.iterrows():
            liste=[]
            liste.append(row[4])
            liste.append(row[2])
            list_of_id.append(liste)
            #test_unique_list=list(list_of_id_unique)

        list_category_json[category]=(list_of_id)
        sorted_list.append(list_category_json)

    ohe_df = pd.DataFrame(sorted_list)
    return ohe_df

def rankings_bd(data1, data2, data3):

    #pour les bd uniquement pour le moment
    data_filtered = data1[data1['publication_category'] == 'bd']

    #ajouts de points pour les vues (coef 1)
    dups = data_filtered.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list=list(zip(dups.index,dups))
    list_to_convert_in_csv=[]
    for item in dups_list:
        labels={}
        labels["format"]=list(list(item)[0])[0]
        labels["publication_id"]=list(list(item)[0])[1]
        labels["points"]=list(item)[1]
        list_to_convert_in_csv.append(labels)

    #ajout de points pour le temps des vues (coef 1 et divise par 20  :3 vues valent 1 minute de vue pour les bd)
    for index, row in data_filtered.iterrows():
        for item in list_to_convert_in_csv:
            if (item['format']==row[3]) and (item['publication_id']==row[5]):
                item['points']+=(row[9]/20)

    #on passe aux likes pour les bd seulements
    data_filtered_2 = data2[data2['publication_category'] == 'bd']

    # ajout de points pour les likes (coef 2)
    dups_2 = data_filtered_2.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list_2=list(zip(dups_2.index,dups))
    for item in dups_list:
        for item_2 in list_to_convert_in_csv:
            if (item_2['format']==list(list(item)[0])[0]) and (item_2['publication_id']==list(list(item)[0])[1]):
                item_2['points']+=2

    #on passe aux loves pour les bd seulements
    data_filtered_3 = data3[data3['publication_category'] == 'bd']

    # ajout de points pour les loves (coef 3)
    dups_3 = data_filtered_3.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list_3=list(zip(dups_3.index,dups))
    for item in dups_list:
        for item_2 in list_to_convert_in_csv:
            if (item_2['format']==list(list(item)[0])[0]) and (item_2['publication_id']==list(list(item)[0])[1]):
                item_2['points']+=3

    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)
    csv_bd_rankings = pd.DataFrame(list_to_convert_in_csv)
    csv_bd_rankings.sort_values(by = ["points"], inplace = True, ascending=False)

    return(csv_bd_rankings.head(30))

def rankings_drawing(data1, data2, data3):
    #pour les bd uniquement pour le moment
    data_filtered = data1[data1['publication_category'] == 'drawing']

    #ajouts de points pour les vues (coef 1)
    dups = data_filtered.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list=list(zip(dups.index,dups))
    list_to_convert_in_csv=[]
    for item in dups_list:
        labels={}
        labels["format"]=list(list(item)[0])[0]
        labels["publication_id"]=list(list(item)[0])[1]
        labels["points"]=list(item)[1]
        list_to_convert_in_csv.append(labels)

    #ajout de points pour le temps des vues (coef 1 et divise par 10  :10 secondes de vues vaut une vue en plus)
    for index, row in data_filtered.iterrows():
        for item in list_to_convert_in_csv:
            if (item['format']==row[3]) and (item['publication_id']==row[5]):
                item['points']+=(row[9]/10)

    #on passe aux likes pour les bd seulements
    data_filtered_2 = data2[data2['publication_category'] == 'drawing']

    # ajout de points pour les likes (coef 2)
    dups_2 = data_filtered_2.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list_2=list(zip(dups_2.index,dups))
    for item in dups_list:
        for item_2 in list_to_convert_in_csv:
            if (item_2['format']==list(list(item)[0])[0]) and (item_2['publication_id']==list(list(item)[0])[1]):
                item_2['points']+=2

    #on passe aux loves pour les bd seulements
    data_filtered_3 = data3[data3['publication_category'] == 'drawing']

    # ajout de points pour les loves (coef 3)
    dups_3 = data_filtered_3.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list_3=list(zip(dups_3.index,dups))
    for item in dups_list:
        for item_2 in list_to_convert_in_csv:
            if (item_2['format']==list(list(item)[0])[0]) and (item_2['publication_id']==list(list(item)[0])[1]):
                item_2['points']+=3

    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)
    csv_drawing_rankings = pd.DataFrame(list_to_convert_in_csv)
    csv_drawing_rankings.sort_values(by = ["points"], inplace = True, ascending=False)

    return(csv_drawing_rankings.head(30))

def rankings_writings(data1, data2, data3):
    #pour les bd uniquement pour le moment
    data_filtered = data1[data1['publication_category'] == 'writing']

    #ajouts de points pour les vues (coef 1)
    dups = data_filtered.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list=list(zip(dups.index,dups))
    list_to_convert_in_csv=[]
    for item in dups_list:
        labels={}
        labels["format"]=list(list(item)[0])[0]
        labels["publication_id"]=list(list(item)[0])[1]
        labels["points"]=list(item)[1]
        list_to_convert_in_csv.append(labels)

    #ajout de points pour le temps des vues (coef 1 et divise par 60  :60 secondes de vues vaut une vue en plus)
    for index, row in data_filtered.iterrows():
        for item in list_to_convert_in_csv:
            if (item['format']==row[3]) and (item['publication_id']==row[5]):
                item['points']+=(row[9]/60)

    #on passe aux likes pour les bd seulements
    data_filtered_2 = data2[data2['publication_category'] == 'writing']

    # ajout de points pour les likes (coef 2)
    dups_2 = data_filtered_2.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list_2=list(zip(dups_2.index,dups))
    for item in dups_list:
        for item_2 in list_to_convert_in_csv:
            if (item_2['format']==list(list(item)[0])[0]) and (item_2['publication_id']==list(list(item)[0])[1]):
                item_2['points']+=2

    #on passe aux loves pour les bd seulements
    data_filtered_3 = data3[data3['publication_category'] == 'writing']

    # ajout de points pour les loves (coef 3)
    dups_3 = data_filtered_3.pivot_table(index=["format","publication_id"], aggfunc='size')
    dups_list_3=list(zip(dups_3.index,dups))
    for item in dups_list:
        for item_2 in list_to_convert_in_csv:
            if (item_2['format']==list(list(item)[0])[0]) and (item_2['publication_id']==list(list(item)[0])[1]):
                item_2['points']+=3

    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)
    csv_writing_rankings = pd.DataFrame(list_to_convert_in_csv)
    csv_writing_rankings.sort_values(by = ["points"], inplace = True, ascending=False)

    return(csv_writing_rankings.head(30))






