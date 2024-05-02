import {
  Box,
  Button,
  InputAdornment,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { East, West } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { useCreateCampaignMutation } from "src/services/campaign-service";
import { useState } from "react";

const Page = () => {
  const navigate = useNavigate();

  const [createCampaign] = useCreateCampaignMutation();
  const[disableButton, setDisableButton] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: "Your Campaign Title",
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required("Name is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const { message } = await createCampaign(values).unwrap();
        toast.success(message);
        window.Intercom('trackEvent', "Campaign created");

        navigate("/campaigns");
        setDisableButton(false)
      } catch (err) {
        helpers.setErrors({ submit: err.data.error.message });
        setDisableButton(false)
      }
    },
  });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: "60px",
            width: "100%",
            boxShadow: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "80%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                height: "100%",
              }}
              onClick={() => navigate("/campaigns")}
            >
              <West sx={{ mr: 1 }} fontSize="small" />
              Back
            </Button>
          </Box>
        </Box>
        <form noValidate onSubmit={formik.handleSubmit}>
          {" "}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "500px",
              flexDirection: "column",
              alignItems: "flex-start",
              height: "60vh",
              mt: 5,
              boxShadow: "0px 0px 26px 1px rgba(0, 0, 0, 0.15)",
              p: 5,
              px: 4,

              border: "1px solid rgba(0,0,0,0.5)",
            }}
          >
            <Typography sx={{ fontSize: "26px", fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>
            Let's launch a fresh campaign! 🔥
            </Typography>{" "}
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 400,
                color: "rgba(0,0,0,0.4)",
                mt: 1,
                width: "100%",
                textAlign: "left",
              }}
            >
              What name do you have in mind?
            </Typography>
            <TextField
              fullWidth
              label="Campaign Name"
              placeholder="Give your campaign a Name"
              variant="outlined"
              defaultValue="Your Campaign Title"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ display: "none" }}>
                    {" "}
                  </InputAdornment>
                ),
              }}
              sx={{
                "& div input": { fontSize: "20px", py: 3, pl: 1 },
                "& label": {
                  fontSize: "18px",
                  fontWeight: 400,
                  backgroundColor: "white",
                  px: 2,
                  pl: 1,
                },
                my: 7,
                mb: 12,
              }}
              error={!!(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            {formik.errors.submit && (
              <Typography
                color="error"
                sx={{ mt: 3, textAlign: "center", width: "100%" }}
                variant="body2"
              >
                {formik.errors.submit}
              </Typography>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                sx={{ fontSize: "15px", fontWeight: 600, p: 3, py: 1, mr: 2, px: 7 }}
                onClick={() => navigate("/campaigns")}
              >
                Cancel
              </Button>
              {disableButton ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "16px",
                  py: 1,
                  px: 5,
                }}
                variant="contained"
                disabled={!formik.isValid}
                type="submit"
              >
                  <>
                    Continue <East sx={{ ml: 1 }} />
                  </>
              </Button>)}
            </Box>
          </Box>
        </form>
      </Box>
    </>
  );
};

export default Page;
