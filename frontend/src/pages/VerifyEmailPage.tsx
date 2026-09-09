import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.get(
          `http://localhost:5000/api/auth/verify-email?token=${token}`
        );

        setSuccess(true);
        setMessage("Your email has been verified successfully!");
      } catch (error) {
        console.error("Email verification failed:", error);

        setMessage(
          "This verification link is invalid or has expired."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2>
          {success ? "Email Verified 🎉" : "Email Verification"}
        </h2>

        <p style={{ marginTop: "20px" }}>{message}</p>

        {success && (
          <Link
            to="/login"
            style={{
              display: "inline-block",
              marginTop: "25px",
              padding: "12px 24px",
              backgroundColor: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
}