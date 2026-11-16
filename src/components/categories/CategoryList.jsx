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
import DeleteIcon from "@mui/icons-material/Delete";

import categoryService from "../../services/categoryService";

const initialForm = {
  name: "",
  description: "",
  phone: "",
  address: "",
};

export const CategoryList = () => {
  const { showToast } = useToast();
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log("Loading categories...");
    try {
      const response = await categoryService.getAll(token);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories", error);
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

  const handleEdit = (category) => {
    setForm({
      name: category.name || "",
      description: category.description || "",
    });

    setSelectedId(category.id);
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
      setError(["Category name is required"]);
      return;
    }
    try {
      if (selectedId) {
        await categoryService.update(token, selectedId, { category: form });
      } else {
        await categoryService.create(token, { category: form });
      }

      handleClose();
      loadCategories();
    } catch (error) {
      setError(error.response?.data?.errors || ["Unable to save category"]);
    }
  };

  const handleDelete = async (categoryId) => {
    setDialogOpen(true);
    setCategoryToDelete(categoryId);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.delete(token, categoryToDelete);
      showToast("Category deleted successfully", "success");
      await loadCategories();
    } catch (err) {
      const errors = err.response?.data?.errors;
      Array.isArray(errors) && showToast(errors.join(", "), "error");
      !Array.isArray(errors) &&
        showToast(["Unable to delete category."].join(", "), "error");
    } finally {
      setDialogOpen(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Categories
        </Typography>

        <Button
          sx={{ ml: "auto", position: "relative", zIndex: 1 }}
          className="btn-primary"
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </Stack>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(category)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(category.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedId ? "Edit Category" : "Add Category"}
        </DialogTitle>

        <DialogContent>
          {error && error.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Category Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={form.description}
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
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
      />
    </Box>
  );
};
