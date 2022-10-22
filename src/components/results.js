import '../App.css';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import parse from "html-react-parser";


/* TODO: 

    Feature List:
    - N top results, 3, 5, 10, 15, 20
    - Compare to other ESG Scores
*/

function Results ({filterState, ...rest}) {

    const TOPN = 5;

    const [resultState, setResultState] = useState({});


    const formatURL = (param) =>  `../Formatted_Data/formatted_${param.company}_${param.topic}`;

    const fetchCsv = async(url) => {
        if(!url.length) return;
        return await (await fetch(url)).text()
    };

    const getCsvData = async(url) => {
        let csvData = await fetchCsv(url);
        if(!csvData) return;
        return Papa.parse(csvData, {
            headers: true,
            complete: (res) => res.data
        });
    };

    const selectTopNBySentiment = (n, df) => {
        let [countPos, countNeut, countNeg] = [n, n, n];
        let i=0, leanDf = [];
        const len = df[0].length-1;
        while(countPos>0 && i<df.length) {
            if(i===0) {
                leanDf.push(df[i]);
            }
            if(df[i][len]==='positive' && countPos){
                leanDf.push(df[i]);
                countPos--;
            }
            else if(df[i][len]==='negative' && countNeg){
                leanDf.push(df[i]);
                countNeg--;
            }
            else if(df[i][len]==='neutral' && countNeut){
                leanDf.push(df[i]);
                countNeut--;
            }
            i++;
        };
        return leanDf;
    }

    const calculateOverallSentiment = (df) => {
        const scoreMap = {
            "positive": 1,
            "neutral": 0,
            "negative": -1
        };

        df.map((line, id) => {
            const overallScore = line.reduce((acc, val) => {
                return acc += scoreMap[val] || 0
            }, 0)
            let sentiment = "neutral";
            if(overallScore > 1) sentiment = "positive";
            if(overallScore < -1) sentiment = "negative";
            line.push(id===0 ? "Overal_Sentiment" : sentiment);
            return line;
        });
        return df;
    }

    const getHeaders = (inputArr) => {
        if(!inputArr.length) return;
        let headerMap = new Map();
        inputArr[0].map((val, idx) => headerMap.set(val, idx));
        return headerMap;
    };


    useEffect(() => {
        if(!filterState.company) return;
        const urlPrefix = formatURL(filterState)

        const formatData = (df) => selectTopNBySentiment(TOPN, calculateOverallSentiment(df.data))
        const fetchData = async(segment) => await getCsvData(`${urlPrefix}_${segment}.csv`)
        
        Promise.all([fetchData('E'), fetchData('S'), fetchData('G')])
            .then(results => {
                results = results.map(result => formatData(result))
                const headers = getHeaders(results[0]);
                setResultState(Object.create({
                    headers: headers,
                    environment: results[0],
                    social: results[1],
                    governance: results[2]
                }))
            })
    }, [filterState]);

    const ParagraphComponent = (props) => {
        let inputData = props.param;
        if(!inputData) return <></>;
        return inputData.map((line, id) => {
            if(id===0) return <div key={id}></div>
            return ( 
                <div className={`inner-box ${line[line.length-1]}`} 
                key={id}>
                    {parse(line[resultState.headers.get('FORMATTED')])}
                </div>
            );
        });
    };

    return (
        <div className='result-wrapper'>
            <div className='section'>
                <h4>Environment</h4>
                <div className='box'>
                    <ParagraphComponent param={resultState.environment}/>
                </div>
            </div>
            <div className='section'>
                <h4>Social</h4>
                <div className='box'>
                    <ParagraphComponent param={resultState.social}/>
                </div>
            </div>
            <div className='section'>
                <h4>Governance</h4>
                <div className='box'>
                    <ParagraphComponent param={resultState.governance}/>
                </div>
            </div>
        </div>
    );
};

export default Results;