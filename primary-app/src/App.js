import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './Components/NavBar';
import './index.css';
import Home from './Pages/Home';
import Map from './Pages/Map';
import Profile from './Pages/Profile';
import reportWebVitals from './reportWebVitals';

const App = () => {
	return (
		<>
			//TODO: Figure out how to use reportWebVitals and actually render
			something at /
			<NavBar />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/map" element={<Map />} />
					<Route path="/profile" element={<Profile />} />
				</Routes>
			</BrowserRouter>
		</>
	);
};
export default App;
