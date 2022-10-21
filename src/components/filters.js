import Dropdown from 'react-dropdown';
import '../App.css';
import 'react-dropdown/style.css'
import { useState } from 'react';


function Filters ({setState, ...rest}) {

    const companyOptions = ["Nvidia", "Amazon", "Bloom Energy"];
    const topicOptions = ["10K", "10Q", "Litigation DB"];
    const relevancyOptions = ["70%", "75%", "80%", "85%", "90%", "95%"];
    
    const query = {
        'company': '',
        'topic': '',
        'rel': ''
    }
    const [locQueryState, setLocQueryState] = useState(query);

    const companyAbbreviations = {
        "Amazon" : "AMZN",
        "Nvidia" : "NVDA",
        "Bloom Energy" : "BE",
        "SCHN": "SCHN"
    }

    
    /**
     * Handles value changes of the dropdown menus
     * 
     * @param {number} src 
     * @param {event} ev 
     */
    const handleSelect = (src, ev) => {
        switch (src){
            case "company": 
                locQueryState.company = companyAbbreviations[ev.value];
                break;
            case "topic": 
                locQueryState.topic = ev.value;
                break;
            case "rel":
                locQueryState.rel = ev.value;
                break;
            default:
                break;
        }
    };

    /**
     * Sets parent state query when update button is pressed
     */
    const handleSubmit = () => {
        setState(Object.create(locQueryState))
    }

    return (
        <div className="filter-wrap">
            <div className="filter">
                Company:
                <Dropdown className="dropdown"
                    options={companyOptions} 
                    onChange={(ev) => handleSelect("company", ev)}
                    placeholder="Select the company" 
                />
            </div>
            <div className="filter">
                Topics:
                <Dropdown className="dropdown"
                    options={topicOptions} 
                    onChange={(ev) => handleSelect("topic", ev)} 
                    placeholder="Select the source" 
                />
            </div>
            <button onClick={() => handleSubmit()}>Update</button>
        </div>
    )
};

export default Filters;
/*
 <div className="filter">
                Relevancy:
                <Dropdown className="dropdown"
                    options={relevancyOptions} 
                    onChange={(ev) => handleSelect("rel", ev)} 
                    placeholder="Select the relevancy percentile" 
                />
            </div>
*/