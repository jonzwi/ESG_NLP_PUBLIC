import '../App.css';

import { useEffect, useState } from 'react';

import Papa from 'papaparse';


function TopNResults({params}) {

    const N =3;
    const indexOfScore = 2; //'MATCH_SCORE'
    const indexOfParagraph = 4; //"PRG_TEXT"
    const indexOfSentiment = 13; //"vote_balanced"
    
    const [topResults, setTopResults] = useState([]);
    const [shouldUpdate, setShouldUpdate] = useState(1);

    const company = params.appState.company.value;
    const companyFullName = params.appState.company.label.split(" | ")[0]
    const sources = [params.options.source[0].value]

    const fetchCsv = async(url) => await (await fetch(url)).text();
    const getCsvData = async(url) => Papa.parse(
        await fetchCsv(url), 
        {   headers: true,
            complete: (res) => res.data
        }); 


    //const formatData = (df) => selectTopNBySentiment(TOPN, calculateOverallSentiment(df));

    const fetchAllSourceData = (segment) => {
        return sources.map(async(src) => {
            const url  = `../Formatted_Threshold/formatted_${company}_${src}_${segment}.csv`;
            return await getCsvData(url);
        });
    };

    const segments = ['E', 'S', 'G'];

    Promise.all([fetchAllSourceData('E'), fetchAllSourceData('S'), fetchAllSourceData('G')])
    .then(results => {
        let globRes = [];
        return results.map((sectionResults, idx) => {
            return sectionResults.map(srcResult => {
                return srcResult.then(data => {
                    const topN = data.data.slice(1, N+1);
                    topN.map(line => {
                        const obj = {
                            score: line[indexOfScore],
                            data: line[indexOfParagraph],
                            segment: segments[idx],
                            src: "10K",
                            sentiment: line[indexOfSentiment]
                        }
                        if(!obj.score) return line;
                        globRes.push(obj);
                        globRes.sort((a, b) => b.score - a.score).splice(N);
                        return line;
                    });
                    if(shouldUpdate){
                        setTopResults(Array.from(globRes));
                        setShouldUpdate(0);
                    }
                    return topN;
                });
            });
        });
    });

    const handleNav = (e) => {
        params.setScreen('detail')
    }

    return ( 
    <div>
        Top {N} Results for {companyFullName} from all sources {topResults.map((res, idx) => {
            return <div key={idx}>
                {res.data} {res.segment} {res.src} {res.sentiment}-----------
            </div>
        })}
        <div onClick={handleNav}>Next -> </div>
    </div>)
};

export default TopNResults;