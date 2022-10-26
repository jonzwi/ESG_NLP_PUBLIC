import '../App.css';
//import 'react-dropdown/style.css';

//import Dropdown from 'react-dropdown';
import { useRef } from 'react';


function Filters ({nav, state, setState, options}) {

    const companyRef = useRef();
    const sourceRef = useRef();

    const refList = new Array(options.source.length)
        .fill()
        .map(id => new useRef())

    /**
     * Sets parent ref value when update button is pressed
     */
    const onChange = (e) => {
       // e.preventDefault();
        const checkedBoxes = refList.map(ref => {
            if(ref.current.checked===true) return ref.current.name
        }).filter(name => name);
        const currentCompany = companyRef.current.value;
        const currentSource = checkedBoxes;
        if(!currentCompany || !currentSource) {
            alert("Please select all filters");
            return;
        }
        setState(Object.create({
            company: currentCompany,
            source: currentSource
        }));
    };

    return (
        <div>
            <h2>ESG Related Insights</h2>
            <div className='link' onClick={() => nav(1)}>Back</div>
            <div className="filter-wrap">
                <div className="filter">
                    Company:
                    <form>
                        <select ref={companyRef} 
                        defaultValue={state.company} 
                        onChange={onChange}>
                        {options.company.map((company, idx) => (
                            <option value={company} key={idx}>{company}</option>
                        ))}
                        </select>
                    </form>
                </div>
                <div className="filter">
                    Source:
                    <form>
                    {options.source.map((src, idx) => {
                        return (
                            <label key={idx}>
                                <input
                                    ref={refList[idx]}
                                    type="checkbox"
                                    name={src}
                                    value={src}
                                    onChange={onChange}
                                />
                                {src}
                            </label>
                        )
                    })}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Filters;

/*

            <div className="filter">
                Company:
                <Dropdown className="dropdown"
                    options={options.company} 
                    ref={companyRef}
                    placeholder="Select the company" 
                />
            </div>
            <div className="filter">
                Source:
                <Dropdown className="dropdown"
                    options={options.source} 
                    ref={sourceRef}
                    placeholder="Select the source" 
                />
            </div>

*/