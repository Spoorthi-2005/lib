import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const initialForm = { title: '', author: '', isbn: '', image: '', domain: '', publicationYear: '', copies: 1 };

const LibrarianPanel = ({ books, onAdd, onUpdate, onRemove }) => {
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm(initialForm);
  };

  const handleEdit = (book) => {
    setEditId(book.id);
    setForm({ ...book });
    setOpenEdit(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate(editId, form);
    setOpenEdit(false);
    setEditId(null);
    setForm(initialForm);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Librarian Book Management</Typography>
      <Box component="form" onSubmit={handleAdd} sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField label="Title" name="title" value={form.title} onChange={handleChange} required />
        <TextField label="Author" name="author" value={form.author} onChange={handleChange} required />
        <TextField label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} required />
        <TextField label="Image URL" name="image" value={form.image} onChange={handleChange} required />
        <TextField label="Domain" name="domain" value={form.domain} onChange={handleChange} required />
        <TextField label="Publication Year" name="publicationYear" value={form.publicationYear} onChange={handleChange} required />
        <TextField label="Copies" name="copies" type="number" value={form.copies} onChange={handleChange} required inputProps={{ min: 1 }} />
        <Button type="submit" variant="contained" color="primary">Add Book</Button>
      </Box>
      <Typography variant="h6" mb={1}>All Books</Typography>
      <List>
        {books.map((book) => (
          <ListItem key={book.id} secondaryAction={
            <>
              <IconButton onClick={() => handleEdit(book)}><EditIcon /></IconButton>
              <IconButton onClick={() => onRemove(book.id)} color="error"><DeleteIcon /></IconButton>
            </>
          }>
            <ListItemText
              primary={`${book.title} (${book.domain})`}
              secondary={`Author: ${book.author} | Year: ${book.publicationYear} | ISBN: ${book.isbn} | Book ID: ${book.id} | Copies: ${book.availableCopies}/${book.totalCopies}`}
            />
          </ListItem>
        ))}
      </List>
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleChange} required />
            <TextField label="Author" name="author" value={form.author} onChange={handleChange} required />
            <TextField label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} required />
            <TextField label="Image URL" name="image" value={form.image} onChange={handleChange} required />
            <TextField label="Domain" name="domain" value={form.domain} onChange={handleChange} required />
            <TextField label="Publication Year" name="publicationYear" value={form.publicationYear} onChange={handleChange} required />
            <TextField label="Copies" name="copies" type="number" value={form.copies} onChange={handleChange} required inputProps={{ min: 1 }} />
            <Button type="submit" variant="contained" color="primary">Update Book</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LibrarianPanel; 