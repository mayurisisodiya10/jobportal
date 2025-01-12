import React, { useState, useEffect } from "react";
import "./Management.css";
import bluebag from "../../../assets/logos/superadmin/blue.png";
import greenbag from "../../../assets/logos/superadmin/green.png";
import redbag from "../../../assets/logos/superadmin/red.png";
import yellowbag from "../../../assets/logos/superadmin/yellow.png";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import Notification from "../../../Notification/Notification";
import {
  Typography,
  InputBase,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  getCompanyData,
  getActivePlan,
  registerCompany,
} from "../../SuperAdminService";

function Management() {
  const [isColumnLayout, setIsColumnLayout] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    company_name: "",
    email: "",
    password: "",
    subscription_plan: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleColumnLayout = () => setIsColumnLayout(true);
  const handleGridLayout = () => setIsColumnLayout(false);

  const handleClickOpen = () => {
    setFormValues({
      company_name: "",
      email: "",
      password: "",
      subscription_plan: "",
    });
    setFormErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setFormValues({
      company_name: "",
      email: "",
      password: "",
      subscription_plan: "",
    });
    setFormErrors({});
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Remove error message when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.company_name)
      errors.company_name = "This field is required";
    if (!formValues.email) errors.email = "This field is required";
    if (!formValues.password) errors.password = "This field is required";
    if (!formValues.subscription_plan)
      errors.subscription_plan = "This field is required";
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await registerCompany(formValues);
      console.log("Company registered successfully:", formValues);
      setFormValues({
        company_name: "",
        email: "",
        password: "",
        subscription_plan: "",
      });
      handleClose();
      const data = await getCompanyData();
      setCompanies(data);
      setNotification({
        open: true,
        message: response.message,
        severity: "success",
      });
    } catch (err) {
      console.error("Error registering company:", err);
      setNotification({
        open: true,
        message: "Error registering company",
        severity: "error",
      });
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setDetailsDialogOpen(true);
  };

  const buttonStyle = (view) => ({
    backgroundColor:
      !isColumnLayout && view === "grid"
        ? "green"
        : isColumnLayout && view === "column"
        ? "green"
        : "transparent",
    color:
      !isColumnLayout && view === "grid"
        ? "white"
        : isColumnLayout && view === "column"
        ? "white"
        : "inherit",
    borderRadius: "4px",
    padding: "5px",
  });

  const companyListStyle = {
    display: "flex",
    flexDirection: isColumnLayout ? "column" : "row",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "20px",
  };

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await getCompanyData();
        setCompanies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    const loadSubscriptionPlans = async () => {
      try {
        const data = await getActivePlan();
        setSubscriptionPlans(data);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
      }
    };

    loadSubscriptionPlans();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredCompanies = companies.filter((company) => {
    if (filter === "all") return true;
    if (filter === "active") return company.is_active;
    if (filter === "inactive") return !company.is_active;
    if (filter === "paid") return company.is_paid;
    return true;
  });
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    // Date formatting
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(2);

    // Time formatting in 12-hour format with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${day}-${month}-${year}, Time: ${hours}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Notification
        open={notification.open}
        handleClose={() => setNotification({ ...notification, open: false })}
        alertMessage={notification.message}
        alertSeverity={notification.severity}
      />

      <div className="page-header">
        <div className="search-container">
          <InputBase
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <SearchIcon className="search-icon" />
        </div>
        <div className="add-company-btn">
          <Button variant="contained" color="success" onClick={handleClickOpen}>
            Add Company
          </Button>
        </div>
        <div className="view-btns">
          <Typography>View</Typography>
        </div>

        <div>
          <IconButton style={buttonStyle("grid")} onClick={handleGridLayout}>
            <ViewModuleIcon />
          </IconButton>
        </div>
        <div>
          <IconButton
            style={buttonStyle("column")}
            onClick={handleColumnLayout}
          >
            <ViewListIcon />
          </IconButton>
        </div>
      </div>
      <div className="company-status">
        <div className="status-card" onClick={() => setFilter("all")}>
          <div className="status-img">
            <img src={bluebag} alt="" />
          </div>
          <div>
            <p>Total Company</p>
            <p>{companies.length}</p>
          </div>
        </div>
        <div className="status-card" onClick={() => setFilter("active")}>
          <div className="status-img">
            <img src={greenbag} alt="" />
          </div>
          <div>
            <p>Active Company</p>
            <p>{companies.filter((company) => company.is_active).length}</p>
          </div>
        </div>
        <div className="status-card" onClick={() => setFilter("inactive")}>
          <div className="status-img">
            <img src={redbag} alt="" />
          </div>
          <div>
            <p>Inactive Company</p>
            <p>{companies.filter((company) => !company.is_active).length}</p>
          </div>
        </div>
        <div className="status-card" onClick={() => setFilter("paid")}>
          <div className="status-img">
            <img src={yellowbag} alt="" />
          </div>
          <div>
            <p>Paid Company</p>
            <p>{companies.filter((company) => company.is_paid).length}</p>
          </div>
        </div>
      </div>
      <div className="company-list" style={companyListStyle}>
        {filteredCompanies
          .filter((company) =>
            company.company_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map((company) => (
            <div key={company.id} className="company-details">
              <div className="all-details">
                <div className="company-logo">
                  <img src={bluebag} alt="" />
                </div>
                <div className="company-other-details">
                  <p>{company.company_name}</p>
                  <p>
                    {company.subdomain
                      ? `Subdomain: ${company.subdomain}`
                      : "No Subdomain"}
                  </p>
                  <p>
                    Reg.Date:
                    <span>
                      {new Date(
                        company.subscription_plan.start_date
                      ).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    Plan Expiry Date:
                    <span>
                      {new Date(
                        company.subscription_plan.end_date
                      ).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="del-buttons">
                  <IconButton color="error" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    aria-label="view"
                    onClick={() => handleViewDetails(company)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </div>
              </div>
              <div className="current-plan">
                <p>{company.subscription_plan.plan_name}</p>
                <p>Plan Name</p>
                <div>
                  {company.days_remaining > 0 ? (
                    <div>
                      <p>{company.days_remaining}</p>
                      <p>Days Remaining</p>
                    </div>
                  ) : company.time_remaining > 0 ? (
                    <div>
                      <p>{company.time_remaining}</p>
                      <p>Time Remaining</p>
                    </div>
                  ) : (
                    <div>
                      <p>Plan Expired</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Company</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="company_name"
            label="Company Name"
            type="text"
            fullWidth
            value={formValues.company_name}
            onChange={handleInputChange}
            error={!!formErrors.company_name}
            helperText={formErrors.company_name}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formValues.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={formValues.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          <TextField
            margin="dense"
            name="subscription_plan"
            label="Subscription Plan"
            select
            fullWidth
            value={formValues.subscription_plan}
            onChange={handleInputChange}
            error={!!formErrors.subscription_plan}
            helperText={formErrors.subscription_plan}
          >
            {subscriptionPlans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.plan_name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
      >
        <DialogTitle>Company Details</DialogTitle>
        <DialogContent>
          {selectedCompany && (
            <>
              <Typography>
                Company Name: {selectedCompany.company_name}
              </Typography>
              <Typography>
                Subdomain: {selectedCompany.subdomain || "N/A"}
              </Typography>
              <Typography>Email: {selectedCompany.email}</Typography>
              <Typography>Password: {selectedCompany.password}</Typography>

              <Typography>
                Is Paid: {selectedCompany.is_paid ? "Yes" : "No"}
              </Typography>
              <Typography>
                Is Active: {selectedCompany.is_active ? "Yes" : "No"}
              </Typography>
              <Typography>
                Last Login: {formatDate(selectedCompany.last_login)}
              </Typography>
              <Typography>
                Subscription Plan:
                <ul>
                  <li>
                    Plan Name: {selectedCompany.subscription_plan.plan_name}
                  </li>
                  <li>Price: ${selectedCompany.subscription_plan.price}</li>

                  <li>Days Remaining: {selectedCompany.days_remaining} days</li>
                  <li>Time Remaining: {selectedCompany.time_remaining} </li>
                  <li>
                    Start Date:
                    {new Date(
                      selectedCompany.subscription_plan.start_date
                    ).toLocaleDateString()}
                  </li>
                  <li>
                    End Date:{" "}
                    {new Date(
                      selectedCompany.subscription_plan.end_date
                    ).toLocaleDateString()}
                  </li>
                  <li>
                    Details: {selectedCompany.subscription_plan.plan_details}
                  </li>
                </ul>
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Management;
