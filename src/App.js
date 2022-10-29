import './App.css';

import { 
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
 
import Filters from './components/filters';
import Results from './components/results';
import LandingPage from './components/landing';
import TopNResults from './components/topnresults';

function App() {
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

  const filterPageCustomStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: "none",
      outline: "none",
      border: "none",
      borderBottom: state.isFocused ? "2px solid var(--cap-primary-color)" 
        : "1px solid black",
      backgroundColor: "transparent",
      borderRadius: "none",
      textAlign: "left"
    }),
    menu: (base, state) => ({
      ...base,
      backgroundColor: '#f0f0f0',
      width: "max-content"
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
    }),
    option: (base, state) => ({
      ...base,
    }),
    indicatorSeparator: (base, state) => ({
      ...base,
      display: "none"
    })
  };

  const landingPageCustomStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: "none",
      outline: "none",
      border: "none",
      borderBottom: state.isFocused ? "2px solid var(--cap-primary-color)" 
        : "1px solid black",
      backgroundColor: "transparent",
      borderRadius: "none",
      textAlign: "left"
    }),
    menu: (base, state) => ({
      ...base,
      backgroundColor: '#f0f0f0',
      width: "max-content"

    }),
    dropdownIndicator: (base, state) => ({
      ...base,
    }),
    option: (base, state) => ({
      ...base,
    })
  };


  //React Router

  const params = {
    options: filterOptions,
    customFilterStyle: filterPageCustomStyles,
    //customLandingStyle: landingPageCustomStyles
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage params={params}/>}/>
          <Route path="/topresults/:companyName" element={<TopNResults params={params}/>}/>
          <Route path="/details/:companyName/:src" element={<Filters params={params}/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
