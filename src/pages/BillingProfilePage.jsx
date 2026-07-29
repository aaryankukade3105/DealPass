import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Landmark,
  Building2,
  CreditCard,
  Hash,
  BadgeIndianRupee,
  Save,
  CheckCircle2,
} from "lucide-react";

const defaultForm = {
  full_name: "",
  email: "",
  phone: "",

  address: "",

  pan_number: "",
  gst_number: "",

  account_holder: "",
  bank_name: "",
  account_number: "",
  ifsc: "",
  upi_id: "",
};

function Section({ icon: Icon, title, color = "#6366f1", children }) {
  return (
    <div className="dp-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: color,
            display: "grid",
            placeItems: "center",
            color: "#fff",
          }}
        >
          <Icon size={20} />
        </div>

        <div>
          <div
            className="dp-display"
            style={{
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

function Input({
  icon: Icon,
  label,
  required = false,
  textarea = false,
  ...props
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="dp-label">
        {label}

        {required && (
          <span
            style={{
              color: "#ef4444",
              marginLeft: 4,
            }}
          >
            *
          </span>
        )}
      </label>

      <div className="dp-input-wrapper">
        <Icon className="dp-input-icon" size={18} />

        {textarea ? (
          <textarea
            className="dp-input"
            rows={4}
            {...props}
          />
        ) : (
          <input
            className="dp-input"
            {...props}
          />
        )}
      </div>
    </div>
  );
}

export default function BillingProfilePage({ account }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setForm({ ...defaultForm, ...data });
    } else {
      setForm((prev) => ({
        ...prev,
        full_name: account?.full_name || "",
        email: account?.email || "",
      }));
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const requiredFields = [
    "full_name",
    "email",
    "address",
    "pan_number",
    "account_holder",
    "bank_name",
    "account_number",
    "ifsc",
  ];

  const progress = useMemo(() => {
    const completed = requiredFields.filter(
      (key) => form[key]?.trim() !== ""
    ).length;

    return Math.round(
      (completed / requiredFields.length) * 100
    );
  }, [form]);

  async function handleSave() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login again.");
        return;
      }

      const { error } = await supabase
        .from("billing_profiles")
        .upsert({
          user_id: user.id,
          ...form,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Invoice profile saved successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="dp-page">

      {/* HEADER */}

      <div
        className="dp-card"
        style={{
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <h1
              className="dp-display"
              style={{
                margin: 0,
                fontSize: 32,
              }}
            >
              Invoice Profile
            </h1>

            <p
              style={{
                marginTop: 8,
                color: "var(--slate)",
              }}
            >
              Fill this once. Every invoice will use these details.
            </p>
          </div>

          <div
            style={{
              minWidth: 230,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              <span>Profile Completion</span>

              <span>{progress}%</span>
            </div>

            <div
              style={{
                height: 10,
                background: "#e5e7eb",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg,#6366f1,#8b5cf6)",
                  height: "100%",
                  transition: ".3s",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}

      <div className="billing-grid">

        {/* PERSONAL */}

        <Section
          icon={User}
          title="Personal Information"
          color="#3b82f6"
        >
          <Input
            icon={User}
            label="Full Name"
            required
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Aryan Kukade"
          />

          <Input
            icon={Mail}
            label="Email"
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <Input
            icon={Phone}
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
          />
        </Section>

        {/* ADDRESS */}

        <Section
          icon={MapPin}
          title="Billing Address"
          color="#10b981"
        >
          <Input
            icon={MapPin}
            textarea
            required
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Flat, Street, City, State, PIN"
          />
        </Section>

        {/* TAX */}

        <Section
          icon={Receipt}
          title="Tax Information"
          color="#f59e0b"
        >
          <Input
            icon={Receipt}
            required
            label="PAN Number"
            name="pan_number"
            value={form.pan_number}
            onChange={handleChange}
            placeholder="ABCDE1234F"
          />

          <Input
            icon={Receipt}
            label="GST Number"
            name="gst_number"
            value={form.gst_number}
            onChange={handleChange}
            placeholder="Optional"
          />
        </Section>

        {/* BANK */}

        <Section
          icon={Landmark}
          title="Bank Details"
          color="#8b5cf6"
        >
          <Input
            icon={User}
            required
            label="Account Holder"
            name="account_holder"
            value={form.account_holder}
            onChange={handleChange}
          />

          <Input
            icon={Building2}
            required
            label="Bank Name"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
          />

          <Input
            icon={CreditCard}
            required
            label="Account Number"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
          />

          <Input
            icon={Hash}
            required
            label="IFSC Code"
            name="ifsc"
            value={form.ifsc}
            onChange={handleChange}
          />

          <Input
            icon={BadgeIndianRupee}
            label="UPI ID"
            name="upi_id"
            value={form.upi_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </Section>

      </div>

      {/* SAVE */}

      <button
        className="dp-btn"
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%",
          marginTop: 30,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        {saving ? (
          <>
            <Save size={18} />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Save Invoice Profile
          </>
        )}
      </button>
    </div>
  );
}