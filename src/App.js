import './App.css';

import { useState } from 'react';

import Filters from './components/filters';
import Results from './components/results';
import LandingPage from './components/landing';

function App() {

  const [filterState, setFilterState] = useState({
    company: undefined,
    source: []
  });

  const [landingScreen, setLandingScreen] = useState(1)


  /**
   * Options for dropdowns
   */
  const filterOptions = {
    company: ["Select company", "Nvidia", "Bloom Energy"],
    source: ["10K", "10Q", "Litigation DB"]
  };

  const landingOptions = [
    { value: 'BE', label: 'Bloom Energy | BE' },
    { value: 'AMZN', label: 'Amazon | AMZN' },
    { value: 'CNP', label: 'CenterPoint Energy, Inc. | CNP' },
    { value: 'CBP', label: 'Campbell Soup Company | CBP' },
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


  /**
   * Use to convert full company name from dropdown to 
   * abbreviation used in file naming.
   */
  const companyAbbreviations = {
    "Amazon" : "AMZN",
    "Nvidia" : "NVDA",
    "Bloom Energy" : "BE",
    "SCHN": "SCHN"
  };

  const params = {
    appState: filterState,
    appSetState: setFilterState,
    appNav: setLandingScreen,
    filterOptions: filterOptions,
    abbrevDict: companyAbbreviations,
    landingOptions: landingOptions
  }

  return (
    <div className="App">
      { landingScreen ? 
      <LandingPage params={params}/>
      : 
      <div>
        <Filters  
          nav={setLandingScreen} 
          state={filterState}
          setState={setFilterState} 
          options={filterOptions}
        />
        <Results  
          filterState={filterState} 
          abbrevDict={companyAbbreviations}
        />
        <div className="description">
          <span className="bold">Bold</span> sentences are most relevant to the category. 
          * The number in [r.number] shows relevancy to the topic (1 being most relevant).
          * <span className='negative'>Red: ESG risk </span> 
          * <span className='positive'>Green: ESG mitigation </span> 
          * Black: Relevant to ESG but no direction regarding ESG risks/mitigation.
        </div>
      </div> }
    </div>
  );
}
export default App;
