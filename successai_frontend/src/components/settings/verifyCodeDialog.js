import { useFormik } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import * as Yup from "yup";

const VerifyCodeDialog = ({ open, onClose, title, contentText, onSubmit }) => {
  const codeForm = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().required("Code is required"),
    }),
    onSubmit,
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontSize: "24px" }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 5, wordWrap: "break-word" }}>{contentText}</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          type="text"
          id="code"
          name="code"
          variant="outlined"
          onChange={codeForm.handleChange}
          onBlur={codeForm.handleBlur}
          value={codeForm.values.code}
          error={codeForm.touched.code && Boolean(codeForm.errors.code)}
          helperText={codeForm.touched.code && codeForm.errors.code}
        />
      </DialogContent>
      <DialogActions sx={{ mb: 3 }}>
        <Button onClick={codeForm.handleSubmit} variant="contained">
          Proceed
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerifyCodeDialog;
