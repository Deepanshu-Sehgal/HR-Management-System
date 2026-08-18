import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOnboardings,
  fetchOnboardingStats,
  createOnboarding,
  updateOnboardingTask,
  addOnboardingTask,
  deleteOnboarding,
} from "../../redux/Slices/OnboardingSlice";
import styles from "./Onboarding.module.css";

const CATEGORIES = ["Documentation", "IT", "HR", "Training", "Compliance", "Access"];

const EMPTY = {
  employeeName: "",
  employeeEmail: "",
  department: "",
  position: "",
  startDate: "",
};

const taskOverdue = (t) =>
  t.status !== "Done" && t.dueDate && new Date(t.dueDate).getTime() < Date.now();

function Onboarding() {
  const dispatch = useDispatch();
  const { items, stats, loading } = useSelector((state) => state.onboarding);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", category: "HR", dueDate: "" });

  useEffect(() => {
    dispatch(fetchOnboardings());
    dispatch(fetchOnboardingStats());
  }, [dispatch]);

  // Keep the open drawer in sync with the latest store copy.
  const current = selected
    ? items.find((o) => o._id === selected._id) || selected
    : null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employeeName || !form.startDate) return;
    await dispatch(createOnboarding({ ...form, createdBy: "HR" }));
    dispatch(fetchOnboardingStats());
    setForm(EMPTY);
    setShowForm(false);
  };

  const toggleTask = async (o, task) => {
    await dispatch(
      updateOnboardingTask({
        id: o._id,
        taskId: task._id,
        data: { status: task.status === "Done" ? "Pending" : "Done" },
      })
    );
    dispatch(fetchOnboardingStats());
  };

  const handleAddTask = async (o) => {
    if (!newTask.title.trim()) return;
    await dispatch(addOnboardingTask({ id: o._id, data: newTask }));
    setNewTask({ title: "", category: "HR", dueDate: "" });
    dispatch(fetchOnboardingStats());
  };

  const handleDelete = async (o) => {
    await dispatch(deleteOnboarding(o._id));
    dispatch(fetchOnboardingStats());
    if (selected?._id === o._id) setSelected(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1>Employee Onboarding</h1>
          <p className={styles.subtitle}>
            Auto-generated checklists that walk each new hire from offer to day-one ready.
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New Onboarding"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.notStarted}</span>
            <span className={styles.statLabel}>Not Started</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${stats.overdueTasks ? styles.danger : ""}`}>
              {stats.overdueTasks}
            </span>
            <span className={styles.statLabel}>Overdue Tasks</span>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Employee name *"
              value={form.employeeName}
              onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Employee email"
              value={form.employeeEmail}
              onChange={(e) => setForm({ ...form, employeeEmail: e.target.value })}
            />
          </div>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <input
              type="text"
              placeholder="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Create &amp; generate checklist
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No onboardings yet. Create one to get started.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((o) => (
            <div key={o._id} className={styles.card} onClick={() => setSelected(o)}>
              <div className={styles.cardHead}>
                <strong>{o.employeeName}</strong>
                <span className={`${styles.badge} ${styles["s_" + o.status.replace(/\s/g, "")]}`}>
                  {o.status}
                </span>
              </div>
              <div className={styles.cardSub}>
                {o.position || "—"} · {o.department || "—"}
              </div>
              <div className={styles.cardSub}>
                Starts {new Date(o.startDate).toLocaleDateString()}
              </div>
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${o.progress}%` }} />
                </div>
                <span className={styles.progressLabel}>{o.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {current && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <h2>{current.employeeName}</h2>
                <p>
                  {current.position || "—"} · {current.department || "—"} · starts{" "}
                  {new Date(current.startDate).toLocaleDateString()}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${current.progress}%` }} />
              </div>
              <span className={styles.progressLabel}>{current.progress}% complete</span>
            </div>

            <h4>Checklist</h4>
            <div className={styles.taskList}>
              {current.tasks.map((t) => (
                <label
                  key={t._id}
                  className={`${styles.task} ${taskOverdue(t) ? styles.taskOverdue : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={t.status === "Done"}
                    onChange={() => toggleTask(current, t)}
                  />
                  <span className={styles.taskBody}>
                    <span className={t.status === "Done" ? styles.taskDone : ""}>
                      {t.title}
                    </span>
                    <span className={styles.taskMeta}>
                      <span className={styles.cat}>{t.category}</span>
                      {t.dueDate && (
                        <span className={taskOverdue(t) ? styles.danger : ""}>
                          due {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className={styles.addTask}>
              <input
                type="text"
                placeholder="Add a task..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <button onClick={() => handleAddTask(current)}>Add</button>
            </div>

            <button className={styles.deleteBtn} onClick={() => handleDelete(current)}>
              Delete onboarding
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Onboarding;
