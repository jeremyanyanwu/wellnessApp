import React from "react";
import { Col, Row } from "react-bootstrap";
import { motion as framerMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const AuthLayout = ({ component }) => {
  const navigate = useNavigate();

  return (
    <framerMotion.div
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <framerMotion.div
        className="row w-100 m-0 h-100 g-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Col xs={12} md={6} className="left-panel d-flex flex-column justify-content-center align-items-center p-4 p-md-5">
          <h1 className="text-center text-md-start">🌿 Wellness Journey</h1>
          <p className="text-center text-md-start">Start tracking your health and find peace today.</p>
        </Col>
        <Col xs={12} md={6} className="auth-right d-flex flex-column justify-content-center align-items-center p-4 p-md-5">
          <div className="auth-form-container">{component}</div>
        </Col>
      </framerMotion.div>
    </framerMotion.div>
  );
};

export default AuthLayout;