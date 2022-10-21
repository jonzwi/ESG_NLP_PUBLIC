
import { useEffect, useState } from 'react';
import '../App.css';

import Papa from 'papaparse';

/* TODO: 
    -Bold filtered sentences
    -Rank filtered sentences
    -Reduce number of renders by condenseing states
    -Seperate relevancy from other filters, operates on file, doesn't define file (MSI, Arabesque)

    Feature List:
    - N top results, 3, 5, 10, 15, 20
    - Compare to other ESG Scores

    - include match score

    -drop relevancy, show top 5 for each sentiment
*/

function Results ({filterResults, ...rest}) {

    const [environmentResult, setEnvironmentResult] = useState([]);
    const [socialResult, setSocialResult] = useState([]);
    const [governanceResult, setGovernanceResult] = useState([]);

    let relevancyFilter = 0;

    const fetchCsv = async(url) => {
        if(!url.length) return
        return await fetch(url)
            .then(responce => responce.text())
            .then(text => text ) 
            .catch(err => alert(err)) 
    } 

    const getCsvData = async(url) => {
        let csvData = await fetchCsv(url);
        if(!csvData) return
        return Papa.parse(csvData, {
            complete: (res) => res.data
        });
    }

    useEffect(() => {
        if(!filterResults) return;
        const urlPrefix = `../NLP_Output/NLP_${filterResults.company}_${filterResults.topic}`;
        relevancyFilter = parseInt(filterResults.rel.split("").filter((ch) => ch !== '%').join(""))
        getCsvData(`${urlPrefix}_E.csv`)
            .then(ret => setEnvironmentResult(ret.data.slice(1)))
        getCsvData(`${urlPrefix}_S.csv`)
            .then(ret => setSocialResult(ret.data.slice(1)))
        getCsvData(`${urlPrefix}_G.csv`)
            .then(ret => setGovernanceResult(ret.data.slice(1)))
    }, [filterResults])


    const ParagraphComponent = (props) => {
        let inputData = props.param

        return inputData.length ? inputData
            .filter((entry) => entry[0]>=relevancyFilter)
            .map((entry, id) => {
                if(entry[2] && entry[2].length>2){
                    const sentenceMap = new Map();
                    //entry[2].replace(/'/g, '"');
                    //console.log((entry[2]))
                    //entry[2].map((sent, indx) => sentenceMap.set(sent, indx));
                }
                return (<div className='inner-box' key={id}>{entry[0] + " " + entry[1] || ""}</div>)
            }) : <></>
    }

    return (
        <div className='result-wrapper'>
            <div className='section'>
                <h4>Environment</h4>
                <div className='box'>
                    <ParagraphComponent param={environmentResult}/>
                </div>
            </div>
            <div className='section'>
                <h4>Social</h4>
                <div className='box'>
                    <ParagraphComponent param={socialResult}/>
                </div>
            </div>
            <div className='section'>
                <h4>Governance</h4>
                <div className='box'>
                    <ParagraphComponent param={governanceResult}/>
                </div>
            </div>
        </div>
    )
};

export default Results;