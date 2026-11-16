import { useEffect, useState } from "react";
import { useToast } from "./../../context/ToastContext";
import { useAuth } from "./../../context/AuthContext";
import { ConfirmDialog } from "./../../ui/ConfirmDialog";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { Add, Delete, Edit } from "@mui/icons-material";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import companyService from "../../services/companyService";

const initialForm = {
  name: "",
  address: "",
  contact_number: "",
};

export const CompanyList = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [companyToUpdate, setCompanyToUpdate] = useState(null);

  useEffect(() => {
    loadCompanies(token);
  }, []);

  const loadCompanies = async (token) => {
    try {
      setLoading(true);
      const response = await companyService.getAll(token);
      setCompanies(response.data);
    } catch (err) {
      setError(["Unable to load companies."]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setError([]);
    setOpen(true);
  };

  const handleEdit = (company) => {
    setEditingId(company.id);
    setForm({
      name: company.name,
      address: company.address,
      contact_number: company.contact_number,
    });
    setError([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setError([]);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!form.name.trim()) {
      errors.push("Company name is required.");
    }

    if (
      form.contact_number.trim() &&
      !/^[0-9+\-\s()]{7,20}$/.test(form.contact_number.trim())
    ) {
      errors.push("Please enter a valid contact number.");
    }

    setError(errors);

    if (errors.length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError([]);

      const data = {
        company: {
          name: form.name.trim(),
          address: form.address.trim(),
          contact_number: form.contact_number.trim(),
        },
      };

      if (editingId) {
        await companyService.update(token, editingId, data);
        showToast("Company updated successfully", "success");
      } else {
        await companyService.create(token, data);
        showToast("Company created successfully", "success");
      }

      handleClose();
      await loadCompanies(token);
    } catch (err) {
      const errors = err.response?.data?.errors;
      Array.isArray(errors) && showToast(errors.join(", "), "error");
      !Array.isArray(errors) && showToast("Unable to save company.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (company) => {
    setDialogOpen(true);
    setCompanyToUpdate(company);
  };

  // const confirmDelete = async () => {
  //   try {
  //     await companyService.delete(token, companyToDelete);
  //     showToast("Company deleted successfully", "success");
  //     await loadCompanies(token);
  //   } catch (err) {
  //     const errors = err.response?.data?.errors;
  //     Array.isArray(errors) && showToast(errors.join(", "), "error");
  //     !Array.isArray(errors) && showToast("Unable to delete company.", "error");
  //   } finally {
  //     setDialogOpen(false);
  //   }
  // };

  const confirmUpdate = async () => {
    try {
      await companyService.toggleStatus(token, companyToUpdate.id);
      showToast("Company status updated successfully", "success");
      await loadCompanies(token);
    } catch (err) {
      const errors = err.response?.data?.errors;
      Array.isArray(errors) && showToast(errors.join(", "), "error");
      !Array.isArray(errors) &&
        showToast(["Unable to update company status."].join(", "), "error");
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Companies
        </Typography>

        <Button
          sx={{ ml: "auto" }}
          className="btn-primary"
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Company
        </Button>
      </Stack>

      <Card>
        <CardContent>
          {error.length > 0 && !open && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.map((err, index) => (
                <div key={index}>{err}</div>
              ))}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>ID</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Company Name</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Address</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Contact Number</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>{company.id}</TableCell>

                    <TableCell>{company.name}</TableCell>

                    <TableCell>{company.address || "-"}</TableCell>

                    <TableCell>{company.contact_number || "-"}</TableCell>

                    <TableCell>
                      {company.active ? "Active" : "Inactive"}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleUpdate(company)}
                      >
                        {company.active ? (
                          <ToggleOnIcon color="success" />
                        ) : (
                          <ToggleOffIcon color="failure" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && companies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Company" : "Add Company"}</DialogTitle>

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

          <TextField
            autoFocus
            fullWidth
            required
            label="Company Name"
            name="name"
            margin="normal"
            value={form.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Address"
            name="address"
            margin="normal"
            value={form.address}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Contact Number"
            name="contact_number"
            margin="normal"
            value={form.contact_number}
            onChange={handleChange}
            inputProps={{ maxLength: 20 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>

          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Dialog Component */}
      <ConfirmDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={confirmUpdate}
        title={
          (companyToUpdate && companyToUpdate?.active
            ? "Deactivate"
            : "Activate") + " Company"
        }
        message={`Are you sure you want to ${companyToUpdate && companyToUpdate?.active ? "deactivate" : "activate"} this company?`}
        buttonMessage="Update Status"
      />
    </Box>
  );
};
