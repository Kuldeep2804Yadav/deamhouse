import { useEffect, useState } from "react";

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false); // Loading state

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        const parsedUser = JSON.parse(user);
        const id = parsedUser?._id;

        const res = await fetch(`http://localhost:3000/api/user/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.error("Failed to fetch landlord:", error);
      }
    };

    fetchLandlord();
  }, [listing.userRef]);

  // ✅ Function to Send Email via Backend API
  const sendEmail = async () => {
    if (!message.trim()) {
      alert("Please enter a message before sending.");
      return;
    }

    setIsSending(true);
    
    try {
      const res = await fetch("http://localhost:3000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: landlord.email,
          subject: `Regarding ${listing.name}`,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Email sent successfully!");
        setMessage(""); // Clear message after sending
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows="2"
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <button
            onClick={sendEmail}
            disabled={isSending}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </div>
      )}
    </>
  );
}
