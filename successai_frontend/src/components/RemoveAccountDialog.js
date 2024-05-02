import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";

const RemoveAccountDialog = ({ open, onClose, onClick }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ p: 2, py: 1 }}>
        <DialogTitle sx={{ fontSize: "24px", textAlign: "center" }}>Are you sure?</DialogTitle>
        <DialogContent>
          Deleting this account may delete any existing data and may affect the ongoing campaigns negatively.
        </DialogContent>
        <DialogActions sx={{ mb: 3, justifyContent: 'center' }}>
          <Button onClick={onClick} variant="contained" color="error">
            Delete Account
          </Button>
          <Button onClick={onClose} variant="contained" sx={{ backgroundColor: 'black', color: 'white' }}>Cancel</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RemoveAccountDialog;
