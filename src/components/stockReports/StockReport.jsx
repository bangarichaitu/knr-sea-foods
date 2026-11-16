import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

import api from "../../Api";
import stockReportService from "../../services/stockReportService";

const initialFilters = {
  company_id: "",
  category_id: "",
};

export const StockReport = () => {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [balances, setBalances] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    loadStockReport({});
  }, []);
  const loadStockReport = async (appliedFilters = {}) => {
    try {
      const response = await stockReportService.getAll(token, appliedFilters);
      setCompanies(response.data.companies);
      setCategories(response.data.categories);
      setBalances(response.data.stock_balances);
      setTotalStock(Number(response.data.total_stock));
    } catch (error) {
      console.error("Failed to load stock report", error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    loadStockReport(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadStockReport({});
  };

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        Stock Balance Report
      </Typography>

      {/* Total Stock */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography color="text.secondary">Total Available Stock</Typography>

        <Typography variant="h4" fontWeight="bold">
          {totalStock.toFixed(3)} KG
        </Typography>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Filters
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Company"
              name="company_id"
              value={filters.company_id}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All Companies</MenuItem>

              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
            >
              <MenuItem value="">All Categories</MenuItem>

              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>

              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Balance Table */}
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Available Stock (KG)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.id}>
                <TableCell>{balance.company_name}</TableCell>

                <TableCell>{balance.category_name}</TableCell>

                <TableCell align="right">
                  {Number(balance.quantity).toFixed(3)}
                </TableCell>
              </TableRow>
            ))}

            {balances.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No stock balances found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
