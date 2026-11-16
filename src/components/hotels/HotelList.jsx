import { useEffect, useState } from "react";
import Add from "@mui/icons-material/Add";
import { useToast } from "./../../context/ToastContext";
import { useAuth } from "./../../context/AuthContext";
import { ConfirmDialog } from "./../../ui/ConfirmDialog";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import hotelService from "../../services/hotelService";

const initialForm = {
  name: "",
  contact_person: "",
  phone: "",
  address: "",
};

export const HotelList = () => {
  const { showToast } = useToast();
  const { token } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hotelToUpdate, setHotelToUpdate] = useState(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const response = await hotelService.getAll(token);
      setHotels(response.data);
    } catch (error) {
      console.error("Failed to load hotels", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setForm(initialForm);
    setSelectedId(null);
    setError([]);
    setOpen(true);
  };

  const handleEdit = (hotel) => {
    setForm({
      name: hotel.name || "",
      contact_person: hotel.contact_person || "",
      phone: hotel.phone || "",
      address: hotel.address || "",
    });

    setSelectedId(hotel.id);
    setError([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError([]);
  };

  const handleSubmit = async () => {
    setError([]);
    if (!form.name.trim()) {
      setError(["Hotel name is required"]);
      return;
    }
    try {
      if (selectedId) {
        await hotelService.update(token, selectedId, { hotel: form });
      } else {
        await hotelService.create(token, { hotel: form });
      }

      handleClose();
      loadHotels();
    } catch (error) {
      setError(error.response?.data?.errors || ["Unable to save hotel"]);
    }
  };

  const handleUpdate = async (hotel) => {
    setDialogOpen(true);
    setHotelToUpdate(hotel);
  };

  // const confirmDelete = async () => {
  //   try {
  //     await hotelService.delete(token, hotelToDelete.id);
  //     showToast("Hotel deleted successfully", "success");
  //     await loadHotels();
  //   } catch (err) {
  //     const errors = err.response?.data?.errors;
  //     Array.isArray(errors) && showToast(errors.join(", "), "error");
  //     !Array.isArray(errors) &&
  //       showToast(["Unable to delete hotel."].join(", "), "error");
  //   } finally {
  //     setDialogOpen(false);
  //   }
  // };

  const confirmUpdate = async () => {
    try {
      await hotelService.toggleStatus(token, hotelToUpdate.id);
      showToast("Hotel status updated successfully", "success");
      await loadHotels();
    } catch (err) {
      const errors = err.response?.data?.errors;
      Array.isArray(errors) && showToast(errors.join(", "), "error");
      !Array.isArray(errors) &&
        showToast(["Unable to update hotel status."].join(", "), "error");
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Hotels
        </Typography>

        <Button
          sx={{ ml: "auto" }}
          className="btn-primary"
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Hotel
        </Button>
      </Stack>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hotel Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {hotels.map((hotel) => (
              <TableRow key={hotel.id}>
                <TableCell>{hotel.name}</TableCell>
                <TableCell>{hotel.contact_person}</TableCell>
                <TableCell>{hotel.phone}</TableCell>
                <TableCell>{hotel.address}</TableCell>
                <TableCell>{hotel.active ? "Active" : "Inactive"}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(hotel)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleUpdate(hotel)}>
                    {hotel.active ? (
                      <ToggleOnIcon color="success" />
                    ) : (
                      <ToggleOffIcon color="failure" />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {hotels.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hotels found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{selectedId ? "Edit Hotel" : "Add Hotel"}</DialogTitle>

        <DialogContent>
          {error && error.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Hotel Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Contact Person"
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Address"
            name="address"
            multiline
            rows={3}
            value={form.address}
            onChange={handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <Button variant="contained" onClick={handleSubmit}>
            {selectedId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={confirmUpdate}
        title={
          (hotelToUpdate && hotelToUpdate?.active ? "Deactivate" : "Activate") +
          " Hotel"
        }
        message={`Are you sure you want to ${hotelToUpdate && hotelToUpdate?.active ? "deactivate" : "activate"} this hotel?`}
        buttonMessage="Update Status"
      />
    </Box>
  );
};
