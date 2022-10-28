import '../App.css';

import parse from "html-react-parser";

function ParagraphComponent({props}){
    
    let inputData = props.data;
    if(!inputData) return <div></div>;
    if(inputData[1].length<=1) return <div>No relevant results with these settings</div>;


    const getColumnIndx = (col) => props.headers.get(col);


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
        
    /**
     * Sorts input array by selected sentiment column
     * @param {arr} arr 
     * @returns sorted array
     */
    const sortedParagraphs = (arr) => {
        let valMapping = {}
        if(props.sortBy==="score") {
            return arr.sort((a, b) => b[getColumnIndx("MATCH_SCORE")] - a[getColumnIndx("MATCH_SCORE")])
        }
        else if(props.sortBy==="sentNeg") valMapping = { "negative": 2, "positive": 1, "neutral": 0 }
        else if(props.sortBy==="sentPos") valMapping = { "positive": 2, "negative": 1, "neutral": 0 }
        return arr.sort((a, b) => 
            valMapping[b[getColumnIndx(props.sentimentColumn)]] - 
            valMapping[a[getColumnIndx(props.sentimentColumn)]])
    }
        
    /**
     * 
     * @param {object} props 
     * @returns JSX Component for each paragraph in the input array
     */
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
            const sentiment = line[getColumnIndx(props.sentimentColumn)]
            if(count[sentiment]>=0) count[sentiment]++;
            return line;
        })
        const insertCol = getColumnIndx(props.renderColumn);
        const sentimentCol = getColumnIndx(props.sentimentColumn)
        Object.entries(count).map(([sent, cnt]) => {
            if(cnt===0){
                let row = [];
                row[insertCol] = `No relevant ${sent==='positive' ? "mitigation" : 
                        sent==='negative' ? "risk" : 
                            "neutral"} results.`;
                row[sentimentCol] = `${sent}`;
                row[getColumnIndx("MATCH_SCORE")] = 0;
                data.push(row);
            }
            return [sent, cnt];
        });
    }


    findMissingSentiments(inputData)
    return sortedParagraphs(inputData).map((line, id) => {
        if(id===0 || line.length<=1) return <div key={id}></div>
        const sentimentClass = line[getColumnIndx(props.sentimentColumn)];
        let lineToRender = line[getColumnIndx(props.renderColumn)];
        lineToRender = replaceNonBreakingSpaces(lineToRender);
        const sentOrder = sentimentCount[sentimentClass]++;
        if(line[1]){
            return ( 
                <div className={`inner-box ${sentimentClass}`} 
                key={id}>
                    <div className="p-head">
                    {sentOrder}. {sentimentClass==='positive' ? "Mitigation" : 
                        sentimentClass==='negative' ? "Risk" : 
                            "Neutral"}
                    </div>
                    {testObjs(lineToRender)}
                </div>
            );
        }
        return <div key={id} className="inner-box center">{lineToRender}</div>
    });

}

export default ParagraphComponent;