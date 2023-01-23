import './App.css';
import { Button, Slider } from '@mui/material';
import MaterialReactTable from 'material-react-table';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
	const [data, setData] = useState([]);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [rowCount, setRowCount] = useState(0);

	//table state
	const [columnFilters, setColumnFilters] = useState([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [sorting, setSorting] = useState([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setIsError(null);

			try {
				const response = await axios.get(
					'https://api.instantwebtools.net/v1/passenger?page=0&size=10'
				);
				const data = response.data;
				setData(data);
			} catch (error) {
				console.error(error);
				setIsError(error);
			}

			setIsLoading(false);
		};

		fetchData();
	}, []);

	if (isLoading) {
		return <p>Cargando...</p>;
	}

	if (isError) {
		return <p>Error: {isError.message}</p>;
	}

	console.log('--->La Data:', data);

	return <div></div>;
}

export default App;
