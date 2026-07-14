import { useMemo, useState } from "react";
import { X, Bug, Lightbulb, Mail } from "lucide-react";

export default function FeedbackSheet({
  type = "bug",
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const config = useMemo(() => {
    switch (type) {
      case "feature":
        return {
          icon: <Lightbulb size={24} />,
          title: "Suggest a Feature",
          subtitle:
            "We'd love to hear your ideas for improving DealPass.",
          titlePlaceholder: "Feature title",
          messagePlaceholder:
            "Describe your idea...\n\nHow would this help you?",
          button: "Submit Feature",
        };

      case "contact":
        return {
          icon: <Mail size={24} />,
          title: "Contact Us",
          subtitle:
            "Have a question or need help? Send us a message.",
          titlePlaceholder: "Subject",
          messagePlaceholder: "How can we help you?",
          button: "Send Message",
        };

      default:
        return {
          icon: <Bug size={24} />,
          title: "Report a Bug",
          subtitle:
            "Found something that isn't working correctly?",
          titlePlaceholder: "Bug title",
          messagePlaceholder:
            "Describe what happened...\n\nSteps to reproduce:\n\nExpected behaviour:\n\nActual behaviour:",
          button: "Send Report",
        };
    }
  }, [type]);

  return (
    <>
      <div
        className="dp-sheet-backdrop"
        onClick={onClose}
      />

      <div className="dp-sheet">

        {/* Header */}

        <div
          style={{
            padding: "22px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  color: "var(--signal)",
                }}
              >
                {config.icon}
              </div>

              <div
                className="dp-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {config.title}
              </div>
            </div>

            <div
              style={{
                color: "var(--slate)",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {config.subtitle}
            </div>

          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X />
          </button>

        </div>

        {/* Body */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 22,
          }}
        >

          <div style={{ marginBottom: 18 }}>

            <label className="dp-label">
              {type === "contact" ? "Subject" : "Title"}
            </label>

            <input
              className="dp-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={config.titlePlaceholder}
            />

          </div>

          <div>

            <label className="dp-label">
              Message
            </label>

            <textarea
              className="dp-input"
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={config.messagePlaceholder}
              style={{
                resize: "none",
                minHeight: 180,
              }}
            />

          </div>

        </div>

        {/* Footer */}

        <div
          style={{
            padding: 22,
            borderTop: "1px solid var(--line)",
            display: "flex",
            gap: 12,
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
            onClick={() =>
              onSubmit({
                type,
                title,
                message,
              })
            }
          >
            {config.button}
          </button>
        </div>

      </div>
    </>
  );
}