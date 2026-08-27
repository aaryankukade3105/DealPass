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
import BillingProfilePage from "./pages/BillingProfilePage";
import FeedbackSheet from "./components/profile/FeedbackSheet";
import InvoiceEditorPage from "./pages/InvoiceEditorPage";
import { exportDealsExcel } from "./utils/exportExcel";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import InvoicesPage from "./pages/InvoicesPage";
import DeleteAccountRequestSheet from "./components/profile/DeleteAccountRequestSheet";
import { deleteInvoiceByDealId } from "./services/invoiceService";
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
const SHOOT_STATUS_OPTIONS = [
  "Not Scheduled",
  "Scheduled",
  "Shot",
  "Cancelled",
  "Rescheduled",
];

// Billing rows have their own primary key column also called "id" — that
// is NOT the same as the logged-in user's auth id (account.id). Spreading
// a raw billing object into the account object would silently overwrite
// the real user id with the billing row's id, which then gets sent as
// `user_id` on every deal insert/update and gets rejected by Supabase RLS
// (auth.uid() no longer matches). This helper strips billing's own `id`
// (and `user_id`, which is also not meant to override account fields)
// before it's ever spread into account state. Use this everywhere billing
// data is merged into account — never spread a raw billing object.
function stripBillingIdentity(billing) {
  if (!billing) return {};
  const { id: _billingRowId, user_id: _billingUserId, ...rest } = billing;
  return rest;
}

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
    shoot_date: "",
shoot_time: "",
shoot_status: "Not Scheduled",
shoot_location: "",
shoot_notes: "",
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

