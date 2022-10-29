import '../App.css';

import { useState } from 'react';
import Select from 'react-select';
import { useParams, Link } from 'react-router-dom';

import Results from './results';


function Filters ({params}) {

    const companyParam = useParams().companyName;
    const srcParam = useParams().src;

    const sourceObject = params.options.source.filter(src => 
        src.value===srcParam)

    const companyObject = params.options.company.filter(cmp => 
        cmp.value===companyParam);


    const [selectedCompany, setSelectedCompany] = useState(companyObject);
    const [selectedSources, setSelectedSources] = useState(sourceObject)
    

    const onChangeCompany = (value, action) => {
        if(action.action==='select-option') {
            setSelectedCompany(Object.create(value));
        }
        else if(action.action==='clear') {
            setSelectedCompany(undefined);
        };
    };

    const onChangeSoure = (value, action) => setSelectedSources(Object.create(value));

    const SelectCompany = () => {
        return <Select className="filter-dropdown"
                options={params.options.company} 
                isSearchable={true}
                isClearable={false}
                onChange={onChangeCompany}
                defaultValue={selectedCompany}
                placeholder="Select company..."
                styles={params.customFilterStyle}
                />
    }

    const SelectSources = () => {
        return <Select className="filter-dropdown"
                options={params.options.source} 
                isSearchable={true}
                onChange={onChangeSoure}
                defaultValue={selectedSources}
                placeholder="Select source..."
                styles={params.customFilterStyle}
                />
    };


    return (
        <div className="detail-page fadeIn">
            <div className="detail-title">Detailed ESG Related Insights</div>
            <div className="filter-wrap">
                <div className="selectables">
                    <div className="filter">
                        <SelectCompany/>
                    </div>
                    <div className='filter'>
                        <SelectSources/>
                    </div>
                    <Link to={`../details/${selectedCompany.value || companyParam}/${selectedSources.value}`} className="link">
                        <div className=" btn-filter">Show Detailed Results</div>
                    </Link>
                </div>
            </div>
            <Results params={params}/>
        </div>
    );
};

export default Filters;