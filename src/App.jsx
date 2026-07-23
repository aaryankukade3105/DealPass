import GlobalStyles from "./styles/GlobalStyles";
import Field from "./components/common/Field";
import SectionLabel from "./components/common/SectionLabel";
import EmptyState from "./components/common/EmptyState";
import ChipSelect from "./components/common/ChipSelect";
import ConfirmDialog from "./components/common/ConfirmDialog";
import DealCard from "./components/deals/DealCard";
import DealPreview from "./components/deals/DealPreview";
import DealFormSheet from "./components/deals/DealFormSheet";
import { Download } from "lucide-react";
import { toJpeg } from "html-to-image";
import { addDeal, getDeals, updateDeal, deleteDeal } from "./services/dealService";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./lib/supabase";
import {
  Menu, X, LayoutDashboard, Briefcase, User, LogOut, Plus, Pencil, Trash2,
  Search, Clock, Receipt, Sparkles, Eye, EyeOff,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell,
} from "recharts";
import DateField from "./components/common/DateField";
import DashboardPage from "./pages/DashboardPage";
import DealsPage from "./pages/DealsPage";
import Header from "./components/layout/Header";
import Drawer from "./components/layout/Drawer";
import AlertModal from "./components/common/AlertModal";
import ProfilePage from "./pages/ProfilePage";
import { computeStats } from "./utils/dashboard";
import AuthPage from "./pages/AuthPage";
import { changePassword } from "./services/authService";
import ChangePasswordSheet from "./components/profile/ChangePasswordSheet";
import { exportDealsCSV } from "./utils/exportCsv";
import { downloadBackup } from "./utils/backup";
import { importBackup } from "./utils/importBackup";
import { submitFeedback } from "./services/feedbackService";
import FeedbackSheet from "./components/profile/FeedbackSheet";
import { exportDealsExcel } from "./utils/exportExcel";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DeleteAccountRequestSheet from "./components/profile/DeleteAccountRequestSheet";
/* ---------------------------------- constants ---------------------------------- */

const STORAGE_KEYS = {
  account: "dealpass-account",
  deals: "dealpass-deals",
  session: "dealpass-session",
};

const CONFIRMATION_MODES = ["Call", "Email", "WhatsApp", "Instagram Chat", "Other"];
const PAYMENT_MODES = ["UPI", "Bank Transfer", "PayPal", "Cheque", "Cash", "Other"];
const DELIVERABLE_OPTIONS = [
  "Reel", "Story", "Static Post", "Carousel", "Review", "UGC Video", "YouTube Video", "Other",
];

function emptyDeal() {
  return {
    brand_id: "",

    deal_title: "",

    collaboration_type: "Paid",

    confirmation_mode: "Email",

    confirmation_date: "",

    deal_status: "Negotiation",

    commercials: "",

    payment_mode: "UPI",

    payment_status: "Pending",

    payment_deadline: "",

    deliverables: [],

    invoice_sent: false,

    invoice_number: "",

    transaction_id: "",

    notes: "",
  };
}

/* ---------------------------------- helpers ---------------------------------- */

