import '../App.css';

import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';


function Filters ({params}) {

    // useEffect(() => {
    //     window.location.reload();
    // }, [])

    const [selectedCompany, setSelectedCompany] = useState(params.appState.company);
    const [selectedSources, setSelectedSources] = useState([])
    
    /**
     * Sets parent ref value when update button is pressed
     */
    const onSubmit = (e) => {
        
        if(!selectedCompany || !selectedSources.length) {
            alert("Please select all filters");
            return;
        }
        params.appSetState(Object.create({
            company: selectedCompany.value,
            source: selectedSources.map(src => src.value)
        }));
    };

    const onChangeCompany = (value, action) => {
        if(action.action==='select-option') {
            setSelectedCompany(Object.create(value));
        }
        else if(action.action==='clear') {
            setSelectedCompany(undefined);
        }
    }

    const onChangeSoure = (value, action) => {
        setSelectedSources(Array.from(value))
       
    } 

    const SelectCompany = () => {
        return <Select className="filter-dropdown"
                options={params.options.company} 
                isSearchable={true}
                isClearable={selectedCompany!==null}
                onChange={onChangeCompany}
                defaultValue={selectedCompany}
                placeholder="Select company..."
                />
    }

    const SelectSources = () => {
        return <Select className="filter-dropdown"
                options={params.options.source} 
                isSearchable={true}
                onChange={onChangeSoure}
                defaultValue={selectedSources}
                placeholder="Select source(s)..."
                isMulti={true}
                components={makeAnimated()}
                />
    }


    return (
        <div>
            <div className="detail-title">ESG Related Insights</div>
            <div className="filter-wrap">
                <div className="selectables">
                    <div className="filter">
                        <SelectCompany/>
                    </div>
                    <div className='filter'>
                        <SelectSources/>
                    </div>
                    <div className=" btn-filter" onClick={onSubmit}>Show Detailed Results</div>
                </div>
            </div>
        </div>
    );
};

export default Filters;

/*

            <div className='link' onClick={() => params.nav(1)}>Back</div>


            <div className="filter">
                            Source:
                            <form>
                            {params.options.source.map((src, idx) => {
                                return (
                                    <label key={idx}>
                                        <input
                                            disabled={src==="Litigation DB"}
                                            ref={refList[idx]}
                                            type="checkbox"
                                            name={src}
                                            value={src}
                                        />
                                        {src}
                                    </label>
                                )
                            })}
                            </form>
                        </div>

*/