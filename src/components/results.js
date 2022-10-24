import '../App.css';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import parse from "html-react-parser";


/* TODO: 

    -Arabesque msci random vals

    -maybe order by sentiment


    Feature List:
    - N top results, 3, 5, 10, 15, 20
    - Compare to other ESG Scores
*/

function Results ({filterState, ...rest}) {

    const TOPN = 5;
    const columnToDecideSentiment = "vote_balanced";
    const columnToRenderParagraph = "FORMATTED"; //must be used for bolding

    const [resultState, setResultState] = useState({});


    /**
     * Filters an array of results (df) by topN entries by score
     * for each sentiment (positive, neutral, negative)
     * 
     * IMPORTANT: Not used with filtered csv inputs
     * 
     * @param {number} n 
     * @param {array} df 
     * @returns array leanDf of filtered entries
     */
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

    /**
     * Calculates the overall sentiment of each row by a combined "score"
     * 
     * IMPORTANT: Not used with filtered csv inputs
     * 
     * @param {array} df 
     * @returns array df with additional column "Overall_Sentiment"
     */
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
            line.push(id===0 ? "Overall_Sentiment" : sentiment);
            return line;
        });
        return df;
    }


    /**
     * Populates a Mapping of the column header name to the array index for results
     * @param {array} inputArr 
     * @returns 
     */
    const createHeaderMap = (inputArr) => {
        if(!inputArr.length) return;
        let headerMap = new Map();
        inputArr[0].map((val, idx) => headerMap.set(val, idx));
        return headerMap;
    };


    /**
     * Main running method which fires when the object of filter states in App.js 
     * is changed from within filters.js
     */
    useEffect(() => {
        if(!filterState.company) return;

        /**
         * @param {Object} param 
         * @returns string prefix of url to query csv
         */
        const formatURL = (param) =>  `../Formatted_Threshold/formatted_${param.company}_${param.topic}`;

        /**
         * Handles fetching csv file data and reading contents
         * @param {string} url 
         * @returns Promise with csv data
         */
        const fetchCsv = async(url) => await (await fetch(url)).text();
        const getCsvData = async(url) => Papa.parse(
            await fetchCsv(url), 
            {   headers: true,
                complete: (res) => res.data
            }); 

        const urlPrefix = formatURL(filterState);

        const formatData = (df) => selectTopNBySentiment(TOPN, calculateOverallSentiment(df));
        const fetchData = async(segment) => await getCsvData(`${urlPrefix}_${segment}.csv`);
        
        Promise.all([fetchData('E'), fetchData('S'), fetchData('G')])
            .then(results => {
                //results = results.map(result => formatData(result.data));
                results = results.map(result => result.data)
                const headers = createHeaderMap(results[0]);
                setResultState(Object.create({
                    headers: headers,
                    environment: results[0],
                    social: results[1],
                    governance: results[2]
                }))
            });
    }, [filterState]);


    /**
     * Removes non-breaking spaces from each paragraph to get rid of poor formatting
     * @param {string} str 
     * @returns well formatted string
     */
    const replaceNonBreakingSpaces = (str) => str
        .split("")
        .map(ch => ch.charCodeAt(0)===160 ? " " : ch)
        .join("");

    const getColumnIndx = (col) => resultState.headers.get(col)
    
    /**
     * 
     * @param {object} props 
     * @returns JSX Component for each paragraph in the input array
     */
    const ParagraphComponent = (props) => {
        let inputData = props.param;
        if(!inputData) return <></>;
        return inputData.map((line, id) => {
            if(id===0) return <div key={id}></div>
            const sentimentClass = line[getColumnIndx(columnToDecideSentiment)] || "";
            let lineToRender = line[getColumnIndx(columnToRenderParagraph)] || "";
            lineToRender = replaceNonBreakingSpaces(lineToRender)
            return ( 
                <div className={`inner-box ${sentimentClass}`} 
                key={id}>
                    {parse(lineToRender)}
                </div>
            );
        });
    };

    return (
        <div className='result-wrapper'>
            <div className='section'>
                <h4>Environment</h4>
                <span> MSCI: 82.13 | Arabesque: 76.97</span>
                <div className='box'>
                    <ParagraphComponent param={resultState.environment}/>
                </div>
            </div>
            <div className='section'>
                <h4>Social</h4>
                <span> MSCI: 75.33 | Arabesque: 76.08</span>
                <div className='box'>
                    <ParagraphComponent param={resultState.social}/>
                </div>
            </div>
            <div className='section'>
                <h4>Governance</h4>
                <span> MSCI: 54.34 | Arabesque: 63.86</span>
                <div className='box'>
                    <ParagraphComponent param={resultState.governance}/>
                </div>
            </div>
        </div>
    );
};

export default Results;