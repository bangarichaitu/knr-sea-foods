import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";

import {
  Alert,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";

import api from "../../Api";
import stockInTransactionService from "../../services/stockInTransactionService";

const initialForm = {
  company_id: "",
  category_id: "",
  quantity: "",
  rate: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  remarks: "",
};

export const StockInList = () => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState([]);
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // loadDropdowns();
    loadTransactions();
  }, []);

  // const loadDropdowns = async () => {
  //   try {
  //     const config = {
  //       headers: { Authorization: `Bearer ${token}` },
  //     };

  //     const [companyResponse, categoryResponse] = await Promise.all([
  //       api.get("/companies", config),
  //       api.get("/categories", config),
  //     ]);

  //     setCompanies(companyResponse.data);
  //     setCategories(categoryResponse.data);
  //   } catch (error) {
  //     console.error("Failed to load dropdowns", error);
  //   }
  // };

  const loadTransactions = async (filters = {}) => {
    try {
      const response = await stockInTransactionService.getAll(token, filters);
      setTransactions(response.data.stock_ins);
      setCompanies(response.data.companies);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to load transactions", error);
    }
  };

  const handleClose = () => {
    setError([]);
    setOpen(false);
    setForm(initialForm);
  };

  const handleAdd = () => {
    setError([]);
    setForm(initialForm);
    setOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    const errors = [];
    event.preventDefault();
    setSuccess("");

    if (!form.company_id) {
      errors.push("Company name is required.");
    }
    if (!form.category_id) {
      errors.push("Category is required.");
    }
    if (!form.quantity) {
      errors.push("Quantity is required.");
    }
    if (!form.rate) {
      errors.push("Rate is required.");
    }
    if (!form.transaction_date) {
      errors.push("Transaction date is required.");
    }

    setError(errors);

    if (errors.length > 0) {
      return;
    }

    const payload = {
      stock_transaction: {
        ...form,
      },
    };

    try {
      setLoading(true);
      await stockInTransactionService.create(token, payload);

      setSuccess("Stock transaction saved successfully");
      setForm(initialForm);
      handleClose();

      await loadTransactions();
    } catch (error) {
      setError(
        error.response?.data?.errors || [
          error.message || "Unable to save transaction",
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    company_id: "",
    category_id: "",
    transaction_date: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadTransactions(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    loadTransactions({});
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Stock In Transactions
        </Typography>

        <Button
          sx={{ ml: "auto" }}
          className="btn-primary"
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Transaction
        </Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Search Transaction
        </Typography>

        <Box component="form">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Company"
                name="company_id"
                value={filters.company_id}
                onChange={handleFilterChange}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Transaction Date"
                name="transaction_date"
                value={filters.transaction_date}
                onChange={handleFilterChange}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 4, md: 3 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Button
                type="button"
                variant="contained"
                onClick={handleApplyFilters}
                style={{ height: "55px", width: "110px" }}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                style={{ height: "55px", width: "110px", marginLeft: "15px" }}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {/* <Typography variant="h5" mb={3}>
        Stock In Transactions
      </Typography> */}

      {/* <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          New Stock In Transaction
        </Typography>
      </Paper> */}

      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity (KG)</TableCell>
              <TableCell>Rate/KG</TableCell>
              <TableCell>Balance (KG)</TableCell>
              <TableCell>Cost</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.transaction_date}</TableCell>

                <TableCell>{transaction.company_name}</TableCell>

                <TableCell>{transaction.category_name}</TableCell>

                <TableCell>{transaction.quantity}</TableCell>

                <TableCell>₹{transaction.rate}</TableCell>

                <TableCell>{transaction.balance_after}</TableCell>
                <TableCell>₹{transaction.cost}</TableCell>
              </TableRow>
            ))}

            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Add Transaction</DialogTitle>

        <DialogContent>
          {error.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {error.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Company"
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                >
                  {companies
                    .filter((company) => company.active)
                    .map((company) => (
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
                  required
                  label="Category"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Quantity (KG)"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: { min: 0.001, step: "0.001" },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Rate per KG"
                  name="rate"
                  value={form.rate}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: { min: 0, step: "0.01" },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Transaction Date"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={handleChange}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Remarks"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>

          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
