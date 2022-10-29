import '../App.css';

import { useEffect, useState } from 'react';
import Select from 'react-select';

import { Link } from 'react-router-dom';

import { Buffer } from 'buffer';

function LandingPage({params}) {

    const [msciScore, setMsciScore] = useState(undefined);
    const [arabesqueScore, setArabesqueScore] = useState(undefined);
    const [dateString, setDateString] = useState("");

    const [selectedOption, setSelectedOption] = useState(undefined);
    const [showApiResults, setShowApiResults] = useState(0);


    useEffect(() => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        setDateString(`${months[month-1]} ${year}`)
    },[])

    const onChange = (value, action) => {
        if(action.action==='select-option') {
            setSelectedOption(Object.create(value));
            setShowApiResults(1);
        }
        else if(action.action==='clear') {
            setSelectedOption(undefined);
            setShowApiResults(0);
        }
    }

    const SelectComponent = () => {
        return <Select  className="l-dropdown"
                        options={params.options.company} 
                        isSearchable={true}
                        isClearable={showApiResults}
                        onChange={onChange}
                        defaultValue={selectedOption}
                        placeholder="Select Company..."
                        styles={params.customLandingStyle}
                />
    }

    return (
        <div className="landing">
            <div className="landing-wrap">
                <div className="landing-text l-title">LENS</div>
                <div className="landing-text l-subtitle">DE-RISKING ESG</div>
                <div className="landing-text l-date">{dateString}</div>
                <SelectComponent/>
                { showApiResults ? 
                    <div className={showApiResults ? "text-landing showApi show" : "text-landing noShowApi hide"}>
                        <div className='fadeIn'>MSCI Score: {(Math.random()*100).toFixed(2)}</div>
                        <div className='fadeIn'>Arabesque Score: {(Math.random()*100).toFixed(2)}</div>
                        <Link to={`topresults/${selectedOption.value}`} className="link">
                            <div className="btn-landing shadow fadeIn">NLP Deep Dive</div>
                        </Link>
                    </div>
                :   <div className={showApiResults ? "text-landing noShowApi show" : "text-landing showApi hide"}/>
                }
            </div>
        </div>

    )
}

export default LandingPage;

/*


<div className="filter">
                    Company:
                    <form>
                        <select onChange={handleChange} defaultValue={params.appState.company}>
                        {params.filterOptions.company.map((company, idx) => (
                            <option value={company} key={idx}>{company}</option>
                        ))}
                        </select>
                    </form>
                </div>
                <div>MSCI Score: AAA</div>
                <div>Arabesque Score: AA</div>
                <div className="link" onClick={handleNav}>See Capgemini Score -></div>
*/

//  Use for MSCI / Arabesque scores
    // const url = "https://api2.msci.com/esg/data/v1.0/parameterValues/indexes";
    // const username = "john.leckrone@capgemini.com";
    // const password = "hjs0e81$sHD4Deb";
    // const encodedString = Buffer.from(`${username}:${password}`).toString('base64');

    // const fetchAPIData = async() => {
    //     fetch(url, {
    //         method: "GET",
    //         headers: {
    //             'Authorization': `Basic ${encodedString}`
    //         }

    //     })
    //     .then(res => res.json())
    //     .then(data => console.log(data))
    //     .catch(err => console.log(err))

    // }

    // useEffect(() => {
    //    // fetchAPIData()
    // }, [])
