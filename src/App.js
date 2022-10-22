import './App.css';

import { useState } from 'react';

import Filters from './components/filters';
import Results from './components/results';

function App() {

  const [filterState, setFilterState] = useState({})

  const filterOptions = {
    company: ["Nvidia", "Bloom Energy"],
    topic: ["10K", "10Q", "Litigation DB"]
  };

  const companyAbbreviations = {
    "Amazon" : "AMZN",
    "Nvidia" : "NVDA",
    "Bloom Energy" : "BE",
    "SCHN": "SCHN"
  };

  return (
    <div className="App">
      <h1>ESG related insights extractor from unstructured data</h1>
      <Filters setState={setFilterState} options={filterOptions} abbrevDict={companyAbbreviations}/>
      <div className="description">
        <span className="bold">Bold</span> sentences are most relevant to the category. 
        * The number in "r.number" shows relevancy to the topic (1 being most relevant).
        * <span className='red'>Red: ESG risk </span> 
        * <span className='green'>Green: ESG mitigation </span> 
        * Black: Relevant to ESG but no direction regarding ESG risks/mitigation.
      </div>
       <Results filterState={filterState} />
    </div>
  );
}
export default App;