function formatINR(amount) {
  const n = Number(amount) || 0;
  return "₹" + n.toLocaleString("en-IN");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function nextDealId(deals) {
  const max = deals.reduce((m, d) => {
    const match = /DP-(\d+)/.exec(d.id || "");
    const n = match ? parseInt(match[1], 10) : 0;
    return Math.max(m, n);
  }, 0);
  return "DP-" + String(max + 1).padStart(4, "0");
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seedDemoDeals() {
  return [
    {
      id: "DP-0001", brandName: "Mamaearth", pocName: "Riya Kapoor", contactNumber: "+91 98765 43210",
      confirmationDate: daysAgoISO(3), confirmationMode: "Instagram Chat",
      commercials: "45000", paymentMode: "UPI", paymentDeadline: daysAgoISO(-7),
      paymentStatus: "pending", deliverables: ["Reel", "Story"],
      deliverablesCompletionDate: "", paymentCompletionDate: "", invoiceSent: "no", transactionId: "", notes: "",
    },
    {
      id: "DP-0002", brandName: "boAt", pocName: "Karan Mehta", contactNumber: "+91 91234 56789",
      confirmationDate: daysAgoISO(10), confirmationMode: "Email",
      commercials: "60000", paymentMode: "Bank Transfer", paymentDeadline: daysAgoISO(2),
      paymentStatus: "completed", deliverables: ["Reel", "Carousel"],
      deliverablesCompletionDate: daysAgoISO(6), paymentCompletionDate: daysAgoISO(2),
      invoiceSent: "yes", transactionId: "UTR2208841", notes: "",
    },
    {
      id: "DP-0003", brandName: "Nykaa", pocName: "Simran Bhatia", contactNumber: "+91 99887 76655",
      confirmationDate: daysAgoISO(25), confirmationMode: "Call",
      commercials: "30000", paymentMode: "UPI", paymentDeadline: daysAgoISO(20),
      paymentStatus: "completed", deliverables: ["Static Post", "Review"],
      deliverablesCompletionDate: daysAgoISO(22), paymentCompletionDate: daysAgoISO(20),
      invoiceSent: "yes", transactionId: "UTR1190034", notes: "",
    },
    {
      id: "DP-0004", brandName: "Tripoto", pocName: "Devika Rao", contactNumber: "+91 90909 12345",
      confirmationDate: daysAgoISO(45), confirmationMode: "WhatsApp",
      commercials: "80000", paymentMode: "Bank Transfer", paymentDeadline: daysAgoISO(-5),
      paymentStatus: "pending", deliverables: ["YouTube Video"],
      deliverablesCompletionDate: daysAgoISO(40), paymentCompletionDate: "",
      invoiceSent: "yes", transactionId: "", notes: "Awaiting brand finance approval.",
    },
    {
      id: "DP-0005", brandName: "Sugar Cosmetics", pocName: "Naveen Iyer", contactNumber: "+91 98989 11223",
      confirmationDate: daysAgoISO(70), confirmationMode: "Email",
      commercials: "20000", paymentMode: "UPI", paymentDeadline: daysAgoISO(64),
      paymentStatus: "completed", deliverables: ["Reel"],
      deliverablesCompletionDate: daysAgoISO(67), paymentCompletionDate: daysAgoISO(65),
      invoiceSent: "yes", transactionId: "UTR0098123", notes: "",
    },
  ];
}



/* ---------------------------------- global styles ---------------------------------- */


/* ---------------------------------- small UI bits ---------------------------------- */




/* ---------------------------------- header / drawer ---------------------------------- */




/* ---------------------------------- auth ---------------------------------- */
export default function DealPassApp() {
 const [loading, setLoading] = useState(true);
const [account, setAccount] = useState(null);
const [deals, setDeals] = useState([]);
const [changePasswordOpen, setChangePasswordOpen] = useState(false);
const [loggedIn, setLoggedIn] = useState(false);
const [logoutOpen, setLogoutOpen] = useState(false);
const [authMode, setAuthMode] = useState("signup");
const [authBusy, setAuthBusy] = useState(false);
const [feedbackOpen, setFeedbackOpen] = useState(false);
const [deleteRequestOpen, setDeleteRequestOpen] = useState(false);
const [feedbackType, setFeedbackType] = useState("bug");
const [isResetPasswordPage, setIsResetPasswordPage] = useState(false);
const [resetBusy, setResetBusy] = useState(false);
const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("theme") === "dark";
});
useEffect(() => {
  const root = document.querySelector(".dp-root");

  if (root) {
    root.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }

  localStorage.setItem(
    "theme",
    darkMode ? "dark" : "light"
  );
}, [darkMode]);
const [alert, setAlert] = useState({

  open: false,
  type: "warning",
  title: "",
  message: "",
});
function showAlert(type, title, message) {
  setAlert({
    open: true,
    type,
    title,
    message,
  });
}
useEffect(() => {
  let lastTouchEnd = 0;

  const preventZoom = (e) => {
    const now = Date.now();

    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }

    lastTouchEnd = now;
  };

  document.addEventListener("touchend", preventZoom, {
    passive: false,
  });

  return () => {
    document.removeEventListener("touchend", preventZoom);
  };
}, []);

useEffect(() => {
  async function loadDeals() {
    if (!loggedIn) return;

    try {
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      console.error(err);
    }
  }

  loadDeals();
}, [loggedIn]);


