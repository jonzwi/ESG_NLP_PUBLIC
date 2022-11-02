import pandas as pd
pd.set_option('max_colwidth', 50)

import numpy as np
import ast

import os

### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 

# if not 'cleanURL.py' in os.listdir():
#   cleanURL_PY = '1WFCzNdHClqA2f8n8-82Vbq_0tjInh65w'

#   !gdown $cleanURL_PY

#   from cleanURL import cleanURL


# ### AMZN data
# URL_E = '/content/sample_data/formatted_NVDA_10K_E.csv'
# URL_S = '/content/sample_data/formatted_NVDA_10K_S.csv'
# URL_G = '/content/sample_data/formatted_NVDA_10K_G.csv'

company = "3M"

URL_E = "public/Formatted_Data/formatted_{}_10K_E.csv".format(company)
URL_S = "public/Formatted_Data/formatted_{}_10K_S.csv".format(company)
URL_G = "public/Formatted_Data/formatted_{}_10K_G.csv".format(company)

output_pth = "public/Formatted_Threshold/formatted_{}_10K_".format(company)


os.chdir("C:/Users/jleckron/ReactProjects/esgnlpfrontend")


### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 

def main(LIST_URLS, topN=50):

  E,S,G = LIST_URLS

  df_E = pd.read_csv(E)
  df_S = pd.read_csv(S)
  df_G = pd.read_csv(G)

  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 


  def sentimentElection(df, rowNum, categoryESG, electionMode='balanced'):

    if categoryESG not in ['E','S','G']:
      print(f'categoryESG must be "E", "S", or "G"' )
      return


    maxSentimentCols = [ col for col in df.columns if 'maxSentiment' in col ]
    modelSentiments  = []

    for col in maxSentimentCols:
      modelSentiments.append( df[col][rowNum] )
    
    tally = sorted({ k:modelSentiments.count(k) for k in set(modelSentiments) }.items(), reverse=True, key=lambda x: x[1])
    
    sentiments = {
        0 : 'neutral' ,
        1 : 'positive',
        2 : 'negative',
    }

    if len(tally) == 3:
      if electionMode=='extreme': return df[f'{categoryESG}_fineTuned_maxSentiment'][rowNum]
      if electionMode=='annuled': 
        # print(f'annuled tally: {tally}')
        return 'TIE'
      else:
        # print('THREE-WAY TIE')
        # print(f'modelSentiments: {modelSentiments}')
        
        twitter = ast.literal_eval(df[f'{categoryESG}_twitter_ntl_pos_neg'][rowNum])
        finBERT = ast.literal_eval(df[f'{categoryESG}_finBERT_ntl_pos_neg'][rowNum])

        idxSUM = [i+j for i,j in zip(twitter, finBERT)]

        # print()
        # print('E_finBERT:'.rjust(22), E_finBERT)
        # print('E_twitter:'.rjust(22), E_twitter) 
        # print('E_twitter + E_finBERT:',idxSUM)

        sentIDX = np.argmax(idxSUM)

        return sentiments[sentIDX]
  
    else:
      return tally[0][0]
    

  ### ---- ---- ---- ---- ---- 
  ### RUN CODE
  ### ---- ---- ---- ---- ---- 

  electionModes = ['balanced', 'extreme', 'annuled']
  # electionMode='balanced'

  for df,categoryESG in zip([df_E, df_S, df_G], ['E','S','G']):

    for electionMode in electionModes:

      df[f'vote_{electionMode}'] = ''

      for i in range(len(df)):
        df[f'vote_{electionMode}'][i] = sentimentElection(
                                              df = df, 
                                              rowNum = i, 
                                              categoryESG  = categoryESG, 
                                              electionMode = electionMode
                                          )

      dropTIES = 0
      ### DROP ALL ROWS WHERE THERE IS A TIE
      if dropTIES: df = df[ ~ (df['vote_annuled']=='TIE')]

    # display(df.head(5))


  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 
  import matplotlib.pyplot as plt

  plt.figure(figsize=(5,5))

  end = 50

  plt.plot(df_E['MATCH_SCORE'][0:end], c='green' )
  plt.plot(df_S['MATCH_SCORE'][0:end], c='navy'  )
  plt.plot(df_G['MATCH_SCORE'][0:end], c='orange')
  plt.xlabel('rowNum', fontdict=None, labelpad=None)
  plt.ylabel('Match_Score', fontdict=None, labelpad=None)

  plt.legend(['E','S','G'])

  plt.show()

  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 

  def getMinMax(LIST_DFS):
    MAX = float('-inf')
    MIN = float('inf')

    ESG    = {}
    maxCAT = ''

    for df in LIST_DFS:
      _max = max(df['MATCH_SCORE'])
      _min = min(df['MATCH_SCORE'])

      query = df['QUERY'][0]
      category = 'S' if 'Social' in query else 'G' if 'Governance' in query else 'E'

      if _max > MAX: 
        MAX = _max
        maxCAT = category

      if _min < MIN: 
        MIN = _min
        minCAT = category

      ESG[category] = (_max, _min)

    ESG['Max_Min'] = (MAX, MIN)

    return {
            'E': ESG['E'], 
            'S': ESG['S'], 
            'G': ESG['G'], 
            'MIN': MIN, 
            'MAX': MAX, 
            'minCAT': minCAT, 
            'maxCAT': maxCAT,
          }


  ESG = getMinMax( [df_E, df_S, df_G] )



  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 

  def getTopDF(LIST_DFS, TOP_CATEGORY):
    print(f'TOP_CATEGORY: {TOP_CATEGORY}')

    if TOP_CATEGORY == 'E': keyword = 'Environmental' 
    if TOP_CATEGORY == 'S': keyword = 'Social' 
    if TOP_CATEGORY == 'G': keyword = 'Governance' 

    for df in LIST_DFS:
      query = df['QUERY'][0]
      if keyword in query:      
        return df

  topDF = getTopDF( [df_E, df_S, df_G], ESG['maxCAT'] )



  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 

  def filterTopN(topDF, LIST_DFS, topN=topN):
    lowerBound = topDF['MATCH_SCORE'][topN]
    print(f'MATCH_SCORE lowerBound : {lowerBound }')

    for idx,df in enumerate(LIST_DFS):
      df = df[df['MATCH_SCORE'] > lowerBound]
      LIST_DFS[idx] = df

    return LIST_DFS


  df_E, df_S, df_G = filterTopN(
      topDF    = topDF, 
      LIST_DFS = [df_E, df_S, df_G], 
      topN     = 20
    )

  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 
  def DF_STATS():
    voteCOLS = [ 'vote_balanced',	'vote_extreme',	'vote_annuled']

    stats = {}

    for df, categoryESG in zip([df_E, df_S, df_G], ['E','S','G'] ) :

      stats[f'DF_{categoryESG}'] = {}


      pos = df[   (df['vote_balanced'] == 'positive') | (df['vote_extreme'] == 'positive') | (df['vote_annuled'] == 'positive') ]
      neg = df[   (df['vote_balanced'] == 'negative') | (df['vote_extreme'] == 'negative') | (df['vote_annuled'] == 'negative') ]
      ntl = df[   (df['vote_balanced'] == 'neutral') | (df['vote_extreme'] == 'neutral') | (df['vote_annuled'] == 'neutral') ]

      posLEN = len(pos)
      negLEN = len(neg)
      ntlLEN = len(ntl)
      dfLEN = len(df)

      stats[f'DF_{categoryESG}']['LEN'] = dfLEN
      stats[f'DF_{categoryESG}']['POS'] = posLEN
      stats[f'DF_{categoryESG}']['NEG'] = negLEN
      stats[f'DF_{categoryESG}']['NTL'] = ntlLEN

      print(f'DF_{categoryESG}: ')
      for k,v in stats[f'DF_{categoryESG}'].items():
        print('\t',k,v)
      display(df)
      print('\n' * 3)

    




  DF_STATS()

  return df_E, df_S, df_G



  ### ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 

if __name__ == '__main__':
  
  E,S,G = main(
        LIST_URLS = [URL_E,URL_S,URL_G],
        topN = 50
      )
