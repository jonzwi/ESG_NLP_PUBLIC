import '../App.css';

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import Papa from 'papaparse';


function TopNResults({params}) {

    const [topResults, setTopResults] = useState([]);
    const [shouldUpdate, setShouldUpdate] = useState(1);

    const companyParam = useParams().companyName;

    const N =3;
    const indexOfScore = 2; //'MATCH_SCORE'
    const indexOfParagraph = 4; //"PRG_TEXT"
    const indexOfSentiment = 13; //"vote_balanced"

    const segmentMap = {
        'E': 'Environmental',
        'S': 'Social',
        'G': 'Governance'
    };

    const sentimentMap = {
        'positive': 'mitigation',
        'negative': 'risk',
        'neutral': 'neutrality'
    };

    const companyObject = params.options.company.filter(cmp => 
        cmp.value===companyParam);

    if(!companyObject.length) return <div>Company not found</div>


    const companyFullName = companyObject[0].label.split(" | ")[0];

    if(!companyFullName.length) return <div>Company not found</div>
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
            const PUBLIC_URL = process.env.PUBLIC_URL;
            const url  = `${PUBLIC_URL}/data/Formatted_Threshold/formatted_${companyParam}_${src}_${segment}.csv`;
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
                        if(line[indexOfParagraph]===undefined) return line;
                        const obj = {
                            score: line[indexOfScore],
                            data: line[indexOfParagraph].split(". ")[0],
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

    return (
    <div className="detail-page fadeIn">
        <div className="topn-title">
            Top Results for {companyFullName} 
            <div className="topn-subtitle">
                from all sources (NLP result under construction)
            </div>
        </div>
        <div className='topn-wrap'>
        {topResults.map((res, idx) => {
            return (
            <div className="topn-result" key={idx}>
                <div className="topn-desc">
                    <div className={`${res.sentiment}`}>{`${segmentMap[res.segment]} ${sentimentMap[res.sentiment]}`}</div>
                    <div>Source: {res.src}</div>
                </div>
                <div className="topn-p">{res.data}.</div>
            </div>)
        })}
        <Link to={`../details/${companyParam}/none`} className="link">
            <div className=" btn-filter">See Details</div>
        </Link>
        </div>
    </div>
    );
};

export default TopNResults;