import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import TimelinePage from './pages/TimelinePage'
import DecisionsPage from './pages/DecisionsPage'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Dashboard /> },
			{ path: 'timeline', element: <TimelinePage /> },
			{ path: 'decisions', element: <DecisionsPage /> },
		],
	},
])

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)