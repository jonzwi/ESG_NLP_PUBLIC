import '../App.css';

import { useEffect, useState } from 'react';
import ReactWordcloud from 'react-wordcloud';


import Papa from 'papaparse';
import parse from "html-react-parser";

/* TODO: 

    -Arabesque msci random vals - APIS, columbia U litigation DB


    Feature List:
    - Compare to other ESG Scores


    option to sort results max score or top by sentiment & top n

    maybe check boxes

    EEL
*/

function Results ({filterState, abbrevDict, ...rest}) {

    const TOPN = 5;
    const columnToDecideSentiment = "vote_balanced";
    const columnToRenderParagraph = "FORMATTED"; //must be used for bolding

    const [resultState, setResultState] = useState({});
    const [sortBy, setSortBy] = useState("")


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
        if(!filterState.source.length) {
            setResultState(Object.create({}));
            return;
        }

        const formatURL = (param) =>  
            `../Formatted_Threshold/formatted_${abbrevDict[param.company]}_${param.source[0]}`;

        const fetchCsv = async(url) => await (await fetch(url)).text();
        const getCsvData = async(url) => Papa.parse(
            await fetchCsv(url), 
            {   headers: true,
                complete: (res) => res.data
            }); 

        const urlPrefix = formatURL(filterState);

        const formatData = (df) => selectTopNBySentiment(TOPN, calculateOverallSentiment(df));
        const fetchData = async(segment) => await getCsvData(`${urlPrefix}_${segment}.csv`);

        const fetchAllSourceData = (segment) => {
            return filterState.source.map(async(src) => {
                const url  = `../Formatted_Threshold/formatted_${abbrevDict[filterState.company]}_${src}_${segment}.csv`;
                return await getCsvData(url);
            });
        };


        // Promise.all([fetchAllSourceData('E'), fetchAllSourceData('S'), fetchAllSourceData('G')])
        //     .then(results => {
        //         results = results.map(sectionResults => {
        //             return sectionResults.map(srcResult => {
        //                 return srcResult.then(data => console.log(data.data))
        //             })
        //         })
        //     });
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
    const replaceNonBreakingSpaces = (str) => {
        return str.split("")
        .map(ch => ch.charCodeAt(0)===160 ? " " : ch)
        .join("");
    }

    const getColumnIndx = (col) => resultState.headers.get(col)

    /**
     * Sorts input array by selected sentiment column
     * @param {arr} arr 
     * @returns sorted array
     */
    const sortedParagraphs = (arr) => {
        let valMapping = {}
        if(sortBy==="score") {
            return arr.sort((a, b) => b[getColumnIndx("MATCH_SCORE")] - a[getColumnIndx("MATCH_SCORE")])
        }
        else if(sortBy==="sentNeg") valMapping = { "negative": 2, "positive": 1, "neutral": 0 }
        else if(sortBy==="sentPos") valMapping = { "positive": 2, "negative": 1, "neutral": 0 }
        return arr.sort((a, b) => 
            valMapping[b[getColumnIndx(columnToDecideSentiment)]] - 
            valMapping[a[getColumnIndx(columnToDecideSentiment)]])
    }
    
    /**
     * 
     * @param {object} props 
     * @returns JSX Component for each paragraph in the input array
     */
    const ParagraphComponent = (props) => {
        let inputData = props.param;
        if(!inputData) return <div></div>;
        if(inputData[1].length<=1) return <div>No relevant results with these settings</div>
        const testObjs = (html) => {
            return parse(html)
        }

        const sentimentCount = {
            "positive": 1,
            "negative": 1,
            "neutral": 1
        }

        const findMissingSentiments = (data) => {
            const count = { "positive": 0, "negative": 0, "neutral": 0 }
            data.map((line) => {
                const sentiment = line[getColumnIndx(columnToDecideSentiment)]
                if(count[sentiment]>=0) count[sentiment]++;
                return line;
            })
            const insertCol = getColumnIndx(columnToRenderParagraph);
            const sentimentCol = getColumnIndx(columnToDecideSentiment)
            Object.entries(count).map(([sent, cnt]) => {
                if(cnt===0){
                    let row = [];
                    row[insertCol] = `No ${sent} sentiment results.`;
                    row[sentimentCol] = `${sent}`;
                    row[getColumnIndx("MATCH_SCORE")] = 0;
                    data.push(row);
                }
                return [sent, cnt];
            })
        }

        findMissingSentiments(inputData)
        return sortedParagraphs(inputData).map((line, id) => {
            if(id===0 || line.length<=1) return <div key={id}></div>

            const sentimentClass = line[getColumnIndx(columnToDecideSentiment)];
            let lineToRender = line[getColumnIndx(columnToRenderParagraph)];
            lineToRender = replaceNonBreakingSpaces(lineToRender);
            const sentOrder = sentimentCount[sentimentClass]++;
            if(line[1]){
                return ( 
                    <div className={`inner-box ${sentimentClass}`} 
                    key={id}>
                        <div className="p-head">{sentOrder}. {sentimentClass}</div>
                        {testObjs(lineToRender)}
                    </div>
                );
            }
            return <div key={id} className="inner-box center">{lineToRender}</div>
        });
    };

    const words = [
        {
          text: 'ESG',
          value: 45,
        },
        {
          text: 'NLP',
          value: 35,
        },
        {
          text: 'Capgemini',
          value: 50,
        },
        {
          text: 'Project',
          value: 30,
        },
      ]
       
      function SimpleWordcloud() {
        return <ReactWordcloud
                words={words} 
                options={{rotations:0}}
                size={[400,400]}/>
      }



    return (
        <div>
            <div className="filter right">
                Sort by
                <form>
                    <select onChange={(e) => setSortBy(e.target.value)}>
                        <option value="score">Relevance</option>
                        <option value="sentNeg">Negative, Relevance</option>
                        <option value="sentPos">Positive, Relevance</option>
                    </select>
                </form>
            </div>
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
            <SimpleWordcloud/>
        </div>
    );
};

export default Results;