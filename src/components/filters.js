import '../App.css';
import 'react-dropdown/style.css';

import Dropdown from 'react-dropdown';
import { useRef } from 'react';


function Filters ({setState, options, abbrevDict}) {

    const companyRef = useRef();
    const topicRef = useRef();

    /**
     * Sets parent ref value when update button is pressed
     */
    const onSubmit = (e) => {
       // e.preventDefault();
        const currentCompany = companyRef.current.state.selected.value;
        const currentTopic = topicRef.current.state.selected.value;
        if(!currentCompany || !currentTopic) {
            alert("Please select all filters");
            return;
        }
        setState(Object.create({
            company: abbrevDict[currentCompany],
            topic: currentTopic
        }));
    };

    return (
        <div className="filter-wrap">
            <div className="filter">
                Company:
                <Dropdown className="dropdown"
                    options={options.company} 
                    ref={companyRef}
                    placeholder="Select the company" 
                />
            </div>
            <div className="filter">
                Topics:
                <Dropdown className="dropdown"
                    options={options.topic} 
                    ref={topicRef}
                    placeholder="Select the source" 
                />
            </div>
            <button onClick={onSubmit}>Update</button>
        </div>
    );
};

export default Filters;