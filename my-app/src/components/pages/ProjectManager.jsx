import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const ProjectManager = () => {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openAssign, setOpenAssign] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
    fetchEmployees();
  }, []);

  const fetchTickets = async () => {
    const ticketsQuery = query(collection(db, 'tickets'));
    const ticketsSnapshot = await getDocs(ticketsQuery);
    const ticketsList = ticketsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTickets(ticketsList);
  };

  const fetchEmployees = async () => {
    const employeesQuery = query(
      collection(db, 'users'),
      where('role', '==', 'employee')
    );
    const employeesSnapshot = await getDocs(employeesQuery);
    const employeesList = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEmployees(employeesList);
  };

  const handleAssignTicket = async (employeeId) => {
    try {
      await updateDoc(doc(db, 'tickets', selectedTicket.id), {
        assignedTo: employeeId,
        status: 'in-progress',
        updatedAt: new Date().toISOString(),
      });
      setOpenAssign(false);
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Project Manager Dashboard</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            label="Filter by Status"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Tickets</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.clientName}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{ticket.description}</TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority}
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>
                  {ticket.assignedTo ? 
                    employees.find(emp => emp.uid === ticket.assignedTo)?.name || 'Unknown' :
                    'Unassigned'
                  }
                </TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {!ticket.assignedTo && (
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setOpenAssign(true);
                      }}
                    >
                      Assign
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAssign} onClose={() => setOpenAssign(false)}>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Select Employee</InputLabel>
            <Select
              label="Select Employee"
              onChange={(e) => handleAssignTicket(e.target.value)}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.uid} value={employee.uid}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectManager;
