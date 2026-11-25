import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
// Importing printBill should be at the top of the file, not inside the component
import { printBill } from "../../BillPDF";

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

import stockOutTransactionService from "../../services/stockOutTransactionService";

const initialForm = {
  company_id: "",
  hotel_id: "",
  category_id: "",
  quantity: "",
  rate: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  remarks: "",
};

export const StockOutList = () => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState([]);
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [printData, setPrintData] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialFilters = {
    company_id: "",
    category_id: "",
    hotel_id: "",
    from_date: "",
    to_date: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    // loadDropdowns();
    loadTransactions({});
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

  //     setCompanies(companyResponse.data);10000.0

  //     setCategories(categoryResponse.data);
  //   } catch (error) {
  //     console.error("Failed to load dropdowns", error);
  //   }
  // };

  // const handleShareWhatsApp = async () => {
  //   const hotelName = hotels.find((h) => h.id === filters.hotel_id)?.name || "";
  //   const bill = {
  //     watsapp: true,
  //     billNumber: filters.hotel_id ? `KNR-${Date.now()}` : "",
  //     date: new Date().toLocaleDateString("en-IN"),
  //     customerName: hotelName,
  //     phone: hotels.find((h) => h.id === filters.hotel_id)?.phone || "",
  //     items: transactions.map((t) => ({
  //       name: t.category_name,
  //       quantity: t.quantity,
  //       price: t.rate,
  //     })),
  //     total: transactions.reduce((sum, t) => sum + t.quantity * t.rate, 0),
  //   };

  //   const pdfBlob = printBill(bill);

  //   const file = new File([pdfBlob], `${bill.billNumber}.pdf`, {
  //     type: "application/pdf",
  //   });

  //   console.log(
  //     navigator.canShare?.({ files: [file] }),
  //     "PDF Blob created for WhatsApp sharing",
  //   );
  //   console.log(pdfBlob, "pdfBlob");
  //   if (navigator.canShare?.({ files: [file] })) {
  //     try {
  //       await navigator.share({
  //         files: [file],
  //         title: "KNR SEA FOODS Bill",
  //         text: "Your bill " + bill.billNumber,
  //       });
  //     } catch (error) {
  //       if (error.name !== "AbortError") {
  //         console.error(error);
  //       }
  //     }
  //   } else {
  //     alert(
  //       "Direct PDF sharing is not supported. Please download the bill and share it through WhatsApp.",
  //     );
  //   }
  // };

  const handlePrintBill = () => {
    const hotel = hotels.find((h) => h.id === filters.hotel_id);

    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = t.transaction_date?.split("T")[0];

      if (!transactionDate) return false;

      if (filters.from_date && transactionDate < filters.from_date) {
        return false;
      }

      if (filters.to_date && transactionDate > filters.to_date) {
        return false;
      }

      return true;
    });

    if (!filteredTransactions.length) {
      alert("No transactions found for the selected date range.");
      return;
    }

    const bill = {
      billNumber: `KNR-${Date.now()}`,
      date: `${filters.from_date || ""} to ${filters.to_date || ""}`,
      fromDate: filters.from_date || "",
      toDate: filters.to_date || "",
      customerName: hotel?.name || "",
      phone: hotel?.phone || "",

      items: filteredTransactions.map((t) => ({
        transactionDate: t.transaction_date?.split("T")[0],
        name: t.category_name,
        quantity: Number(t.quantity || 0),
        price: Number(t.rate || 0),
      })),

      total: filteredTransactions.reduce(
        (sum, t) => sum + Number(t.quantity || 0) * Number(t.rate || 0),
        0,
      ),
    };

    printBill(bill);
  };

  const loadTransactions = async (filters = {}) => {
    try {
      const response = await stockOutTransactionService.getAll(token, filters);
      setTransactions(response.data.stock_outs);
      setCompanies(response.data.companies);
      setHotels(response.data.hotels);
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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setPrintData(filters.hotel_id && (filters.from_date || filters.to_date));
    loadTransactions(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    loadTransactions({});
    setPrintData(false);
  };

  const handleSubmit = async (event) => {
    const errors = [];
    event.preventDefault();
    setSuccess("");

    if (!form.company_id) {
      errors.push("Company name is required.");
    }
    if (!form.hotel_id) {
      errors.push("Hotel is required.");
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
      await stockOutTransactionService.create(token, payload);

      setSuccess("Stock transaction saved successfully");
      setForm(initialForm);
      handleClose();
      setFilters(initialFilters);
      setPrintData(false);

      await loadTransactions({});
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

  return (
    <Box>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Stock Out Transactions
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
            <Grid size={{ xs: 12, md: 2 }}>
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

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Hotel"
                name="hotel_id"
                value={filters.hotel_id}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Hotels</MenuItem>
                {hotels.map((hotel) => (
                  <MenuItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
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

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>
            </Grid>

            <Grid
              size={{ xs: 4, md: 2 }}
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
      {printData && transactions.length > 0 && (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" onClick={handlePrintBill}>
            Print Bill
          </Button>

          {/* <Button
            variant="contained"
            color="success"
            onClick={handleShareWhatsApp}
          >
            Share on WhatsApp
          </Button> */}
        </Stack>
      )}

      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Hotel</TableCell>
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

                <TableCell>{transaction.hotel_name}</TableCell>
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
                  label="Hotel"
                  name="hotel_id"
                  value={form.hotel_id}
                  onChange={handleChange}
                >
                  {hotels
                    .filter((hotel) => hotel.active)
                    .map((hotel) => (
                      <MenuItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
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
                  {categories
                    .filter((category) => category.active)
                    .map((category) => (
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
