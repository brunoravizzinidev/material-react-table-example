import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Box, Button, Slider } from '@mui/material';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import MaterialReactTable from 'material-react-table';
//Import Material React Table Translations
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import './App.css';

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
					`https://api.instantwebtools.net/v1/passenger?page=${pagination.pageIndex}&size=${pagination.pageSize}`
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
				enableColumnFilter: false,
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
	console.log('--->Filtro de Columna:', columnFilters);

	function downloadXLS(array, cols, moduleName) {
		console.log(array, '-array---', cols);

		let exportCols = cols.map((col) => {
			return col.accessorKey;
		});

		let newArray = array.map((item) => _.pick(item, exportCols));

		console.log('----->', newArray, '----newArray');

		// headers
		let exportColsHeaders = cols.map((col) => {
			return col.header;
		});

		// let newHeaders = exportColsHeaders.join(columnDelimiter);

		let newHeadersArray = [exportColsHeaders];

		const ws = XLSX.utils.json_to_sheet(newArray, {
			origin: 'A2',
			skipHeader: true,
		});
		const wb = XLSX.utils.book_new();

		XLSX.utils.sheet_add_aoa(ws, newHeadersArray, { origin: 'A1' });

		XLSX.utils.book_append_sheet(wb, ws, moduleName);
		XLSX.writeFile(wb, 'reports.xlsx');
	}

	const handleExportRows = (rows, cols, moduleName) => {
		console.log(rows, 'z------');
		downloadXLS(
			rows.map((row) => row.original),
			cols,
			moduleName
		);
	};

	return (
		<div className="container">
			<div className="row">
				<div className="col-md-12">
					<MaterialReactTable
						columns={columns}
						data={data}
						initialState={{
							showColumnFilters: true,
							// col oculta al inicio, por id
							columnVisibility: { _id: false },
						}}
						// cabecera de botones
						renderTopToolbarCustomActions={({ table }) => (
							<Box
								sx={{
									display: 'flex',
									gap: '1rem',
									p: '0.5rem',
									flexWrap: 'wrap',
								}}
							>
								<Button
									color="primary"
									//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
									onClick={() =>
										downloadXLS(data, columns, 'data')
									}
									startIcon={<FileDownloadIcon />}
									variant="contained"
								>
									Exportar a Excel
								</Button>
								<Button
									color="primary"
									//export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
									onClick={() =>
										handleExportRows(
											table.getRowModel().rows,
											columns,
											'data2'
										)
									}
									startIcon={<FileDownloadIcon />}
									variant="contained"
								>
									Exportar Filas
								</Button>
							</Box>
						)}
						// estilo a cabecera
						muiTableHeadCellProps={{
							//no useTheme hook needed, just use the `sx` prop with the theme callback
							sx: (theme) => ({
								color: 'tomato',
								backgroundColor: 'yellow',
								'&: nth-last-child(-n+1)': {
									backgroundColor: 'red',
								},
							}),
						}}
						// filtrar col server side
						manualFiltering
						// paginar server side
						manualPagination
						// hacer sort server side
						manualSorting
						// permitir fijar cols
						enablePinning
						// no poder cambiar padding filas
						enableDensityToggle={false}
						// no permite búsqueda global
						enableGlobalFilter={false}
						// no permite filtrar
						enableColumnFilters={false}
						localization={MRT_Localization_ES}
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
