import './App.css';
import { Button, Slider } from '@mui/material';
import MaterialReactTable from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function App() {
	const [data, setData] = useState([]);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefetching, setIsRefetching] = useState(false);
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
			setIsError(null);

			if (!data.length) {
				setIsLoading(true);
			} else {
				setIsRefetching(true);
			}

			try {
				const response = await axios.get(
					`https://api.instantwebtools.net/v1/passenger?page=0&size=${pagination.pageSize}`
				);
				const data = response.data;
				setData(data.data);
				setRowCount(data.totalPassengers);
			} catch (error) {
				console.error(error);
				setIsError(error);
			}

			setIsLoading(false);
			setIsRefetching(false);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pagination.pageIndex, pagination.pageSize]);

	const columns = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Nombre',
			},
			{
				accessorKey: 'trips',
				header: 'Viajes',
			},
			{
				accessorKey: '_id',
				header: 'ID',
			},
		],
		[]
	);

	if (isLoading) {
		return (
			<div className="container">
				<div className="row">
					<div className="col-12 text-center">
						<p>CARGANDO....</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container">
				<div className="row">
					<div className="col-12 text-center">
						<p>Error: {isError.message}</p>
					</div>
				</div>
			</div>
		);
	}

	console.log('--->La Data:', data);
	console.log('--->La Paginación:', pagination);
	console.log('--->El sort:', sorting);

	return (
		<div className="container">
			<div className="row">
				<div className="col-md-12">
					<MaterialReactTable
						columns={columns}
						data={data}
						initialState={{ showColumnFilters: true }}
						manualFiltering
						manualPagination
						manualSorting
						muiToolbarAlertBannerProps={
							isError
								? {
										color: 'error',
										children: 'Error loading data',
								  }
								: undefined
						}
						onColumnFiltersChange={setColumnFilters}
						onGlobalFilterChange={setGlobalFilter}
						onPaginationChange={setPagination}
						onSortingChange={setSorting}
						rowCount={rowCount}
						state={{
							columnFilters,
							globalFilter,
							isLoading,
							pagination,
							showAlertBanner: isError,
							showProgressBars: isRefetching,
							sorting,
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