async function handleChangePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  try {
    if (!currentPassword.trim()) {
      return showAlert(
        "warning",
        "Current Password",
        "Please enter your current password."
      );
    }

    if (!newPassword.trim()) {
      return showAlert(
        "warning",
        "New Password",
        "Please enter a new password."
      );
    }

    if (newPassword.length < 8) {
      return showAlert(
        "warning",
        "Weak Password",
        "Password must be at least 8 characters."
      );
    }

    if (newPassword !== confirmPassword) {
      return showAlert(
        "warning",
        "Passwords Don't Match",
        "New password and confirmation password must match."
      );
    }

await changePassword(
  currentPassword,
  newPassword
);

    setChangePasswordOpen(false);

    showAlert(
      "success",
      "Password Updated",
      "Your password has been updated successfully."
    );

  } catch (err) {
    showAlert(
      "error",
      "Update Failed",
      err.message
    );
  }
}
function handleExportCSV() {
  if (deals.length === 0) {
    return showInfo(
      "No Deals",
      "You don't have any deals to export."
    );
  }

  exportDealsCSV(deals);

  showSuccess(
    "CSV Exported",
    "Your deals have been downloaded successfully."
  );
}

function handleExportExcel() {
  if (deals.length === 0) {
    return showInfo(
      "No Deals",
      "You don't have any deals to export."
    );
  }

  exportDealsExcel(deals);

  showSuccess(
    "Excel Exported",
    "Your Excel file has been downloaded successfully."
  );
}

function handleDownloadBackup() {
  downloadBackup(account, deals);

  showSuccess(
    "Backup Downloaded",
    "Your DealPass backup has been downloaded successfully."
  );
}
function openBackupPicker() {
  fileInputRef.current?.click();
}
async function handleImportBackup(file) {
  try {
    const backup = await importBackup(file);

    setDeals(backup.deals);

    if (backup.account) {
      setAccount(backup.account);
    }

    showSuccess(
      "Backup Restored",
      `${backup.deals.length} deals imported successfully.`
    );

  } catch (err) {
    showError(
      "Import Failed",
      err.message
    );
  }
}
async function handleSubmitFeedback({
  type,
  title,
  message,
}) {
  try {
    if (!title.trim()) {
      return showWarning(
        "Title Required",
        "Please enter a title."
      );
    }

    if (!message.trim()) {
      return showWarning(
        "Message Required",
        "Please enter your message."
      );
    }

    await submitFeedback({
      type,
      title,
      message,
    });

    setFeedbackOpen(false);

    showSuccess(
      "Thank You!",
      type === "bug"
        ? "Your bug report has been submitted."
        : type === "feature"
        ? "Your feature request has been submitted."
        : "Your message has been sent."
    );

  } catch (err) {
    showError(
      "Submission Failed",
      err.message
    );
  }
}
const [page, setPage] = useState("dashboard");
const [drawerOpen, setDrawerOpen] = useState(false);
const [formOpen, setFormOpen] = useState(false);
const [editingDeal, setEditingDeal] = useState(null);
const [deletingDeal, setDeletingDeal] = useState(null);
const [toast, setToast] = useState("");
const [selectedDeal, setSelectedDeal] = useState(null);
const fileInputRef = useRef(null);

