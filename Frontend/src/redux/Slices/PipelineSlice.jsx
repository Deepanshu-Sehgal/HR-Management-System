import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const PIPELINES_URL = `${API_BASE_URL}/pipelines`;

// Ensure a default pipeline exists and return it (bootstraps the board).
export const ensureDefaultPipeline = createAsyncThunk(
  "pipeline/ensureDefault",
  async () => {
    const response = await axios.get(`${PIPELINES_URL}/ensure-default`);
    return response.data;
  }
);

export const fetchPipelines = createAsyncThunk(
  "pipeline/fetchPipelines",
  async () => {
    const response = await axios.get(PIPELINES_URL);
    return response.data;
  }
);

export const fetchBoard = createAsyncThunk(
  "pipeline/fetchBoard",
  async (pipelineId) => {
    const response = await axios.get(`${PIPELINES_URL}/${pipelineId}/board`);
    return response.data; // { pipeline, columns }
  }
);

export const fetchFunnel = createAsyncThunk(
  "pipeline/fetchFunnel",
  async (pipelineId) => {
    const response = await axios.get(`${PIPELINES_URL}/${pipelineId}/funnel`);
    return response.data;
  }
);

export const fetchOverdue = createAsyncThunk(
  "pipeline/fetchOverdue",
  async (pipelineId) => {
    const url = pipelineId
      ? `${PIPELINES_URL}/overdue?pipelineId=${pipelineId}`
      : `${PIPELINES_URL}/overdue`;
    const response = await axios.get(url);
    return response.data;
  }
);

export const enrollApplication = createAsyncThunk(
  "pipeline/enroll",
  async ({ applicationId, pipelineId, stageKey, by }) => {
    const response = await axios.post(`${PIPELINES_URL}/enroll`, {
      applicationId,
      pipelineId,
      stageKey,
      by,
    });
    return response.data.application;
  }
);

export const moveStage = createAsyncThunk(
  "pipeline/moveStage",
  async ({ applicationId, stageKey, note, by }) => {
    const response = await axios.patch(
      `${PIPELINES_URL}/applications/${applicationId}/move`,
      { stageKey, note, by }
    );
    return response.data.application;
  }
);

export const addActivity = createAsyncThunk(
  "pipeline/addActivity",
  async ({ applicationId, message, by, type }) => {
    const response = await axios.post(
      `${PIPELINES_URL}/applications/${applicationId}/activity`,
      { message, by, type }
    );
    return response.data.application;
  }
);

export const createPipeline = createAsyncThunk(
  "pipeline/createPipeline",
  async (data) => {
    const response = await axios.post(PIPELINES_URL, data);
    return response.data.pipeline;
  }
);

export const updatePipeline = createAsyncThunk(
  "pipeline/updatePipeline",
  async ({ id, data }) => {
    const response = await axios.put(`${PIPELINES_URL}/${id}`, data);
    return response.data.pipeline;
  }
);

export const runSlaSweep = createAsyncThunk("pipeline/runSlaSweep", async () => {
  const response = await axios.post(`${PIPELINES_URL}/run-sla-sweep`);
  return response.data;
});

const initialState = {
  pipelines: [],
  activePipeline: null,
  columns: [],
  funnel: null,
  overdue: [],
  loading: false,
  moving: false,
  error: null,
  lastSweep: null,
};

// Move an application object between columns in local state after a stage change.
function relocate(state, application) {
  if (!application) return;
  state.columns.forEach((col) => {
    col.applications = col.applications.filter((a) => a._id !== application._id);
  });
  const target = state.columns.find((c) => c.key === application.stageKey);
  if (target) {
    target.applications.unshift(application);
  }
  // Recompute counts
  const now = Date.now();
  state.columns.forEach((col) => {
    col.count = col.applications.length;
    col.overdueCount = col.applications.filter(
      (a) => a.dueAt && new Date(a.dueAt).getTime() < now
    ).length;
  });
}

const PipelineSlice = createSlice({
  name: "pipeline",
  initialState,
  reducers: {
    setActivePipeline: (state, action) => {
      state.activePipeline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ensureDefaultPipeline.fulfilled, (state, action) => {
        state.activePipeline = action.payload;
        if (!state.pipelines.find((p) => p._id === action.payload._id)) {
          state.pipelines.push(action.payload);
        }
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.pipelines = action.payload;
      })
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.activePipeline = action.payload.pipeline;
        state.columns = action.payload.columns;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchFunnel.fulfilled, (state, action) => {
        state.funnel = action.payload;
      })
      .addCase(fetchOverdue.fulfilled, (state, action) => {
        state.overdue = action.payload;
      })
      .addCase(moveStage.pending, (state) => {
        state.moving = true;
      })
      .addCase(moveStage.fulfilled, (state, action) => {
        state.moving = false;
        relocate(state, action.payload);
      })
      .addCase(moveStage.rejected, (state, action) => {
        state.moving = false;
        state.error = action.error.message;
      })
      .addCase(enrollApplication.fulfilled, (state, action) => {
        relocate(state, action.payload);
      })
      .addCase(createPipeline.fulfilled, (state, action) => {
        state.pipelines.push(action.payload);
      })
      .addCase(updatePipeline.fulfilled, (state, action) => {
        const i = state.pipelines.findIndex((p) => p._id === action.payload._id);
        if (i !== -1) state.pipelines[i] = action.payload;
        if (state.activePipeline?._id === action.payload._id) {
          state.activePipeline = action.payload;
        }
      })
      .addCase(runSlaSweep.fulfilled, (state, action) => {
        state.lastSweep = action.payload;
      });
  },
});

export const { setActivePipeline } = PipelineSlice.actions;
export default PipelineSlice.reducer;
