import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./registration.css";

const Register = () => {
  const navigate = useNavigate();
  const [universityOptions, setUniversityOptions] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    reEnterPassword: "",
    tuitionFeeBudget: "",
    accommodationFeeBudget: "",
    selectedColleges: [],
  });
  const [errors, setErrors] = useState({});

  // Fetch university names from backend
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get("http://localhost:5001/universities");
        setUniversityOptions(
          response.data.map((univ) => ({
            value: univ,
            label: univ,
          }))
        );
      } catch (error) {
        console.error("Error fetching university names:", error);
      }
    };
    fetchUniversities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear specific field error when user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));

    // Validation for numeric fields
    if ((name === "tuitionFeeBudget" || name === "accommodationFeeBudget") && value) {
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Please enter a valid positive number.",
        }));
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (selectedOptions) => {
    setFormData((prevState) => ({
      ...prevState,
      selectedColleges: selectedOptions || [],
    }));

    // Clear university selection error
    if (selectedOptions.length >= 3 && selectedOptions.length <= 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        selectedColleges: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const tuitionFee = parseInt(formData.tuitionFeeBudget, 10);
    const accommodationBudget = parseInt(formData.accommodationFeeBudget, 10);
    const selectedColleges = formData.selectedColleges;

    // Required fields validation
    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.lastName) newErrors.lastName = "Last Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.reEnterPassword) newErrors.reEnterPassword = "Re-entering the password is required.";
    if (formData.password !== formData.reEnterPassword) newErrors.reEnterPassword = "Passwords do not match.";

    // Budget validation
    if (isNaN(tuitionFee) || tuitionFee < 0 || tuitionFee > 60000) {
      newErrors.tuitionFeeBudget = "Tuition Fee Budget must be between 0 and 60000.";
    }
    if (isNaN(accommodationBudget) || accommodationBudget < 200 || accommodationBudget > 22000) {
      newErrors.accommodationFeeBudget = "Accommodation Fee Budget must be between 200 and 22000.";
    }

    // University selection validation
    if (selectedColleges.length < 3) {
      newErrors.selectedColleges = "Please select at least three universities.";
    } else if (selectedColleges.length > 10) {
      newErrors.selectedColleges = "You can select at most ten universities.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // If there are errors, stop the form submission
      return;
    }

    // Prepare payload
    const payload = {
      FirstName: formData.firstName,
      LastName: formData.lastName,
      EmailId: formData.email,
      Password: formData.password,
      TuitionFeeBudget: tuitionFee,
      AccommodationBudget: accommodationBudget,
      SelectedColleges: selectedColleges.map((college) => college.value),
    };

    // Submit data
    try {
      const response = await axios.post("http://localhost:5001/register", payload);
      if (response.status === 201) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(response.data.error || "Registration failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className="register">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div>
          <label>Re-enter Password:</label>
          <input
            type="password"
            name="reEnterPassword"
            value={formData.reEnterPassword}
            onChange={handleChange}
            required
          />
          {errors.reEnterPassword && <span className="error">{errors.reEnterPassword}</span>}
        </div>
        <div>
          <label>Tuition Fee Budget:</label>
          <input
            type="number"
            name="tuitionFeeBudget"
            value={formData.tuitionFeeBudget}
            onChange={handleChange}
            required
          />
          {errors.tuitionFeeBudget && <span className="error">{errors.tuitionFeeBudget}</span>}
        </div>
        <div>
          <label>Accommodation Fee Budget:</label>
          <input
            type="number"
            name="accommodationFeeBudget"
            value={formData.accommodationFeeBudget}
            onChange={handleChange}
            required
          />
          {errors.accommodationFeeBudget && <span className="error">{errors.accommodationFeeBudget}</span>}
        </div>
        <div>
          <label>University Names:</label>
          <Select
            options={universityOptions}
            isMulti
            value={formData.selectedColleges}
            onChange={handleDropdownChange}
            placeholder="Select Universities"
          />
          {errors.selectedColleges && <span className="error">{errors.selectedColleges}</span>}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
