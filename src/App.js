import './App.css';

import { useState } from 'react';

import Filters from './components/filters';
import Results from './components/results';

function App() {

  const [query, setQuery] = useState(undefined);

  return (
    <div className="App">
      <h1>ESG related insights extractor from unstructured data</h1>
      <Filters setState={setQuery}/>
      <div className="description">
        <span className="bold">Bold</span> sentences are most relevant to the category. 
        * The number in "r.number" shows relevancy to the topic (1 being most relevant).
        * <span className='red'>Red: ESG risk </span> 
        * <span className='green'>Green: ESG mitigation </span> 
        * Black: Relevant to ESG but no direction regarding ESG risks/mitigation.
      </div>
      <Results filterResults={query}/>
    </div>
  );
}

export default App;
