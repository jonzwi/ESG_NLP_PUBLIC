import '../App.css';

import { useEffect, useState } from 'react';
import Select from 'react-select';

import ParagraphComponent from './paragraph';

import Papa from 'papaparse';
import { useParams } from 'react-router-dom';

function Results ({params}) {

    const company = useParams().companyName;
    const source = useParams().src;

    const [resultState, setResultState] = useState({});
    const [sortBy, setSortBy] = useState("score");

    const columnToDecideSentiment = "vote_balanced";
    const columnToRenderParagraph = "FORMATTED"; //must be used for bolding

    const sortOptions = [
        { value: "score", label: "Relevance" },
        { value: "sentNeg", label: "Risk, Relevance" },
        { value: "sentPos", label: "Mitigation, Relevance" }
    ]


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
    };


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
        if(company===undefined || source==='none' || source===undefined) return;

        const PUBLIC_URL = process.env.PUBLIC_URL;
        const formatURL = () =>  
            `${PUBLIC_URL}/Formatted_Threshold/formatted_${company}_${source}`;

        const fetchCsv = async(url) => await (await fetch(url)).text();
        const getCsvData = async(url) => Papa.parse(
            await fetchCsv(url), 
            {   headers: true,
                complete: (res) => res.data
            }); 

        const urlPrefix = formatURL();
        //const formatData = (df) => selectTopNBySentiment(TOPN, calculateOverallSentiment(df));
        const fetchData = async(segment) => await getCsvData(`${urlPrefix}_${segment}.csv`);

        // const fetchAllSourceData = (segment) => {
        //     return filterState.source.map(async(src) => {
        //         const url  = `../Formatted_Threshold/formatted_${companyParam}_${src}_${segment}.csv`;
        //         return await getCsvData(url);
        //     });
        // };


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
    }, [company, source]);

    
    const WrapParagraph = (props) => {
        const sendProps = {
            data: props.param,
            sentimentColumn: columnToDecideSentiment,
            renderColumn: columnToRenderParagraph,
            headers: resultState.headers,
            sortBy: sortBy
        }
        return <ParagraphComponent props={sendProps}/>
    }

    const onChange = (value, action) => setSortBy(value.value)


    const SelectComponent = () => {
        return <Select  className="filter-dropdown sort"
                        options={sortOptions} 
                        isSearchable={false}
                        onChange={onChange}
                        defaultValue={sortOptions.filter(op => op.value===sortBy)[0]}
                        styles={params.customFilterStyle}
                />
    }

    return (
        <div>
            <div className="filter right">
                Sort by
                <SelectComponent/>
            </div>
            <div className='result-wrapper'>
                <div className='section'>
                    <h4>Environment</h4>
                    <div className='box'>
                        <WrapParagraph param={resultState.environment}/>
                    </div>
                </div>
                <div className='section'>
                    <h4>Social</h4>
                    <div className='box'>
                        <WrapParagraph param={resultState.social}/>
                    </div>
                </div>
                <div className='section'>
                    <h4>Governance</h4>
                    <div className='box'>
                        <WrapParagraph param={resultState.governance}/>
                    </div>
                </div>
            </div>
            <div className="description">
          <span className="bold">Bold</span> sentences are most relevant to the category. 
          * The number in [r.number] shows relevancy to the topic (1 being most relevant).
          * <span className='negative'>Red: ESG risk </span> 
          * <span className='positive'>Green: ESG mitigation </span> 
          * Black: Relevant to ESG but no direction regarding ESG risks/mitigation.
        </div>
        </div>
    );
};

export default Results;


/*

 // const words = [
    //     {
    //       text: 'ESG',
    //       value: 45,
    //     },
    //     {
    //       text: 'NLP',
    //       value: 35,
    //     },
    //     {
    //       text: 'Capgemini',
    //       value: 50,
    //     },
    //     {
    //       text: 'Project',
    //       value: 30,
    //     },
    // ]
    
    // function SimpleWordcloud() {
    // return <ReactWordcloud
    //         words={words} 
    //         options={{rotations:0}}
    //         size={[400,400]}/>
    // }

        /**
     * Calculates the overall sentiment of each row by a combined "score"
     * 
     * IMPORTANT: Not used with filtered csv inputs
     * 
     * @param {array} df 
     * @returns array df with additional column "Overall_Sentiment"
     */
        //  const calculateOverallSentiment = (df) => {
        //     const scoreMap = {
        //         "positive": 1,
        //         "neutral": 0,
        //         "negative": -1
        //     };
    
        //     df.map((line, id) => {
        //         const overallScore = line.reduce((acc, val) => {
        //             return acc += scoreMap[val] || 0
        //         }, 0)
        //         let sentiment = "neutral";
        //         if(overallScore > 1) sentiment = "positive";
        //         if(overallScore < -1) sentiment = "negative";
        //         line.push(id===0 ? "Overall_Sentiment" : sentiment);
        //         return line;
        //     });
        //     return df;
        // }

