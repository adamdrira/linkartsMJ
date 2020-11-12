#!/usr/bin/python3

print('#Hello from python#')


import csv
import os 
import json
import sys
print(sys.version)
import pandas as pd





def rankings_users(data_users):  
    
    #pour les bd uniquement pour le moment
    print("rankings user")    
    data_filtered = data_users
    print(data_filtered)
    #ajouts de points pour les vues (coef 1)
    dups = data_filtered.pivot_table(index=["id","number_of_comics","number_of_drawings","number_of_writings","number_of_likes","number_of_loves","number_of_comments","number_of_views","subscribers_number","subscribings_number"], aggfunc='size')
    dups_list=list(zip(dups.index,dups))
    list_to_convert_in_csv=[]
    compteur=0
    print(dups_list)
    for item in dups_list:
        labels={}
        labels["id"]=list(list(item)[0])[0]
        if(compteur==0):
            print(list(list(item)[0])[1]) 
            #nbc
            print(list(list(item)[0])[2])
            #nbd
            print(list(list(item)[0])[3])
            #nbw
            print(list(list(item)[0])[4])
            #nbli
            print(list(list(item)[0])[5])
            #nblo
            print(list(list(item)[0])[6])
            #nbco
            print(list(list(item)[0])[7])
            #nbvi
            print(list(list(item)[0])[8])
            #nbabonnés
            print(list(list(item)[0])[9])
            #nbabonnement
        compteur+=1
        NBO=list(list(item)[0])[1]+ list(list(item)[0])[2] + list(list(item)[0])[3]
        if(NBO==0):
             labels["points"]=0
        elif (list(list(item)[0])[9]!=0):
            labels["points"]=6*(list(list(item)[0])[5]) + 5*(list(list(item)[0])[4]) + 4*(list(list(item)[0])[6]) + 3*(list(list(item)[0])[8]/list(list(item)[0])[9]) + 2*NBO + list(list(item)[0])[7]
        else:
            labels["points"]=6*(list(list(item)[0])[5]) + 5*(list(list(item)[0])[4]) + 4*(list(list(item)[0])[6]) + 3*(list(list(item)[0])[8]) + 2*NBO + list(list(item)[0])[7]
        
        list_to_convert_in_csv.append(labels)    

    
    list_to_convert_in_csv= sorted(list_to_convert_in_csv, key = lambda x: x['points'],reverse=True)           
    csv_users_rankings = pd.DataFrame(list_to_convert_in_csv)            
    csv_users_rankings.sort_values(by = ["points"], inplace = True, ascending=False)
    print(csv_users_rankings)
    return(csv_users_rankings.head(100))


   

def main():
        
    date = sys.argv[1]
    headers = {'date': date}
    print(date)
    data_users = pd.read_csv('C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/csvfiles_for_python/favorites_ranking-'+str(date)+'.csv')      
    
    csv_users_rankings = rankings_users(data_users)
    csv_users_rankings.to_json(r'C:/Users/Utilisateur/Desktop/Site/linkarts/data_and_routes/routes/python_files/favorites_ranking-'+str(date)+'.json',force_ascii=False)

    print("end")
    sys.stdout.flush()
   

if __name__ == '__main__':
    main()