useEffect(() => {
const checkSession = async () => {
  const hash = window.location.hash;

  if (
    hash.includes("type=recovery") ||
    window.location.pathname === "/reset-password"
  ) {
    setIsResetPasswordPage(true);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

    if (session) {
      const user = session.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

setAccount({
  id: user.id,
  full_name: profile?.full_name || user.user_metadata?.full_name || "Creator",
  email: user.email,
  created_at: profile?.created_at,
});

      setLoggedIn(true);
    }

    setLoading(false);
  };

  checkSession();
}, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };


  const persistAccount = async (next) => {
    setAccount(next);
    try { await window.storage.set(STORAGE_KEYS.account, JSON.stringify(next)); } catch (e) {}
  };
  const persistSession = async (loggedInVal) => {
    setLoggedIn(loggedInVal);
    try { await window.storage.set(STORAGE_KEYS.session, JSON.stringify({ loggedIn: loggedInVal })); } catch (e) {}
  };
const handleSignup = async ({
  name,
  identifier,
  password,
  confirm,
}) => {
  if (!name.trim()) {
  showAlert(
    "warning",
    "Full Name Required",
    "Please enter your full name."
  );
  return;
}

if (!identifier.trim()) {
  showAlert(
    "warning",
    "Email Required",
    "Please enter your email address."
  );
  return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(identifier.trim())) {
  showAlert(
    "warning",
    "Invalid Email",
    "Please enter a valid email address."
  );
  return;
}

if (!password.trim()) {
  showAlert(
    "warning",
    "Password Required",
    "Please enter your password."
  );
  return;
}

if (password.length < 8) {
  showAlert(
    "warning",
    "Weak Password",
    "Password must be at least 8 characters."
  );
  return;
}

if (!confirm.trim()) {
  showAlert(
    "warning",
    "Confirm Password Required",
    "Please confirm your password."
  );
  return;
}

if (password !== confirm) {
  showAlert(
    "warning",
    "Passwords Don't Match",
    "Password and Confirm Password must match."
  );
  return;
}
  try {
    setAuthBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: identifier.trim().toLowerCase(),
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("Unable to create your account.");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: name.trim(),
        email: identifier.trim().toLowerCase(),
      });

    if (profileError) throw profileError;

    setAuthBusy(false);

    // Switch to Login screen
    setAuthMode("login");

    // Show success popup
    showSuccess(
      "Account Created",
      "Your account has been created successfully. Please log in."
    );

  } catch (err) {
    setAuthBusy(false);

    if (
      err.message?.toLowerCase().includes("already") ||
      err.message?.toLowerCase().includes("registered")
    ) {
      showAlert(
  "warning",
  "Email Already Registered",
  "An account with this email already exists."
);
    } else {
    showAlert(
  "error",
  "Signup Failed",
  err.message
);
    }
  }
};
const handleLogin = async ({ identifier, password }) => {

  try {
    setAuthBusy(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) throw error;

    const user = data.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "Creator",
        email: user.email,
      });
    } else if (profileError) {
      throw profileError;
    }

   setAccount({
  id: user.id,
  full_name: profile?.full_name || user.user_metadata?.full_name || "Creator",
  email: user.email,
  created_at: profile?.created_at,
});

    setLoggedIn(true);
    setAuthBusy(false);

  } catch (err) {
    setAuthBusy(false);
    showAlert(
  "error",
  "Login Failed",
  err.message
);
  }
};
const handleForgotPassword = async (email) => {
  try {
    if (!email.trim()) {
  return showAlert(
    "warning",
    "Email Required",
    "Please enter your email address first."
  );
}

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
  return showAlert(
    "warning",
    "Invalid Email",
    "Please enter a valid email address."
  );
}
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo:
            window.location.origin + "/reset-password",
        }
      );

    if (error) throw error;

    showAlert(
      "success",
      "Reset Email Sent",
      "We've sent you a password reset link. Please check your inbox."
    );
  } catch (err) {
    showAlert(
      "error",
      "Failed",
      err.message
    );
  }
};

