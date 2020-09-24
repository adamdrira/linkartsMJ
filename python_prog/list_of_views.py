#!/usr/bin/python3

print('#Hello from python#')


import csv
import os 
import json
import sys
print(sys.version)
import pandas as pd





def recommendation_categories_and_styles_first_page(data):
    
    #data = pd.read_csv('./csv_files/list_of_views_test_1.csv') 
    #print(data)
    dups = data.pivot_table(index=["publication_category"], aggfunc='size')
   # print(dups)
    dups_list=list(zip(dups.index,dups))
    dups_sorted= sorted(dups_list, key=lambda x: x[1],reverse=True)
    #maintenant qu'on a la liste triees des categories aimees on va obtenir la liste des styles aimes par categorie
    sorted_list=[]
    for item in dups_sorted:
        label={}
        list_of_styles=[]
        category_list=list(item)
        #print(category_list)
        category=category_list[0]
        data_one_category=data.loc[data['publication_category'] == category]
        dups_styles = data_one_category.pivot_table(index=["style"], aggfunc='size')
        dups_styles_list=list(zip(dups_styles.index,dups_styles))
        #on trie de facon inverse car le set() va inverser le trie
        dups_styles_list= sorted(dups_styles_list, key=lambda x: x[1],reverse=True)
        label[category]=(dups_styles_list)
        sorted_list.append(label)
    ohe_df = pd.DataFrame(sorted_list)
    #print(ohe_df)
    #ohe_df.to_json (r'./csv_files/test_list_views.json')
    return ohe_df

def recommendation_artpieces_first_page(data):
    
    #on recupere les 50 dernieres oeuvres vues.
    #data = pd.read_csv('./csv_files/list_of_views_test_1.csv') 
    #print(data)
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
        print(data_one_category)
        for index, row in data_one_category.iterrows():
            liste=[]
            liste.append(row[4])
            liste.append(row[2])
            list_of_id.append(liste)
            #test_unique_list=list(list_of_id_unique)
            
        list_category_json[category]=(list_of_id)
        sorted_list.append(list_category_json)

    ohe_df = pd.DataFrame(sorted_list)
    print(ohe_df)
    #ohe_df.to_json (r'./csv_files/test_list_views_artpieces.json')
    return ohe_df

def main():
    
    print("in python file")
    #file = sys.argv[1]
    headers_content = sys.argv[1]
    print(headers_content)
    headers={'user_id':headers_content}
    #print(file)
    data = pd.read_csv('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/csvfiles_for_python/classement_python-' +str(headers_content)+'.csv')
    print(data)
    list_of_views_csv = recommendation_categories_and_styles_first_page(data)
    print(list_of_views_csv)


    #artpieces
    list_of_views_artpieces_csv = recommendation_artpieces_first_page(data)
    print(list_of_views_artpieces_csv)
    

    #sauvegarder le fichier en json et en csv
    list_of_views_artpieces_csv.to_json(r'C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/recommendations_artpieces-'+str(headers_content)+'.json',force_ascii=False)
    fichier_1 = {'upload_file': open('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/recommendations_artpieces-'+str(headers_content)+'.json','rb')}
    #y = requests.post('http://localhost:4600/python/python_artpieces', files=fichier_1, headers=headers)

    #sauvegarder le fichier en json 

    list_of_views_csv.to_json(r'C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/recommendations-'+str(headers_content)+'.json',force_ascii=False)
    fichier = {'upload_file': open('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/recommendations-'+str(headers_content)+'.json','rb')}
    #x = requests.post('http://localhost:4600/python/python_recommendations', files=fichier, headers=headers)


    print(fichier)
    print(fichier_1)
    print("end")
    sys.stdout.flush()

if __name__ == '__main__':
    main()