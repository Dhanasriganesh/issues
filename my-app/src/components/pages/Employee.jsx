import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Send as SendIcon } from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MessageSquare } from 'lucide-react';

const Employee = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const ticketsCollection = collection(db, 'tickets');
      const q = query(
        ticketsCollection,
        where('assignedTo', '==', user.uid),
        orderBy('created', 'desc')
      );
      const ticketsSnapshot = await getDocs(q);
      const ticketsList = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsList);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch tickets');
    }
  };

  const handleAddComment = async (ticketId) => {
    if (!comment.trim()) return;

    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
      
      const newComment = {
        text: comment.trim(),
        userId: user.uid,
        userName: user.name,
        timestamp: serverTimestamp()
      };

      await updateDoc(ticketRef, {
        comments: [...(ticket.comments || []), newComment],
        lastUpdated: serverTimestamp()
      });

      setComment('');
      setSuccess('Comment added successfully');
      fetchTickets();
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
      setSuccess('Status updated successfully');
      fetchTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-gray-600">View and manage assigned tickets</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <DashboardLayout title="Employee Dashboard">
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              My Tickets
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket #</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.ticketNumber}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{ticket.customer}</TableCell>
                    <TableCell>{ticket.priority}</TableCell>
                    <TableCell>
                      <FormControl size="small">
                        <Select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        >
                          <MenuItem value="Open">Open</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Resolved">Resolved</MenuItem>
                          <MenuItem value="Closed">Closed</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => setSelectedTicket(ticket)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="md" fullWidth>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogContent>
              {selectedTicket && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">{selectedTicket.subject}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {selectedTicket.description}
                  </Typography>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Comments</Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2 }}>
                      {selectedTicket.comments?.map((comment, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle2">{comment.userName}</Typography>
                          <Typography variant="body2">{comment.text}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comment.timestamp?.toDate?.().toLocaleString()}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={() => handleAddComment(selectedTicket.id)}
                      disabled={!comment.trim()}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTicket(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </div>
  );
};

export default Employee;