const handleResetPassword = async ({
  password,
  confirm,
}) => {
  try {
    if (!password.trim()) {
      return showAlert(
        "warning",
        "Password Required",
        "Please enter your new password."
      );
    }

    if (password.length < 8) {
      return showAlert(
        "warning",
        "Weak Password",
        "Password must be at least 8 characters."
      );
    }

    if (password !== confirm) {
      return showAlert(
        "warning",
        "Passwords Don't Match",
        "Please make sure both passwords match."
      );
    }

    setResetBusy(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    setResetBusy(false);

await supabase.auth.signOut();

setIsResetPasswordPage(false);
setLoggedIn(false);
setAccount(null);
setAuthMode("login");

window.history.replaceState({}, "", "/");

showAlert(
  "success",
  "Password Updated",
  "Your password has been changed successfully. You can now return to the app and log in with your new password."
);

  } catch (err) {
    setResetBusy(false);

    showAlert(
      "error",
      "Update Failed",
      err.message
    );
  }
};
const handleLogout = async () => {
  await supabase.auth.signOut();

  setLoggedIn(false);
  setAccount(null);
  setDeals([]);
  setDrawerOpen(false);
  setPage("dashboard");
};
const handleDeleteRequest = async (reason) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("account_deletion_requests")
    .insert({
      user_id: user.id,
      reason,
    });

  if (error) {
    showAlert(
      "error",
      "Request Failed",
      error.message
    );
    return;
  }

  setDeleteRequestOpen(false);

  showAlert(
    "success",
    "Request Submitted",
    "Your account deletion request has been submitted successfully."
  );
};
const handleSaveDeal = async (deal) => {
  try {
    const duplicateDeal = deals.find(
  (d) =>
    d.id !== editingDeal?.id &&
    d.brand_name.trim().toLowerCase() ===
      deal.brand_name.trim().toLowerCase() &&
    d.deal_title.trim().toLowerCase() ===
      deal.deal_title.trim().toLowerCase() &&
    d.confirmation_date === deal.confirmation_date
);

if (duplicateDeal) {
  return showAlert(
    "warning",
    "Duplicate Deal",
    "A collaboration with the same brand, deal title and confirmation date already exists."
  );
}

let newDeal;

if (editingDeal) {
  await updateDeal(editingDeal.id, deal);
} else {
const tempDeal = {
  ...deal,
  id: crypto.randomUUID(),
  saving: true,
};

setDeals((prev) => [tempDeal, ...prev]);

setEditingDeal(null);
setFormOpen(false);

newDeal = await addDeal(deal);
}

// Instantly show the new deal (only for new deals)
if (newDeal) {
  setDeals((prev) =>
    prev.map((d) =>
      d.id === tempDeal.id ? newDeal : d
    )
  );
}
// Close immediately
setEditingDeal(null);
setFormOpen(false);


showAlert(
  "success",
  editingDeal ? "Deal Updated" : "Deal Added",
  editingDeal
    ? "Your collaboration has been updated successfully."
    : "Your collaboration has been added successfully."
);

  } catch (err) {
    console.error(err);
  
    showAlert(
      "error",
      "Failed to Save Deal",
      err.message
    );
  }
};

const handleDeleteDeal = async () => {
  if (!deletingDeal) return;

  try {
    await deleteDeal(deletingDeal.id);

    const latestDeals = await getDeals();
    setDeals(latestDeals);

    setDeletingDeal(null);

    showToast("Deal deleted successfully.");

  } catch (err) {
    console.error(err);
  
    showAlert(
      "error",
      "Failed to Delete Deal",
      err.message
    );
  }
};

const showValidation = (field) => {
  setAlert({
    open: true,
    type: "warning",
    title: "Missing Required Field",
    message: `Please enter ${field} before continuing.`,
  });
};

const showSuccess = (title, message) => {
  setAlert({
    open: true,
    type: "success",
    title,
    message,
  });
};

const showError = (title, message) => {
  setAlert({
    open: true,
    type: "error",
    title,
    message,
  });
};

const showInfo = (title, message) => {
  setAlert({
    open: true,
    type: "info",
    title,
    message,
  });
};

  const PAGE_TITLES = { dashboard: "Dashboard", deals: "Your deals", profile: "Profile" };

  if (loading) {
    return (
      <div className="dp-root">
        <div className="dp-canvas" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="dp-display" style={{ fontWeight: 700, fontSize: 18 }}>DealPass</div>
        </div>
        <GlobalStyles />
      </div>
    );
  }
