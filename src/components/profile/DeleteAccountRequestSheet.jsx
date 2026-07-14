import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteAccountRequestSheet({
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");

  return (
    <>
      <div
        className="dp-sheet-backdrop"
        onClick={onClose}
      />

      <div className="dp-sheet">

        <div
          style={{
            padding:24,
            overflowY:"auto",
          }}
        >

          <div
            style={{
              display:"flex",
              justifyContent:"center",
              marginBottom:18,
            }}
          >
            <AlertTriangle
              size={46}
              color="#D62828"
            />
          </div>

          <div
            className="dp-display"
            style={{
              fontSize:24,
              fontWeight:700,
              textAlign:"center",
              marginBottom:10,
            }}
          >
            Request Account Deletion
          </div>

          <div
            style={{
              color:"var(--slate)",
              textAlign:"center",
              lineHeight:1.6,
              marginBottom:24,
            }}
          >
            We'll review your request and permanently
            delete your DealPass account along with all
            associated data.

            <br /><br />

            This action cannot be undone.
          </div>

          <label className="dp-label">
            Reason (optional)
          </label>

          <textarea
            className="dp-input"
            rows={5}
            placeholder="Tell us why you're leaving..."
            value={reason}
            onChange={(e)=>setReason(e.target.value)}
          />

          <div
            style={{
              display:"flex",
              gap:12,
              marginTop:24,
            }}
          >
            <button
              className="dp-btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="dp-btn-signal"
              style={{
                background:"#D62828",
              }}
              onClick={() => onSubmit(reason)}
            >
              Submit Request
            </button>

          </div>

        </div>

      </div>
    </>
  );
}