/* ---------------------------------- auth / app ---------------------------------- */

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
  // Set by DashboardPage (via onFilterDeals) when the user clicks a stat
  // like "Pending Revenue" — DealsPage applies it once, then clears it via
  // onFiltersApplied so it doesn't stick around on later visits.
  const [dealsFilterOverride, setDealsFilterOverride] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.querySelector(".dp-root");

    if (root) {
      root.setAttribute("data-theme", darkMode ? "dark" : "light");
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [alert, setAlert] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  function showAlert(type, title, message) {
    setAlert({ open: true, type, title, message });
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

    document.addEventListener("touchend", preventZoom, { passive: false });

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

  async function handleChangePassword({ currentPassword, newPassword, confirmPassword }) {
    try {
      if (!currentPassword.trim()) {
        return showAlert("warning", "Current Password", "Please enter your current password.");
      }

      if (!newPassword.trim()) {
        return showAlert("warning", "New Password", "Please enter a new password.");
      }

      if (newPassword.length < 8) {
        return showAlert("warning", "Weak Password", "Password must be at least 8 characters.");
      }

      if (newPassword !== confirmPassword) {
        return showAlert(
          "warning",
          "Passwords Don't Match",
          "New password and confirmation password must match."
        );
      }
const hasUppercase = /[A-Z]/.test(newPassword);
const hasNumber = /\d/.test(newPassword);
const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

if (!hasUppercase) {
  return showAlert(
    "warning",
    "Weak Password",
    "Password must contain at least one uppercase letter."
  );
}

if (!hasNumber) {
  return showAlert(
    "warning",
    "Weak Password",
    "Password must contain at least one number."
  );
}

if (!hasSpecial) {
  return showAlert(
    "warning",
    "Weak Password",
    "Password must contain at least one special character."
  );
}
      await changePassword(currentPassword, newPassword);

      setChangePasswordOpen(false);

      showAlert("success", "Password Updated", "Your password has been updated successfully.");
    } catch (err) {
      showAlert("error", "Update Failed", err.message);
    }
  }

  function handleExportCSV() {
    if (deals.length === 0) {
      return showInfo("No Deals", "You don't have any deals to export.");
    }

    exportDealsCSV(deals);

    showSuccess("CSV Exported", "Your deals have been downloaded successfully.");
  }

  function handleExportExcel() {
    if (deals.length === 0) {
      return showInfo("No Deals", "You don't have any deals to export.");
    }

    exportDealsExcel(deals);

    showSuccess("Excel Exported", "Your Excel file has been downloaded successfully.");
  }

  function handleDownloadBackup() {
    downloadBackup(account, deals);

    showSuccess("Backup Downloaded", "Your DealPass backup has been downloaded successfully.");
  }

  function openBackupPicker() {
    fileInputRef.current?.click();
  }

  async function handleImportBackup(file) {
    try {
      const backup = await importBackup(file);

      setDeals(backup.deals);

      if (backup.account) {
        // Guard the imported backup's account object the same way as any
        // other account merge — never let a stale/backup id silently
        // replace the currently logged-in user's real auth id.
        setAccount((prev) => ({
          ...prev,
          ...backup.account,
          id: prev?.id ?? backup.account.id,
        }));
      }

      showSuccess("Backup Restored", `${backup.deals.length} deals imported successfully.`);
    } catch (err) {
      showError("Import Failed", err.message);
    }
  }

  async function handleSubmitFeedback({ type, title, message }) {
    try {
      if (!title.trim()) {
        return showAlert("warning", "Title Required", "Please enter a title.");
      }

      if (!message.trim()) {
        return showAlert("warning", "Message Required", "Please enter your message.");
      }

      await submitFeedback({ type, title, message });

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
      console.error("Feedback Error:", err);

      showError("Submission Failed", err.message);
    }
  }

  const [page, setPage] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deletingDeal, setDeletingDeal] = useState(null);
  const [toast, setToast] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const fileInputRef = useRef(null);
  // Synchronous guard against a double-tap firing two saves before React
  // re-renders with saving: true — see handleSaveDeal below. A ref is
  // read/written immediately, unlike state which only takes effect on
  // the next render, so this closes a window a state flag alone can't.
  const savingLockRef = useRef(false);
  // Per-deal "which save attempt is the newest" token. If the same deal
  // is edited twice in quick succession, the slower of the two network
  // responses must not be allowed to overwrite the result of the
  // faster/newer one — see handleSaveDeal below.
  const saveTokensRef = useRef(new Map());

  // ---- FIXED: checkSession now has try/catch/finally so a failed profile
  // lookup (e.g. brand-new Google OAuth user with no profiles row yet)
  // can never leave the app stuck on the loading screen. It also now
  // creates a profiles row for first-time OAuth users instead of assuming
  // one already exists. ----
  useEffect(() => {
    const checkSession = async () => {
      try {
        const hash = window.location.hash;

        if (hash.includes("type=recovery") || window.location.pathname === "/reset-password") {
          setIsResetPasswordPage(true);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const user = session.user;

          let { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!profile) {
            // First-time OAuth (e.g. Google) login — no profiles row yet.
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                full_name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  "Creator",
                email: user.email,
                avatar_url: user.user_metadata?.avatar_url || null,
              })
              .select()
              .single();

            if (insertError) throw insertError;

            profile = newProfile;
          } else if (
            user.user_metadata?.avatar_url &&
            profile.avatar_url !== user.user_metadata.avatar_url
          ) {
            await supabase
              .from("profiles")
              .update({ avatar_url: user.user_metadata.avatar_url })
              .eq("id", user.id);

            profile.avatar_url = user.user_metadata.avatar_url;
          }

          const { data: billing } = await supabase
            .from("billing_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          // IMPORTANT: billing_profiles has its own "id" column (its row's
          // primary key) which is NOT the logged-in user's auth id. Never
          // spread a raw billing object after `id: user.id` — strip its
          // identity columns first so the real auth id always wins.
          setAccount({
            id: user.id,
            full_name: profile?.full_name || user.user_metadata?.full_name || "Creator",
            email: user.email,
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
            created_at: profile?.created_at,
            ...stripBillingIdentity(billing), // phone, account_holder, bank_name, account_number, ifsc, upi_id, etc.
          });

          setLoggedIn(true);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const persistAccount = async (next) => {
    setAccount(next);
    try {
      await window.storage.set(STORAGE_KEYS.account, JSON.stringify(next));
    } catch (e) {}
  };

  const persistSession = async (loggedInVal) => {
    setLoggedIn(loggedInVal);
    try {
      await window.storage.set(STORAGE_KEYS.session, JSON.stringify({ loggedIn: loggedInVal }));
    } catch (e) {}
  };

  const handleSignup = async ({ name, identifier, password, confirm }) => {
    if (!name.trim()) {
      showAlert("warning", "Full Name Required", "Please enter your full name.");
      return;
    }

    if (!identifier.trim()) {
      showAlert("warning", "Email Required", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(identifier.trim())) {
      showAlert("warning", "Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      showAlert("warning", "Password Required", "Please enter your password.");
      return;
    }

    if (password.length < 8) {
      showAlert("warning", "Weak Password", "Password must be at least 8 characters.");
      return;
    }

    if (!confirm.trim()) {
      showAlert("warning", "Confirm Password Required", "Please confirm your password.");
      return;
    }

    if (password !== confirm) {
      showAlert("warning", "Passwords Don't Match", "Password and Confirm Password must match.");
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

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: name.trim(),
        email: identifier.trim().toLowerCase(),
      });

      if (profileError) throw profileError;

      setAuthBusy(false);

      setAuthMode("login");

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
        showAlert("warning", "Email Already Registered", "An account with this email already exists.");
      } else {
        showAlert("error", "Signup Failed", err.message);
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

    const { data: billing } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Same fix as checkSession: strip billing's own "id"/"user_id" before
    // spreading, so it can never overwrite the real auth user id below.
    setAccount({
      id: user.id,
      full_name: profile?.full_name || user.user_metadata?.full_name || "Creator",
      email: user.email,
      created_at: profile?.created_at,
      ...stripBillingIdentity(billing),
    });

    setLoggedIn(true);
    setAuthBusy(false);
  } catch (err) {
    setAuthBusy(false);
    showAlert("error", "Login Failed", err.message);
  }
};
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      showAlert("error", "Google Sign-In Failed", error.message);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      if (!email.trim()) {
        return showAlert("warning", "Email Required", "Please enter your email address first.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        return showAlert("warning", "Invalid Email", "Please enter a valid email address.");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      showAlert(
        "success",
        "Reset Email Sent",
        "We've sent you a password reset link. Please check your inbox."
      );
    } catch (err) {
      showAlert("error", "Failed", err.message);
    }
  };

  const handleResetPassword = async ({ password, confirm }) => {
    try {
      if (!password.trim()) {
        return showAlert("warning", "Password Required", "Please enter your new password.");
      }

      if (password.length < 8) {
        return showAlert("warning", "Weak Password", "Password must be at least 8 characters.");
      }

      if (password !== confirm) {
        return showAlert("warning", "Passwords Don't Match", "Please make sure both passwords match.");
      }

      setResetBusy(true);

      const { error } = await supabase.auth.updateUser({ password });

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

      showAlert("error", "Update Failed", err.message);
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

    const { error } = await supabase.from("account_deletion_requests").insert({
      user_id: user.id,
      reason,
    });

    if (error) {
      showAlert("error", "Request Failed", error.message);
      return;
    }

    setDeleteRequestOpen(false);

    showAlert("success", "Request Submitted", "Your account deletion request has been submitted successfully.");
  };

  // ---- Instant local update on both add and edit. Also guards against
  // two real bugs the previous version was exposed to:
  //  1. Race condition: if the same deal is edited twice in quick
  //     succession, the first (slower) network response could arrive
  //     after the second edit and stomp it with stale data. We tag each
  //     save with a per-deal token and only apply a response if it's
  //     still the latest one issued for that deal.
  //  2. Double submit: relies on more than just React's `saving` state
  //     (which only takes effect after a re-render) — a synchronous ref
  //     blocks a second call in the same tick.
  const handleSaveDeal = async (deal) => {
    if (savingLockRef.current) return;
    savingLockRef.current = true;

    try {
      const duplicateDeal = deals.find(
        (d) =>
          d.id !== editingDeal?.id &&
          (d.brand_name || "").trim().toLowerCase() === deal.brand_name.trim().toLowerCase() &&
          (d.deal_title || "").trim().toLowerCase() === deal.deal_title.trim().toLowerCase() &&
          d.confirmation_date === deal.confirmation_date
      );

      if (duplicateDeal) {
        showAlert(
          "warning",
          "Duplicate Deal",
          "A collaboration with the same brand, deal title and confirmation date already exists."
        );
        return;
      }

      if (editingDeal) {
        const editedId = editingDeal.id;
        const optimisticDeal = { ...editingDeal, ...deal, id: editedId };

        // Reflect the edit instantly and close the sheet right away.
        setDeals((prev) => prev.map((d) => (d.id === editedId ? optimisticDeal : d)));
        setEditingDeal(null);
        setFormOpen(false);

        const myToken = Symbol("save");
        saveTokensRef.current.set(editedId, myToken);

        try {
          const updated = await updateDeal(editedId, deal);

          // Only apply this response if nothing newer has been issued
          // for this deal since we started. If a second edit fired
          // while this request was in flight, its own request (and its
          // own token) is now the latest — we must not overwrite it.
          if (updated && saveTokensRef.current.get(editedId) === myToken) {
            setDeals((prev) =>
              prev.map((d) => (d.id === editedId ? { ...d, ...updated } : d))
            );
          }

          showAlert("success", "Deal Updated", "Your collaboration has been updated successfully.");
        } catch (err) {
          console.error(err);
          showAlert("error", "Failed to Save Deal", err.message);

          // Only roll back to server truth if this was still the latest
          // attempt for this deal — an older failed request shouldn't
          // undo a newer, still-in-flight or already-succeeded edit.
          if (saveTokensRef.current.get(editedId) === myToken) {
            try {
              const latest = await getDeals();
              setDeals(latest);
            } catch (_) {}
          }
        }
      } else {
        const tempDeal = {
          ...deal,
          id: crypto.randomUUID(),
          saving: true,
        };

        setDeals((prev) => [tempDeal, ...prev]);
        setFormOpen(false);

        try {
          console.log("account.id being sent:", account.id);
          const newDeal = await addDeal(deal, account.id);

          setDeals((prev) =>
            prev.map((d) =>
              d.id === tempDeal.id
                ? newDeal
                  ? { ...deal, ...newDeal, saving: false }
                  : { ...deal, id: tempDeal.id, saving: false }
                : d
            )
          );

          showAlert("success", "Deal Added", "Your collaboration has been added successfully.");
        } catch (err) {
          console.error(err);
          showAlert("error", "Failed to Save Deal", err.message);

          // The optimistic temp deal never made it to the server —
          // remove it rather than leaving a phantom entry, but don't
          // silently drop the user's input: the form is already closed,
          // so surface it clearly via the alert above (message includes
          // err.message) and drop the temp row since it was never real.
          setDeals((prev) => prev.filter((d) => d.id !== tempDeal.id));
        }
      }
    } finally {
      savingLockRef.current = false;
    }
  };

const updateShootStatus = async (dealId, status, extra = {}) => {
  const updates = {
    shoot_status: status,
    ...extra,
  };

  switch (status) {
    case "In Progress":
      updates.shoot_next_check_at = new Date(
        Date.now() + 60 * 60 * 1000
      ).toISOString();
      break;

    case "Shot":
      updates.deal_status = "Content Shot";
      updates.shoot_next_check_at = null;
      break;

    case "Scheduled":
      // Covers both a fresh deal getting its first shoot date and a
      // postponed deal getting rescheduled to a new one — either way,
      // any pending "ask again in 1hr" check-in for the old slot is stale.
      updates.shoot_next_check_at = null;
      break;

    case "Not Scheduled":
      // Postponed with "date yet to decide" — nothing to check in on
      // until a real date is picked again.
      updates.shoot_next_check_at = null;
      break;

    case "Rescheduled":
      updates.shoot_next_check_at = null;
      break;

case "Cancelled":
      // Don't touch deal_status, and don't null the date/time yet — stay
      // visible on the dashboard tagged "Cancelled" for a 1hr grace
      // window in case this was a mis-tap. useShootReminders silently
      // clears shoot_date/shoot_time and flips this back to
      // "Not Scheduled" once that window passes.
      updates.shoot_next_check_at = new Date(
        Date.now() + 60 * 60 * 1000
      ).toISOString();
      break;

    default:
      break;
  }

  const updated = await updateDeal(dealId, updates);

  if (!updated) return;

  setDeals((prev) =>
    prev.map((d) => (d.id === dealId ? updated : d))
  );

  return updated;
};
   const handleDeleteDeal = async () => {
    if (!deletingDeal) return;

    const deletedId = deletingDeal.id;
    const deletedSnapshot = deletingDeal; // keep a copy in case we need to restore on failure

    try {
      // Optimistic removal too, so deletes feel instant.
      setDeals((prev) => prev.filter((d) => d.id !== deletedId));
      setDeletingDeal(null);

      // Delete linked invoice (if it exists)
      await deleteInvoiceByDealId(deletedId);

      // Delete the deal
      await deleteDeal(deletedId);

      showToast("Deal deleted successfully.");
    } catch (err) {
      console.error(err);

      showAlert("error", "Failed to Delete Deal", err.message);

      // Resync in case the delete actually failed server-side. Using a
      // full getDeals() here (rather than re-inserting the snapshot) is
      // intentional: we don't know whether the invoice delete succeeded
      // but the deal delete failed, or vice versa, so server truth is
      // the only safe source at this point.
      try {
        const latest = await getDeals();
        setDeals(latest);
      } catch (_) {}
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
    setAlert({ open: true, type: "success", title, message });
  };

  const showError = (title, message) => {
    setAlert({ open: true, type: "error", title, message });
  };

  const showInfo = (title, message) => {
    setAlert({ open: true, type: "info", title, message });
  };

 const PAGE_TITLES = {
  dashboard: "Dashboard",
  deals: "Your deals",
  invoices: "Invoices",
  profile: "Profile",
};

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
    return <ResetPasswordPage busy={resetBusy} onSave={handleResetPassword} />;
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
            onGoogleLogin={handleGoogleLogin}
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
          onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
        />

        <GlobalStyles />
      </div>
    );
  }

  return (
    <div className="dp-root">
      <div className="dp-canvas">
        <Header
  onMenu={() => setDrawerOpen(true)}
  title={PAGE_TITLES[page]}
  account={account}
  onOpenProfile={() => setPage("profile")}
  onLogout={() => setLogoutOpen(true)}
/>

        {page === "dashboard" && (
      <DashboardPage
  deals={deals}
  account={account}
  updateShootStatus={updateShootStatus}
  onAddDeal={() => {
    setEditingDeal(null);
    setFormOpen(true);
  }}
  onOpenDeal={(d) => setSelectedDeal(d)}
  onFilterDeals={(filters) => {
    setDealsFilterOverride(filters);
    setPage("deals");
  }}
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
            onGenerateInvoice={(deal) => {
              setSelectedDeal(deal);
              setPage("invoice-editor");
            }}
            initialFilters={dealsFilterOverride}
            onFiltersApplied={() => setDealsFilterOverride(null)}
          />
        )}

        {deleteRequestOpen && (
          <DeleteAccountRequestSheet
            onClose={() => setDeleteRequestOpen(false)}
            onSubmit={handleDeleteRequest}
          />
        )}
{page === "invoices" && (
<InvoicesPage
  deals={deals}
  onOpenInvoice={(deal) => {
    setSelectedDeal(deal);
    setSelectedInvoice(null);
    setPage("invoice-editor");
  }}
/>
)}
        {page === "profile" && (
          <ProfilePage
            account={account}
            deals={deals}
            stats={computeStats(deals)}
            onChangePassword={() => setChangePasswordOpen(true)}
            onLogout={() => setLogoutOpen(true)}
            onDeleteAccount={() => setDeleteRequestOpen(true)}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onDownloadBackup={handleDownloadBackup}
            onOpenBillingProfile={() => setPage("billing-profile")}
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
{page === "billing-profile" && (
  <BillingProfilePage
    account={account}
    onSaved={(billingForm) => {
      // Same rule as everywhere else: billingForm may carry its own
      // "id"/"user_id" fields from the billing_profiles row — never let
      // those override the real logged-in user's account.id.
      setAccount((prev) => ({
        ...prev,
        ...stripBillingIdentity(billingForm),
      }));
      setPage("profile");
    }}
  />
)}

        {page === "invoice-editor" && (
         <InvoiceEditorPage
  deal={selectedDeal}
  invoice={selectedInvoice}
  onBack={() => {
    setSelectedDeal(null);
    setSelectedInvoice(null);
    setPage(selectedInvoice ? "invoices" : "deals");
  }}
/>
        )}

     <Drawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  page={page}
  setPage={(newPage) => {
    setSelectedDeal(null);
    setSelectedInvoice(null);
    setPage(newPage);
  }}
  onLogout={handleLogout}
  account={account}
/>

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

        {selectedDeal && page !== "invoice-editor" && (
          <DealPreview deal={selectedDeal} account={account} onClose={() => setSelectedDeal(null)} />
        )}

        {deletingDeal && (
          <ConfirmDialog
            title="Delete Deal?"
            message={`Are you sure you want to delete your collaboration with ${deletingDeal.brand_name}?\n\nThis will permanently delete the deal and its linked invoice.\n\nThis action cannot be undone.`}
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
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
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
        <FeedbackSheet type={feedbackType} onClose={() => setFeedbackOpen(false)} onSubmit={handleSubmitFeedback} />
      )}

      <GlobalStyles />
    </div>
  );
}