if (isResetPasswordPage) {
  return (
    <ResetPasswordPage
  busy={resetBusy}
  onSave={handleResetPassword}
/>
  );
}
  if (!loggedIn || !account) {
    return (
      
     <div className="dp-root">
  <div className="dp-canvas">
   <AuthPage
  mode={authMode}
  setMode={setAuthMode}
  onSignup={handleSignup}
  onLogin={handleLogin}
  busy={authBusy}
  showAlert={showAlert}
    onForgotPassword={handleForgotPassword}
/>
  </div>

  <AlertModal
    open={alert.open}
    type={alert.type}
    title={alert.title}
    message={alert.message}
    onClose={() =>
      setAlert((prev) => ({
        ...prev,
        open: false,
      }))
    }
  />

  <GlobalStyles />
</div>
    );
  }

  return (
    <div className="dp-root">
      <div className="dp-canvas">
        <Header onMenu={() => setDrawerOpen(true)} title={PAGE_TITLES[page]} account={account} />

        {page === "dashboard" && (
     <DashboardPage
  deals={deals}
  account={account}
  onAddDeal={() => {
    setEditingDeal(null);
    setFormOpen(true);
  }}
  onOpenDeal={(d) => setSelectedDeal(d)}
/>
        )}
       {page === "deals" && (
  <DealsPage
    deals={deals}
    onAdd={() => {
      setEditingDeal(null);
      setFormOpen(true);
    }}
    onEdit={(d) => {
      setEditingDeal(d);
      setFormOpen(true);
    }}
    onDelete={(d) => setDeletingDeal(d)}
    onOpenDeal={(d) => setSelectedDeal(d)}
  />
)}
{deleteRequestOpen && (

<DeleteAccountRequestSheet

onClose={()=>
setDeleteRequestOpen(false)
}

onSubmit={handleDeleteRequest}

/>

)}
{page === "profile" && (
  <ProfilePage
    account={account}
    deals={deals}
    stats={computeStats(deals)}
      onChangePassword={() => setChangePasswordOpen(true)}
    onLogout={() => setLogoutOpen(true)}
   onDeleteAccount={() =>setDeleteRequestOpen(true)}
    onExportCSV={handleExportCSV}
    onExportExcel={handleExportExcel}
    onDownloadBackup={handleDownloadBackup}
      darkMode={darkMode}
  setDarkMode={setDarkMode}
    onImportBackup={openBackupPicker}
  onReportBug={() => {
    setFeedbackType("bug");
    setFeedbackOpen(true);
  }}
  onSuggestFeature={() => {
    setFeedbackType("feature");
    setFeedbackOpen(true);
  }}
  onContactUs={() => {
    setFeedbackType("contact");
    setFeedbackOpen(true);
  }}
  />
)}

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} page={page} setPage={setPage} onLogout={handleLogout} account={account} />
{page === "deals" && (
  <button
    className="dp-fab"
    onClick={() => {
      setEditingDeal(null);
      setFormOpen(true);
    }}
  >
    <Plus size={24} />
  </button>
)}
        {formOpen && (
          <DealFormSheet
  initial={editingDeal}
  onSave={handleSaveDeal}
  onClose={() => {
    setFormOpen(false);
    setEditingDeal(null);
  }}
  showAlert={showAlert}
/>
        )}
        {changePasswordOpen && (
 <ChangePasswordSheet
    onClose={() => setChangePasswordOpen(false)}
    onSave={handleChangePassword}
/>
)}
{selectedDeal && (
<DealPreview
  deal={selectedDeal}
  account={account}
  onClose={() => setSelectedDeal(null)}
/>
)}
        {deletingDeal && (
  <ConfirmDialog
  title="Delete Deal?"
  message={`Are you sure you want to delete your collaboration with\n${deletingDeal.brand_name}?\n\nThis action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  danger={true}
  onConfirm={handleDeleteDeal}
  onCancel={() => setDeletingDeal(null)}
/>
        )}
{logoutOpen && (
  <ConfirmDialog
    title="Sign Out"
    message="Are you sure you want to sign out of DealPass?"
    confirmText="Sign Out"
    cancelText="Stay Logged In"
    danger={false}
    onConfirm={async () => {
      setLogoutOpen(false);
      await handleLogout();
    }}
    onCancel={() => setLogoutOpen(false)}
  />
)}
        {toast && <div className="dp-toast">{toast}</div>}
      </div>

<AlertModal
  open={alert.open}
  type={alert.type}
  title={alert.title}
  message={alert.message}
  onClose={() =>
    setAlert((prev) => ({
      ...prev,
      open: false,
    }))
  }
/>
<input
  ref={fileInputRef}
  type="file"
  accept=".dealpass,.json"
  style={{ display: "none" }}
  onChange={async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    await handleImportBackup(file);

    e.target.value = "";
  }}
/>
{feedbackOpen && (
  <FeedbackSheet
    type={feedbackType}
    onClose={() => setFeedbackOpen(false)}
    onSubmit={handleSubmitFeedback}
  />
)}
      <GlobalStyles />
    </div>
  );
}
