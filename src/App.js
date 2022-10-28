import './App.css';

import { useState } from 'react';

import Filters from './components/filters';
import Results from './components/results';
import LandingPage from './components/landing';
import TopNResults from './components/topnresults';


function App() {

  const [filterState, setFilterState] = useState({
    company: undefined,
    source: []
  });

  const [showScreen, setShowScreen] = useState("landing")

  /**
   * Options for dropdowns
   */
  const companyOptions = [
    { value: 'BE', label: 'Bloom Energy | BE' },
    { value: 'CNP', label: 'CenterPoint Energy, Inc. | CNP' },
    { value: 'CPB', label: 'Campbell Soup Company | CPB' },
    { value: 'CTAS', label: 'Cintas Corporation | CTAS' },
    { value: '3M', label: '3M Company | 3M' },
    { value: 'AMD', label: 'Advanced Micro Devices, Inc. | AMD' },
    { value: 'ARE', label: 'Alexandria Real Estate Equities, Inc. | ARE' },
    { value: 'CAG', label: 'Conagra Brands, Inc. | CAG' },
    { value: 'COST', label: 'Costco Wholesale Corporation | COST' },
    { value: 'CSX', label: 'CSX Corporation | CSX' },
    { value: 'DDD', label: '3D Systems Corporation | DDD' },
    { value: 'DHR', label: 'Danaher Corporation | DHR' },
    { value: 'NVDA', label: 'Nvidia | NVDA' },
  ].sort((a, b) => a.value.localeCompare(b.value));

  const sourceOptions = [
    { value: "10K", label: "10K" },
    { value: "10Q", label: "10Q" },
    { value: "LitigationDB", label: "Litigation DB"}
  ]

  const filterOptions = {
    company: companyOptions,
    source: sourceOptions
  };


  /**
   * Use to convert full company name from dropdown to 
   * abbreviation used in file naming.
   */

  const params = {
    appState: filterState,
    appSetState: setFilterState,
    setScreen: setShowScreen,
    options: filterOptions
  }

  const detailComponent = (
    <div className="detail-page fadeIn">
        <Filters params={params}/>
        <Results  
          filterState={filterState} 
        />
        <div className="description">
          <span className="bold">Bold</span> sentences are most relevant to the category. 
          * The number in [r.number] shows relevancy to the topic (1 being most relevant).
          * <span className='negative'>Red: ESG risk </span> 
          * <span className='positive'>Green: ESG mitigation </span> 
          * Black: Relevant to ESG but no direction regarding ESG risks/mitigation.
        </div>
      </div>
  )

  const allComponents = {
    'landing': <LandingPage params={params}/>,
    'topN': <TopNResults params={params}/>,
    'detail': detailComponent
  }

  return (
    <div className="App">
      {allComponents[showScreen]}
    </div>
  );
}
export default App;
