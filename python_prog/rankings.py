#!/usr/bin/python3

print('#Hello from python#')


import csv
import os 
import json
import sys
print(sys.version)
import pandas as pd





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
                
    #print(list_to_convert_in_csv)
    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)           
    csv_bd_rankings = pd.DataFrame(list_to_convert_in_csv)            
    csv_bd_rankings.sort_values(by = ["points"], inplace = True, ascending=False)
    #print(csv_bd_rankings)
    
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
                
    #print(list_to_convert_in_csv)
    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)           
    csv_drawing_rankings = pd.DataFrame(list_to_convert_in_csv)            
    csv_drawing_rankings.sort_values(by = ["points"], inplace = True, ascending=False)
    #print(csv_drawing_rankings)
    
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
                
    #print(list_to_convert_in_csv)
    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)           
    csv_writing_rankings = pd.DataFrame(list_to_convert_in_csv)            
    csv_writing_rankings.sort_values(by = ["points"], inplace = True, ascending=False)
    #print(csv_writing_rankings)
    
    return(csv_writing_rankings.head(30))
   

def main():
        
    date = sys.argv[1]
    headers = {'date': date}
    print(date)
    data_view = pd.read_csv('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/csvfiles_for_python/view_rankings.csv')                              
    data_likes = pd.read_csv('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/csvfiles_for_python/likes_rankings.csv')      
    data_loves= pd.read_csv('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/csvfiles_for_python/loves_rankings.csv')      
    
    csv_bd_rankings = rankings_bd(data_view,data_likes,data_loves)
    csv_drawings_rankings = rankings_drawing(data_view,data_likes,data_loves)
    csv_writings_rankings = rankings_writings(data_view,data_likes,data_loves)
    
    
    
    csv_bd_rankings.to_json(r'C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/comics_rankings_for_trendings-'+str(date)+'.json',force_ascii=False)

    
    csv_drawings_rankings.to_json (r'C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/drawings_rankings_for_trendings-'+str(date)+'.json',force_ascii=False)

    
    csv_writings_rankings.to_json (r'C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/writings_rankings_for_trendings-'+str(date)+'.json',force_ascii=False)

    print(csv_bd_rankings)
    print(csv_drawings_rankings)
    print(csv_writings_rankings)
    print("end")
    sys.stdout.flush()
   

if __name__ == '__main__':
    main()